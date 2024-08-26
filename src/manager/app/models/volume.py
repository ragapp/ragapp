import os
from typing import Optional

from pydantic import BaseModel, computed_field

STATE_HOST_DIR = os.getenv("STATE_HOST_DIR")


class RAGAppVolumeConfig(BaseModel):
    name: str
    container_data_mount_path: str = "/app/data"
    container_config_mount_path: str = "/app/config"
    host_mount_prefix: Optional[str] = STATE_HOST_DIR

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
                f"{self.host_mount_path}/ragapps/data": {
                    "bind": self.container_data_mount_path,
                    "mode": "rw",
                },
                # Config volume
                f"{self.host_mount_path}/ragapps/config": {
                    "bind": self.container_config_mount_path,
                    "mode": "rw",
                },
                # Storage volume
                f"{self.host_mount_path}/ragapps/storage": {
                    "bind": "/app/storage",
                    "mode": "rw",
                },
            }
