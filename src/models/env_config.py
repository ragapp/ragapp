import os
import dotenv
from typing import Optional, Annotated
from pydantic import (
    BaseModel,
    Field,
    SecretStr,
    PlainSerializer,
    BeforeValidator,
    validator,
    computed_field,
)
from pydantic_settings import BaseSettings, SettingsConfigDict
from src.constants import ENV_FILE_PATH


class EnvConfig(BaseSettings):
    """
    Inference configuration settings from environment variables.
    """

    openai_api_key: str | None = Field(
        default=None, description="The OpenAI API key to use.", env="OPENAI_API_KEY"
    )
    model: str | None = Field(
        default=None,
        description="The model to use for the LLM.",
        env="MODEL",
    )
    system_prompt: str | None = Field(
        default=None,
        description="The system prompt to use for the LLM.",
        env="SYSTEM_PROMPT",
        preprocess=True,
    )

    @computed_field
    @property
    def configured(self) -> bool:
        return self.openai_api_key is not None

    # To convert empty string prompt to None automatically
    @validator("system_prompt", pre=True)
    def preprocess_system_prompt(cls, value):
        if value == "":
            return None
        return value

    def to_runtime_env(self):
        """
        Update the current values to the runtime environment variables.
        """
        for field_name, field_info in self.__fields__.items():
            value = getattr(self, field_name)
            if value is not None:
                os.environ[field_info.json_schema_extra["env"]] = str(value)
            else:
                os.environ.pop(field_info.json_schema_extra["env"], None)

    def to_env_file(self):
        """
        Write the current values to a dot env file.
        """
        dotenv_file = dotenv.find_dotenv(filename=ENV_FILE_PATH)
        for field_name, field_info in self.__fields__.items():
            value = getattr(self, field_name)
            if value is not None:
                dotenv.set_key(dotenv_file, field_info.json_schema_extra.get("env"), value)  # type: ignore
            else:
                dotenv.unset_key(dotenv_file, field_info.json_schema_extra.get("env"))

    def to_api_response(self):
        """
        Convert the current values to a dictionary for API response.
        """
        result = self.dict()
        # Add the configured field
        result["configured"] = self.configured
        return result


def get_config() -> EnvConfig:
    return EnvConfig()  # type: ignore
