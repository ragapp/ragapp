from dotenv import load_dotenv

load_dotenv()

# flake8: noqa
import logging
import os

from llama_index.core.indices import VectorStoreIndex
from llama_index.indices.managed.llama_cloud import LlamaCloudIndex
from llama_index.core.callbacks import CallbackManager

from backend.engine.vectordb import get_vector_store

logger = logging.getLogger("uvicorn")


def get_llama_cloud_index(callback_manager: CallbackManager = None, **kwargs):
    from app.engine.llamacloud_index import get_index, IndexConfig

    index_config = IndexConfig(callback_manager=callback_manager, **kwargs)
    return get_index(index_config)


def get_vector_store_index(callback_manager: CallbackManager = None, **kwargs):
    from app.engine.index import get_index, IndexConfig

    index_config = IndexConfig(callback_manager=callback_manager, **kwargs)
    return get_index(index_config)


def get_index(callback_manager: CallbackManager = None, **kwargs):
    use_llama_cloud = os.getenv("USE_LLAMA_CLOUD", "false").lower() == "true"
    if use_llama_cloud:
        logger.info("Connecting to LlamaCloud...")
        return get_llama_cloud_index(callback_manager=callback_manager, **kwargs)
    else:
        logger.info("Connecting vector store...")
        return get_vector_store_index(callback_manager=callback_manager, **kwargs)
