from typing import Any

from pydantic import BaseModel, Field, computed_field

from src.models.base_env import BaseEnvConfig


class OpenAIConfig(BaseModel):
    openai_api_key: str | None = Field(
        default=None,
        description="The OpenAI API key to use",
        env="OPENAI_API_KEY",
    )
    openai_api_base: str | None = Field(
        default=None,
        description="The base URL for the OpenAI API",
        env="OPENAI_API_BASE",
    )


class GeminiConfig(BaseModel):
    google_api_key: str | None = Field(
        default=None,
        description="The Google API key to use",
        env="GOOGLE_API_KEY",
    )


class OllamaConfig(BaseModel):
    ollama_base_url: str | None = Field(
        default=None,
        description="The base URL for the Ollama API",
        env="OLLAMA_BASE_URL",
    )
    ollama_request_timeout: float | None = Field(
        default=120.0,
        description="The request timeout for the Ollama API in seconds",
        env="OLLAMA_REQUEST_TIMEOUT",
    )


class AzureOpenAIConfig(BaseModel):
    azure_openai_endpoint: str | None = Field(
        default=None,
        description="The Azure OpenAI endpoint to use",
        env="AZURE_OPENAI_ENDPOINT",
    )
    azure_openai_api_key: str | None = Field(
        default=None,
        description="The Azure OpenAI API key to use",
        env="AZURE_OPENAI_API_KEY",
    )
    openai_api_version: str | None = Field(
        default="2024-02-01",
        description="The Azure OpenAI API version to use",
        env="OPENAI_API_VERSION",
    )
    azure_openai_llm_deployment: str | None = Field(
        default=None,
        description="The Azure OpenAI LLM deployment to use",
        env="AZURE_OPENAI_LLM_DEPLOYMENT",
    )
    azure_openai_embedding_deployment: str | None = Field(
        default=None,
        description="The Azure OpenAI embedding deployment to use",
        env="AZURE_OPENAI_EMBEDDING_DEPLOYMENT",
    )


class TSystemsConfig(BaseModel):
    t_systems_llmhub_api_key: str | None = Field(
        default=None,
        description="The T-Systems LLMHub API key to use",
        env="T_SYSTEMS_LLMHUB_API_KEY",
    )
    t_systems_llmhub_api_base: str | None = Field(
        default="https://llm-server.llmhub.t-systems.net/v2",
        description="The base URL for the T-Systems LLMHub API",
        env="T_SYSTEMS_LLMHUB_BASE_URL",
    )


class MistralConfig(BaseModel):
    mistral_api_key: str | None = Field(
        default=None,
        description="The Mistral API key to use",
        env="MISTRAL_API_KEY",
    )


class GroqConfig(BaseModel):
    groq_api_key: str | None = Field(
        default=None,
        description="The Groq API key to use",
        env="GROQ_API_KEY",
    )


# We're using inheritance to flatten all the fields into a single class
# Todo: Refactor API to nested structure
class ModelConfig(
    BaseEnvConfig,
    OpenAIConfig,
    GeminiConfig,
    OllamaConfig,
    AzureOpenAIConfig,
    TSystemsConfig,
    MistralConfig,
    GroqConfig,
):
    model_provider: str | None = Field(
        default=None,
        description="The name of AI provider.",
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

    class Config:
        extra = "ignore"
        protected_namespaces = ("settings_",)

    def model_post_init(self, __context: dict[str, Any]) -> None:
        # llama_index will be conflicted if the AZURE_OPENAI_API_KEY and OPENAI_API_KEY are used together.
        # so we must clean OPENAI_API_KEY if the model_provider is azure-openai
        # Todo: Refactor API to nested structure, clean the unused fields in the respective classes
        if self.model_provider == "azure-openai":
            self.openai_api_key = None

    @computed_field
    def configured(self) -> bool:
        match self.model_provider:
            case "openai":
                return self.openai_api_key is not None
            case "gemini":
                return self.google_api_key is not None
            case "ollama":
                return True
            case "azure-openai":
                return True
            case "t-systems":
                return self.t_systems_llmhub_api_key is not None
            case "mistral":
                return self.mistral_api_key is not None
            case "groq":
                return self.groq_api_key is not None
            case _:
                return False

    @classmethod
    def get_config(cls) -> "ModelConfig":
        return ModelConfig()
