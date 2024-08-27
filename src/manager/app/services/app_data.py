import logging
import os
import shutil

from app.utils import check_app_name
from app.constants import RAGAPP_STATE_NAME

logger = logging.getLogger("uvicorn")
# The directory in the container where the state data of the ragapps is mounted.
RAGAPPS_DIR = f"{os.getenv('STATE_DIR_LOCAL')}/{RAGAPP_STATE_NAME}"


class AppDataService:
    @staticmethod
    def remove_app_data(
        app_name: str,
    ):
        app_name = check_app_name(app_name)
        # Remove app data
        app_data_dir = f"{RAGAPPS_DIR}/{app_name}"
        if os.path.exists(app_data_dir):
            shutil.rmtree(app_data_dir)
            return True
        else:
            logger.error(f"App data directory {app_data_dir} not found")
            return False
