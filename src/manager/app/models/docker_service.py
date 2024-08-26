from datetime import datetime
from typing import Optional

from docker.models.containers import Container
from pydantic import BaseModel, Field, computed_field, validator


class ServiceInfo(BaseModel):
    id: str
    name: str
    app_name: str | None
    created_at: Optional[str] = None
    started_at: Optional[str] = None
    updated_at: Optional[str] = None
    status: str
    image: Optional[str] = None
    restart_count: Optional[int] = Field(default=0)

    @computed_field  # type: ignore
    @property
    def url(self) -> str:
        return f"/a/{self.app_name}"

    @validator("created_at", "updated_at", "started_at", pre=True)
    def format_datetime(cls, v):
        if v is None:
            return v
        dt = datetime.strptime(v.split(".")[0], "%Y-%m-%dT%H:%M:%S")
        return dt.strftime("%Y-%m-%d %H:%M:%S")

    @classmethod
    def from_docker_container(cls, container: Container) -> "ServiceInfo":
        attrs = container.attrs
        state = container.attrs["State"]
        app_name = container.labels.get("ragapp.app_name")
        return cls(
            id=container.id,
            name=container.name,
            app_name=app_name,
            started_at=state.get("StartedAt"),
            created_at=attrs.get("Created"),
            updated_at=attrs.get("Updated"),
            status=state.get("Status"),
            image=attrs.get("Image"),
            restart_count=attrs.get("RestartCount"),
        )
