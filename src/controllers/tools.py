import os
import dotenv
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
from src.constants import TOOL_CONFIG_FILE, ENV_FILE_PATH
from src.models.tools import (
    DuckDuckGoTool,
    WikipediaTool,
    OpenAPITool,
    ImageGeneratorTool,
    Tools,
)
from src.constants import TOOL_CONFIG_FILE


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
            # Hard-code for E2BInterpreter and Image generator tool
            # to set E2B_API_KEY in .env file
            # Todo: Better handling in upstream code to get the value in config if not provided
            if tool_name == "interpreter":
                api_key = config.get("api_key")
                if api_key:
                    os.environ["E2B_API_KEY"] = api_key
                    dotenv.set_key(ENV_FILE_PATH, "E2B_API_KEY", api_key)
            elif tool_name == "image_generator":
                api_key = config.get("api_key")
                if api_key:
                    os.environ["STABILITY_API_KEY"] = api_key
                    dotenv.set_key(ENV_FILE_PATH, "STABILITY_API_KEY", api_key)
        else:
            if tool.config_id in self.config[tool.tool_type]:
                self.config[tool.tool_type].pop(tool.config_id)
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
