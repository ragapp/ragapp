from typing import ClassVar, Literal, Optional

from pydantic import BaseModel, Field


class ImageGeneratorToolConfig(BaseModel):
    api_key: str | None = Field(
        default=None,
        description="The Stability AI API key to use for the image generator.",
    )


class ImageGeneratorTool(BaseModel):
    config_id: ClassVar[str] = "img_gen"
    name: Literal["ImageGenerator"] = "ImageGenerator"
    tool_type: Literal["local"] = "local"
    label: Literal["Image Generator"] = "Image Generator"
    description: str = "Generate images from text descriptions."
    config: ImageGeneratorToolConfig | None = Field(
        default=ImageGeneratorToolConfig(),
    )
    custom_prompt: Optional[str] = (
        """The output link of the generated image must start with '/api/files/output/tool/<image>'. It must be a relative path, don't try adding the domain name or protocol"""
    )
    enabled: bool = False

    def validate_config(self) -> bool:
        if self.enabled and not self.config.api_key:
            raise ValueError("API key is required for enabled Image Generator tool")
        return True
