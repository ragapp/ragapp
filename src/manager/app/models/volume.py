import os
from typing import Optional

from pydantic import BaseModel, computed_field

STATE_HOST_DIR = os.getenv("STATE_HOST_DIR")


class RAGAppVolumeConfig(BaseModel):
    name: str
    container_data_path: str = "/app/data"
    container_config_path: str = "/app/config"
    container_storage_path: str = "/app/storage"
    container_output_path: str = "/app/output"
    host_mount_prefix: Optional[str] = STATE_HOST_DIR

    @computed_field
    @property
    def host_mount_path(self) -> str:
        """
        The path to the directory in the host machine where the app's state will be stored
        """
        return f"{self.host_mount_prefix}/ragapps/{self.name}"

    def to_container_create_kwargs(self) -> dict | None:
        # If host mount path is provided, return the data and config volumes
        # Otherwise, don't mount any volumes
        # TODO: Simplify these volumes into a mount path if possible
        if self.host_mount_prefix is not None:
            return {
                # Data volume (upload/knowledge files)
                f"{self.host_mount_path}/data": {
                    "bind": self.container_data_path,
                    "mode": "rw",
                },
                # Config volume
                f"{self.host_mount_path}/config": {
                    "bind": self.container_config_path,
                    "mode": "rw",
                },
                # Storage volume
                f"{self.host_mount_path}/storage": {
                    "bind": self.container_storage_path,
                    "mode": "rw",
                },
                # Ouptut volume
                f"{self.host_mount_path}/output": {
                    "bind": self.container_output_path,
                    "mode": "rw",
                },
            }
