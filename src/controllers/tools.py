import os
import dotenv
import re
import yaml
from pydantic import Field, validator
from pydantic_settings import BaseSettings
from typing import Dict, Tuple, List

from src.models.tools import (
    DuckDuckGoTool,
    WikipediaTool,
    OpenAPITool,
    E2BInterpreterTool,
    Tools,
)
from src.constants import TOOL_CONFIG_FILE, ENV_FILE_PATH, TOOL_CONFIG_FILE
from src.models.tools import (
    DuckDuckGoTool,
    WikipediaTool,
    OpenAPITool,
    ImageGeneratorTool,
    Tools,
)
from src.controllers.system_prompt import update_system_prompts


class ToolsManager:
    """
    To manage the tools configuration file
    """

    config_file: Dict

    def __init__(self):
        self.config = self.load_config_file()

    def _get_tool(self, tool_name: str, **kwargs):
        match tool_name:
            case "DuckDuckGo" | "duckduckgo.DuckDuckGoSearchToolSpec" | "duckduckgo":
                return DuckDuckGoTool(**kwargs)
            case "Wikipedia" | "wikipedia.WikipediaToolSpec" | "wikipedia":
                return WikipediaTool(**kwargs)
            case "OpenAPI" | "openapi.OpenAPIActionToolSpec" | "openapi":
                return OpenAPITool(**kwargs)
            case "E2BInterpreter" | "interpreter":
                return E2BInterpreterTool(**kwargs)
            case "ImageGenerator" | "image_generator":
                return ImageGeneratorTool(**kwargs)
            case _:
                raise ValueError(f"Tool {tool_name} not found")

    def get_tools(self):
        tools = Tools.from_config(self.config)
        return tools

    def _update_env(self, env_name: str, env_value: str):
        """
        Update the custom prompts to runtime and dotenv file
        """
        os.environ[env_name] = env_value
        dotenv.set_key(ENV_FILE_PATH, env_name, env_value)

    def _update_tool_custom_prompt(self, tool):
        if hasattr(tool, "custom_prompt"):
            custom_prompts = os.getenv("TOOL_CUSTOM_PROMPTS", "")

            if f"==={tool.name}===" in custom_prompts:
                # Replace the old custom prompt (the content between the tool name pattern)
                # with the new system prompt
                new_custom_prompts = (
                    f"==={tool.name}===\n{tool.custom_prompt}\n==={tool.name}==="
                )
                # Using regex to replace the old system prompt with the new system prompt
                custom_prompts = re.sub(
                    f"==={tool.name}===.*?==={tool.name}===",
                    new_custom_prompts,
                    custom_prompts,
                    flags=re.DOTALL,
                )
            else:
                # Append the new tool custom prompt to the
                custom_prompts += (
                    f"\n==={tool.name}===\n{tool.custom_prompt}\n==={tool.name}==="
                )
            # Update the tool custom prompt to runtime and dotenv file
            self._update_env("TOOL_CUSTOM_PROMPTS", custom_prompts)
        else:
            raise ValueError(f"Tool {tool.name} does not have custom_prompt attribute")

    def _remove_tool_custom_prompt(self, tool):
        if hasattr(tool, "custom_prompt"):
            custom_prompts = os.getenv("TOOL_CUSTOM_PROMPTS", "")
            # Remove
            custom_prompts = re.sub(
                f"==={tool.name}===.*?==={tool.name}===",
                "",
                custom_prompts,
                flags=re.DOTALL,
            ).strip()
            # Update the custom prompts to runtime and dotenv file
            self._update_env("TOOL_CUSTOM_PROMPTS", custom_prompts)
        else:
            raise ValueError(f"Tool {tool.name} does not have custom_prompt attribute")

    def update_tool(self, tool_name: str, data: Dict):
        tool = self._get_tool(tool_name=tool_name, **data)
        config = data.get("config")
        # Add the tool to the config if it is enabled
        # Otherwise, remove it from the config
        if data.get("enabled"):
            self.config[tool.tool_type][tool.config_id] = config
            if hasattr(tool, "custom_prompt"):
                self._update_tool_custom_prompt(tool)
        else:
            if tool.config_id in self.config[tool.tool_type]:
                self.config[tool.tool_type].pop(tool.config_id)
            if hasattr(tool, "custom_prompt"):
                self._remove_tool_custom_prompt(tool)
        # Update the system prompts because the tool custom prompts have been updated
        update_system_prompts()
        self._update_config_file()

    @staticmethod
    def load_config_file() -> Dict:
        try:
            with open(TOOL_CONFIG_FILE, "r") as file:
                return yaml.safe_load(file)
        except FileNotFoundError:
            raise FileNotFoundError(f"Tool config file {TOOL_CONFIG_FILE} not found!")

    def _update_config_file(self):
        with open(TOOL_CONFIG_FILE, "w") as file:
            yaml.dump(self.config, file)


def tools_manager():
    return ToolsManager()
