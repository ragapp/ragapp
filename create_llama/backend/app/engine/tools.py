import os
import yaml
import importlib

from llama_index.core.tools.tool_spec.base import BaseToolSpec
from llama_index.core.tools.function_tool import FunctionTool


class ToolFactory:

    @staticmethod
    def create_tool(tool_name: str, **kwargs) -> list[FunctionTool]:
        try:
            tool_package, tool_cls_name = tool_name.split(".")
            module_name = f"llama_index.tools.{tool_package}"
            module = importlib.import_module(module_name)
            tool_class = getattr(module, tool_cls_name)
            tool_spec: BaseToolSpec = tool_class(**kwargs)
            return tool_spec.to_tool_list()
        except (ImportError, AttributeError) as e:
            raise ValueError(f"Unsupported tool: {tool_name}") from e
        except TypeError as e:
            raise ValueError(
                f"Could not create tool: {tool_name}. With config: {kwargs}"
            ) from e

    @staticmethod
    def from_env() -> list[FunctionTool]:
        tools = []
        if os.path.exists("config/tools.yaml"):
            with open("config/tools.yaml", "r") as f:
                tool_configs = yaml.safe_load(f)
                for name, config in tool_configs.items():
                    tools += ToolFactory.create_tool(name, **config)
        return tools
