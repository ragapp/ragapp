import sys
import asyncio
from pydantic import Field
from pydantic_settings import BaseSettings
from typing import List, ClassVar
from llama_agents import AgentService
from llama_index.llms.openai import OpenAI
from llama_index.core.settings import Settings
from llama_agents.message_queues import SimpleRemoteClientMessageQueue


class AgentServiceConfig(BaseSettings):
    name: str = Field(..., description="Name of the agent", env="NAME")
    description: str = Field(
        ...,
        description="Description of the agent. To introduce with other agents",
        env="DESCRIPTION",
    )
    prompt: str = Field(
        ...,
        description="Prompt to use for the agent",
        env="PROMPT",
    )
    system_prompt: str = Field(
        ...,
        description="System prompt to use for the agent",
        env="SYSTEM_PROMPT",
        alias="system_prompt",  # Set alias to not use the prefix
    )
    tools: List[str] = Field(
        default=[],
        description="List of tools to use for the agent",
        env="TOOLS",
    )
    host: str = Field(default="localhost", env="HOST")
    port: int = Field(default=8002, env="PORT")
    control_plane_url: str | None = Field(
        default="http://localhost:8001",
        alias="control_plane_url",
        env="CONTROL_PLANE_URL",
    )
    message_queue_url: str = Field(
        default="http://localhost:8100",
        alias="message_queue_url",
        env="MESSAGE_QUEUE_URL",
    )

    # Config for llm
    llm_provider: ClassVar[str] = "openai"  # Update for other LLM providers later
    llm_model: str = Field(
        default="gpt-3.5-turbo",
        description="Model to use for the agent",
        env="MODEL",
    )

    class Config:
        env_prefix = "AGENT_"


def get_agent_service(config: AgentServiceConfig):
    from create_llama.backend.app.engine import get_chat_engine
    from llama_index.core.agent import ReActAgent

    # agent = ReActAgent.from_tools([], llm=OpenAI())
    agent = get_chat_engine()
    message_queue = SimpleRemoteClientMessageQueue(
        base_url=config.message_queue_url,
    )
    agent_service = AgentService(
        agent=agent,
        message_queue=message_queue,
        description=config.description,
        service_name=config.name,
        host=config.host,
        port=config.port,
    )

    return agent_service


async def launch_agent(config: AgentServiceConfig):
    agent_service = get_agent_service(config)

    # Launch the agent service
    server = agent_service.launch_server()

    # Register the agent
    await agent_service.register_to_message_queue()
    await agent_service.register_to_control_plane(config.control_plane_url)

    await server


async def init_and_register_agent(config: AgentServiceConfig):
    agent_service = get_agent_service(config)
    # Schedule both coroutines to run on the event loop without blocking
    await asyncio.create_task(agent_service.register_to_message_queue())
    await asyncio.create_task(
        agent_service.register_to_control_plane(config.control_plane_url)
    )

    return agent_service


if __name__ == "__main__":
    import os
    from dotenv import load_dotenv
    from src.app.constants import ENV_FILE_PATH

    load_dotenv(dotenv_path=ENV_FILE_PATH, verbose=False)

    config = AgentServiceConfig()
    asyncio.run(launch_agent(config=config))
