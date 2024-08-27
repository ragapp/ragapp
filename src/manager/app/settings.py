from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings

from app.utils import default_state_dir


class ManagerSettings(BaseSettings):
    # Constants
    # The name of ragapp state directory
    RAGAPP_STATE_NAME: str = "ragapps"

    # Configurations for ragapp template
    ragapp_image: str = Field(default="ragapp/ragapp:latest", env="RAGAPP_IMAGE")
    ragapp_network: str = Field(default="ragapp-network", env="RAGAPP_NETWORK")
    chat_request_limit_threshold: int = Field(
        default=20, env="CHAT_REQUEST_LIMIT_THRESHOLD"
    )
    app_name_template: str = Field(default="ragapp-{app_name}", env="APP_NAME_TEMPLATE")
    state_dir: Optional[str] = Field(
        description="The directory where the state all the services are be stored. This config is used for mounting ragapp volumes",
        default_factory=default_state_dir,
        env="STATE_DIR",
    )

    # Configurations for manager
    state_dir_local: Optional[str] = Field(
        description="The directory where the state of the local services are stored. This config is used for manage service states. It is the same as `state_dir` by default",
        default_factory=default_state_dir,
        env="STATE_DIR_LOCAL",
    )


settings = ManagerSettings()
