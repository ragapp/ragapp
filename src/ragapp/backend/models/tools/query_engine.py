from typing import ClassVar, Literal

from pydantic import BaseModel


class QueryEngineTool(BaseModel):
    config_id: ClassVar[str] = "query_engine"
    name: Literal["query_engine"] = "query_engine"
    tool_type: Literal["local"] = "local"
    label: Literal["Query Engine"] = "Query Engine"
    description: str = "Query the database"
    config: dict = {}
