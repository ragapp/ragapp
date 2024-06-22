from typing import Dict, Tuple, ClassVar, Literal
from pydantic import BaseModel, Field


class DuckDuckGoTool(BaseModel):
    config_id: ClassVar[str] = "duckduckgo"
    name: Literal["duckduckgo"] = "duckduckgo"
    tool_type: Literal["local"] = "local"
    label: Literal["DuckDuckGo"] = "DuckDuckGo"
    description: str = (
        "Search more information about a topic from the query using DuckDuckGo."
    )
    config: Dict = {}
    enabled: bool = False


class WikipediaTool(BaseModel):
    config_id: ClassVar[str] = "wikipedia.WikipediaToolSpec"
    name: Literal["wikipedia"] = "wikipedia"
    tool_type: Literal["llamahub"] = "llamahub"
    label: Literal["Wikipedia"] = "Wikipedia"
    description: str = (
        "Use Wikipedia to gather more information about a topic from the query."
    )
    config: Dict = {}
    enabled: bool = False


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


class E2BInterpreterToolConfig(BaseModel):
    api_key: str | None = Field(
        default=None,
        description="The API key to use for the E2B Interpreter.",
    )


class E2BInterpreterTool(BaseModel):
    config_id: ClassVar[str] = "interpreter"
    name: Literal["interpreter"] = "interpreter"
    tool_type: Literal["local"] = "local"
    label: Literal["E2B Interpreter"] = "E2B Interpreter"
    description: str = "Execute Python code in a sandbox environment."
    config: E2BInterpreterToolConfig | None = Field(
        default=E2BInterpreterToolConfig(),
    )
    enabled: bool = False


class Tools(BaseModel):
    duckduckgo: DuckDuckGoTool = DuckDuckGoTool()
    wikipedia: WikipediaTool = WikipediaTool()
    openapi: OpenAPITool = OpenAPITool()
    interpreter: E2BInterpreterTool = E2BInterpreterTool()

    @classmethod
    def from_config(cls, config: Dict):
        llama_hub_config = config.get("llamahub", {})
        local_config = config.get("local", {})

        return cls(
            wikipedia=WikipediaTool(
                enabled=llama_hub_config.get(WikipediaTool.config_id) is not None,
                config=llama_hub_config.get(WikipediaTool.config_id, {}),
            ),
            duckduckgo=DuckDuckGoTool(
                enabled=local_config.get(DuckDuckGoTool.config_id) is not None,
                config=local_config.get(DuckDuckGoTool.config_id, {}),
            ),
            openapi=OpenAPITool(
                enabled=local_config.get(OpenAPITool.config_id) is not None,
                config=local_config.get(OpenAPITool.config_id, {}),
            ),
            interpreter=E2BInterpreterTool(
                enabled=local_config.get(E2BInterpreterTool.config_id) is not None,
                config=local_config.get(E2BInterpreterTool.config_id, {}),
            ),
        )
