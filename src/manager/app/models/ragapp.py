import re
from typing import Dict, List, Optional

from pydantic import BaseModel, Field, computed_field, validator

from app.models.volume import RAGAppVolumeConfig
from app.settings import settings


class RAGAppContainerConfig(BaseModel):
    name: str
    image: str = Field(default=settings.ragapp_image)
    command: Optional[List[str]] = Field(default=None)
    labels: Dict = Field(default_factory=dict)
    environment: Dict = Field(default_factory=dict)
    network: str = Field(default=settings.ragapp_network)
    chat_request_limit_threshold: int = Field(
        default=settings.chat_request_limit_threshold
    )
    volume_config: Optional[RAGAppVolumeConfig] = None
    status: Optional[str] = Field(default=None)

    class Config:
        # example
        json_schema_extra = {
            "example": {
                "name": "my-app",
                "image": settings.ragapp_image,
            }
        }

    def __init__(self, **data):
        if "labels" not in data:
            data["labels"] = _get_default_app_labels(data["name"])
        else:
            data["labels"].update(_get_default_app_labels(data["name"]))
        if "environment" not in data:
            data["environment"] = _get_default_app_environment(data["name"])
        else:
            data["environment"].update(_get_default_app_environment(data["name"]))
        super().__init__(**data)
        self.volume_config = RAGAppVolumeConfig(name=self.name)

    @validator("name", pre=True)
    def validate_name(cls, v):
        if not re.match(r"^[a-zA-Z0-9_-]+$", v):
            raise ValueError(
                "Name must be alphanumeric or underscores `_` or dashes `-`"
            )
        return v

    @computed_field
    @property
    def container_name(self) -> str:
        return settings.app_name_template.format(app_name=self.name)

    def to_docker_create_kwargs(self) -> dict:
        return {
            "name": self.container_name,
            "image": self.image,
            "command": self.command,
            "labels": self.labels,
            "environment": self.environment,
            "network": self.network,
            "volumes": self.volume_config.to_container_create_kwargs(),
        }


def _get_default_app_labels(app_name: str) -> Dict[str, str]:
    return {
        # To display the name in manager UI
        "ragapp.app_name": app_name,
        "com.docker.compose.service": f"ragapp-{app_name}",
        # Traefik configs
        "traefik.enable": "true",
        f"traefik.http.services.ragapp-{app_name}.loadbalancer.server.port": "8000",
        f"traefik.http.routers.ragapp-{app_name}.rule": f"PathPrefix(`/a/{app_name}`)",
        f"traefik.http.routers.ragapp-{app_name}-admin.rule": f"PathRegexp(`/a/{app_name}/admin`)",
        f"traefik.http.routers.ragapp-{app_name}-management-api.rule": f"PathPrefix(`/a/{app_name}/api/management`)",
        f"traefik.http.routers.ragapp-{app_name}.middlewares": "ragapp-keycloakopenid",
        f"traefik.http.routers.ragapp-{app_name}-admin.middlewares": "ragapp-keycloakopenid,admin-auth",
        f"traefik.http.routers.ragapp-{app_name}-management-api.middlewares": "ragapp-keycloakopenid,admin-auth",
    }


# TODO: Use template for environment variables
def _get_default_app_environment(app_name: str) -> Dict[str, str]:
    return {
        "BASE_URL": f"/a/{app_name}",
        "FILESERVER_URL_PREFIX": f"/a/{app_name}/api/files",
        "MODEL_PROVIDER": "openai",
        "MODEL": "gpt-4o-mini",
        "EMBEDDING_MODEL": "text-embedding-3-small",
        "EMBEDDING_DIM": "1024",
        "CHAT_REQUEST_LIMIT_THRESHOLD": settings.chat_request_limit_threshold,
        "DB_URI": "sqlite:///storage/db.sqlite",
        "TRACKING_SNIPPET": settings.tracking_snippet,
    }
