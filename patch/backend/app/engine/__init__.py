import os

from app.engine.constants import DEFAULT_RERANK_TOP_K, DEFAULT_TOP_K
from app.engine.index import get_index
from app.engine.reranker import get_reranker
from app.engine.tools import ToolFactory
from llama_index.core.settings import Settings


def get_chat_engine():
    system_prompt = os.getenv("SYSTEM_PROMPT")
    node_postprocessors = []

    top_k = int(os.getenv("TOP_K", DEFAULT_TOP_K))
    if os.getenv("RERANK_PROVIDER") is not None:
        top_k = max(top_k, DEFAULT_RERANK_TOP_K)
        node_postprocessors.append(get_reranker())

    index = get_index()
    if index is None:
        raise RuntimeError("Index is not found")

    tools = ToolFactory.from_env()

    # Use the context chat engine if no tools are provided
    if len(tools) == 0:
        from llama_index.core.chat_engine import CondensePlusContextChatEngine

        return CondensePlusContextChatEngine.from_defaults(
            retriever=index.as_retriever(similarity_top_k=top_k),
            node_postprocessors=node_postprocessors,
            system_prompt=system_prompt,
            llm=Settings.llm,
        )
    else:
        from llama_index.core.agent import AgentRunner
        from llama_index.core.tools.query_engine import QueryEngineTool

        # Add the query engine tool to the list of tools
        query_engine_tool = QueryEngineTool.from_defaults(
            query_engine=index.as_query_engine(
                similarity_top_k=top_k,
                node_postprocessors=node_postprocessors,
            )
        )
        tools.append(query_engine_tool)  # type: ignore
        return AgentRunner.from_llm(
            llm=Settings.llm,
            tools=tools,  # type: ignore
            system_prompt=system_prompt,
            verbose=True,  # Show agent logs to console
        )
