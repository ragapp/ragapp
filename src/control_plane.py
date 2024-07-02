import sys
import logging
import asyncio
from fastapi import Request, Response
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings
from typing import ClassVar
from llama_agents import (
    ControlPlaneServer,
    AgentOrchestrator,
    PipelineOrchestrator,
    ServiceComponent,
)
from llama_agents.message_queues import SimpleRemoteClientMessageQueue
from llama_agents.message_consumers.callable import CallableMessageConsumer
from llama_agents.message_consumers.remote import RemoteMessageConsumer
from src.models.control_plane_config import ControlPlaneConfig
from src.routers.agent.chat import agent_chat_router


logger = logging.getLogger(__name__)


# Just create a simple consumer that prints the result directly in control plane
def get_human_consumer():
    def handle_result(message) -> None:
        logger.info(f"Result received: {message}")

    human_consumer = CallableMessageConsumer(
        handler=handle_result, message_type="human"
    )

    return human_consumer


async def task_result_callback(request: Request):
    """
    Simple callback function to show the task result
    """
    data = await request.json()
    print(f"Result received: {data}")

    return Response(status_code=204)  # 204 No Content


async def launch_control_plane(config: ControlPlaneConfig):
    message_queue = SimpleRemoteClientMessageQueue(base_url=config.message_queue_url)

    control_plane = ControlPlaneServer(
        message_queue=message_queue,
        orchestrator=config.get_orchestrator(),
        host=config.host,
        port=config.port,
    )
    control_plane.app.add_api_route(
        "/task-result", task_result_callback, methods=["POST"]
    )

    control_plane.app.include_router(agent_chat_router, prefix="/chat", tags=["Chat"])

    result_consumer = RemoteMessageConsumer(
        url=f"http://{config.host}:{config.port}/task-result", message_type="human"
    )

    server = control_plane.launch_server()
    await message_queue.register_consumer(control_plane.as_consumer(remote=True))
    await message_queue.register_consumer(result_consumer)
    await server


if __name__ == "__main__":
    config = ControlPlaneConfig()
    asyncio.run(launch_control_plane(config=config))
