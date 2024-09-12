import json
import logging
from asyncio import Task
from typing import AsyncGenerator, List

from aiostream import stream
from app.agents.single import AgentRunEvent, AgentRunResult
from app.api.routers.models import ChatData, Message
from app.api.services.suggestion import NextQuestionSuggestion
from fastapi import Request
from fastapi.responses import StreamingResponse

logger = logging.getLogger("uvicorn")


class VercelStreamResponse(StreamingResponse):
    """
    Class to convert the response from the chat engine to the streaming format expected by Vercel
    """

    TEXT_PREFIX = "0:"
    DATA_PREFIX = "8:"

    @classmethod
    def convert_text(cls, token: str):
        # Escape newlines and double quotes to avoid breaking the stream
        token = json.dumps(token)
        return f"{cls.TEXT_PREFIX}{token}\n"

    @classmethod
    def convert_data(cls, data: dict):
        data_str = json.dumps(data)
        return f"{cls.DATA_PREFIX}[{data_str}]\n"

    def __init__(
        self,
        request: Request,
        task: Task[AgentRunResult | AsyncGenerator],
        events: AsyncGenerator[AgentRunEvent, None],
        chat_data: ChatData,
        verbose: bool = True,
    ):
        content = VercelStreamResponse.content_generator(
            request, task, events, chat_data, verbose
        )
        super().__init__(content=content)

    @classmethod
    async def content_generator(
        cls,
        request: Request,
        task: Task[AgentRunResult | AsyncGenerator],
        events: AsyncGenerator[AgentRunEvent, None],
        chat_data: ChatData,
        verbose: bool = True,
    ):
        # Yield the text response
        async def _chat_response_generator():
            result = await task
            final_response = ""

            if isinstance(result, AgentRunResult):
                for token in result.response.message.content:
                    final_response += token
                    yield cls.convert_text(token)

            if isinstance(result, AsyncGenerator):
                async for token in result:
                    final_response += token.delta
                    yield cls.convert_text(token.delta)

            # Generate next questions if next question prompt is configured
            question_data = await cls._generate_next_questions(
                chat_data.messages, final_response
            )
            if question_data:
                yield cls.convert_data(question_data)

            # TODO: stream sources

        # Yield the events from the event handler
        async def _event_generator():
            async for event in events():
                event_response = cls._event_to_response(event)
                if verbose:
                    logger.debug(event_response)
                if event_response is not None:
                    yield cls.convert_data(event_response)

        combine = stream.merge(_chat_response_generator(), _event_generator())

        is_stream_started = False
        async with combine.stream() as streamer:
            if not is_stream_started:
                is_stream_started = True
                # Stream a blank message to start the stream
                yield cls.convert_text("")

            async for output in streamer:
                yield output
                if await request.is_disconnected():
                    break

    @staticmethod
    def _event_to_response(event: AgentRunEvent) -> dict:
        return {
            "type": "agent",
            "data": {"agent": event.name, "text": event.msg},
        }

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
