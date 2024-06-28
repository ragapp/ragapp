import os
import logging
import asyncio
import uvicorn
from fastapi import FastAPI
from fastapi.responses import RedirectResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from create_llama.backend.app.settings import init_settings
from create_llama.backend.app.api.routers.chat import chat_router
from src.app.routers.management.config import config_router
from src.app.routers.management.files import files_router
from src.app.routers.management.tools import tools_router
from src.app.routers.management.loader import loader_router
from src.app.models.model_config import ModelConfig

init_settings()


async def redirect():
    config = ModelConfig.get_config()
    if config.configured:
        # system is configured - / points to chat UI
        return FileResponse("static/index.html")
    else:
        # system is not configured - redirect to onboarding page
        return RedirectResponse(url="/admin/#new")


def init_app(use_agent: bool = False) -> FastAPI:
    if use_agent:
        from src.app.agent_service import init_and_register_agent, AgentServiceConfig

        agent_service = asyncio.run(init_and_register_agent(AgentServiceConfig()))
        app = agent_service._app
    else:
        app = FastAPI()

    if os.getenv("ENVIRONMENT", "") == "dev":
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
        loader_router, prefix="/api/management/loader", tags=["Knowledge"]
    )

    app.add_api_route("/", redirect, methods=["GET"])

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

    return app
