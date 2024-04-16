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
    return config.dict()


@r.post("")
def update_config(
    new_config: EnvConfig,
    config: EnvConfig = Depends(get_config),
):
    # Update config
    new_config.to_runtime_env()
    new_config.to_env_file()
    # Reload the llama_index settings
    init_settings()
    return JSONResponse({"message": "Config updated successfully."})
