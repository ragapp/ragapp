import os

from pydantic import BaseModel, computed_field

RAGAPP_MOUNT_PATH = os.getenv("RAGAPP_MOUNT_PATH")


class RAGAppVolumeConfig(BaseModel):
    name: str
    container_data_mount_path: str = "/app/data"
    container_config_mount_path: str = "/app/config"
    host_mount_prefix: str = RAGAPP_MOUNT_PATH

    @computed_field
    @property
    def host_mount_path(self) -> str:
        return f"{self.host_mount_prefix}/{self.name}"

    def to_container_create_kwargs(self) -> dict | None:
        # If host mount path is provided, return the data and config volumes
        # Otherwise, don't mount any volumes
        # TODO: Simplify these volumes into a mount path if possible
        if self.host_mount_prefix is not None:
            return {
                # Data volume (upload/knowledge files)
                f"{self.host_mount_path}/data": {
                    "bind": self.container_data_mount_path,
                    "mode": "rw",
                },
                # Config volume
                f"{self.host_mount_path}/config": {
                    "bind": self.container_config_mount_path,
                    "mode": "rw",
                },
                # Storage volume
                f"{self.host_mount_path}/storage": {
                    "bind": "/app/storage",
                    "mode": "rw",
                },
            }
