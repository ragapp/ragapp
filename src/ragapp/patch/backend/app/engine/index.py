import logging
import os

from app.engine.llamacloud_index import IndexConfig as LlamaCloudIndexConfig
from app.engine.llamacloud_index import get_index as get_llama_cloud_index
from app.engine.vectordb import get_vector_store
from llama_index.core.callbacks import CallbackManager
from llama_index.core.indices import VectorStoreIndex

logger = logging.getLogger("uvicorn")


class IndexConfig:
    callback_manager: CallbackManager

    def __new__(cls, *args, **kwargs):
        if os.getenv("USE_LLAMA_CLOUD", "false").lower() == "true":
            return LlamaCloudIndexConfig(
                callback_manager=CallbackManager(),
            )
        else:
            return super().__new__(cls)

    def __init__(self, callback_manager: CallbackManager = None):
        self.callback_manager = callback_manager or CallbackManager()

    @classmethod
    def from_env(cls):
        if os.getenv("USE_LLAMA_CLOUD", "false").lower() == "true":
            return LlamaCloudIndexConfig()
        else:
            return cls()


def get_index(index_config=None):
    if index_config is None:
        index_config = IndexConfig.from_env()
    if isinstance(index_config, LlamaCloudIndexConfig):
        return get_llama_cloud_index(index_config)
    else:
        store = get_vector_store()
        # Load the index from the vector store
        # If you are using a vector store that doesn't store text,
        # you must load the index from both the vector store and the document store
        index = VectorStoreIndex.from_vector_store(
            store, callback_manager=index_config.callback_manager
        )
        logger.info("Finished load index from vector store.")
        return index


# For compatibility with LLamaCloudFileService
def get_client():
    if os.getenv("USE_LLAMA_CLOUD", "false").lower() == "true":
        from app.engine.llamacloud_index import get_client

        return get_client()
    else:
        return None
