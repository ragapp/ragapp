from datetime import datetime

from fastapi import APIRouter, Depends
from pydantic import BaseModel, computed_field, validator

from app.constants import DEFAULT_PROJECT_PREFIX
from app.docker_client import get_docker_client

service_router = r = APIRouter()


class ServiceInfo(BaseModel):
    id: str
    name: str
    created_at: str
    started_at: str | None
    updated_at: str | None
    status: str
    image: str
    restart_count: int
    exposed_ports: dict

    @computed_field  # type: ignore
    @property
    def port(self) -> str | None:
        main_port = self.exposed_ports.get("8000/tcp", [])
        if main_port:
            return main_port[0].get("HostPort")
        else:
            return None

    @computed_field  # type: ignore
    @property
    def url(self) -> str:
        return f"/services/{self.name}"

    @validator("created_at", "updated_at", "started_at", pre=True)
    def format_datetime(cls, v):
        if v is None:
            return v
        dt = datetime.strptime(v.split(".")[0], "%Y-%m-%dT%H:%M:%S")
        return dt.strftime("%Y-%m-%d %H:%M:%S")


@r.get("")
def list_services(
    project_prefix: str = DEFAULT_PROJECT_PREFIX,
    only_ragapp: bool = True,
    docker_client=Depends(get_docker_client),
) -> list[ServiceInfo]:
    if only_ragapp:
        filters = {"name": f"{project_prefix}-ragapp"}
    else:
        filters = {"name": f"{project_prefix}-"}
    services = docker_client.containers.list(filters=filters)
    service_list = []
    for service in services:
        attrs = service.attrs
        state = attrs.get("State")
        service_info = ServiceInfo(
            id=service.id,
            name=service.name,
            started_at=state.get("StartedAt"),
            created_at=attrs.get("Created"),
            updated_at=attrs.get("Updated"),
            status=state.get("Status"),
            image=attrs.get("Image"),
            restart_count=attrs.get("RestartCount"),
            exposed_ports=attrs.get("NetworkSettings", {}).get("Ports"),
        )
        service_list.append(service_info)
    return service_list
