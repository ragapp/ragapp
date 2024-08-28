import logging

from app.docker_client import get_docker_client
from app.models.docker_service import ServiceInfo
from app.models.ragapp import RAGAppContainerConfig
from app.services import AppConfigService, AppDataService, ContainerService
from app.services.app import AppService
from app.services.container import ContainerServiceError
from app.utils import check_app_name
from docker.errors import DockerException
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse, Response

service_router = r = APIRouter()


logger = logging.getLogger("uvicorn")


@r.get("")
def list_services(
    only_ragapp: bool = True,
    docker_client=Depends(get_docker_client),
) -> list[ServiceInfo]:
    try:
        return AppService.fetch_all_service_info(docker_client)
    except DockerException as e:
        raise HTTPException(status_code=500, detail=str(e))
    pass


@r.post("/{app_name}/stop")
def stop_service(
    app_name: str,
    docker_client=Depends(get_docker_client),
):
    app_name = check_app_name(app_name)
    try:
        logger.info(f"Stopping app {app_name}")
        container = ContainerService.fetch_ragapp_container(
            docker_client=docker_client, app_name=app_name
        )
        container.stop()
        # Update app status
        AppConfigService.update_app_status(app_name, "stopped")
    except DockerException as e:
        raise HTTPException(status_code=400, detail=str(e))
    return Response(status_code=204)


@r.post("/{app_name}/start")
def start_service(
    app_name: str,
    docker_client=Depends(get_docker_client),
):
    app_name = check_app_name(app_name)
    try:
        logger.info(f"Starting app {app_name}")
        container = ContainerService.fetch_ragapp_container(
            docker_client=docker_client, app_name=app_name
        )
        container.start()
        # Update app status
        AppConfigService.update_app_status(app_name, "running")
    except DockerException as e:
        raise HTTPException(status_code=500, detail=str(e))
    return Response(status_code=204)


@r.delete("/{app_name}")
def remove_service(
    app_name: str,
    docker_client=Depends(get_docker_client),
):
    app_name = check_app_name(app_name)
    logger.info(f"Removing app {app_name}")
    try:
        container = ContainerService.fetch_ragapp_container(
            docker_client=docker_client, app_name=app_name
        )
        container.remove(force=True)
    except DockerException as e:
        logger.error(f"Error removing container: {e}")
    finally:
        # Remove app config
        AppConfigService.delete_app_config(app_name=app_name)
        # Remove app data
        AppDataService.remove_app_data(app_name)
    return Response(status_code=204)


# Create a new service
@r.post("")
def create_agent(
    config: RAGAppContainerConfig,
    docker_client=Depends(get_docker_client),
):
    try:
        container = ContainerService.create_ragapp_container(config, docker_client)
    except ContainerServiceError as e:
        raise HTTPException(status_code=500, detail=str(e))

    return JSONResponse(
        status_code=201,
        content={
            "id": container.id,
            "name": container.name,
        },
    )
