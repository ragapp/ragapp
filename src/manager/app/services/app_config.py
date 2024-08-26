import json
import os

from app.models.ragapp import RAGAppContainerConfig

DEFAULT_CONFIG_DIR = os.environ.get("CONFIG_DIR", "config/app_configs")


class AppConfigService:
    persist_dir = DEFAULT_CONFIG_DIR

    @classmethod
    def persist_app_config(cls, app_config: RAGAppContainerConfig):
        app_name = app_config.name
        config = app_config.model_dump_json()

        if not os.path.exists(cls.persist_dir):
            os.makedirs(cls.persist_dir)

        with open(f"{cls.persist_dir}/{app_name}.json", "w") as f:
            f.write(config)
        return True

    @classmethod
    def load_app_config(
        cls, app_name: str = None, service_id: str = None
    ) -> RAGAppContainerConfig:
        if app_name is None and service_id is None:
            raise ValueError("Either app_name or service_id must be provided")
        if app_name is not None:
            with open(f"{cls.persist_dir}/{app_name}.json", "r") as f:
                config = json.loads(f.read())
        else:
            for file in os.listdir(cls.persist_dir):
                with open(f"{cls.persist_dir}/{file}", "r") as f:
                    config = json.loads(f.read())
                if config["service_id"] == service_id:
                    break
        return RAGAppContainerConfig(**config)

    @classmethod
    def load_all_configs_from_disk(cls) -> list[RAGAppContainerConfig]:
        configs = []
        try:
            for file in os.listdir(cls.persist_dir):
                with open(f"{cls.persist_dir}/{file}", "r") as f:
                    config = json.loads(f.read())
                configs.append(RAGAppContainerConfig(**config))
        except FileNotFoundError:
            return []
        return configs

    @classmethod
    def delete_app_config(cls, app_name: str = None, service_id: str = None):
        if app_name is None and service_id is None:
            raise ValueError("Either app_name or service_id must be provided")
        if app_name is None and service_id is not None:
            app_name = cls.load_app_config(service_id=service_id).name
        file_path = os.path.join(cls.persist_dir, f"{app_name}.json")
        if os.path.exists(file_path) and os.path.isfile(file_path):
            os.remove(file_path)
            return True
        else:
            return False
