import logging

from app.docker_client import get_docker_client
from app.models.docker_service import ServiceInfo
from app.models.ragapp import RAGAppContainerConfig
from app.services import AppConfigService, AppDataService, ContainerService
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
    # Get all RAGapp cotnainers from docker server
    containers = ContainerService.fetch_all_ragapp_containers(docker_client)
    services = [
        ServiceInfo.from_docker_container(container) for container in containers
    ]

    # Validate with persisted app configs
    app_configs = AppConfigService.load_all_configs_from_disk()
    config_app_names = [config.name for config in app_configs]
    # Find orphaned containers (the ones that are in Docker but don't have app configs)
    for service in services:
        if service.app_name not in config_app_names:
            logger.warning(f"Orphaned container: {service.name}")
            service.status = "orphaned"
    service_names = [service.app_name for service in services]
    # Find missing containers (the ones that have app configs but not in docker)
    for config in app_configs:
        if config.name not in service_names:
            logger.warning(f"Missing container: {config.name}")
            services.append(
                ServiceInfo(
                    name=config.name,
                    app_name=config.name,
                    status="missing",
                    id="",
                    image=config.image,
                    command=config.command,
                    labels=config.labels,
                    environment=config.environment,
                    network=config.network,
                )
            )
    return services


@r.post("/{app_name}/stop")
def stop_service(
    app_name: str,
    docker_client=Depends(get_docker_client),
):
    try:
        logger.info(f"Stopping app {app_name}")
        container = ContainerService.fetch_ragapp_container(
            docker_client=docker_client, app_name=app_name
        )
        container.stop()
    except DockerException as e:
        raise HTTPException(status_code=400, detail=str(e))
    return Response(status_code=204)


@r.post("/{app_name}/start")
def start_service(
    app_name: str,
    docker_client=Depends(get_docker_client),
):
    try:
        logger.info(f"Starting app {app_name}")
        container = ContainerService.fetch_ragapp_container(
            docker_client=docker_client, app_name=app_name
        )
        container.start()
    except DockerException as e:
        raise HTTPException(status_code=500, detail=str(e))
    return Response(status_code=204)


@r.delete("/{app_name}")
def remove_service(
    app_name: str,
    docker_client=Depends(get_docker_client),
):
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
    container_config = config.to_docker_create_kwargs()

    try:
        current_container = ContainerService.fetch_ragapp_container(
            docker_client=docker_client, app_name=config.name
        )
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

    # Persist app config
    AppConfigService.persist_app_config(config)

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
