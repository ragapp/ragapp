from typing import List, Optional

from llama_index.core.chat_engine.types import ChatMessage

from backend.agents.multi import AgentOrchestrator
from backend.agents.single import FunctionCallingAgent
from backend.controllers.agents import AgentManager


def get_tool(tool_name: str, config: dict):
    from app.engine.tools import ToolFactory

    tools = ToolFactory.load_tools(config.tool_type, config.name, config.dict())
    return tools[0]


def get_agents(
    chat_history: Optional[List[ChatMessage]] = None,
) -> List[FunctionCallingAgent]:
    agent_manager = AgentManager()
    agents_config = agent_manager.get_agents()
    agents = []
    for agent_config in agents_config:
        agent_tools_config = agent_manager.get_agent_tools(agent_config.agent_id)
        tools = [
            get_tool(tool_name, tool_config)
            for tool_name, tool_config in agent_tools_config
            if tool_config.enabled
        ]
        agents.append(
            FunctionCallingAgent(
                name=agent_config.name,
                role=agent_config.role,
                system_prompt=agent_config.system_prompt,
                tools=tools,
                chat_history=chat_history,
                verbose=True,
            )
        )
    return agents


def create_orchestrator(chat_history: Optional[List[ChatMessage]] = None):
    agents = get_agents(chat_history)
    return AgentOrchestrator(agents=agents, refine_plan=False)
