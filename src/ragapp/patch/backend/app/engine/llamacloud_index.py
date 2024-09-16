from typing import Optional

from llama_index.core.callbacks import CallbackManager
from llama_index.core.ingestion.api_utils import (
    get_client as llama_cloud_get_client,
)
from llama_index.indices.managed.llama_cloud import LlamaCloudIndex
from pydantic import BaseModel, Field

from backend.models.llamacloud_config import LlamaCloudConfig


class IndexConfig(BaseModel):
    llama_cloud_pipeline_config: LlamaCloudConfig = Field(
        default_factory=LlamaCloudConfig.get_config,
        alias="llamaCloudPipeline",
    )
    callback_manager: Optional[CallbackManager] = Field(
        default=None,
    )

    def to_index_kwargs(self) -> dict:
        return {
            "name": self.llama_cloud_pipeline_config.llama_cloud_index_name,
            "project_name": self.llama_cloud_pipeline_config.llama_cloud_project_name,
            "api_key": self.llama_cloud_pipeline_config.llama_cloud_api_key,
            "callback_manager": self.callback_manager,
        }


def get_index(config: IndexConfig = None):
    if config is None:
        config = IndexConfig()
    index = LlamaCloudIndex(**config.to_index_kwargs())

    return index


def get_client():
    config = IndexConfig()
    return llama_cloud_get_client(
        api_key=config.llama_cloud_pipeline_config.llama_cloud_api_key
    )
