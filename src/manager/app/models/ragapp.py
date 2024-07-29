from typing import Dict, List, Optional

from pydantic import BaseModel, Field, computed_field

DEFAULT_RAGAPP_IMAGE = "ragapp/ragapp:latest"
DEFAULT_NETWORK = "ragapp-network"
APP_NAME_TEMPLATE = "ragapp-{app_name}"


def get_default_app_labels(app_name: str) -> Dict[str, str]:
    return {
        # To display the name in manager UI
        "ragapp.app_name": app_name,
        # Traefik configs
        "traefik.enable": "true",
        f"traefik.http.services.ragapp-{app_name}.loadbalancer.server.port": "8000",
        f"traefik.http.routers.ragapp-{app_name}.rule": f"PathPrefix(`/a/{app_name}`)",
        f"traefik.http.middlewares.ragapp-{app_name}-strip-path.stripprefix.prefixes": f"/a/{app_name}",
        f"traefik.http.routers.ragapp-{app_name}.middlewares": f"ragapp-{app_name}-strip-path",
        f"traefik.http.routers.ragapp-{app_name}-admin.rule": f"PathRegexp(`/a/{app_name}/admin`)",
        f"traefik.http.routers.ragapp-{app_name}-admin.middlewares": f"admin-auth,ragapp-{app_name}-strip-path",
    }


# TODO: Use template for environment variables
def get_default_app_environment(app_name: str) -> Dict[str, str]:
    return {
        "BASE_URL": f"/a/{app_name}",
        "VECTOR_STORE_PROVIDER": "qdrant",
        "QDRANT_URL": "http://qdrant:6333",
        "QDRANT_COLLECTION": app_name,
        "QDRANT_API_KEY": "",
        "MODEL_PROVIDER": "openai",
        "MODEL": "gpt-4o-mini",
        "EMBEDDING_MODEL": "text-embedding-3-small",
        "EMBEDDING_DIM": "1024",
    }


class RAGAppServiceConfig(BaseModel):
    name: str
    image: str = Field(default=DEFAULT_RAGAPP_IMAGE)
    command: Optional[List[str]] = Field(default=None)
    labels: Dict = Field(default_factory=dict)
    environment: Dict = Field(default_factory=dict)
    network: str = Field(default=DEFAULT_NETWORK)

    class Config:
        # example
        json_schema_extra = {
            "example": {
                "name": "my-app",
                "image": DEFAULT_RAGAPP_IMAGE,
            }
        }

    def __init__(self, **data):
        if "labels" not in data:
            data["labels"] = get_default_app_labels(data["name"])
        else:
            data["labels"] += get_default_app_labels(data["name"])
        if "environment" not in data:
            data["environment"] = get_default_app_environment(data["name"])
        else:
            data["environment"] += get_default_app_environment(data["name"])

        super().__init__(**data)

    @computed_field
    @property
    def container_name(self) -> str:
        return APP_NAME_TEMPLATE.format(app_name=self.name)

    def to_docker_create_kwargs(self):
        return {
            "name": self.container_name,
            "image": self.image,
            "command": self.command,
            "labels": self.labels,
            "environment": self.environment,
            "network": self.network,
        }
