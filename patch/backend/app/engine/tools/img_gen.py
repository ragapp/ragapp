import os
import uuid
import logging
import requests
from typing import Optional
from pydantic import BaseModel, Field
from llama_index.core.tools import FunctionTool

logger = logging.getLogger(__name__)


class ImageGeneratorToolOutput(BaseModel):
    is_success: bool = Field(
        ...,
        description="Whether the image generation was successful.",
    )
    image_url: Optional[str] = Field(
        None,
        description="The URL of the generated image.",
    )
    error_message: Optional[str] = Field(
        None,
        description="The error message if the image generation failed.",
    )


class ImageGeneratorTool:
    _IMG_OUTPUT_FORMAT = "webp"
    _IMG_OUTPUT_DIR = "tool-output"
    _IMG_GEN_API = "https://api.stability.ai/v2beta/stable-image/generate/core"

    def __init__(self, api_key: str = None):
        if not api_key:
            api_key = os.getenv("STABILITY_API_KEY")
        self._api_key = api_key
        self.fileserver_url_prefix = os.getenv("FILESERVER_URL_PREFIX")
        if self._api_key is None:
            raise ValueError(
                "STABILITY_API_KEY key is required to run image generator. Get it here: https://platform.stability.ai/account/keys"
            )
        if self.fileserver_url_prefix is None:
            raise ValueError("FILESERVER_URL_PREFIX is required.")

    def _prepare_output_dir(self):
        """
        Create the output directory if it doesn't exist
        """
        if not os.path.exists(self._IMG_OUTPUT_DIR):
            os.makedirs(self._IMG_OUTPUT_DIR, exist_ok=True)

    def _save_image(self, image_data: bytes):
        self._prepare_output_dir()
        filename = f"{uuid.uuid4()}.{self._IMG_OUTPUT_FORMAT}"
        output_path = os.path.join(self._IMG_OUTPUT_DIR, filename)
        with open(output_path, "wb") as f:
            f.write(image_data)
        url = f"{os.getenv('FILESERVER_URL_PREFIX')}/{self._IMG_OUTPUT_DIR}/{filename}"
        logger.info(f"Saved image to {output_path}.\nURL: {url}")
        return url

    def _call_stability_api(self, prompt: str):
        headers = {
            "authorization": f"Bearer {self._api_key}",
            "accept": "image/*",
        }
        data = {
            "prompt": prompt,
            "output_format": self._IMG_OUTPUT_FORMAT,
        }

        response = requests.post(
            self._IMG_GEN_API,
            headers=headers,
            files={"none": ""},
            data=data,
        )
        response.raise_for_status()

        return response

    def generate_image(self, prompt: str) -> ImageGeneratorToolOutput:
        """
        Use this tool to generate an image based on the prompt.
        Args:
            prompt (str): The prompt to generate the image from.
        """

        try:
            # Call the Stability API
            response = self._call_stability_api(prompt)

            # Save the image and get the URL
            image_url = self._save_image(response.content)

            return ImageGeneratorToolOutput(
                is_success=True,
                image_url=image_url,
            )
        except Exception as e:
            logger.exception(e, exc_info=True)
            return ImageGeneratorToolOutput(
                is_success=False,
                error_message=str(e),
            )


def get_tools(**kwargs):
    return [FunctionTool.from_defaults(ImageGeneratorTool(**kwargs).generate_image)]
