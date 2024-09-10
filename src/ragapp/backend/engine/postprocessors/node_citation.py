from typing import List, Optional

from llama_index.core import QueryBundle
from llama_index.core.postprocessor.types import BaseNodePostprocessor
from llama_index.core.schema import NodeWithScore


class NodeCitationProcessor(BaseNodePostprocessor):
    """
    Append node_id into metadata for citation purpose.
    Config SYSTEM_CITATION_PROMPT in your runtime environment variable to enable this feature.
    """

    def _postprocess_nodes(
        self,
        nodes: List[NodeWithScore],
        query_bundle: Optional[QueryBundle] = None,
    ) -> List[NodeWithScore]:
        for node_score in nodes:
            node_score.node.metadata["node_id"] = node_score.node.node_id
        return nodes
