import os

from app.engine.tools import ToolFactory
from llama_index.core.callbacks import CallbackManager
from llama_index.core.memory import ChatMemoryBuffer
from llama_index.core.settings import Settings

from backend.engine.constants import DEFAULT_MAX_TOP_K, DEFAULT_TOP_K
from backend.engine.index import get_index
from backend.engine.postprocessors import NodeCitationProcessor, get_reranker


def get_chat_engine(filters=None, params=None, event_handlers=None):
    top_k = int(os.getenv("TOP_K", "3"))
    system_prompt = os.getenv("SYSTEM_PROMPT")
    citation_prompt = os.getenv("SYSTEM_CITATION_PROMPT")
    node_postprocessors = []
    callback_manager = CallbackManager(handlers=event_handlers or [])

    if citation_prompt is not None:
        node_postprocessors.append(NodeCitationProcessor())
        system_prompt = f"{system_prompt}\n{citation_prompt}"

    if os.getenv("USE_RERANKER", "False").lower() == "true":
        top_k = max(top_k, DEFAULT_MAX_TOP_K)
        node_postprocessors.append(get_reranker())
    else:
        top_k = int(os.getenv("TOP_K", DEFAULT_TOP_K))

    index = get_index(callback_manager=callback_manager, **(params or {}))
    if index is None:
        raise RuntimeError("Index is not found")

    tools = ToolFactory.from_env()

    # Use the context chat engine if no tools are provided
    if len(tools) == 0:
        from llama_index.core.chat_engine import CondensePlusContextChatEngine

        memory = ChatMemoryBuffer.from_defaults(
            token_limit=Settings.llm.metadata.context_window - 256
        )

        retriever = index.as_retriever(
            filters=filters, **({"similarity_top_k": top_k} if top_k != 0 else {})
        )

        return CondensePlusContextChatEngine(
            llm=Settings.llm,
            memory=memory,
            system_prompt=system_prompt,
            retriever=retriever,
            node_postprocessors=node_postprocessors,
            callback_manager=callback_manager,
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
            callback_manager=callback_manager,
            verbose=True,  # Show agent logs to console
        )
