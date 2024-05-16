import os
import shutil
import logging
from create_llama.backend.app.engine.generate import generate_datasource


logger = logging.getLogger("uvicorn")


def index_all():
    # Just call the generate_datasource from create_llama for now
    # Todo: update this once we added ingestion pipeline in create_llama
    generate_datasource()
    return True


def reset_index():
    from chromadb import PersistentClient

    # Clear all the generated context data and vector store data
    # and re-index the data again

    # Remove STORAGE_DIR
    storage_context_dir = os.getenv("STORAGE_DIR")
    logger.info(f"Removing {storage_context_dir}")
    if os.path.exists(storage_context_dir):
        shutil.rmtree(storage_context_dir)

    # Todo: Consider using other method to clear the vector store data
    chroma_path = os.getenv("CHROMA_PATH")
    collection_name = os.getenv("CHROMA_COLLECTION", "default")
    chroma_client = PersistentClient(path=chroma_path)
    if chroma_client.get_or_create_collection(collection_name):
        logger.info(f"Removing collection {collection_name}")
        chroma_client.delete_collection(collection_name)

    # Re-index the data
    return index_all()
