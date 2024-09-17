from typing import ClassVar, Literal

from pydantic import BaseModel, Field


class ImageGeneratorToolConfig(BaseModel):
    api_key: str | None = Field(
        default=None,
        description="The API key to use for the Image Generator.",
    )


class ImageGeneratorTool(BaseModel):
    config_id: ClassVar[str] = "image_generator"
    name: Literal["ImageGenerator"] = "ImageGenerator"
    tool_type: Literal["local"] = "local"
    label: Literal["Image Generator"] = "Image Generator"
    description: str = "Generate images from text descriptions."
    config: ImageGeneratorToolConfig | None = Field(
        default=ImageGeneratorToolConfig(),
    )
    enabled: bool = False

    def validate_config(self) -> bool:
        if self.enabled and not self.config.api_key:
            raise ValueError("API key is required for enabled Image Generator tool")
        return True
