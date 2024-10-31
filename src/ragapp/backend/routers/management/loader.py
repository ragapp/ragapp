import logging

from fastapi import APIRouter, Depends
from fastapi.exceptions import HTTPException
from fastapi.responses import JSONResponse

from backend.controllers.loader import LoaderManager, loader_manager
from backend.models.loader import LoaderConfig, SupportedLoaders

loader_router = r = APIRouter()
logger = logging.getLogger("uvicorn")


@r.get("")
def loader_config(
    loader_name: SupportedLoaders,
    loader_manager: LoaderManager = Depends(loader_manager),
):
    """
    Get the current loader configuration.
    """
    try:
        loader = loader_manager.get_loader(loader_name)
        return loader.dict()
    except Exception as e:
        logger.exception(e, exc_info=True)
        raise HTTPException(
            status_code=500, detail="Could not get loader configuration!"
        )


@r.post("")
def update_loader_config(
    loader_config: LoaderConfig,
    loader_manager: LoaderManager = Depends(loader_manager),
):
    """
    Update the loader configuration.
    """
    try:
        loader_manager.update_loader(loader_config)
        return JSONResponse(content={"message": "Loader configuration updated!"})
    except Exception as e:
        logger.exception(e, exc_info=True)
        raise HTTPException(
            status_code=500, detail="Could not update loader configuration!"
        )
