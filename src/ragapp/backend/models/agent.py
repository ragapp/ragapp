from typing import Dict, List
from pydantic import BaseModel, Field, validator
import re
from collections import OrderedDict


class ToolConfig(BaseModel):
    enabled: bool = False
    config: Dict = Field(default_factory=dict)


TOOL_ORDER = ["DuckDuckGo", "Wikipedia", "OpenAPI", "E2BInterpreter", "ImageGenerator"]


class AgentConfig(BaseModel):
    agent_id: str
    name: str
    system_prompt: str
    tools: Dict[str, ToolConfig] = Field(default_factory=OrderedDict)

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

    @validator("tools", pre=True, always=True)
    def set_default_tools(cls, v):
        default_tools = OrderedDict((tool, ToolConfig()) for tool in TOOL_ORDER)
        if isinstance(v, dict):
            for tool_name in TOOL_ORDER:
                if tool_name not in v:
                    v[tool_name] = default_tools[tool_name]
                elif isinstance(v[tool_name], dict):
                    v[tool_name] = ToolConfig(**v[tool_name])
        return OrderedDict((k, v[k]) for k in TOOL_ORDER if k in v)
