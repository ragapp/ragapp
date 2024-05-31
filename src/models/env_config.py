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
from src.models.provider_config import ProviderConfig


# We're using inheritance to flatten all the fields into a single class
# Todo: Refactor API to nested structure
class EnvConfig(ProviderConfig):
    """
    Inference configuration settings from environment variables.
    """

    # System prompt
    system_prompt: str | None = Field(
        default="You are a helpful assistant who helps users with their questions.",
        description="The system prompt to use for the LLM.",
        env="SYSTEM_PROMPT",
        preprocess=True,
    )

    class Config:
        extra = "ignore"

    @computed_field
    @property
    def configured(self) -> bool:
        if self.model_provider == "openai":
            return self.openai_api_key is not None
        elif self.model_provider == "gemini":
            return self.google_api_key is not None
        elif self.model_provider == "ollama":
            return True
        elif self.model_provider == "azure-openai":
            return True
        return False

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
                dotenv.set_key(dotenv_file, field_info.json_schema_extra.get("env"), str(value))  # type: ignore
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
