import os
from typing import List


class AIProvider:
    @staticmethod
    def fetch_ollama_models() -> List[str]:
        """
        Fetch all available models from the Ollama provider.
        """
        from ollama import Client

        client = Client(host=os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434"))
        res = client.list()
        models = res.get("models", [])

        return [model.get("name") for model in models]

    @classmethod
    def fetch_available_models(cls, provider: str = None) -> List[str]:
        """
        Fetch all available models from the model provider.
        """
        if provider is None:
            provider = os.getenv("MODEL_PROVIDER")

        match provider:
            case "ollama":
                return cls.fetch_ollama_models()
            case _:
                raise ValueError(f"Unsupported fetch models for provider: {provider}")
