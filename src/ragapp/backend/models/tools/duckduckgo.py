from typing import ClassVar, Dict, Literal, Optional

from pydantic import BaseModel


class DuckDuckGoTool(BaseModel):
    config_id: ClassVar[str] = "duckduckgo"
    name: Literal["duckduckgo"] = "duckduckgo"
    tool_type: Literal["local"] = "local"
    label: Literal["Web Search"] = "Web Search"
    description: str = (
        "Search more information about a topic from the query using DuckDuckGo."
    )
    custom_prompt: Optional[str] = None
    config: Dict = {}
    enabled: bool = False
