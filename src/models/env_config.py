import os
import dotenv
from typing import Optional, Annotated
from pydantic import BaseModel, Field, SecretStr, PlainSerializer, BeforeValidator
from pydantic_settings import BaseSettings, SettingsConfigDict


class EnvConfig(BaseSettings):
    """
    Inference configuration settings from environment variables.
    """

    openai_api_key: str | None = Field(
        description="The OpenAI API key to use.", env="OPENAI_API_KEY"
    )
    model: str | None = Field(
        description="The model to use for the LLM.",
        env="MODEL",
    )

    def to_runtime_env(self):
        """
        Update the current values to the runtime environment variables.
        """
        for field_name, field_info in self.__fields__.items():
            value = getattr(self, field_name)
            if value is not None:
                os.environ[field_info.json_schema_extra["env"]] = str(value)

    def to_env_file(self):
        """
        Write the current values to a dot env file.
        """
        dotenv_file = dotenv.find_dotenv()
        for field_name, field_info in self.__fields__.items():
            value = getattr(self, field_name)
            if value is not None:
                dotenv.set_key(dotenv_file, field_info.json_schema_extra.get("env"), value)  # type: ignore


def get_config() -> EnvConfig:
    return EnvConfig()  # type: ignore
