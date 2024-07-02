from pydantic import Field
from pydantic_settings import BaseSettings
from typing import List, ClassVar
from src.utils import get_hostname


class AgentServiceConfig(BaseSettings):
    name: str = Field(
        default=get_hostname(),
        description="Name of the agent, default is the current host name",
        env="NAME",
    )
    description: str = Field(
        ...,
        description="Description of the agent. To introduce with other agents",
        env="DESCRIPTION",
    )
    prompt: str | None = Field(
        default=None,
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
    host: str = Field(default=get_hostname(), env="HOST")
    port: int = Field(default=8001, env="PORT")
    control_plane_url: str | None = Field(
        default="http://localhost:8000",
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
