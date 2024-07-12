from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

from src.controllers.env_configs import EnvConfigManager
from src.models.reranker_config import CohereRerankerConfig, get_reranker_config

reranker_router = r = APIRouter()


@r.get("")
def get_llamacloud_config(
    config: CohereRerankerConfig = Depends(get_reranker_config),
):
    return config.to_api_response()


@r.put("")
def update_reranker_config(
    new_config: CohereRerankerConfig,
    config: CohereRerankerConfig = Depends(get_reranker_config),
):
    EnvConfigManager.update(config, new_config, rollback_on_failure=True)
    return JSONResponse(
        {
            "message": "Config updated successfully.",
            "data": new_config.to_api_response(),
        }
    )
