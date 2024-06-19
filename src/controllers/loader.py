import os
import dotenv
import yaml
from pydantic import Field, validator
from pydantic_settings import BaseSettings
from typing import Dict, Tuple, List

from src.models.loader import LoaderConfig, FileLoader
from src.constants import LOADER_CONFIG_FILE


class LoaderManager:
    """
    To manage the loader configuration file
    """

    config_file: Dict

    def __init__(self):
        self.config = self.load_config_file()

    def update_loader(self, loader_config: LoaderConfig):
        """
        Update the loader configuration.
        """
        if isinstance(loader_config, FileLoader):
            # Update tool loader config file
            self.config[loader_config.loader_name] = loader_config.to_config_dict()
            self._update_config_file()
            # Update environment variable
            loader_config.update_env_api_key()
        else:
            raise ValueError("Unsupported loader configuration!")

    def get_loader(self, loader_name: str = None) -> Dict:
        """
        Get the loader configuration.
        """
        if loader_name is None:
            return self.config
        else:
            if loader_name == "file":
                config = self.config.get(loader_name)
                return FileLoader(loader_name=loader_name, **config).dict()
            else:
                raise ValueError(f"Unsupported loader {loader_name}!")

    @staticmethod
    def load_config_file() -> Dict:
        try:
            with open(LOADER_CONFIG_FILE, "r") as file:
                return yaml.safe_load(file)
        except FileNotFoundError:
            raise FileNotFoundError(f"Tool config file {LOADER_CONFIG_FILE} not found!")

    def _update_config_file(self):
        with open(LOADER_CONFIG_FILE, "w") as file:
            yaml.dump(self.config, file)


def loader_manager():
    return LoaderManager()
