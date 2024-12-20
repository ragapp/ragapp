from typing import ClassVar, Literal, Optional

from pydantic import BaseModel, Field


class E2BInterpreterToolConfig(BaseModel):
    api_key: str | None = Field(
        default=None,
        description="The API key to use for the E2B Interpreter.",
    )


class E2BInterpreterTool(BaseModel):
    config_id: ClassVar[str] = "interpreter"
    name: Literal["Interpreter"] = "Interpreter"
    tool_type: Literal["local"] = "local"
    label: Literal["Code Interpreter"] = "Code Interpreter"
    custom_prompt: Optional[
        str
    ] = """- You are a Python interpreter that can run any python code in a secure environment.
- The python code runs in a Jupyter notebook. Every time you call the 'interpreter' tool, the python code is executed in a separate cell. 
- You are given tasks to complete and you run python code to solve them.
- It's okay to make multiple calls to interpreter tool. If you get an error or the result is not what you expected, you can call the tool again. Don't give up too soon!
- Plot visualizations using matplotlib or any other visualization library directly in the notebook.
- You can install any pip package (if it exists) by running a cell with pip install.
- Use absolute url from result to display images or any other media.

# IMPORTANT
- If the user provides files, always pass the file path to the interpreter tool.
- Always remove the "sandbox:" prefix from the link before replying to the user."""
    description: str = "Execute Python code in a sandbox environment."
    config: E2BInterpreterToolConfig | None = Field(
        default=E2BInterpreterToolConfig(),
    )
    enabled: bool = False

    def validate_config(self) -> bool:
        if self.enabled and not self.config.api_key:
            raise ValueError("API key is required for enabled Interpreter tool")
        return self.config
