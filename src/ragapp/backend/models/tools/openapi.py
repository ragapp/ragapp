from typing import ClassVar, Dict, Literal, Optional

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
    custom_prompt: Optional[str] = None
    enabled: bool = False

    def validate_config(self) -> bool:
        if self.enabled and not self.config.openapi_uri:
            raise ValueError("OpenAPI URI is required for enabled OpenAPI tool")
        return True
