import os
from llama_index.vector_stores.qdrant import QdrantVectorStore


def get_vector_store(user_id: str):
    collection_name = f"{os.getenv('QDRANT_COLLECTION', 'default')}_{user_id}"
    url = os.getenv("QDRANT_URL")
    api_key = os.getenv("QDRANT_API_KEY")
    if not collection_name or not url:
        raise ValueError(
            "Please set QDRANT_COLLECTION, QDRANT_URL"
            " to your environment variables or config them in the .env file"
        )
    store = QdrantVectorStore(
        collection_name=collection_name,
        url=url,
        api_key=api_key,
    )
    return store
