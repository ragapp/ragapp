import logging
from typing import Optional

from docker import DockerClient
from docker.errors import DockerException
from docker.models.containers import Container

from app.models.ragapp import RAGAppContainerConfig
from app.services.app_config import AppConfigService

logger = logging.getLogger("uvicorn")


class ContainerServiceError(Exception):
    pass


class ContainerService:
    @staticmethod
    def fetch_ragapp_container(
        docker_client: DockerClient,
        app_name: Optional[str] = None,
    ) -> Container:
        container_name = f"ragapp-{app_name}"
        containers = docker_client.containers.list(
            filters={"name": container_name}, all=True
        )
        if len(containers) == 0:
            raise DockerException(f"Container {container_name} not found")
        return containers[0]

    @staticmethod
    def fetch_all_ragapp_containers(
        docker_client: DockerClient,
        include_missing: bool = False,
    ) -> list[Container]:
        filters = {"label": "ragapp.app_name"}
        containers = docker_client.containers.list(filters=filters, all=True)
        return containers

    @staticmethod
    def create_ragapp_container(
        config: RAGAppContainerConfig,
        docker_client: DockerClient,
    ):
        container_config = config.to_docker_create_kwargs()

        try:
            current_container = ContainerService.fetch_ragapp_container(
                docker_client=docker_client, app_name=config.name
            )
            if current_container:
                raise ContainerServiceError("Container already exists")
        except DockerException:
            pass

        try:
            logger.info(f"Creating container with config: {container_config}")
            container = docker_client.containers.create(**container_config)
        except DockerException as e:
            logger.error(f"Error creating container: {e}")
            raise ContainerServiceError(str(e))

        try:
            container.start()
            # Persist app config
            config.status = "running"
            AppConfigService.persist_app_config(config)
        except DockerException as e:
            logger.error(f"Error starting container: {e}")
            container.remove(force=True)
            raise ContainerServiceError(str(e))

        return container

    @staticmethod
    def start_all_containers(
        docker_client: DockerClient,
        app_configs: list[RAGAppContainerConfig],
    ):
        for app in app_configs:
            container_name = f"ragapp-{app.name}"
            # Check if container is already running
            try:
                container = ContainerService.fetch_ragapp_container(
                    docker_client, app.name
                )
                if container.status == "running":
                    continue
                # Start container
                container.start()
                logger.info(f"Container {container_name} started")
            except DockerException:
                # Create container with app config
                container = ContainerService.create_ragapp_container(app, docker_client)
                logger.info(f"Container {container_name} created")
