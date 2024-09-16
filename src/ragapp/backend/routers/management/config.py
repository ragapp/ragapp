from typing import Annotated, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse

from backend.controllers.agents import AgentManager, agent_manager
from backend.controllers.env_configs import EnvConfigManager
from backend.controllers.providers import AIProvider
from backend.models.chat_config import ChatConfig
from backend.models.model_config import ModelConfig
from backend.tasks.indexing import reset_index

config_router = r = APIRouter()


@r.get("/is_configured")
def is_configured(
    config: ModelConfig = Depends(ModelConfig.get_config),
) -> bool:
    return config.configured


@r.get("/chat", tags=["Chat config"])
def get_chat_config(
    config: ChatConfig = Depends(ChatConfig.get_config),
):
    return config.to_api_response()


@r.post("/chat", tags=["Chat config"])
def update_chat_config(
    new_config: ChatConfig,
    config: ChatConfig = Depends(ChatConfig.get_config),
):
    EnvConfigManager.update(config, new_config, rollback_on_failure=True)

    updated_config = ChatConfig.get_config()

    return JSONResponse(
        {
            "message": "Config updated successfully.",
            "data": updated_config.to_api_response(),
        }
    )


@r.get("/models", tags=["Model config"])
def get_model_config(
    config: ModelConfig = Depends(ModelConfig.get_config),
):
    return config.to_api_response()


@r.post("/models", tags=["Model config"])
def update_model_config(
    new_config: ModelConfig,
    agent_manager: Annotated[AgentManager, Depends(agent_manager)],
    config: ModelConfig = Depends(ModelConfig.get_config),
):
    # If the new config has a different model provider
    # or embedding model
    # or the model config has not been configured yet
    # We need to:
    # 1. Reload the llama_index settings
    # 2. Reset the index

    if new_config.model_provider != config.model_provider:
        # If multi-agent mode is enabled, and the new model is not a function calling model
        # raise an error
        if (
            agent_manager.is_using_multi_agents_mode()
            and not agent_manager.check_supported_multi_agents_model(
                new_config.model_provider, new_config.model
            )
        ):
            raise HTTPException(
                status_code=400,
                detail="You are using multi-agent mode, please select a model supporting function calling. Or remove the multi-agent mode by deleting agents.",
            )

    EnvConfigManager.update(config, new_config, rollback_on_failure=True)

    # We won't rollback the changes if the index reset fails
    if (
        (new_config.model_provider != config.model_provider)
        or (new_config.embedding_model != config.embedding_model)
        or not config.configured
    ):
        reset_index()

    # Response with the updated config
    config = ModelConfig.get_config()

    return JSONResponse(
        {
            "message": "Config updated successfully.",
            "data": config.to_api_response(),
        }
    )


@r.get("/models/list", tags=["Model config"])
def get_available_models(
    provider: Optional[str] = Query(
        None,
        description="The provider to fetch the models from. Default is the configured provider.",
    ),
    provider_url: Optional[str] = Query(
        None,
        description="The provider URL to fetch the models from. Default is the configured provider URL.",
    ),
) -> List[str]:
    return AIProvider.fetch_available_models(provider, provider_url)
