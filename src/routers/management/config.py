from typing import Optional, Annotated, List
from fastapi import APIRouter, Depends, Query
from fastapi.exceptions import HTTPException
from fastapi.responses import JSONResponse
from src.models.model_config import ModelConfig
from src.models.chat_config import ChatConfig
from src.controllers.providers import AIProvider
from src.tasks.indexing import reset_index
from src.controllers.env_configs import EnvConfigManager
from create_llama.backend.app.settings import init_settings

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

    return JSONResponse(
        {
            "message": "Config updated successfully.",
            "data": new_config.to_api_response(),
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
    config: ModelConfig = Depends(ModelConfig.get_config),
):
    # If the new config has a different model provider
    # or embedding model
    # or the model config has not been configured yet
    # We need to:
    # 1. Reload the llama_index settings
    # 2. Reset the index
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
