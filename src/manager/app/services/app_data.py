import logging
import os
import shutil

from app.utils import check_app_name

logger = logging.getLogger("uvicorn")
# The default data directory (in container) for RAGapp data
DEFAULT_RAGAPP_DATA_DIR = os.getenv("RAGAPP_DATA_DIR", "data/ragapps")


class AppDataService:
    @staticmethod
    def remove_app_data(
        app_name: str,
    ):
        app_name = check_app_name(app_name)
        # Remove app data
        app_data_dir = f"{DEFAULT_RAGAPP_DATA_DIR}/{app_name}"
        if os.path.exists(app_data_dir):
            shutil.rmtree(app_data_dir)
            return True
        else:
            logger.error(f"App data directory {app_data_dir} not found")
            return False
