from fastapi import APIRouter, UploadFile, Depends
from fastapi.responses import JSONResponse
from src.models.file import File
from src.controllers.files import FileHandler, UnsupportedFileExtensionError
from src.models.llamacloud_config import LlamaCloudConfig
from src.controllers.env_configs import EnvConfigManager

llamacloud_router = r = APIRouter()


@r.get("")
def get_llamacloud_config(
    config: LlamaCloudConfig = Depends(LlamaCloudConfig.get_config),
):
    # TODO: call llamacloud API to get dashboard url
    return config.to_api_response()


@r.put("")
def update_llamacloud_config(
    new_config: LlamaCloudConfig,
    config: LlamaCloudConfig = Depends(LlamaCloudConfig.get_config),
):
    EnvConfigManager.update(config, new_config, rollback_on_failure=True)
    return JSONResponse(
        {
            "message": "Config updated successfully.",
            "data": new_config.to_api_response(),
        }
    )
