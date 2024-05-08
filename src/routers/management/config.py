from typing import Optional, Annotated
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from src.models.env_config import EnvConfig, get_config
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
    # User removed the open_api_key
    # Set it to None to ensure the app functionality
    if new_config.openai_api_key == "":
        new_config.openai_api_key = None
    # Update config
    new_config.to_runtime_env()
    new_config.to_env_file()
    # Reload the llama_index settings
    init_settings()
    return JSONResponse(
        {
            "message": "Config updated successfully.",
            "data": new_config.to_api_response(),
        }
    )
