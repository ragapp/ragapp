import threading
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
            "role": "Assistant",
            "backstory": "You are an AI assistant created to help with various tasks.",
            "goal": "To assist users with their queries and tasks efficiently.",
            "system_prompt": "You are Agent 1",
            "system_prompt_template": None,
            "tools": {
                "DuckDuckGo": ToolConfig(
                    enabled=True, config={"param1": "value1"}
                ).dict(),
                "Wikipedia": ToolConfig(enabled=False, config={}).dict(),
                "OpenAPI": ToolConfig().dict(),
                "Interpreter": ToolConfig().dict(),
                "ImageGenerator": ToolConfig().dict(),
                "QueryEngine": ToolConfig().dict(),
                "CodeGenerator": ToolConfig().dict(),
                "DocumentGenerator": ToolConfig().dict(),
            },
            "created_at": 1721060837,
        },
        "agent2": {
            "name": "Agent 2",
            "role": "Researcher",
            "backstory": "You are an AI researcher specializing in data analysis.",
            "goal": "To provide in-depth analysis and insights from given data.",
            "system_prompt": "You are Agent 2",
            "system_prompt_template": None,
            "tools": {
                "DuckDuckGo": ToolConfig().dict(),
                "Wikipedia": ToolConfig().dict(),
                "OpenAPI": ToolConfig().dict(),
                "Interpreter": ToolConfig().dict(),
                "ImageGenerator": ToolConfig().dict(),
                "QueryEngine": ToolConfig().dict(),
                "CodeGenerator": ToolConfig().dict(),
                "DocumentGenerator": ToolConfig().dict(),
            },
            "created_at": 1721060838,
        },
    }


@pytest.fixture
def agent_manager(sample_config):
    # Reset the Singleton instance before each test
    AgentManager._instance = None
    with patch("builtins.open", mock_open(read_data=yaml.dump(sample_config))):
        return AgentManager()


def test_load_config_file(agent_manager, sample_config):
    assert agent_manager.config == sample_config


def test_get_agents(agent_manager):
    agents = agent_manager.get_agents()
    assert len(agents) == 2
    assert isinstance(agents[0], AgentConfig)
    assert agents[0].name == "Agent 1"
    assert agents[0].role == "Assistant"
    assert (
        agents[0].backstory
        == "You are an AI assistant created to help with various tasks."
    )
    assert agents[0].goal == "To assist users with their queries and tasks efficiently."
    assert agents[1].name == "Agent 2"
    assert agents[1].role == "Researcher"


def test_update_agent(agent_manager):
    new_data = {
        "name": "Updated Agent 1",
        "role": "Specialist",
        "backstory": "You are a specialized AI assistant.",
        "goal": "To provide expert assistance in specific domains.",
        "system_prompt": "You are the updated Agent 1",
    }
    with patch.object(agent_manager, "_update_config_file"):
        agent_manager.update_agent("agent1", new_data)

    assert agent_manager.config["agent1"]["name"] == "Updated Agent 1"
    assert agent_manager.config["agent1"]["role"] == "Specialist"
    assert (
        agent_manager.config["agent1"]["backstory"]
        == "You are a specialized AI assistant."
    )
    assert (
        agent_manager.config["agent1"]["goal"]
        == "To provide expert assistance in specific domains."
    )
    assert (
        agent_manager.config["agent1"]["system_prompt"] == "You are the updated Agent 1"
    )


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
        "role": "Analyst",
        "backstory": "You are an AI analyst specializing in data interpretation.",
        "goal": "To provide insightful analysis of complex datasets.",
        "system_prompt": "You are a new agent",
    }
    with patch.object(agent_manager, "_update_config_file"):
        new_agent = agent_manager.create_agent(new_agent_data)

    assert new_agent.agent_id == "new_agent"
    assert new_agent.name == "New Agent"
    assert new_agent.role == "Analyst"
    assert (
        new_agent.backstory
        == "You are an AI analyst specializing in data interpretation."
    )
    assert new_agent.goal == "To provide insightful analysis of complex datasets."
    assert new_agent.system_prompt == "You are a new agent"
    assert "new_agent" in agent_manager.config
    assert "agent_id" not in agent_manager.config["new_agent"]


def test_create_agent_with_custom_id(agent_manager):
    new_agent_data = {
        "agent_id": "custom_id",
        "name": "Custom ID Agent",
        "role": "Specialist",
        "backstory": "You are a specialized AI with a custom ID.",
        "goal": "To showcase the use of custom agent IDs.",
        "system_prompt": "You are a custom ID agent",
    }
    with patch.object(agent_manager, "_update_config_file"):
        new_agent = agent_manager.create_agent(new_agent_data)

    assert new_agent.agent_id == "custom_id"
    assert new_agent.name == "Custom ID Agent"
    assert new_agent.role == "Specialist"
    assert new_agent.backstory == "You are a specialized AI with a custom ID."
    assert new_agent.goal == "To showcase the use of custom agent IDs."
    assert "custom_id" in agent_manager.config
    assert "agent_id" not in agent_manager.config["custom_id"]


def test_concurrent_access(agent_manager):
    def create_agent():
        agent_data = {
            "agent_id": f"agent_{threading.current_thread().name}",
            "name": f"Agent {threading.current_thread().name}",
            "role": "Assistant",
            "backstory": f"You are an AI created in thread {threading.current_thread().name}",
            "goal": f"To demonstrate concurrent access in {threading.current_thread().name}",
            "system_prompt": f"You are {threading.current_thread().name}",
        }
        with patch.object(agent_manager, "_update_config_file"):
            agent_manager.create_agent(agent_data)

    threads = []
    for i in range(5):
        thread = threading.Thread(target=create_agent, name=f"Thread-{i}")
        threads.append(thread)
        thread.start()

    for thread in threads:
        thread.join()

    agents = agent_manager.get_agents()
    assert len(agents) == 2 + 5  # existing 2 plus 5 new
    names = [agent.name for agent in agents]
    for i in range(5):
        assert f"Agent Thread-{i}" in names
