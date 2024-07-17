from pydantic import Field

from src.models.base_env import BaseEnvConfig


class CohereRerankerConfig(BaseEnvConfig):
    use_reranker: bool | None = Field(
        default=None,
        description="Whether to use the reranker service or not.",
        env="USE_RERANKER",
    )
    rerank_provider: str | None = Field(
        default="cohere",
        description="The provider of the reranker service.",
        env="RERANK_PROVIDER",
    )
    cohere_api_key: str | None = Field(
        default=None,
        description="The API key for the Cohere API.",
        env="COHERE_API_KEY",
    )
    rerank_top_k: int | None = Field(
        default=5,
        description="The number of top results to return from the reranker",
        env="RERANK_TOP_K",
    )


def get_reranker_config():
    return CohereRerankerConfig()