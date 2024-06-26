import os
from typing import List


class AIProvider:
    @staticmethod
    def fetch_ollama_models(provider_url: str = None) -> List[str]:
        """
        Fetch all available models from the Ollama provider.
        """
        from ollama import Client

        client = Client(host=provider_url or os.getenv("OLLAMA_BASE_URL"))
        res = client.list()
        models = res.get("models", [])

        return [model.get("name") for model in models]

    @classmethod
    def fetch_available_models(
        cls, provider: str = None, provider_url: str = None
    ) -> List[str]:
        """
        Fetch all available models from the model provider.
        """
        if provider is None:
            provider = os.getenv("MODEL_PROVIDER")

        match provider:
            case "ollama":
                return cls.fetch_ollama_models(provider_url)
            case _:
                raise ValueError(f"Unsupported fetch models for provider: {provider}")
