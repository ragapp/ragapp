from datetime import datetime

from fastapi import APIRouter, Depends
from pydantic import BaseModel, computed_field, validator

from app.docker_client import get_docker_client

service_router = r = APIRouter()


class ServiceInfo(BaseModel):
    id: str
    name: str
    app_name: str | None
    created_at: str
    started_at: str | None
    updated_at: str | None
    status: str
    image: str
    restart_count: int

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


@r.get("")
def list_services(
    only_ragapp: bool = True,
    docker_client=Depends(get_docker_client),
) -> list[ServiceInfo]:
    # Filter services by label
    filters = {"label": "ragapp.app_name"} if only_ragapp else {}
    services = docker_client.containers.list(filters=filters)
    service_list = []
    for service in services:
        attrs = service.attrs
        state = attrs.get("State")
        # Get app name from label
        app_name = service.labels.get("ragapp.app_name")
        service_info = ServiceInfo(
            id=service.id,
            name=service.name,
            app_name=app_name,
            started_at=state.get("StartedAt"),
            created_at=attrs.get("Created"),
            updated_at=attrs.get("Updated"),
            status=state.get("Status"),
            image=attrs.get("Image"),
            restart_count=attrs.get("RestartCount"),
        )
        service_list.append(service_info)
    return service_list
