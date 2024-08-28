from pydantic import BaseModel, computed_field

from app.settings import settings


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
        return f"{settings.state_dir}/{settings.RAGAPP_STATE_NAME}/{self.name}"

    def to_container_create_kwargs(self) -> dict | None:
        # development mode, no need to mount volumes
        if settings.environment != "dev":
            return {
                f"{self.host_mount_path}/{volume}": {
                    "bind": f"/app/{volume}",
                    "mode": "rw",
                }
                for volume in self.volumes
            }
