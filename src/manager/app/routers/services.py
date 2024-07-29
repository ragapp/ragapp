from datetime import datetime

from app.docker_client import get_docker_client
from docker.errors import DockerException
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, computed_field, validator

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
    services = docker_client.containers.list(filters=filters, all=True)
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


@r.post("/{service_id}/stop")
def stop_service(
    service_id: str,
    docker_client=Depends(get_docker_client),
):
    try:
        container = docker_client.containers.get(service_id)
        container.stop()
    except DockerException as e:
        raise HTTPException(status_code=400, detail=str(e))
    return JSONResponse(status_code=204, content={})


@r.post("/{service_id}/start")
def start_service(
    service_id: str,
    docker_client=Depends(get_docker_client),
):
    try:
        container = docker_client.containers.get(service_id)
        container.start()
    except DockerException as e:
        raise HTTPException(status_code=400, detail=str(e))
    return JSONResponse(status_code=204, content={})


@r.delete("/{service_id}")
def remove_service(
    service_id: str,
    docker_client=Depends(get_docker_client),
):
    try:
        container = docker_client.containers.get(service_id)
        container.remove(force=True)
    except DockerException as e:
        raise HTTPException(status_code=400, detail=str(e))
    return JSONResponse(status_code=204, content={})
