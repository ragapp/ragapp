import logging
from llama_index.core.indices import VectorStoreIndex
from app.engine.vectordb import get_vector_store


logger = logging.getLogger("uvicorn")


def get_index():
    logger.info("Connecting vector store...")
    store = get_vector_store()
    # Load the index from the vector store
    # If you are using a vector store that doesn't store text,
    # you must load the index from both the vector store and the document store
    index = VectorStoreIndex.from_vector_store(store)
    logger.info("Finished load index from vector store.")
    return index
