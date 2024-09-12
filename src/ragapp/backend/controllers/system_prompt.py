import os

import dotenv

from backend.constants import (
    DEFAULT_SYSTEM_PROMPT,
    ENV_FILE_PATH,
)


class SystemPromptManager:
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

        # Update the system prompt to runtime and dotenv file
        os.environ["SYSTEM_PROMPT"] = system_prompt
        dotenv.set_key(ENV_FILE_PATH, "SYSTEM_PROMPT", system_prompt)
