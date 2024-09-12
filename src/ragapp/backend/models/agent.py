import re
from typing import Dict

from pydantic import BaseModel, Field, validator


class ToolConfig(BaseModel):
    enabled: bool = False
    custom_prompt: str = ""
    config: Dict = Field(default_factory=dict)


class AgentConfig(BaseModel):
    agent_id: str
    name: str
    role: str
    system_prompt: str
    tools: Dict[str, ToolConfig] = Field(default_factory=dict)

    @validator("agent_id")
    def validate_agent_id(cls, v):
        if not re.match(r"^[a-zA-Z0-9_-]+$", v):
            raise ValueError(
                "agent_id must contain only alphanumeric characters, underscores, and hyphens"
            )
        return v

    @classmethod
    def create_agent_id(cls, name: str) -> str:
        return re.sub(r"[^a-z0-9_-]", "", name.lower().replace(" ", "_"))
