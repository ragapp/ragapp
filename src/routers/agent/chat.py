import os
import time
import logging
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from llama_agents import LlamaAgentsClient, AsyncLlamaAgentsClient
from app.api.routers.vercel_response import VercelStreamResponse
from create_llama.backend.app.api.routers.chat import (
    ChatData,
    Message,
    Result,
    MessageRole,
)

logger = logging.getLogger("uvicorn")


agent_chat_router = r = APIRouter()


@r.post("")
def chat(request: Request, data: ChatData):
    try:
        # We still use the LlamaAgentsClient here, just for reusing the code
        client = LlamaAgentsClient(
            control_plane_url=f"http://{os.getenv('HOST', 'localhost')}:{os.getenv('PORT', 8000)}"
        )

        # Parse message
        last_message_content = data.get_last_message_content()
        messages = data.get_history_messages()

        # Create task for agents
        task_id = client.create_task(last_message_content)

        # Poll task status
        async def content_generator(client: LlamaAgentsClient, task_id: str):
            # Timeout to wait for the task to finish
            timeout = float(os.getenv("TIMEOUT", 30.0))
            # Interval to poll the task status
            interval = float(os.getenv("INTERVAL", 1.0))
            result = None
            chat_history_pointer = 0
            while True and timeout > 0:
                task = client.get_task(task_id)
                timeout -= interval
                chat_history = task.state.get("chat_history")
                result = task.state.get("result")
                if (
                    chat_history is not None
                    and len(chat_history) > chat_history_pointer
                ):
                    chat_history_pointer = len(chat_history)
                    yield VercelStreamResponse.convert_data(
                        {
                            "type": "events",
                            "data": {
                                "title": f"Agent message: {str(chat_history[-1])}",
                            },
                        }
                    )
                if result is not None:
                    yield VercelStreamResponse.convert_text(result.get("result"))
                    break
                else:
                    time.sleep(interval)
            if result is None:
                raise Exception("Task timeout")

        return VercelStreamResponse(
            content=content_generator(client=client, task_id=task_id)
        )

    except Exception as e:
        logger.error(f"Error: {str(e)}", exc_info=True)
        return JSONResponse(status_code=500, content={"error": str(e)})
