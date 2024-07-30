import logging
import os

import requests

ENVIRONMENT = os.getenv("ENVIRONMENT", "dev")

DEFAULT_QDRANT_HOST = (
    ENVIRONMENT == "dev" and "http://localhost:6333" or "http://qdrant:6333"
)
DEFAULT_VECTOR_SIZE = 1024
DEFAULT_DISTANCE_METRIC = "Cosine"


logger = logging.getLogger(__name__)


def collection_exists(collection_name: str, host: str = DEFAULT_QDRANT_HOST) -> bool:
    qdrant_url = f"{host}/collections/{collection_name}"
    response = requests.head(qdrant_url)
    return response.status_code == 200


def setup_vectordb(
    collection_name: str,
    host: str = DEFAULT_QDRANT_HOST,
    vector_size: int = DEFAULT_VECTOR_SIZE,
    distance_metric: str = DEFAULT_DISTANCE_METRIC,
):
    if collection_exists(collection_name):
        return

    qdrant_url = f"{host}/collections/{collection_name}"
    response = requests.put(
        qdrant_url,
        json={
            "vectors": {
                "size": vector_size,
                "distance": distance_metric,
            }
        },
    )
    response.raise_for_status()
    logger.info(f"Created collection {collection_name} in QdrantDB")


def delete_collection(collection_name: str, host: str = DEFAULT_QDRANT_HOST):
    qdrant_url = f"{host}/collections/{collection_name}"
    response = requests.delete(qdrant_url)
    response.raise_for_status()
    logger.info(f"Deleted collection {collection_name} in QdrantDB")
