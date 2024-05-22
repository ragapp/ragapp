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

    model_provider: str | None = Field(
        default=None,
        description="The model provider to use for the LLM.",
        env="MODEL_PROVIDER",
    )
    model: str | None = Field(
        default=None,
        description="The model to use for the LLM.",
        env="MODEL",
    )
    embedding_model: str | None = Field(
        default=None,
        description="The embedding model to use for the LLM.",
        env="EMBEDDING_MODEL",
    )
    embedding_dim: int | None = Field(
        default=None,
        description="The vector size of the embedding model.",
        env="EMBEDDING_DIM",
    )
    # OpenAI config
    openai_api_key: str | None = Field(
        default=None, description="The OpenAI API key to use.", env="OPENAI_API_KEY"
    )
    # Gemini config
    google_api_key: str | None = Field(
        default=None, description="The Google API key to use.", env="GOOGLE_API_KEY"
    )
    # Ollama config
    ollama_base_url: str | None = Field(
        default=None,
        description="The base URL for the Ollama API.",
        env="OLLAMA_BASE_URL",
    )
    system_prompt: str | None = Field(
        default="You are a helpful assistant who helps users with their questions.",
        description="The system prompt to use for the LLM.",
        env="SYSTEM_PROMPT",
        preprocess=True,
    )

    @computed_field
    @property
    def configured(self) -> bool:
        if self.model_provider == "openai":
            return self.openai_api_key is not None
        elif self.model_provider == "gemini":
            return self.google_api_key is not None
        elif self.model_provider == "ollama":
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
