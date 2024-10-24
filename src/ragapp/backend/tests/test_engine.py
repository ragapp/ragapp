from unittest.mock import MagicMock, patch

import pytest
from llama_index.core.agent import AgentRunner
from llama_index.core.chat_engine import CondensePlusContextChatEngine

from backend.controllers.agents import AgentManager
from backend.engine.engine import get_chat_engine
from backend.models.agent import AgentConfig
from backend.workflows.multi import AgentOrchestrator


@pytest.fixture
def agent_manager():
    return AgentManager()


@pytest.fixture
def mock_get_index():
    with patch("backend.engine.engine.get_index") as mock:
        mock.return_value = MagicMock()
        yield mock


@pytest.fixture
def mock_openai_key(monkeypatch):
    monkeypatch.setenv("OPENAI_API_KEY", "test_key")


@pytest.fixture
def mock_load_tools():
    with patch("backend.workflows.orchestrator.ToolFactory.load_tools") as mock:
        mock.return_value = [MagicMock()]
        yield mock


def test_get_chat_engine_single_agent_no_tools(
    agent_manager, mock_get_index, mock_openai_key, mock_load_tools
):
    agent_config = AgentConfig(
        agent_id="test_agent",
        name="Test Agent",
        role="assistant",
        goal="To assist with tests",
        system_prompt="Test system prompt",
        tools={},
    )
    with patch.object(agent_manager, "get_agents", return_value=[agent_config]):
        with patch.object(agent_manager, "get_agent_tools", return_value=[]):
            engine = get_chat_engine()

    assert isinstance(engine, AgentRunner)


def test_get_chat_engine_single_agent_query_engine_tool(
    agent_manager, mock_get_index, mock_openai_key, mock_load_tools
):
    agent_config = AgentConfig(
        agent_id="test_agent",
        name="Test Agent",
        role="assistant",
        goal="To assist with tests",
        system_prompt="Test system prompt",
        tools={"QueryEngine": {"enabled": True, "config": {}}},
    )
    with patch.object(agent_manager, "get_agents", return_value=[agent_config]):
        with patch.object(
            agent_manager,
            "get_agent_tools",
            return_value=[("QueryEngine", MagicMock())],
        ):
            engine = get_chat_engine()

    assert isinstance(engine, CondensePlusContextChatEngine)


def test_get_chat_engine_single_agent_with_multiple_tools(
    agent_manager, mock_get_index, mock_openai_key, mock_load_tools
):
    agent_config = AgentConfig(
        agent_id="test_agent",
        name="Test Agent",
        role="assistant",
        goal="To assist with tests",
        system_prompt="Test system prompt",
        tools={
            "QueryEngine": {"enabled": True, "config": {}},
            "DuckDuckGo": {"enabled": True, "config": {}},
        },
    )
    with patch.object(agent_manager, "get_agents", return_value=[agent_config]):
        with patch.object(
            agent_manager,
            "get_agent_tools",
            return_value=[("QueryEngine", MagicMock()), ("DuckDuckGo", MagicMock())],
        ):
            engine = get_chat_engine()

    assert isinstance(engine, AgentRunner)


def test_get_chat_engine_multiple_agents(
    agent_manager, mock_get_index, mock_openai_key, mock_load_tools
):
    agent_configs = [
        AgentConfig(
            agent_id=f"test_agent_{i}",
            name=f"Test Agent {i}",
            role="assistant",
            goal=f"To assist with tests {i}",
            system_prompt=f"Test system prompt {i}",
            tools={},
        )
        for i in range(2)
    ]
    with patch.object(agent_manager, "get_agents", return_value=agent_configs):
        with patch.object(agent_manager, "get_agent_tools", return_value=[]):
            engine = get_chat_engine()

    assert isinstance(engine, AgentOrchestrator)


def test_get_chat_engine_no_agents(agent_manager, mock_get_index, mock_openai_key):
    with patch.object(agent_manager, "get_agents", return_value=[]):
        with pytest.raises(
            ValueError, match="Required at least one agent to run chat engine."
        ):
            get_chat_engine()
