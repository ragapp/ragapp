from unittest.mock import mock_open, patch

import pytest
import yaml

from backend.controllers.agents import AgentManager
from backend.models.agent import AgentConfig, ToolConfig
from backend.models.tools import DuckDuckGoTool


@pytest.fixture
def sample_config():
    return {
        "agent1": {
            "name": "Agent 1",
            "system_prompt": "You are Agent 1",
            "role": "Assistant",  # Add role
            "tools": {
                "DuckDuckGo": ToolConfig(
                    enabled=True, config={"param1": "value1"}
                ).dict(),
                "Wikipedia": ToolConfig(enabled=False, config={}).dict(),
                # Add other tools with default configurations
                "OpenAPI": ToolConfig().dict(),
                "Interpreter": ToolConfig().dict(),
                "ImageGenerator": ToolConfig().dict(),
                "QueryEngine": ToolConfig().dict(),
            },
        },
        "agent2": {
            "name": "Agent 2",
            "system_prompt": "You are Agent 2",
            "role": "Assistant",  # Add role
            "tools": {
                "DuckDuckGo": ToolConfig().dict(),
                "Wikipedia": ToolConfig().dict(),
                "OpenAPI": ToolConfig().dict(),
                "Interpreter": ToolConfig().dict(),
                "ImageGenerator": ToolConfig().dict(),
                "QueryEngine": ToolConfig().dict(),
            },
        },
    }


@pytest.fixture
def agent_manager(sample_config):
    with patch("builtins.open", mock_open(read_data=yaml.dump(sample_config))):
        with patch(
            "backend.controllers.agent_prompt_manager.AgentPromptManager.update_agent_system_prompts"
        ):
            return AgentManager()


def test_load_config_file(agent_manager, sample_config):
    assert agent_manager.config == sample_config


def test_get_agents(agent_manager):
    agents = agent_manager.get_agents()
    assert len(agents) == 2
    assert isinstance(agents[0], AgentConfig)
    assert agents[0].name == "Agent 1"
    assert agents[1].name == "Agent 2"


def test_update_agent(agent_manager):
    new_data = {
        "name": "Updated Agent 1",
        "system_prompt": "You are the updated Agent 1",
        "role": "Assistant",  # Add role
    }
    with patch.object(agent_manager, "_update_config_file"):
        with patch(
            "backend.controllers.agent_prompt_manager.AgentPromptManager.update_agent_system_prompts"
        ):
            agent_manager.update_agent("agent1", new_data)

    assert agent_manager.config["agent1"]["name"] == "Updated Agent 1"
    assert (
        agent_manager.config["agent1"]["system_prompt"] == "You are the updated Agent 1"
    )
    assert agent_manager.config["agent1"]["role"] == "Assistant"


def test_delete_agent(agent_manager):
    with patch.object(agent_manager, "_update_config_file"):
        agent_manager.delete_agent("agent2")

    assert "agent2" not in agent_manager.config


def test_get_agent_tools(agent_manager):
    tools = agent_manager.get_agent_tools("agent1")
    assert len(tools) == 1
    assert isinstance(tools[0][1], DuckDuckGoTool)


def test_update_agent_tool(agent_manager):
    new_tool_data = ToolConfig(enabled=True, config={"param1": "new_value"}).dict()
    with patch.object(agent_manager, "_update_config_file"):
        with patch(
            "backend.controllers.agent_prompt_manager.AgentPromptManager.update_agent_system_prompts"
        ):
            agent_manager.update_agent_tool("agent1", "Wikipedia", new_tool_data)

    assert agent_manager.config["agent1"]["tools"]["Wikipedia"]["enabled"]
    assert (
        agent_manager.config["agent1"]["tools"]["Wikipedia"]["config"]["param1"]
        == "new_value"
    )


def test_get_tool_not_found(agent_manager):
    with pytest.raises(ValueError):
        agent_manager._get_tool("NonExistentTool")


def test_update_nonexistent_agent(agent_manager):
    with pytest.raises(ValueError):
        agent_manager.update_agent_tool(
            "nonexistent_agent", "DuckDuckGo", {"enabled": True}
        )


def test_create_agent(agent_manager):
    new_agent_data = {
        "agent_id": "new_agent",
        "name": "New Agent",
        "system_prompt": "You are a new agent",
        "role": "Assistant",  # Add role
    }
    with patch.object(agent_manager, "_update_config_file"):
        with patch(
            "backend.controllers.agent_prompt_manager.AgentPromptManager.update_agent_system_prompts"
        ):
            new_agent = agent_manager.create_agent(new_agent_data)

    assert new_agent.agent_id == "new_agent"
    assert new_agent.name == "New Agent"
    assert new_agent.system_prompt == "You are a new agent"
    assert new_agent.role == "Assistant"
    assert "new_agent" in agent_manager.config
    assert "agent_id" not in agent_manager.config["new_agent"]


def test_create_agent_with_custom_id(agent_manager):
    new_agent_data = {
        "agent_id": "custom_id",
        "name": "Custom ID Agent",
        "system_prompt": "You are a custom ID agent",
        "role": "Assistant",  # Add role
    }
    with patch.object(agent_manager, "_update_config_file"):
        with patch(
            "backend.controllers.agent_prompt_manager.AgentPromptManager.update_agent_system_prompts"
        ):
            new_agent = agent_manager.create_agent(new_agent_data)

    assert new_agent.agent_id == "custom_id"
    assert new_agent.name == "Custom ID Agent"
    assert new_agent.role == "Assistant"
    assert "custom_id" in agent_manager.config
    assert "agent_id" not in agent_manager.config["custom_id"]
