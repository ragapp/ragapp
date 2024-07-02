import asyncio
from llama_agents import AgentService
from llama_index.llms.openai import OpenAI
from llama_index.core.settings import Settings
from llama_agents.message_queues import SimpleRemoteClientMessageQueue
from src.models.agent_service_config import AgentServiceConfig


def get_agent_service(config: AgentServiceConfig):
    from create_llama.backend.app.engine import get_chat_engine

    agent = get_chat_engine(use_agent=True)
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
    from src.constants import ENV_FILE_PATH

    load_dotenv(dotenv_path=ENV_FILE_PATH, verbose=False)

    config = AgentServiceConfig()
    asyncio.run(launch_agent(config=config))
