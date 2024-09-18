import uuid
from datetime import datetime
from typing import Dict, Optional

from pydantic import BaseModel, Field, computed_field
from llama_index.core.prompts.base import PromptTemplate

class ToolConfig(BaseModel):
    enabled: bool = False
    custom_prompt: Optional[str] = None
    config: Dict = Field(default_factory=dict)


class AgentConfig(BaseModel):
    agent_id: Optional[str] = None  # Passed from the client, set as optional
    name: str
    role: str = Field(..., min_length=1)
    backstory: str = Field(..., min_length=1)
    goal: str = Field(..., min_length=1)
    system_prompt: str
    system_prompt_template: Optional[str] = None
    tools: Dict[str, ToolConfig] = Field(default_factory=dict)
    created_at: int = Field(default_factory=lambda: int(datetime.now().timestamp()))

    @classmethod
    def create_agent_id(cls, name: str) -> str:
        return str(uuid.uuid4())

    def get_system_prompt(self) -> str:
        if self.system_prompt_template:
            return PromptTemplate(self.system_prompt_template).format(
                role=self.role,
                backstory=self.backstory,
                goal=self.goal
            )
        return self.system_prompt

    def to_config(self) -> Dict:
        return self.model_dump(
            exclude={"agent_id"}
        )