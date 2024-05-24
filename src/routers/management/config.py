from typing import Optional, Annotated, List
from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from src.models.env_config import EnvConfig, get_config
from src.controllers.providers import AIProvider
from src.tasks.indexing import reset_index
from create_llama.backend.app.settings import init_settings

config_router = r = APIRouter()


@r.get("")
def get_current_config(
    config: Annotated[EnvConfig, Depends(get_config)],
):
    return config.to_api_response()


@r.post("")
def update_config(
    new_config: EnvConfig,
    config: EnvConfig = Depends(get_config),
):
    # Update config
    new_config.to_runtime_env()
    new_config.to_env_file()
    # If the new config has a different model provider
    # Or the AI config has not been configured yet
    # We need to:
    # 1. Reload the llama_index settings
    # 2. Reset the index
    init_settings()
    if (new_config.model_provider != config.model_provider) or not config.configured:
        reset_index()

    # Response with the updated config
    config = get_config()
    return JSONResponse(
        {
            "message": "Config updated successfully.",
            "data": config.to_api_response(),
        }
    )


@r.get("/models")
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
