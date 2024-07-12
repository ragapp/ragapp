from typing import Self

from pydantic import Field

from src.models.base_env import BaseEnvConfig


class LlamaCloudConfig(BaseEnvConfig):
    use_llama_cloud: bool | None = Field(
        default=None,
        description="Whether to use the LlamaCloud service or not.",
        env="USE_LLAMA_CLOUD",
    )
    llama_cloud_index_name: str | None = Field(
        default=None,
        description="The name of the LlamaCloud index to use (part of the LlamaCloud project).",
        env="LLAMA_CLOUD_INDEX_NAME",
    )
    llama_cloud_project_name: str | None = Field(
        default=None,
        description="The name of the LlamaCloud project.",
        env="LLAMA_CLOUD_PROJECT_NAME",
    )
    llama_cloud_api_key: str | None = Field(
        default=None,
        description="Get your LlamaCloud API key from https://cloud.llamaindex.ai/",
        env="LLAMA_CLOUD_API_KEY",
    )

    @classmethod
    def get_config(cls) -> Self:
        return cls()
