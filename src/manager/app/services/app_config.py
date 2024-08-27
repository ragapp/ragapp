import json
import os

from app.models.ragapp import RAGAppContainerConfig
from app.settings import settings

CONFIG_DIR = f"{settings.state_dir_local}/manager/config/apps"


# TODO: once the manager keeps more state, we can persist `RAGAppContainerConfig` using `SQLModel`
class AppConfigService:
    persist_dir = CONFIG_DIR

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
    def delete_app_config(cls, app_name: str):
        file_path = os.path.join(cls.persist_dir, f"{app_name}.json")
        if os.path.exists(file_path) and os.path.isfile(file_path):
            os.remove(file_path)
            return True
        else:
            return False

    @classmethod
    def load_config_from_disk(cls, app_name: str) -> RAGAppContainerConfig:
        file_path = os.path.join(cls.persist_dir, f"{app_name}.json")
        if os.path.exists(file_path) and os.path.isfile(file_path):
            with open(file_path, "r") as f:
                config = json.loads(f.read())
            return RAGAppContainerConfig(**config)
        else:
            return None

    @classmethod
    def update_app_status(cls, app_name: str, status: str):
        config = cls.load_config_from_disk(app_name)
        if config:
            config.status = status
            cls.persist_app_config(config)
            return True
        return False
