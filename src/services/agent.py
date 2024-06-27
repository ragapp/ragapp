import sys
import asyncio
from pydantic import BaseModel, Field
from typing import List
from llama_agents import AgentService
from llama_index.core.agent import ReActAgent
from llama_index.llms.openai import OpenAI
from llama_index.core.settings import Settings
from llama_agents.types import ChatMessage
from src.services.utils import get_message_queue, init_llm, get_tools


class LlamaAgentConfig(BaseModel):
    name: str
    description: str
    prompt: str
    port: int = Field(default=8000)
    host: str = Field(default="localhost")
    control_plane_url: str | None = Field(default="http://localhost:8000")

    # Config for llm
    llm_provider: str
    llm_model: str

    # Config for agent
    tools: List[str]

    @classmethod
    def from_file(
        cls, file_path: str, agent_name: str = None
    ) -> List["LlamaAgentConfig"] | "LlamaAgentConfig":
        import yaml

        with open(file_path, "r") as f:
            config = yaml.safe_load(f)
            agent_configs = config.get("agents", [])
            if agent_name:
                return cls(
                    **next(filter(lambda x: x["name"] == agent_name, agent_configs))
                )
            return [cls(**agent) for agent in agent_configs]


def init_agent_service(config: LlamaAgentConfig):
    llm = init_llm(config.llm_provider, config.llm_model)
    tools = get_tools(config.tools)

    agent = ReActAgent.from_tools(tools=tools, llm=llm)
    message_queue = get_message_queue()
    agent_service = AgentService(
        agent=agent,
        message_queue=message_queue,
        description=config.description,
        service_name=config.name,
        host=config.host,
        port=config.port,
        prompt=[
            ChatMessage.from_str(content=config.prompt, role="system"),
        ],
    )

    return agent_service


async def launch_agent(config: LlamaAgentConfig):
    agent_service = init_agent_service(config)

    # Launch the agent service
    server = agent_service.launch_server()

    # Register the agent
    await agent_service.register_to_message_queue()
    await agent_service.register_to_control_plane(config.control_plane_url)

    await server


if __name__ == "__main__":
    config_file = sys.argv[sys.argv.index("--config") + 1]
    agent_name = sys.argv[sys.argv.index("--name") + 1]
    if not agent_name:
        raise ValueError("Agent name is required")
    if not config_file:
        raise ValueError("Config file is required")
    config = LlamaAgentConfig.from_file(file_path=config_file, agent_name=agent_name)

    asyncio.run(launch_agent(config=config))
