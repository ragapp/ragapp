from typing import ClassVar, Literal, Optional

from pydantic import BaseModel


class QueryEngineTool(BaseModel):
    config_id: ClassVar[str] = "query_engine"
    name: Literal["query_engine"] = "query_engine"
    tool_type: Literal["local"] = "local"
    label: Literal["Query Engine"] = "Query Engine"
    custom_prompt: Optional[str] = None
    description: str = "Query the database"
    config: dict = {}
    enabled: bool = False
