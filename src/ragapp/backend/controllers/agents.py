import threading  # Import threading
from datetime import datetime
from functools import lru_cache
from typing import Dict, List, Tuple

import yaml

from backend.constants import AGENT_CONFIG_FILE
from backend.controllers.agent_prompt_manager import AgentPromptManager
from backend.models.agent import AgentConfig, ToolConfig
from backend.models.tools import (
    DuckDuckGoTool,
    E2BInterpreterTool,
    ImageGeneratorTool,
    OpenAPITool,
    QueryEngineTool,
    WikipediaTool,
)


class AgentManager:
    _instance = None
    _lock = threading.Lock()  # Class-level lock for singleton instantiation
    _config_lock = threading.RLock()  # Reentrant lock for config access

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super(AgentManager, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        # Prevent re-initialization in singleton
        if not hasattr(self, "initialized"):
            self.available_tools = {
                "DuckDuckGo": DuckDuckGoTool,
                "Wikipedia": WikipediaTool,
                "OpenAPI": OpenAPITool,
                "Interpreter": E2BInterpreterTool,
                "ImageGenerator": ImageGeneratorTool,
                "QueryEngine": QueryEngineTool,
            }
            self.config = self.load_config_file()
            self._ensure_all_tools_exist()
            self.initialized = True

    @staticmethod
    def load_config_file() -> Dict:
        try:
            with open(AGENT_CONFIG_FILE, "r") as file:
                return yaml.safe_load(file) or {}
        except FileNotFoundError:
            raise FileNotFoundError(f"Agent config file {AGENT_CONFIG_FILE} not found!")
        except yaml.YAMLError as e:
            raise ValueError(f"Error parsing YAML file: {str(e)}")

    def _ensure_all_tools_exist(self):
        with self._config_lock:  # Acquire lock for config modification
            updated = False
            for agent_id, agent_data in self.config.items():
                if "tools" not in agent_data:
                    agent_data["tools"] = {}

                # Add missing tools
                for tool_name in self.available_tools:
                    if tool_name not in agent_data["tools"]:
                        agent_data["tools"][tool_name] = ToolConfig().dict()
                        updated = True

            if updated:
                self._update_config_file()

    def _update_config_file(self):
        with self._config_lock:  # Acquire lock for file writing
            try:
                with open(AGENT_CONFIG_FILE, "w") as file:
                    yaml.dump(self.config, file)
            except IOError as e:
                raise IOError(f"Failed to write to config file: {str(e)}")

    def get_agents(self) -> List[AgentConfig]:
        with self._config_lock:  # Acquire lock for reading config
            agents = [
                AgentConfig(agent_id=agent_id, **agent_data)
                for agent_id, agent_data in self.config.items()
            ]
        return sorted(agents, key=lambda x: x.created_at)  # Sort by creation time

    def create_agent(self, agent_data: Dict) -> AgentConfig:
        with self._config_lock:
            if "agent_id" not in agent_data:
                agent_data["agent_id"] = AgentConfig.create_agent_id(agent_data["name"])

            if "role" not in agent_data:
                raise ValueError("Role is required when creating an agent")

            agent_data["created_at"] = datetime.utcnow()

            if "tools" not in agent_data:
                agent_data["tools"] = {}
            for tool_name in self.available_tools:
                if tool_name not in agent_data["tools"]:
                    agent_data["tools"][tool_name] = ToolConfig().dict()

            new_agent = AgentConfig(**agent_data)
            self.config[new_agent.agent_id] = new_agent.dict(exclude={"agent_id"})
            self._update_agent_config_system_prompt(new_agent.agent_id)
            self._update_config_file()
            return new_agent

    def update_agent(self, agent_id: str, data: Dict):
        with self._config_lock:
            if agent_id not in self.config:
                raise ValueError(f"Agent with id {agent_id} not found")

            updated_data = self.config[agent_id].copy()
            updated_data.update(data)
            updated_data["agent_id"] = agent_id

            if "role" not in updated_data:
                raise ValueError("Role is required when updating an agent")

            if "tools" not in updated_data:
                updated_data["tools"] = {}

            for tool_name, tool_class in self.available_tools.items():
                if tool_name not in updated_data["tools"]:
                    updated_data["tools"][tool_name] = tool_class().dict()
                else:
                    try:
                        # This will trigger the validation
                        tool_instance = tool_class(**updated_data["tools"][tool_name])
                        # if data model has validate_config method, call it
                        if hasattr(tool_instance, "validate_config"):
                            if not tool_instance.validate_config():
                                raise ValueError(
                                    f"Invalid configuration for {tool_name}"
                                )
                        updated_data["tools"][tool_name] = tool_instance.dict()
                    except ValueError as e:
                        raise ValueError(
                            f"Invalid configuration for {tool_name}: {str(e)}"
                        )

            try:
                updated_agent = AgentConfig(**updated_data)
            except ValueError as e:
                raise ValueError(f"Invalid agent configuration: {str(e)}")

            self.config[agent_id] = updated_agent.dict(exclude={"agent_id"})
            self._update_agent_config_system_prompt(agent_id)
            self._update_config_file()
            return updated_agent

    def delete_agent(self, agent_id: str):
        with self._config_lock:
            if agent_id in self.config:
                del self.config[agent_id]
                self._update_config_file()

    def get_agent_tools(self, agent_id: str) -> List[Tuple[str, object]]:
        with self._config_lock:
            agent = self.config.get(agent_id)
            if not agent:
                return []

            tools = []
            for tool_name, tool_config in agent.get("tools", {}).items():
                if tool_config.get("enabled", False):
                    kwargs = {}
                    kwargs["config"] = tool_config.get("config", {})
                    kwargs["enabled"] = tool_config.get("enabled", False)
                    tool = self._get_tool(tool_name, **kwargs)
                    if tool:
                        tools.append((tool_name, tool))
            return tools

    def _get_tool(self, tool_name: str, **kwargs):
        tool_class = self.available_tools.get(tool_name)
        if tool_class:
            return tool_class(**kwargs)
        else:
            raise ValueError(f"Tool {tool_name} not found")

    def update_agent_tool(self, agent_id: str, tool_name: str, data: Dict):
        with self._config_lock:
            if agent_id not in self.config:
                raise ValueError(f"Agent {agent_id} not found")

            if "tools" not in self.config[agent_id]:
                self.config[agent_id]["tools"] = {}

            self.config[agent_id]["tools"][tool_name] = data
            # Update system prompts
            self._update_agent_config_system_prompt(agent_id)
            self._update_config_file()

    def _update_agent_config_system_prompt(self, agent_id: str):
        agent_config = self.config[agent_id]
        system_prompt = AgentPromptManager.generate_agent_system_prompt(agent_config)
        self.config[agent_id]["system_prompt"] = system_prompt

    def is_using_multi_agents_mode(self):
        # Removed the explicit lock acquisition to prevent double-locking
        # Since get_agents() already acquires the lock
        return len(self.get_agents()) > 1

    @staticmethod
    @lru_cache(maxsize=1)
    def check_supported_multi_agents_model(model_provider: str, model: str):
        match model_provider:
            case "openai":
                from llama_index.llms.openai import OpenAI

                llm = OpenAI(model=model)
            case "anthropic":
                from llama_index.llms.anthropic import Anthropic

                llm = Anthropic(model=model)
            case "groq":
                from llama_index.llms.groq import Groq

                llm = Groq(model=model)
            case "ollama":
                from llama_index.llms.ollama import Ollama

                llm = Ollama(model=model)
            case "mistral":
                from llama_index.llms.mistralai import MistralAI

                llm = MistralAI(model=model)
            case _:
                return False

        return llm.metadata.is_function_calling_model


def agent_manager():
    return AgentManager()
