from dotenv import load_dotenv
from src.constants import ENV_FILE_PATH

load_dotenv(
    dotenv_path=ENV_FILE_PATH,
)

import os
import logging
import uvicorn
from fastapi import FastAPI
from fastapi.responses import RedirectResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from create_llama.backend.app.settings import init_settings
from create_llama.backend.app.api.routers.chat import chat_router
from src.routers.management.config import config_router
from src.routers.management.files import files_router

app = FastAPI()
init_settings()

# Add chat router from create_llama/backend
app.include_router(chat_router, prefix="/api/chat")
app.include_router(config_router, prefix="/api/management/config")
app.include_router(files_router, prefix="/api/management/files")


@app.get("/")
async def redirect():
    if os.environ.get("OPENAI_API_KEY") is None:
        # system is not configured - redirect to onboarding page
        return RedirectResponse(url="/admin/#new")
    else:
        # system is configured - / points to chat UI
        return FileResponse("static/index.html")


app.mount("", StaticFiles(directory="static", html=True), name="static")

if __name__ == "__main__":
    app_host = os.getenv("APP_HOST", "0.0.0.0")
    app_port = int(os.getenv("APP_PORT", "8000"))

    uvicorn.run(app="main:app", host=app_host, port=app_port)
