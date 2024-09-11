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
    def __init__(self):
        self.available_tools = {
            "DuckDuckGo": DuckDuckGoTool,
            "Wikipedia": WikipediaTool,
            "OpenAPI": OpenAPITool,
            "E2BInterpreter": E2BInterpreterTool,
            "ImageGenerator": ImageGeneratorTool,
            "QueryEngine": QueryEngineTool,
        }
        self.config = self.load_config_file()
        self._update_config_with_new_tools()

    @staticmethod
    def load_config_file() -> Dict:
        try:
            with open(AGENT_CONFIG_FILE, "r") as file:
                return yaml.safe_load(file)
        except FileNotFoundError:
            raise FileNotFoundError(f"Agent config file {AGENT_CONFIG_FILE} not found!")

    def _update_config_with_new_tools(self):
        updated = False
        for agent_id, agent_data in self.config.items():
            if "tools" not in agent_data:
                agent_data["tools"] = {}

            for tool_name in self.available_tools:
                if tool_name not in agent_data["tools"]:
                    agent_data["tools"][tool_name] = ToolConfig().dict()
                    updated = True

        if updated:
            self._update_config_file()

    def _update_config_file(self):
        with open(AGENT_CONFIG_FILE, "w") as file:
            yaml.dump(self.config, file)

    def get_agents(self) -> List[AgentConfig]:
        return [
            AgentConfig(agent_id=agent_id, **agent_data)
            for agent_id, agent_data in self.config.items()
        ]

    def create_agent(self, agent_data: Dict) -> AgentConfig:
        if "agent_id" not in agent_data:
            agent_data["agent_id"] = AgentConfig.create_agent_id(agent_data["name"])

        if "role" not in agent_data:
            raise ValueError("Role is required when creating an agent")

        if "tools" not in agent_data:
            agent_data["tools"] = {}
        for tool_name in self.available_tools:
            if tool_name not in agent_data["tools"]:
                agent_data["tools"][tool_name] = ToolConfig().dict()

        new_agent = AgentConfig(**agent_data)
        self.config[new_agent.agent_id] = new_agent.dict(exclude={"agent_id"})
        self._update_config_file()
        AgentPromptManager.update_agent_system_prompts(self.get_agents())
        return new_agent

    def update_agent(self, agent_id: str, data: Dict):
        if agent_id not in self.config:
            raise ValueError(f"Agent with id {agent_id} not found")

        updated_data = self.config[agent_id].copy()
        updated_data.update(data)
        updated_data["agent_id"] = agent_id

        if "role" not in updated_data:
            raise ValueError("Role is required when updating an agent")

        if "tools" not in updated_data:
            updated_data["tools"] = {}
        for tool_name in self.available_tools:
            if tool_name not in updated_data["tools"]:
                updated_data["tools"][tool_name] = ToolConfig().dict()

        # Ensure QueryEngine is enabled if this is the only agent
        if len(self.config) == 1:
            updated_data["tools"]["QueryEngine"]["enabled"] = True

        updated_agent = AgentConfig(**updated_data)
        self.config[agent_id] = updated_agent.dict(exclude={"agent_id"})
        self._update_config_file()
        self._ensure_query_engine_enabled()
        AgentPromptManager.update_agent_system_prompts(self.get_agents())
        return updated_agent

    def delete_agent(self, agent_id: str):
        if agent_id in self.config:
            del self.config[agent_id]
            self._update_config_file()
            self._ensure_query_engine_enabled()

    def _ensure_query_engine_enabled(self):
        if len(self.config) == 1:
            remaining_agent_id = next(iter(self.config))
            self.config[remaining_agent_id]["tools"]["QueryEngine"]["enabled"] = True
            self._update_config_file()
            AgentPromptManager.update_agent_system_prompts(self.get_agents())

    def get_agent_tools(self, agent_id: str) -> List[Tuple[str, object]]:
        agent = self.config.get(agent_id)
        if not agent:
            return []

        tools = []
        for tool_name, tool_config in agent.get("tools", {}).items():
            if tool_config["enabled"]:
                tool = self._get_tool(tool_name, **tool_config["config"])
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
        if agent_id not in self.config:
            raise ValueError(f"Agent {agent_id} not found")

        if "tools" not in self.config[agent_id]:
            self.config[agent_id]["tools"] = {}

        self.config[agent_id]["tools"][tool_name] = data
        self._update_config_file()

        # Update system prompts
        AgentPromptManager.update_agent_system_prompts(self.get_agents())


def agent_manager():
    return AgentManager()
