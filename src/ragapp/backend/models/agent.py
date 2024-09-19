import uuid
from datetime import datetime
from typing import Dict, Optional

from llama_index.core.prompts.base import PromptTemplate
from pydantic import BaseModel, Field

from .tools import get_tool_by_id

DEFAULT_SYSTEM_PROMPT_TEMPLATE = (
    """You are a {role}, {backstory}. Your goal is: {goal}"""
)


class ToolConfig(BaseModel):
    enabled: bool = False
    config: Dict = Field(default_factory=dict)


class AgentConfig(BaseModel):
    agent_id: Optional[str] = None  # Passed from the client, set as optional
    name: str
    role: str = Field(..., min_length=1)
    backstory: str = Field(..., min_length=1)
    goal: str = Field(..., min_length=1)
    system_prompt: Optional[str] = None
    system_prompt_template: Optional[str] = None
    tools: Dict[str, ToolConfig] = Field(default_factory=dict)
    created_at: int = Field(default_factory=lambda: int(datetime.now().timestamp()))

    @classmethod
    def create_agent_id(cls, name: str) -> str:
        return str(uuid.uuid4())

    def get_system_prompt(self) -> str:
        if self.system_prompt is not None:
            system_prompt = self.system_prompt
        elif self.system_prompt_template:
            system_prompt = PromptTemplate(self.system_prompt_template).format(
                role=self.role, backstory=self.backstory, goal=self.goal
            )
        else:
            system_prompt = DEFAULT_SYSTEM_PROMPT_TEMPLATE.format(
                role=self.role, backstory=self.backstory, goal=self.goal
            )
        tools_custom_prompts = self.get_tool_custom_prompts()
        if tools_custom_prompts != "":
            system_prompt += tools_custom_prompts
        return system_prompt

    def get_tool_custom_prompts(self) -> str:
        tool_custom_prompts = ""
        for tool_name, tool_config in self.tools.items():
            if tool_config.enabled:
                tool_cls = get_tool_by_id(tool_name)
                tool = tool_cls(**tool_config.config)
                if tool.custom_prompt:
                    tool_custom_prompts += (
                        f"\n<{tool.name}>\n{tool.custom_prompt}\n</{tool.name}>\n\n"
                    )
        if tool_custom_prompts != "":
            return "\n\nPlease follow these tool rules:\n" + tool_custom_prompts
        return ""

    def to_config(self) -> Dict:
        return self.model_dump(exclude={"agent_id"})
