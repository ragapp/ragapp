import logging

from docker import DockerClient
from docker.errors import DockerException

from app.models.docker_service import ServiceInfo
from app.services.app_config import AppConfigService
from app.services.container import ContainerService

logger = logging.getLogger("uvicorn")


class AppService:
    @classmethod
    def fetch_all_service_info(cls, docker_client: DockerClient) -> list[ServiceInfo]:
        # Get all RAGapp containers from docker server
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

    @classmethod
    def start_apps(
        cls,
        docker_client: DockerClient,
    ):
        # Fetch all app configs
        app_configs = AppConfigService.load_all_configs_from_disk()
        errors = []
        for config in app_configs:
            try:
                container = ContainerService.fetch_ragapp_container(
                    docker_client=docker_client, app_name=config.name
                )
                # App config is running but container is not running
                # Start the container
                if container.status != "running" and config.status == "running":
                    container.start()
                    logger.info(f"Started app {config.name}")
            except DockerException:
                if config.status == "running":
                    # If container not found, create it
                    try:
                        ContainerService.create_ragapp_container(
                            config=config, docker_client=docker_client
                        )
                        logger.info(f"Created app {config.name}")
                    except Exception as e:
                        logger.error(f"Error starting app {config.name}: {e}")
                        errors.append(config.name)

    @classmethod
    def remove_orphaned_apps(
        cls,
        docker_client: DockerClient,
    ):
        all_services = AppService.fetch_all_service_info(docker_client)
        orphaned_services = [
            service for service in all_services if service.status == "orphaned"
        ]
        for service in orphaned_services:
            logger.info(f"Removing orphaned app: {service.app_name}")
            container = ContainerService.fetch_ragapp_container(
                docker_client=docker_client, app_name=service.app_name
            )
            container.remove(force=True)
        return orphaned_services
