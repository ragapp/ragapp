from typing import Dict, ClassVar, Literal
from pydantic import BaseModel, Field


class E2BInterpreterToolConfig(BaseModel):
    api_key: str | None = Field(
        default=None,
        description="The API key to use for the E2B Interpreter.",
    )


class E2BInterpreterTool(BaseModel):
    config_id: ClassVar[str] = "interpreter"
    name: Literal["interpreter"] = "interpreter"
    tool_type: Literal["local"] = "local"
    label: Literal["E2B Interpreter"] = "E2B Interpreter"
    description: str = "Execute Python code in a sandbox environment."
    config: E2BInterpreterToolConfig | None = Field(
        default=E2BInterpreterToolConfig(),
    )
    enabled: bool = False
