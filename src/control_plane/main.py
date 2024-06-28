import sys
import logging
import asyncio
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings
from typing import ClassVar
from llama_agents import (
    ControlPlaneServer,
    AgentOrchestrator,
    PipelineOrchestrator,
    ServiceComponent,
)
from llama_index.llms.openai import OpenAI
from llama_index.core.llms.function_calling import FunctionCallingLLM
from llama_agents.message_queues import SimpleRemoteClientMessageQueue
from llama_agents.message_consumers import CallableMessageConsumer
from llama_index.core.query_pipeline import QueryPipeline


logger = logging.getLogger(__name__)


class ControlPlaneConfig(BaseSettings):
    llm_provider: ClassVar[str] = "openai"  # Update for other LLM providers later
    llm_model: str = Field(
        default="gpt-3.5-turbo",
        env="MODEL",
    )

    host: str = Field(
        default="localhost",
        env="HOST",
    )
    port: int = Field(
        default=8001,
        env="PORT",
    )

    orchestrator_type: str = Field(
        default="agent",
        env="ORCHESTRATOR_TYPE",
    )

    message_queue_url: str = Field(
        default="http://localhost:8100",
        env="MESSAGE_QUEUE_URL",
        alias="message_queue_url",
    )

    _llm: FunctionCallingLLM = None

    class Config:
        env_prefix = "CONTROL_PLANE_"

    def get_llm(self):
        # TODO: Update for other LLM providers later
        if self._llm is None:
            self._llm = OpenAI(model=self.llm_model)
        return self._llm

    def get_orchestrator(self):
        llm = self.get_llm()

        match self.orchestrator_type:
            case "agent":
                return AgentOrchestrator(llm=self.get_llm())
            case "pipeline":
                # Hard-code for a pipeline orchestrator
                # travel_service_components = ServiceComponent(
                #     name="travel_agent",
                #     description="Use this service to get places to travel in a country, but i cannot suggest a plan for the trip",
                # )
                # research_service_components = ServiceComponent(
                #     name="research_agent",
                #     description="Use this service to create a plan for the trip, must provide the list of places to visit",
                # )
                # pipeline = QueryPipeline(
                #     chain=[travel_service_components, research_service_components]
                # )
                # return PipelineOrchestrator(pipeline)
                raise NotImplementedError("Pipeline orchestrator not implemented yet")
            case _:
                raise ValueError(f"Unknown orchestrator type: {self.orchestrator_type}")


# Just create a simple consumer that prints the result directly in control plane
def get_human_consumer():
    def handle_result(message) -> None:
        logger.info(f"Result received: {message}")

    human_consumer = CallableMessageConsumer(
        handler=handle_result, message_type="human"
    )

    return human_consumer


async def launch_control_plane(config: ControlPlaneConfig):
    message_queue = SimpleRemoteClientMessageQueue(base_url=config.message_queue_url)

    control_plane = ControlPlaneServer(
        message_queue=message_queue,
        orchestrator=config.get_orchestrator(),
        host=config.host,
        port=config.port,
    )

    human_consumer = get_human_consumer()

    server = control_plane.launch_server()
    await message_queue.register_consumer(control_plane.as_consumer(remote=True))
    await message_queue.register_consumer(human_consumer)
    await server


if __name__ == "__main__":
    config = ControlPlaneConfig()
    asyncio.run(launch_control_plane(config=config))
