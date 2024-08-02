from typing import Dict
from pydantic import BaseModel
from .duckduckgo import DuckDuckGoTool
from .wikipedia import WikipediaTool
from .openapi import OpenAPITool, OpenAPIToolConfig
from .interpreter import E2BInterpreterTool, E2BInterpreterToolConfig
from .image_generator import ImageGeneratorTool, ImageGeneratorToolConfig


# Todo: Can simplify to a single function if there is no other logics
class Tools(BaseModel):
    duckduckgo: DuckDuckGoTool = DuckDuckGoTool()
    wikipedia: WikipediaTool = WikipediaTool()
    openapi: OpenAPITool = OpenAPITool()
    interpreter: E2BInterpreterTool = E2BInterpreterTool()
    image_generator: ImageGeneratorTool = ImageGeneratorTool()

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
            image_generator=ImageGeneratorTool(
                enabled=local_config.get(ImageGeneratorTool.config_id) is not None,
                config=local_config.get(ImageGeneratorTool.config_id, {}),
            ),
        )
