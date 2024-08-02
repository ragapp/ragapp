import importlib
import logging
import os

logger = logging.getLogger(__name__)


def get_vector_store():
    provider = os.getenv("VECTOR_STORE_PROVIDER", "chroma")
    try:
        module = importlib.import_module(f"backend.engine.vectordbs.{provider}")
        logger.info(f"Using vector provider: {provider}")
        return module.get_vector_store()
    except ImportError:
        raise ValueError(f"Unsupported vector provider: {provider}")
