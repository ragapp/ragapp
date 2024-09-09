import logging
from typing import Annotated, Dict, List

from fastapi import APIRouter, Depends, HTTPException

from backend.controllers.agents import AgentManager, agent_manager
from backend.models.agent import AgentConfig, ToolConfig

agents_router = r = APIRouter()

logger = logging.getLogger("uvicorn")


@r.get("")
def get_agents(
    agent_manager: Annotated[AgentManager, Depends(agent_manager)],
) -> List[AgentConfig]:
    """
    Get all configured agents.
    """
    return agent_manager.get_agents()


@r.post("")
def create_agent(
    agent_manager: Annotated[AgentManager, Depends(agent_manager)], agent_data: Dict
) -> AgentConfig:
    """
    Create a new agent.
    """
    try:
        return agent_manager.create_agent(agent_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@r.put("/{agent_id}")
def update_agent(
    agent_id: str,
    agent_data: Dict,
    agent_manager: Annotated[AgentManager, Depends(agent_manager)],
) -> AgentConfig:
    """
    Update an existing agent.
    """
    try:
        return agent_manager.update_agent(agent_id, agent_data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@r.delete("/{agent_id}")
def delete_agent(
    agent_id: str, agent_manager: Annotated[AgentManager, Depends(agent_manager)]
):
    """
    Delete an agent.
    """
    if agent_id not in agent_manager.config:
        raise HTTPException(status_code=404, detail="Agent not found")

    agent_manager.delete_agent(agent_id)
    return {"message": f"Agent {agent_id} deleted successfully"}


@r.get("/{agent_id}/tools")
def get_agent_tools(
    agent_id: str, agent_manager: Annotated[AgentManager, Depends(agent_manager)]
) -> List[Dict]:
    """
    Get all tools configured for a specific agent.
    """
    if agent_id not in agent_manager.config:
        raise HTTPException(status_code=404, detail="Agent not found")

    return agent_manager.get_agent_tools(agent_id)


@r.put("/{agent_id}/tools/{tool_name}")
def update_agent_tool(
    agent_id: str,
    tool_name: str,
    tool_data: ToolConfig,
    agent_manager: Annotated[AgentManager, Depends(agent_manager)],
) -> Dict:
    """
    Update a tool configuration for a specific agent.
    """
    if agent_id not in agent_manager.config:
        raise HTTPException(status_code=404, detail="Agent not found")

    try:
        agent_manager.update_agent_tool(agent_id, tool_name, tool_data.dict())
        return {
            "message": f"Tool {tool_name} updated successfully for agent {agent_id}"
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
