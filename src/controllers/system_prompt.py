import os
import dotenv
from src.constants import (
    DEFAULT_SYSTEM_PROMPT,
    SYSTEM_PROMPT_WITH_TOOLS_PROMPT,
    ENV_FILE_PATH,
)
from string import Template


def update_system_prompts():
    """
    We are constructing the system prompt from the custom prompt and tool custom prompts.
    Call this function to update the system prompt once the custom prompts and tool system prompts are updated.
    """
    # custom prompt from chat config
    system_prompt = os.getenv("CUSTOM_PROMPT", None)
    if system_prompt is None:
        system_prompt = DEFAULT_SYSTEM_PROMPT

    # system prompt from tool config
    tool_custom_prompts = os.getenv("TOOL_CUSTOM_PROMPTS", None)

    if tool_custom_prompts is not None and tool_custom_prompts != "":
        system_prompt = SYSTEM_PROMPT_WITH_TOOLS_PROMPT.substitute(
            system_prompt=system_prompt, tool_custom_prompts=tool_custom_prompts
        )
        system_prompt = system_prompt.strip()
    # Update the system prompt in the environment
    os.environ["SYSTEM_PROMPT"] = system_prompt
    # Update the .env file
    dotenv.set_key(ENV_FILE_PATH, "SYSTEM_PROMPT", system_prompt)
