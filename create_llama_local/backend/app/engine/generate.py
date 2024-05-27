from dotenv import load_dotenv

load_dotenv()

import os
import logging
from llama_index.core.settings import Settings
from llama_index.core.ingestion import IngestionPipeline
from llama_index.core.node_parser import SentenceSplitter
from llama_index.core.storage.docstore import SimpleDocumentStore
from llama_index.core.storage import StorageContext
from app.settings import init_settings
from app.engine.loaders import get_documents
from app.engine.vectordb import get_vector_store


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger()

STORAGE_DIR = os.getenv("STORAGE_DIR", "storage")


def get_doc_store(user_id: str):

    # If the storage directory is there, load the document store from it.
    # If not, set up an in-memory document store since we can't load from a directory that doesn't exist.
    user_storage_dir = f"{STORAGE_DIR}/{user_id}"
    if os.path.exists(user_storage_dir):
        return SimpleDocumentStore.from_persist_dir(user_storage_dir)
    else:
        return SimpleDocumentStore()


def run_pipeline(docstore, vector_store, documents):
    pipeline = IngestionPipeline(
        transformations=[
            SentenceSplitter(
                chunk_size=Settings.chunk_size,
                chunk_overlap=Settings.chunk_overlap,
            ),
            Settings.embed_model,
        ],
        docstore=docstore,
        docstore_strategy="upserts_and_delete",
        vector_store=vector_store,
    )

    # Run the ingestion pipeline and store the results
    nodes = pipeline.run(show_progress=True, documents=documents)

    return nodes


def persist_storage(user_id: str, docstore, vector_store):
    user_storage_dir = f"{STORAGE_DIR}/{user_id}"
    storage_context = StorageContext.from_defaults(
        docstore=docstore,
        vector_store=vector_store,
    )
    storage_context.persist(user_storage_dir)


def generate_datasource(user_id: str):
    init_settings()
    logger.info(f"Generate index for the provided data for user: {user_id}")

    # Get the stores and documents or create new ones
    documents = get_documents(user_id)
    docstore = get_doc_store(user_id)
    vector_store = get_vector_store(user_id)

    # Run the ingestion pipeline
    _ = run_pipeline(docstore, vector_store, documents)

    # Build the index and persist storage
    persist_storage(user_id, docstore, vector_store)
    logger.info(f"Finished generating the index for user: {user_id}")


if __name__ == "__main__":
    import sys
    if len(sys.argv) != 2:
        print("Usage: python generate.py <user_id>")
        sys.exit(1)
    user_id = sys.argv[1]
    generate_datasource(user_id)
