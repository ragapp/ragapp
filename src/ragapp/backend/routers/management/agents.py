import logging
import os
from typing import Annotated, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException

from backend.controllers.agents import (
    AgentManager,
    AgentTemplateManager,
    agent_manager,
    agent_template_manager,
)
from backend.models.agent import AgentConfig, ToolConfig

agents_router = r = APIRouter()

logger = logging.getLogger("uvicorn")


@r.get("/check_supported_model")
def check_supported_model(
    agent_manager: Annotated[AgentManager, Depends(agent_manager)],
    model_provider: Optional[str] = None,
    model: Optional[str] = None,
):
    """
    Check if the current model is supported for multiple agents mode.
    """
    if model_provider is None:
        model_provider = os.environ.get("MODEL_PROVIDER")
    if model is None:
        model = os.environ.get("MODEL")
    if model_provider is None or model is None:
        raise HTTPException(
            status_code=400,
            detail="Model provider and model are required to check if the model is supported for multiple agents mode.",
        )
    return agent_manager.check_supported_multi_agents_model(model_provider, model)


@r.get("")
def get_agents(
    agent_manager: Annotated[AgentManager, Depends(agent_manager)],
) -> List[AgentConfig]:
    """
    Get all configured agents.
    """
    return agent_manager.get_agents()


@r.get("/multi_agent_supported")
def multi_agent_supported() -> bool:
    """
    Check if the current model is supported multiple agents mode.
    """
    from llama_index.core.settings import Settings

    llm = Settings.llm
    return llm.metadata.is_function_calling_model


@r.post("")
def create_agent(
    agent_manager: Annotated[AgentManager, Depends(agent_manager)], agent_data: Dict
) -> AgentConfig:
    """
    Create a new agent.
    """
    try:
        if not multi_agent_supported():
            raise HTTPException(
                status_code=400,
                detail="Agent mode requires a model supporting function calling but your current model does not support it. Please change to a different model or update your model config.",
            )
        agent_manager.validate_agent_data(agent_data)
        return agent_manager.create_agent(agent_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@r.get("/templates")
def get_templates(
    agent_template_manager: Annotated[
        AgentTemplateManager, Depends(agent_template_manager)
    ],
) -> List[AgentConfig]:
    """
    Get all agent templates.
    """
    return agent_template_manager.get_templates()


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
        agent_manager.validate_agent_data(agent_data)
        return agent_manager.update_agent(agent_id, agent_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


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

    return [tool.dict() for tool_name, tool in agent_manager.get_agent_tools(agent_id)]


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
