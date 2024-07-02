from typing import Dict, ClassVar, Literal
from pydantic import BaseModel, Field


class OpenAPIToolConfig(BaseModel):
    openapi_uri: str | None = Field(
        default=None,
        description="The URL to the OpenAPI spec.",
    )
    domain_headers: Dict = Field(
        {},
        description="A mapping of whitelist domains and their headers to use.",
    )


class OpenAPITool(BaseModel):
    config_id: ClassVar[str] = "openapi_action.OpenAPIActionToolSpec"
    name: Literal["openapi"] = "openapi"
    tool_type: Literal["local"] = "local"
    label: Literal["OpenAPI Actions"] = "OpenAPI Actions"
    description: str = "Use the OpenAPI spec to make requests to the API endpoints."
    config: OpenAPIToolConfig | None = Field(
        default=OpenAPIToolConfig(),
    )
    enabled: bool = False
