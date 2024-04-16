from dotenv import load_dotenv
load_dotenv()

import os
import logging
import uvicorn
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from create_llama.backend.app.settings import init_settings
from create_llama.backend.app.api.routers.chat import chat_router
from src.routers.management.config import config_router

app = FastAPI()
init_settings()

# Add chat router from create_llama/backend
app.include_router(chat_router, prefix="/api/chat")
app.include_router(config_router, prefix="/api/management/config")

# Mount the frontend static files
app.mount("", StaticFiles(directory="static", html=True), name="static")

if __name__ == "__main__":
    app_host = os.getenv("APP_HOST", "0.0.0.0")
    app_port = int(os.getenv("APP_PORT", "8000"))

    uvicorn.run(app="main:app", host=app_host, port=app_port)
