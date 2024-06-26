from typing import Dict, ClassVar, Literal
from pydantic import BaseModel, Field


class ImageGeneratorToolConfig(BaseModel):
    api_key: str | None = Field(
        default=None,
        description="The Stability AI API key to use for the image generator.",
    )


class ImageGeneratorTool(BaseModel):
    config_id: ClassVar[str] = "img_gen"
    name: Literal["image_generator"] = "image_generator"
    tool_type: Literal["local"] = "local"
    label: Literal["Image Generator"] = "Image Generator"
    description: str = (
        "Generate images from the provided text using the Stability AI API"
    )
    custom_prompt: ClassVar[
        str
    ] = """- Provide a text prompt to generate an image.
- Show the image to the user by using the absolute link to the image from the tool output."""
    config: ImageGeneratorToolConfig | None = Field(
        default=ImageGeneratorToolConfig(),
    )
    enabled: bool = False
