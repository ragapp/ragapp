import os
import logging
from typing import List
from pydantic import BaseModel, validator
from llama_index.core.indices.vector_store import VectorStoreIndex

logger = logging.getLogger(__name__)


class DBLoaderConfig(BaseModel):
    uri: str
    queries: List[str]


def get_db_documents(user_id: str, configs: list[DBLoaderConfig]):
    from llama_index.readers.database import DatabaseReader

    docs = []
    for entry in configs:
        loader = DatabaseReader(uri=entry.uri)
        for query in entry.queries:
            user_query = query.format(user_id=user_id)
            logger.info(f"Loading data from database for user: {user_id} with query: {user_query}")
            documents = loader.load_data(query=user_query)
            docs.extend(documents)

    return documents
