import logging
import os

from app.engine.constants import STORAGE_DIR
from llama_index.core.storage import StorageContext
from llama_index.core.indices import load_index_from_storage

logger = logging.getLogger("uvicorn")


def get_index():
    # check if storage already exists
    if not os.path.exists(STORAGE_DIR):
        return None
    # load the existing index
    logger.info(f"Loading index from {STORAGE_DIR}...")
    storage_context = StorageContext.from_defaults(persist_dir=STORAGE_DIR)
    index = load_index_from_storage(storage_context)
    logger.info(f"Finished loading index from {STORAGE_DIR}")
    return index
