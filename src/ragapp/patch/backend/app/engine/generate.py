# flake8: noqa: E402
from datetime import datetime
import json
import mimetypes
from typing import Dict, Optional
from dotenv import load_dotenv
import fsspec

load_dotenv()

import logging
import os
from fsspec.implementations.local import LocalFileSystem

from app.engine.loaders import get_documents
from app.engine.vectordb import get_vector_store
from app.settings import init_settings
from llama_index.core.ingestion import IngestionPipeline
from llama_index.core.node_parser import SentenceSplitter
from llama_index.core.settings import Settings
from llama_index.core.storage import StorageContext
from llama_index.core.storage.docstore import SimpleDocumentStore

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger()

STORAGE_DIR = os.getenv("STORAGE_DIR", "storage")


def get_doc_store():
    # If the storage directory is there, load the document store from it.
    # If not, set up an in-memory document store since we can't load from a directory that doesn't exist.
    if os.path.exists(STORAGE_DIR):
        return SimpleDocumentStore.from_persist_dir(STORAGE_DIR)
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


def persist_storage(docstore, vector_store):
    storage_context = StorageContext.from_defaults(
        docstore=docstore,
        vector_store=vector_store,
    )
    storage_context.persist(STORAGE_DIR)

def extract_file_metadata_func(
    file_path: str, fs: Optional[fsspec.AbstractFileSystem] = None
) -> Dict:
    """
    Get some handy metadata from filesystem.

    Args:
        file_path: str: file path in str
    """
    fs = fs or LocalFileSystem()
    stat_result = fs.stat(file_path)
    
    try:
        file_name = os.path.basename(str(stat_result["name"]))
    except Exception as e:
        file_name = os.path.basename(file_path)

    creation_date = datetime.fromtimestamp(stat_result.get("created")).strftime("%Y-%m-%d")
    last_modified_date = datetime.fromtimestamp(stat_result.get("mtime")).strftime("%Y-%m-%d")
    atime = stat_result.get("atime")
    if atime is None or atime == 0:
        atime = stat_result.get("mtime")
    last_accessed_date = datetime.fromtimestamp(atime).strftime("%Y-%m-%d")
    
    default_meta = {
        "file_path": file_path,
        "file_name": file_name,
        "file_type": mimetypes.guess_type(file_path)[0],
        "file_size": stat_result.get("size"),
        "creation_date": creation_date,
        "last_modified_date": last_modified_date,
        "last_accessed_date": last_accessed_date,
    }
    load_dotenv()
    S3_PATH = os.getenv("s3_path_meta_files")

    print(f"S3_PATH: {S3_PATH}")
    if S3_PATH:
        dir_path = os.path.dirname(S3_PATH)
        parts = dir_path.split(os.sep)
        parts[-1] = "meta_files"

        meta_files_path = os.path.join(parts)
        print(f"meta_files_path:{meta_files_path}")
        json_file_path = os.path.join(meta_files_path, f"{file_name}.json")
        if os.path.exists(json_file_path):
            with open(json_file_path, 'r') as json_file:
                json_data = json.load(json_file)
                default_meta.update(json_data)
    res = {
        meta_key: meta_value
        for meta_key, meta_value in default_meta.items()
        if meta_value is not None
    }
    logger.info(f"File: {res}")

    # Return not null value
    return {
        meta_key: meta_value
        for meta_key, meta_value in default_meta.items()
        if meta_value is not None
    }

def generate_datasource():
    init_settings()
    logger.info("Generate index for the provided data")

    # Get the stores and documents or create new ones
    documents = get_documents(extract_file_metadata_func)
    # Set private=false to mark the document as public (required for filtering)
    for doc in documents:
        doc.metadata["private"] = "false"
    docstore = get_doc_store()
    vector_store = get_vector_store()

    # Run the ingestion pipeline
    _ = run_pipeline(docstore, vector_store, documents)

    # Build the index and persist storage
    persist_storage(docstore, vector_store)

    logger.info("Finished generating the index")


if __name__ == "__main__":
    generate_datasource()
