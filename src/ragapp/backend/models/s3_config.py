from pydantic import Field

from backend.models.base_env import BaseEnvConfig


class S3Config(BaseEnvConfig):
    s3_path: str | None = Field(
        default="",
        description=(
            "The path to the S3 bucket where the documents are stored."
        ),
        env="S3_PATH",
    )


def get_s3_config():
    return S3Config()
