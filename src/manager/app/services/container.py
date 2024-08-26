from typing import Optional

from docker import DockerClient
from docker.errors import DockerException
from docker.models.containers import Container


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
    ) -> list[Container]:
        filters = {"label": "ragapp.app_name"}
        containers = docker_client.containers.list(filters=filters, all=True)
        return containers
