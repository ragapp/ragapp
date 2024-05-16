from typing import Optional, Annotated
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from src.models.env_config import EnvConfig, get_config
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
    # If the new config has a different model provider,
    # We need to:
    # 1. Reload the llama_index settings
    # 2. Generate the index again
    init_settings()
    if new_config.model_provider != config.model_provider:
        reset_index()

    # Response with the updated config
    config = get_config()
    return JSONResponse(
        {
            "message": "Config updated successfully.",
            "data": config.to_api_response(),
        }
    )
