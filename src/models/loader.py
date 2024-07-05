import os
from typing import Union, Literal
from pydantic import BaseModel, Field
from src.constants import ENV_FILE_PATH


class FileLoader(BaseModel):
    loader_name: Literal["file"] = Field(
        description="The name of the loader.",
    )
    use_llama_parse: bool = Field(
        default=False,
        description="Use Llama Parser to parse the file.",
    )
    llama_cloud_api_key: str | None = Field(
        default=None,
        description="API key for LlamaParse.",
    )

    def __init__(self, **data):
        env_api_key = os.getenv("LLAMA_CLOUD_API_KEY")
        if env_api_key and "llama_cloud_api_key" not in data:
            data["llama_cloud_api_key"] = env_api_key
        super().__init__(**data)

    def update_env_api_key(self):
        """
        Update the environment variable for the API key.
        """
        import dotenv

        if self.llama_cloud_api_key:
            # Update runtime environment variable
            os.environ["LLAMA_CLOUD_API_KEY"] = self.llama_cloud_api_key
            # Update .env file
            dotenv.set_key(
                ENV_FILE_PATH, "LLAMA_CLOUD_API_KEY", self.llama_cloud_api_key
            )

    def to_config_dict(self):
        """
        Convert the loader configuration to a dictionary.
        """
        return {
            "use_llama_parse": self.use_llama_parse,
        }


LoaderConfig = Union[FileLoader]
SupportedLoaders = Literal["file"]
