import logging
import os
from typing import List, Optional

from app.api.routers.models import ChatMessage
from app.engine.index import IndexConfig, get_index
from llama_index.core.agent import AgentRunner
from llama_index.core.callbacks import CallbackManager
from llama_index.core.chat_engine import CondensePlusContextChatEngine
from llama_index.core.memory import ChatMemoryBuffer
from llama_index.core.settings import Settings
from llama_index.core.tools.query_engine import QueryEngineTool

from backend.agents.orchestrator import create_orchestrator, get_agents
from backend.engine.constants import DEFAULT_MAX_TOP_K, DEFAULT_TOP_K
from backend.engine.postprocessors import NodeCitationProcessor, get_reranker

logger = logging.getLogger("uvicorn")


def create_chat_engine(
    filters=None,
    params=None,
    event_handlers=None,
    chat_history: Optional[List[ChatMessage]] = None,
):
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

    index_config = IndexConfig(callback_manager=callback_manager, **(params or {}))
    index = get_index(index_config)
    if index is None:
        raise RuntimeError("Index is not found")

    # If there is only one agent and no tool enabled, use the context chat engine
    agents = get_agents()
    if len(agents) == 1:
        if len(agents[0].tools) == 1:
            logger.info("Using context chat engine")

            return CondensePlusContextChatEngine(
                llm=Settings.llm,
                memory=ChatMemoryBuffer.from_defaults(
                    token_limit=Settings.llm.metadata.context_window - 256
                ),
                system_prompt=system_prompt,
                retriever=index.as_retriever(
                    filters=filters,
                    **({"similarity_top_k": top_k} if top_k != 0 else {}),
                ),
                node_postprocessors=node_postprocessors,
                callback_manager=callback_manager,
            )
        else:
            raise NotImplementedError("Not implemented")
    else:
        logger.info("Using agent workflow")
        query_engine = index.as_query_engine(
            similarity_top_k=top_k,
            node_postprocessors=node_postprocessors,
            filters=filters,
        )
        workflow = create_orchestrator(chat_history, query_engine)
        return workflow


def _get_chat_engine(filters=None, params=None, event_handlers=None):
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

    index_config = IndexConfig(callback_manager=callback_manager, **(params or {}))
    index = get_index(index_config)
    if index is None:
        raise RuntimeError("Index is not found")

    agents = get_agents()
    if len(agents) == 1:
        agent_tools = agents[0].tools
        if len(agent_tools) == 1:
            # Use the context chat engine if no tools are provided
            return CondensePlusContextChatEngine(
                llm=Settings.llm,
                memory=ChatMemoryBuffer.from_defaults(
                    token_limit=Settings.llm.metadata.context_window - 256
                ),
                system_prompt=system_prompt,
                retriever=index.as_retriever(
                    filters=filters,
                    **({"similarity_top_k": top_k} if top_k != 0 else {}),
                ),
                node_postprocessors=node_postprocessors,
                callback_manager=callback_manager,
            )
        else:
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
