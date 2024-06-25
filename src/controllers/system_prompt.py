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
    We construct the system prompt from the custom prompt and tool custom prompts.
    Call this function to update the system prompt once the custom prompts and tool system prompts are updated.
    """
    # Initialize the system prompt from custom prompt or default prompt
    system_prompt = os.getenv("CUSTOM_PROMPT", DEFAULT_SYSTEM_PROMPT)

    tool_custom_prompts = os.getenv("TOOL_CUSTOM_PROMPTS", None)
    if tool_custom_prompts is not None and tool_custom_prompts != "":
        # Update the system prompt with the tool custom prompts
        system_prompt = SYSTEM_PROMPT_WITH_TOOLS_TPL.substitute(
            system_prompt=system_prompt, tool_custom_prompts=tool_custom_prompts
        )
        system_prompt = system_prompt.strip()

    # Update the system prompt to env
    os.environ["SYSTEM_PROMPT"] = system_prompt
    dotenv.set_key(ENV_FILE_PATH, "SYSTEM_PROMPT", system_prompt)
