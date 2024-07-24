import os

from app.routers.services import service_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles


def create_app() -> FastAPI:
    app = FastAPI()

    environment = os.getenv("ENVIRONMENT")
    if environment == "dev":
        app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    app.include_router(service_router, prefix="/api/services")
    # Mount the frontend static files
    app.mount(
        "",
        StaticFiles(directory="static", check_dir=False, html=True),
    )

    return app


app = create_app()
