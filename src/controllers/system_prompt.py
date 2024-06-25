import os
import dotenv
from src.constants import (
    DEFAULT_SYSTEM_PROMPT,
    SYSTEM_PROMPT_WITH_TOOLS_TPL,
    ENV_FILE_PATH,
)
from string import Template


class SystemPromptManager:

    @staticmethod
    def get_tool_custom_prompts(tools: list = None) -> str:
        if tools is None:
            # Only import tools_manager if not provided to avoid circular import
            from src.controllers.tools import tools_manager

            tools = tools_manager().get_tools()

        tool_custom_prompts = ""
        for tool_name, tool in tools:
            if hasattr(tool, "custom_prompt") and tool.enabled:
                tool_custom_prompts += (
                    f"\n==={tool.name}===\n{tool.custom_prompt}\n==={tool.name}==="
                )
        return tool_custom_prompts

    @classmethod
    def update_system_prompts(cls, tools: list = None):
        """
        We construct the system prompt from the custom prompt and tool custom prompts.
        Call this function to update the system prompt once the custom prompts and tool system prompts are updated.
        Args:
            tools (list, optional): List of tools to update the system prompt.
                It will get the tools from the tools manager if not provided.
        """
        # Initialize the system prompt from custom prompt or default prompt
        system_prompt = os.getenv("CUSTOM_PROMPT", DEFAULT_SYSTEM_PROMPT)

        tool_custom_prompts = cls.get_tool_custom_prompts(tools)
        # Update the system prompt with the tool custom prompts
        if tool_custom_prompts != "":
            system_prompt = Template(SYSTEM_PROMPT_WITH_TOOLS_TPL).substitute(
                system_prompt=system_prompt, tool_custom_prompts=tool_custom_prompts
            )

        # Update the system prompt to runtime and dotenv file
        os.environ["SYSTEM_PROMPT"] = system_prompt
        dotenv.set_key(ENV_FILE_PATH, "SYSTEM_PROMPT", system_prompt)
