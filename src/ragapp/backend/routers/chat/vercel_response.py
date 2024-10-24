import asyncio
import json
import logging
from abc import ABC, abstractmethod
from typing import AsyncGenerator, Awaitable, List

from aiostream import stream
from app.api.routers.events import EventCallbackHandler
from app.api.routers.models import ChatData, Message, SourceNodes
from app.api.services.suggestion import NextQuestionSuggestion
from fastapi import BackgroundTasks, Request
from fastapi.responses import StreamingResponse
from llama_index.core.chat_engine.types import StreamingAgentChatResponse
from llama_index.core.schema import NodeWithScore

from backend.workflows.single import AgentRunEvent, AgentRunResult

logger = logging.getLogger("uvicorn")


class BaseVercelStreamResponse(StreamingResponse, ABC):
    """
    Base class to convert the response from the chat engine to the streaming format expected by Vercel
    """

    TEXT_PREFIX = "0:"
    DATA_PREFIX = "8:"

    def __init__(
        self,
        request: Request,
        chat_data: ChatData,
        event_handler: EventCallbackHandler,
        *args,
        **kwargs,
    ):
        self.request = request
        self.event_handler = event_handler

        stream = self._create_stream(request, chat_data, event_handler, *args, **kwargs)
        content = self.content_generator(stream)

        super().__init__(content=content)

    @abstractmethod
    def _create_stream(
        self,
        request: Request,
        chat_data: ChatData,
        event_handler: EventCallbackHandler,
        *args,
        **kwargs,
    ):
        """
        Create the stream that will be used to generate the response.
        """
        raise NotImplementedError("Subclasses must implement _create_stream")

    async def content_generator(self, stream):
        is_stream_started = False

        try:
            async with stream.stream() as streamer:
                async for output in streamer:
                    if not is_stream_started:
                        is_stream_started = True
                        # Stream a blank message to start the stream
                        yield self.convert_text("")

                    yield output

                    if await self.request.is_disconnected():
                        break
        except asyncio.CancelledError:
            logger.info("Stopping workflow")
            await self.event_handler.cancel_run()
        except Exception as e:
            logger.error(
                f"Unexpected error in content_generator: {str(e)}", exc_info=True
            )
        finally:
            logger.info("The stream has been stopped!")

    @classmethod
    def convert_text(cls, token: str):
        # Escape newlines and double quotes to avoid breaking the stream
        token = json.dumps(token)
        return f"{cls.TEXT_PREFIX}{token}\n"

    @classmethod
    def convert_data(cls, data: dict):
        data_str = json.dumps(data)
        return f"{cls.DATA_PREFIX}[{data_str}]\n"

    @staticmethod
    async def _generate_next_questions(chat_history: List[Message], response: str):
        questions = await NextQuestionSuggestion.suggest_next_questions(
            chat_history, response
        )
        if questions:
            return {
                "type": "suggested_questions",
                "data": questions,
            }
        return None


class ChatEngineVercelStreamResponse(BaseVercelStreamResponse):
    """
    Class to convert the response from the chat engine to the streaming format expected by Vercel
    """

    def _create_stream(
        self,
        request: Request,
        chat_data: ChatData,
        event_handler: EventCallbackHandler,
        response: Awaitable[StreamingAgentChatResponse],
        background_tasks: BackgroundTasks,
    ):
        # Yield the events from the event handler
        async def _event_generator():
            async for event in event_handler.async_event_gen():
                event_response = event.to_response()
                if event_response is not None:
                    yield self.convert_data(event_response)

        # Yield the text response
        async def _chat_response_generator():
            # Wait for the response from the chat engine
            result = await response

            # Once we got a source node, start a background task to download the files (if needed)
            source_nodes = result.source_nodes
            self._process_response_nodes(source_nodes, background_tasks)

            # Yield the source nodes
            yield self.convert_data(self._source_nodes_to_response(source_nodes))

            final_response = ""
            async for token in result.async_response_gen():
                final_response += token
                yield self.convert_text(token)

            # Generate next questions if next question prompt is configured
            question_data = await self._generate_next_questions(
                chat_data.messages, final_response
            )
            if question_data:
                yield self.convert_data(question_data)

            # the text_generator is the leading stream, once it's finished, also finish the event stream
            event_handler.is_done = True

        combine = stream.merge(_chat_response_generator(), _event_generator())
        return combine

    @staticmethod
    def _source_nodes_to_response(source_nodes: List):
        return {
            "type": "sources",
            "data": {
                "nodes": [
                    SourceNodes.from_source_node(node).model_dump()
                    for node in source_nodes
                ]
            },
        }

    @staticmethod
    def _process_response_nodes(
        source_nodes: List[NodeWithScore],
        background_tasks: BackgroundTasks,
    ):
        try:
            # Start background tasks to download documents from LlamaCloud if needed
            from app.engine.service import LLamaCloudFileService  # type: ignore

            LLamaCloudFileService.download_files_from_nodes(
                source_nodes, background_tasks
            )
        except ImportError:
            logger.debug(
                "LlamaCloud is not configured. Skipping post processing of nodes"
            )
            pass


class WorkflowVercelStreamResponse(BaseVercelStreamResponse):
    """
    Class to convert the response from the chat engine to the streaming format expected by Vercel
    """

    def _create_stream(
        self,
        request: Request,
        chat_data: ChatData,
        event_handler: AgentRunResult | AsyncGenerator,
        events: AsyncGenerator[AgentRunEvent, None],
        verbose: bool = True,
    ):
        # Yield the text response
        async def _chat_response_generator():
            result = await event_handler
            final_response = ""

            if isinstance(result, AgentRunResult):
                for token in result.response.message.content:
                    final_response += token
                    yield self.convert_text(token)

            if isinstance(result, AsyncGenerator):
                async for token in result:
                    final_response += token.delta
                    yield self.convert_text(token.delta)

            # Generate next questions if next question prompt is configured
            question_data = await self._generate_next_questions(
                chat_data.messages, final_response
            )
            if question_data:
                yield self.convert_data(question_data)

            # TODO: stream sources

        # Yield the events from the event handler
        async def _event_generator():
            async for event in events:
                event_response = self._event_to_response(event)
                if verbose:
                    logger.debug(event_response)
                if event_response is not None:
                    yield self.convert_data(event_response)

        combine = stream.merge(_chat_response_generator(), _event_generator())
        return combine

    @staticmethod
    def _event_to_response(event: AgentRunEvent) -> dict:
        return {
            "type": "agent",
            "data": {"agent": event.name, "text": event.msg},
        }
