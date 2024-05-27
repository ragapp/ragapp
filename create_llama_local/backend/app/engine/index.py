import logging
from llama_index.core.indices import VectorStoreIndex
from app.engine.vectordb import get_vector_store


logger = logging.getLogger("uvicorn")


def get_index(user_id: str):
    logger.info(f"Connecting vector store for user: {user_id}...")
    store = get_vector_store(user_id)

    # Load the index from the vector store
    # If you are using a vector store that doesn't store text,
    # you must load the index from both the vector store and the document store
    index = VectorStoreIndex.from_vector_store(store)
    logger.info(f"Finished loading index from vector store for user: {user_id}.")
    return index
