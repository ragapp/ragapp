import os
from typing import List, Literal, Union

from llama_parse.utils import SUPPORTED_FILE_TYPES as LLAMA_PARSE_SUPPORTED_FILE_TYPES
from pydantic import BaseModel, Field

from backend.constants import ENV_FILE_PATH

DEFAULT_SUPPORTED_FILE_TYPES = [".txt", ".pdf", ".csv"]


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
    data_dir: str = Field(
        default="data",
        description="The directory of the data.",
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
        print(f"Updating environment variable for {self.llama_cloud_api_key}")
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
            "data_dir": self.data_dir,
        }

    def get_supported_file_extensions(self) -> List[str]:
        """
        Get the supported file extensions.
        """
        if self.use_llama_parse:
            return LLAMA_PARSE_SUPPORTED_FILE_TYPES
        return DEFAULT_SUPPORTED_FILE_TYPES


LoaderConfig = Union[FileLoader]
SupportedLoaders = Literal["file"]
