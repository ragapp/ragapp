import os
import dotenv
from dotenv.main import DotEnv
from typing import List
from pydantic_settings import BaseSettings
from pydantic.json_schema import CoreSchema
from src.constants import ENV_FILE_PATH


class NewlineListEnv(List[str]):
    """
    A custom data type to represent a list of strings separated by newlines.
    """

    def __str__(self):
        return "\n".join(self)

    def __repr__(self):
        return str(self)

    @classmethod
    def __get_pydantic_core_schema__(cls, source_type, handler) -> CoreSchema:
        return handler(NewlineListEnv)


class BaseEnvConfig(BaseSettings):

    def to_runtime_env(self):
        """
        Update the current values to the runtime environment variables.
        """
        for field_name, field_info in self.__fields__.items():
            env_name = field_info.json_schema_extra.get("env")
            value = getattr(self, field_name)
            if value is not None:
                os.environ[env_name] = str(value)
            else:
                os.environ.pop(env_name, None)

    def to_env_file(self):
        """
        Write the current values to a dot env file.
        """
        dotenv_file = dotenv.find_dotenv(filename=ENV_FILE_PATH)
        for field_name, field_info in self.__fields__.items():
            env_name = field_info.json_schema_extra.get("env")
            value = getattr(self, field_name)
            if value is not None:
                dotenv.set_key(dotenv_file, env_name, str(value))  # type: ignore
            else:
                # Disable verbose output to hide unnecessary warnings
                if DotEnv(dotenv_path=dotenv_file, verbose=False, encoding="utf-8").get(
                    env_name
                ):
                    dotenv.unset_key(dotenv_file, env_name)

    def to_api_response(self):
        """
        Convert the current values to a dictionary for API response.
        """
        return self.dict()
