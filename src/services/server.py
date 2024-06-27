import sys
import asyncio
from pydantic import BaseModel, Field
from typing import ClassVar
from src.services.utils import get_message_queue, init_llm
from llama_agents import ControlPlaneServer, AgentOrchestrator


class ControlPlaneConfig(BaseModel):
    _config_namespace: ClassVar[str] = "control_plane"

    llm_provider: str
    llm_model: str

    host: str = Field(default="localhost")
    port: int = Field(default=8000)

    @classmethod
    def from_file(cls, file_path: str):
        import yaml

        with open(file_path, "r") as f:
            config = yaml.safe_load(f)
            return cls(**config.get(cls._config_namespace, {}))


async def launch_control_plane(config: ControlPlaneConfig):
    llm = init_llm(config.llm_provider, config.llm_model)
    message_queue = get_message_queue()

    control_plane = ControlPlaneServer(
        message_queue=message_queue,
        orchestrator=AgentOrchestrator(llm=llm),
        host=config.host,
        port=config.port,
    )

    server = control_plane.launch_server()
    await message_queue.register_consumer(control_plane.as_consumer(remote=True))
    await server


if __name__ == "__main__":
    config_file = sys.argv[sys.argv.index("--config") + 1]
    if not config_file:
        raise ValueError("No config file provided")
    config = ControlPlaneConfig.from_file(config_file)
    asyncio.run(launch_control_plane(config=config))
