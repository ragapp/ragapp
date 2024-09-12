import logging
import os
from typing import List, Optional

from app.api.routers.models import ChatMessage
from app.engine.index import IndexConfig, get_index
from llama_index.core.callbacks import CallbackManager
from llama_index.core.chat_engine import CondensePlusContextChatEngine
from llama_index.core.memory import ChatMemoryBuffer
from llama_index.core.settings import Settings

from backend.agents.multi import AgentOrchestrator
from backend.agents.orchestrator import get_agents
from backend.agents.single import FunctionCallingAgent
from backend.engine.constants import DEFAULT_MAX_TOP_K, DEFAULT_TOP_K
from backend.engine.postprocessors import NodeCitationProcessor, get_reranker

logger = logging.getLogger("uvicorn")


def create_chat_engine(
    filters=None,
    params=None,
    event_handlers=None,
    chat_history: Optional[List[ChatMessage]] = None,
) -> CondensePlusContextChatEngine | AgentOrchestrator | FunctionCallingAgent:
    """
    Create chat engine based on the configurations.
    If there is only one agent and no tool enabled, use the context chat engine.
    Otherwise, use the agent workflow.
    """

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

    # We need to create index here because we need to pass the callback manager to the index
    # and we need to pass the index to the agents
    # TODO: Refactor code to create index independently
    index_config = IndexConfig(callback_manager=callback_manager, **(params or {}))
    index = get_index(index_config)
    if index is None:
        raise RuntimeError("Index is not found")

    query_engine = index.as_query_engine(
        similarity_top_k=top_k,
        node_postprocessors=node_postprocessors,
        filters=filters,
    )
    agents = get_agents(chat_history, query_engine)
    if len(agents) == 1:
        tools = agents[0].tools
        if len(tools) == 1:
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
            return agents[0]
    else:
        return AgentOrchestrator(agents=agents, refine_plan=False)
