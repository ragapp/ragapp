from dotenv import load_dotenv

load_dotenv()

# flake8: noqa
import logging
import os

from llama_index.core.indices import VectorStoreIndex
from llama_index.indices.managed.llama_cloud import LlamaCloudIndex

from backend.engine.vectordb import get_vector_store

logger = logging.getLogger("uvicorn")


def get_llama_cloud_index():
    name = os.getenv("LLAMA_CLOUD_INDEX_NAME")
    project_name = os.getenv("LLAMA_CLOUD_PROJECT_NAME")
    api_key = os.getenv("LLAMA_CLOUD_API_KEY")
    base_url = os.getenv("LLAMA_CLOUD_BASE_URL")

    if name is None or project_name is None or api_key is None:
        raise ValueError(
            "Please set LLAMA_CLOUD_INDEX_NAME, LLAMA_CLOUD_PROJECT_NAME and LLAMA_CLOUD_API_KEY"
            " to your environment variables or config them in .env file"
        )

    index = LlamaCloudIndex(
        name=name,
        project_name=project_name,
        api_key=api_key,
        base_url=base_url,
    )
    return index


def get_index():
    use_llama_cloud = os.getenv("USE_LLAMA_CLOUD", "false").lower() == "true"
    if use_llama_cloud:
        logger.info("Connecting to LlamaCloud...")
        return get_llama_cloud_index()
    else:
        logger.info("Connecting vector store...")
        store = get_vector_store()
        # Load the index from the vector store
        # If you are using a vector store that doesn't store text,
        # you must load the index from both the vector store and the document store
        index = VectorStoreIndex.from_vector_store(store)
        logger.info("Finished load index from vector store.")
        return index
