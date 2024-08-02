from fastapi import APIRouter

from backend.routers.management.config import config_router
from backend.routers.management.files import files_router
from backend.routers.management.llamacloud import llamacloud_router
from backend.routers.management.loader import loader_router
from backend.routers.management.reranker import reranker_router
from backend.routers.management.tools import tools_router

management_router = APIRouter()

management_router.include_router(config_router, prefix="/config")
management_router.include_router(tools_router, prefix="/tools", tags=["Agent"])
management_router.include_router(files_router, prefix="/files", tags=["Knowledge"])
management_router.include_router(
    llamacloud_router, prefix="/llamacloud", tags=["Llamacloud"]
)
management_router.include_router(loader_router, prefix="/loader", tags=["Knowledge"])
management_router.include_router(reranker_router, prefix="/reranker", tags=["Reranker"])
