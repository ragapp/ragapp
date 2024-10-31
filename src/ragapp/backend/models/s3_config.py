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
    s3_enabled: bool | None = Field(
        default=False,
        description=(
            "If S3 is enabled."
        ),
        env="S3",
    )
    s3_bucket: str | None = Field(
        default="",
        description=(
            "The bucket name of the S3 bucket where the documents are stored."
        ),
        env="S3_BUCKET_NAME",
    )
    s3_url: str | None = Field(
        default="",
        description=(
            "The URL of the S3 bucket where the documents are stored."
        ),
        env="S3_URL",
    )
    s3_path_meta_files: str | None = Field(
        default="",
        description=(
            "The URL of the S3 bucket where the documents are stored."
        ),
        env="s3_path_meta_files",
    )


def get_s3_config():
    return S3Config()
