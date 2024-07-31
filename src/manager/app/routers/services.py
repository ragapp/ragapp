import logging

from app.docker_client import get_docker_client
from app.models.docker_service import ServiceInfo
from app.models.ragapp import RAGAppContainerConfig
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
    # Filter services by label
    filters = {"label": "ragapp.app_name"} if only_ragapp else {}
    services = docker_client.containers.list(filters=filters, all=True)
    service_list = []
    for service in services:
        attrs = service.attrs
        state = attrs.get("State")
        # Get app name from label
        app_name = service.labels.get("ragapp.app_name")
        service_info = ServiceInfo(
            id=service.id,
            name=service.name,
            app_name=app_name,
            started_at=state.get("StartedAt"),
            created_at=attrs.get("Created"),
            updated_at=attrs.get("Updated"),
            status=state.get("Status"),
            image=attrs.get("Image"),
            restart_count=attrs.get("RestartCount"),
        )
        service_list.append(service_info)
    return service_list


@r.post("/{service_id}/stop")
def stop_service(
    service_id: str,
    docker_client=Depends(get_docker_client),
):
    try:
        logger.info(f"Stopping container {service_id}")
        container = docker_client.containers.get(service_id)
        container.stop()
    except DockerException as e:
        raise HTTPException(status_code=400, detail=str(e))
    return Response(status_code=204)


@r.post("/{service_id}/start")
def start_service(
    service_id: str,
    docker_client=Depends(get_docker_client),
):
    try:
        logger.info(f"Starting container {service_id}")
        container = docker_client.containers.get(service_id)
        container.start()
    except DockerException as e:
        raise HTTPException(status_code=400, detail=str(e))
    return Response(status_code=204)


@r.delete("/{service_id}")
def remove_service(
    service_id: str,
    docker_client=Depends(get_docker_client),
):
    try:
        logger.info(f"Removing container {service_id}")
        container = docker_client.containers.get(service_id)
        container.remove(force=True)
    except DockerException as e:
        raise HTTPException(status_code=400, detail=str(e))
    return Response(status_code=204)


# Create a new service
@r.post("")
def create_agent(
    config: RAGAppContainerConfig,
    docker_client=Depends(get_docker_client),
):
    container_config = config.to_docker_create_kwargs()

    try:
        current_container = docker_client.containers.get(container_config["name"])
        if current_container:
            raise HTTPException(status_code=400, detail="Container already exists")
    except DockerException:
        pass

    try:
        logger.info(f"Creating container with config: {container_config}")
        container = docker_client.containers.create(**container_config)
    except DockerException as e:
        logger.error(f"Error creating container: {e}")
        raise HTTPException(status_code=400, detail=str(e))

    try:
        container.start()
    except DockerException as e:
        logger.error(f"Error starting container: {e}")
        container.remove(force=True)
        raise HTTPException(status_code=400, detail=str(e))

    return JSONResponse(
        status_code=201,
        content={
            "id": container.id,
            "name": container.name,
        },
    )
