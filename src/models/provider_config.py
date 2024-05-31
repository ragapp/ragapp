from pydantic import Field, BaseModel
from pydantic_settings import BaseSettings


class OpenAIConfig(BaseModel):
    openai_api_key: str | None = Field(
        default=None,
        description="The OpenAI API key to use",
        env="OPENAI_API_KEY",
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


# We're using inheritance to flatten all the fields into a single class
# Todo: Refactor API to nested structure
class ProviderConfig(
    BaseSettings, OpenAIConfig, GeminiConfig, OllamaConfig, AzureOpenAIConfig
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
