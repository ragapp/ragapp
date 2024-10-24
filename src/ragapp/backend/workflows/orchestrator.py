import re
from typing import List, Optional

from app.engine.tools import ToolFactory
from llama_index.core.chat_engine.types import ChatMessage
from llama_index.core.tools.query_engine import QueryEngineTool, ToolMetadata
from pydantic import BaseModel

from backend.controllers.agents import AgentManager
from backend.workflows.multi import AgentOrchestrator
from backend.workflows.single import FunctionCallingAgent


def get_tool(tool_name: str, config: dict, query_engine=None):
    if tool_name == "QueryEngine":
        # Improve tool usage by setting priority for query engine
        description = f"{config.description or ''}\nThis is a preferred tool to use"
        return QueryEngineTool(
            query_engine=query_engine,
            metadata=ToolMetadata(name=tool_name, description=description),
        )
    tool_config = config.config
    if isinstance(tool_config, BaseModel):
        tool_config = tool_config.dict()
    tools = ToolFactory.load_tools(config.tool_type, config.config_id, tool_config)
    return tools[0]


def get_agents(
    chat_history: Optional[List[ChatMessage]] = None, query_engine=None
) -> List[FunctionCallingAgent]:
    agent_manager = AgentManager()
    agents_config = agent_manager.get_agents()
    agents = []
    for agent_config in agents_config:
        agent_tools_config = agent_manager.get_agent_tools(agent_config.agent_id)
        tools = [
            get_tool(tool_name, tool_config, query_engine)
            for tool_name, tool_config in agent_tools_config
            if tool_config.enabled
        ]
        system_prompt = agent_config.get_system_prompt()
        # The orchestrator uses "role" to select the right agent for a task
        # construct a "description" from the user defined role and goal for better orchestration
        description = f"{agent_config.role}\n and its goals are {agent_config.goal}"
        # OpenAI only allows agent names to match the pattern '^[a-zA-Z0-9_-]+$'."
        # Remove special characters from the agent name
        agent_name = re.sub(r"[^a-zA-Z0-9_-]", "", agent_config.name)

        agents.append(
            FunctionCallingAgent(
                name=agent_name,
                description=description,
                system_prompt=system_prompt,
                tools=tools,
                chat_history=chat_history,
                verbose=True,
            )
        )
    return agents


def create_orchestrator(
    chat_history: Optional[List[ChatMessage]] = None, query_engine=None
):
    agents = get_agents(chat_history, query_engine)
    return AgentOrchestrator(agents=agents, refine_plan=False)
