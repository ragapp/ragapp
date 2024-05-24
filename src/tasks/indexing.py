import os
import shutil
import logging
from create_llama.backend.app.engine.generate import generate_datasource


logger = logging.getLogger("uvicorn")


def index_all():
    # Just call the generate_datasource from create_llama for now
    generate_datasource()


def reset_index():
    """
    Reset the index by removing the vector store data and STORAGE_DIR then re-indexing the data.
    """

    def reset_index_chroma():
        from chromadb import PersistentClient

        # Todo: Consider using other method to clear the vector store data
        chroma_path = os.getenv("CHROMA_PATH")
        collection_name = os.getenv("CHROMA_COLLECTION", "default")
        chroma_client = PersistentClient(path=chroma_path)
        if chroma_client.get_or_create_collection(collection_name):
            logger.info(f"Removing collection {collection_name}")
            chroma_client.delete_collection(collection_name)

    def reset_index_qdrant():
        from app.engine.vectordbs.qdrant import get_vector_store

        store = get_vector_store()
        store.client.delete_collection(
            store.collection_name,
        )
        store._create_collection(
            collection_name=store.collection_name,
            vector_size=int(os.getenv("EMBEDDING_DIM", 1536)),
        )

    vector_store_provider = os.getenv("VECTOR_STORE_PROVIDER", "chroma")
    if vector_store_provider == "chroma":
        reset_index_chroma()
    elif vector_store_provider == "qdrant":
        reset_index_qdrant()
    else:
        raise ValueError(f"Unsupported vector provider: {vector_store_provider}")

    # Remove STORAGE_DIR
    storage_context_dir = os.getenv("STORAGE_DIR")
    logger.info(f"Removing {storage_context_dir}")
    if os.path.exists(storage_context_dir):
        shutil.rmtree(storage_context_dir)

    # Run the indexing
    index_all()
