from typing import ClassVar, Dict, Literal
from pydantic import BaseModel


class DuckDuckGoTool(BaseModel):
    config_id: ClassVar[str] = "duckduckgo"
    name: Literal["duckduckgo"] = "duckduckgo"
    tool_type: Literal["local"] = "local"
    label: Literal["Web Search"] = "Web Search"
    description: str = (
        "Search more information about a topic from the query using DuckDuckGo."
    )
    config: Dict = {}
    enabled: bool = False
