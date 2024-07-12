from pydantic import Field, computed_field

from src.models.base_env import BaseEnvConfig


class CohereRerankerConfig(BaseEnvConfig):
    reranker_provider: str | None = Field(
        default="cohere",
        description="The provider of the reranker service.",
        env="RERANKER_PROVIDER",
    )
    cohere_api_key: str | None = Field(
        default=None,
        description="The API key for the Cohere API.",
        env="COHERE_API_KEY",
    )

    @computed_field
    def use_reranker(self) -> bool:
        if self.reranker_provider == "cohere" and self.cohere_api_key:
            return True
        return False


def get_reranker_config():
    return CohereRerankerConfig()
