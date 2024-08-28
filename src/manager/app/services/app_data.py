import logging
import os
import shutil

from app.settings import settings
from app.utils import check_app_name

logger = logging.getLogger("uvicorn")
# The directory in the container where the state data of the ragapps is mounted.
RAGAPPS_DIR = f"{settings.state_dir_local}/{settings.RAGAPP_STATE_NAME}"


class AppDataService:
    @staticmethod
    def remove_app_data(
        app_name: str,
    ):
        # development mode doesn't use volumes, so no need to remove app data
        if settings.environment != "dev":
            app_name = check_app_name(app_name)
            # Remove app data
            app_data_dir = f"{RAGAPPS_DIR}/{app_name}"
            if os.path.exists(app_data_dir):
                shutil.rmtree(app_data_dir)
                return True
            else:
                logger.error(f"App data directory {app_data_dir} not found")
                return False
