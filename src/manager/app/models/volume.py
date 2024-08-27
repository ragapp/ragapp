import os

from pydantic import BaseModel, computed_field

from app.constants import RAGAPP_STATE_NAME

STATE_DIR = os.getenv("STATE_DIR")


class RAGAppVolumeConfig(BaseModel):
    name: str
    volumes: list[str] = [
        "data",
        "config",
        "storage",
        "output",
    ]

    @computed_field
    @property
    def host_mount_path(self) -> str:
        """
        The path to the directory in the host machine where the app's state will be stored
        """
        return f"{STATE_DIR}/{RAGAPP_STATE_NAME}/{self.name}"

    def to_container_create_kwargs(self) -> dict | None:
        return {
            f"{self.host_mount_path}/{volume}": {
                "bind": f"/app/{volume}",
                "mode": "rw",
            }
            for volume in self.volumes
        }
