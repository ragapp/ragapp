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
from src.controllers.system_prompt import SystemPromptManager


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

    def update_tool(self, tool_name: str, data: Dict):
        tool = self._get_tool(tool_name=tool_name, **data)
        config = data.get("config")
        # Add the tool to the config if it is enabled
        # Otherwise, remove it from the config
        if data.get("enabled"):
            self.config[tool.tool_type][tool.config_id] = config
        else:
            if tool.config_id in self.config[tool.tool_type]:
                self.config[tool.tool_type].pop(tool.config_id)
        # Update the system prompts because the tool custom prompts have been updated
        SystemPromptManager.update_system_prompts(tools=self.get_tools())
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
