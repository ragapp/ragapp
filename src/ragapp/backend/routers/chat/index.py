import logging

from app.api.routers.events import EventCallbackHandler
from app.api.routers.models import (
    ChatData,
)
from fastapi import APIRouter, BackgroundTasks, HTTPException, Request, status
from llama_index.core.agent import AgentRunner
from llama_index.core.chat_engine import CondensePlusContextChatEngine

from backend.engine import get_chat_engine
from backend.engine.query_filters import generate_filters
from backend.routers.chat.vercel_response import (
    ChatEngineVercelStreamResponse,
    WorkflowVercelStreamResponse,
)

chat_router = r = APIRouter()

logger = logging.getLogger("uvicorn")


@r.post("")
async def chat(
    request: Request,
    data: ChatData,
    background_tasks: BackgroundTasks,
):
    try:
        last_message_content = data.get_last_message_content()
        messages = data.get_history_messages()

        doc_ids = data.get_chat_document_ids()
        filters = generate_filters(doc_ids)
        params = data.data or {}
        logger.info(
            f"Creating chat engine with filters: {str(filters)}",
        )
        event_handler = EventCallbackHandler()
        chat_engine = get_chat_engine(
            filters=filters,
            params=params,
            event_handlers=[event_handler],
            chat_history=messages,
        )

        if isinstance(chat_engine, CondensePlusContextChatEngine) or isinstance(
            chat_engine, AgentRunner
        ):
            event_handler = EventCallbackHandler()
            chat_engine.callback_manager.handlers.append(event_handler)  # type: ignore

            response = chat_engine.astream_chat(last_message_content, messages)

            return ChatEngineVercelStreamResponse(
                request=request,
                event_handler=event_handler,
                chat_data=data,
                response=response,
                background_tasks=background_tasks,
            )
        else:
            event_handler = chat_engine.run(input=last_message_content, streaming=True)
            return WorkflowVercelStreamResponse(
                request=request,
                chat_data=data,
                event_handler=event_handler,
                events=chat_engine.stream_events(),
            )
    except Exception as e:
        logger.exception("Error in chat engine", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error in chat engine: {e}",
        ) from e
