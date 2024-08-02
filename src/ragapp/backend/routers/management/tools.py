import logging
from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

from backend.controllers.tools import ToolsManager, tools_manager
from backend.models.tools import Tools

tools_router = r = APIRouter()

logger = logging.getLogger("uvicorn")


@r.get("")
def get_tools(
    tools_manager: Annotated[ToolsManager, Depends(tools_manager)],
) -> Tools:
    """
    Get all configured tools.
    """
    return tools_manager.get_tools()


@r.post("/{tool_name}")
def update_tool(
    tool_name: str,
    data: dict,
    tools_manager: Annotated[ToolsManager, Depends(tools_manager)],
) -> JSONResponse:
    """
    Update a tool configuration.
    """
    tools_manager.update_tool(tool_name, data)
    return JSONResponse(content={"message": "Tool updated."})
