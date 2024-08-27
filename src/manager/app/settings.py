import os
from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings


def default_state_dir() -> str:
    """
    Use the current working directory as the default state directory
    """
    # Get current working directory
    current_dir = os.getcwd()
    # Create a directory named `data` in the current working directory
    state_dir = os.path.join(current_dir, "data")
    if not os.path.exists(state_dir):
        os.makedirs(state_dir)

    return state_dir


class ManagerSettings(BaseSettings):
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

    state_dir_local: Optional[str] = Field(
        description="The directory where the state of the local services are stored. This config is used for manage service states. It is the same as `state_dir` by default",
        default_factory=default_state_dir,
        env="STATE_DIR_LOCAL",
    )


settings = ManagerSettings()
