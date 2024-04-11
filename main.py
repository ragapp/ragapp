import os
import logging
import uvicorn
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware

from create_llama.backend.app.api.routers.chat import chat_router

app = FastAPI()

# Add chat router from create_llama/backend
app.include_router(chat_router, prefix="/api/chat")

# Mount the frontend static files
app.mount("", StaticFiles(directory="static", html=True), name="static")

if __name__ == "__main__":
    app_host = os.getenv("APP_HOST", "0.0.0.0")
    app_port = int(os.getenv("APP_PORT", "8000"))

    uvicorn.run(app="main:app", host=app_host, port=app_port)
