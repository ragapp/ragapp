from app.engine.index import get_index
from llama_index.indices.managed.llama_cloud import LlamaCloudIndex


def generate_filters(doc_ids):
    current_index = get_index()

    if isinstance(current_index, LlamaCloudIndex):
        from app.engine.llamacloud_filters import generate_filters

        return generate_filters(doc_ids)
    else:
        from app.engine.query_filter import generate_filters

        return generate_filters(doc_ids)
