import uuid
from datetime import datetime
from typing import Dict, Optional

from pydantic import BaseModel, Field


class ToolConfig(BaseModel):
    enabled: bool = False
    custom_prompt: str = ""
    config: Dict = Field(default_factory=dict)


class AgentConfig(BaseModel):
    agent_id: Optional[str] = None  # Passed from the client, set as optional
    name: str
    role: str
    system_prompt: str
    tools: Dict[str, ToolConfig] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    @classmethod
    def create_agent_id(cls, name: str) -> str:
        return str(uuid.uuid4())
