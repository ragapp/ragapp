import os

from app.engine.tools import ToolFactory
from llama_index.core.settings import Settings

from backend.engine.constants import DEFAULT_MAX_TOP_K, DEFAULT_TOP_K
from backend.engine.index import get_index
from backend.engine.reranker import get_reranker


def get_chat_engine(filters=None):
    top_k = int(os.getenv("TOP_K", "3"))
    system_prompt = os.getenv("SYSTEM_PROMPT")
    node_postprocessors = []

    if os.getenv("USE_RERANKER", "False").lower() == "true":
        top_k = max(top_k, DEFAULT_MAX_TOP_K)
        node_postprocessors.append(get_reranker())
    else:
        top_k = int(os.getenv("TOP_K", DEFAULT_TOP_K))

    index = get_index()
    if index is None:
        raise RuntimeError("Index is not found")

    tools = ToolFactory.from_env()

    # Use the context chat engine if no tools are provided
    if len(tools) == 0:
        from llama_index.core.chat_engine import CondensePlusContextChatEngine

        return CondensePlusContextChatEngine.from_defaults(
            retriever=index.as_retriever(
                similarity_top_k=top_k,
                filters=filters,
            ),
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
                filters=filters,
            )
        )
        tools.append(query_engine_tool)  # type: ignore
        return AgentRunner.from_llm(
            llm=Settings.llm,
            tools=tools,  # type: ignore
            system_prompt=system_prompt,
            verbose=True,  # Show agent logs to console
        )
