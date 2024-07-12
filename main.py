from dotenv import load_dotenv
from src.constants import ENV_FILE_PATH

load_dotenv(dotenv_path=ENV_FILE_PATH, verbose=False)

# flake8: noqa
import logging
import os

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles

from create_llama.backend.app.api.routers.chat import chat_router
from create_llama.backend.app.settings import init_settings
from src.models.model_config import ModelConfig
from src.routers.management.config import config_router
from src.routers.management.files import files_router
from src.routers.management.llamacloud import llamacloud_router
from src.routers.management.loader import loader_router
from src.routers.management.reranker import reranker_router
from src.routers.management.tools import tools_router

app = FastAPI()
init_settings()

environment = os.getenv("ENVIRONMENT")
if environment == "dev":
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Add chat router from create_llama/backend
app.include_router(chat_router, prefix="/api/chat", tags=["Chat"])
app.include_router(config_router, prefix="/api/management/config")
app.include_router(tools_router, prefix="/api/management/tools", tags=["Agent"])
app.include_router(files_router, prefix="/api/management/files", tags=["Knowledge"])
app.include_router(
    llamacloud_router, prefix="/api/management/llamacloud", tags=["Llamacloud"]
)
app.include_router(loader_router, prefix="/api/management/loader", tags=["Knowledge"])
app.include_router(
    reranker_router, prefix="/api/management/reranker", tags=["Reranker"]
)


@app.get("/")
async def redirect():
    config = ModelConfig.get_config()
    if config.configured:
        # system is configured - / points to chat UI
        return FileResponse("static/index.html")
    else:
        # system is not configured - redirect to onboarding page
        return RedirectResponse(url="/admin/#new")


# Mount the data files to serve the file viewer
app.mount(
    "/api/files/data",
    StaticFiles(directory="data", check_dir=False),
)

# Mount the output files from tools
app.mount(
    "/api/files/tool-output",
    StaticFiles(directory="tool-output", check_dir=False),
)

# Mount the frontend static files
app.mount(
    "",
    StaticFiles(directory="static", check_dir=False, html=True),
)

if __name__ == "__main__":
    app_host = os.getenv("APP_HOST", "0.0.0.0")
    app_port = int(os.getenv("APP_PORT", "8000"))
    reload = environment == "dev"

    uvicorn.run(
        app="main:app", host=app_host, port=app_port, reload=reload, loop="asyncio"
    )
