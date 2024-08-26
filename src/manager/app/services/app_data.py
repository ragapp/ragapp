import logging
import os
import shutil

from app.models.volume import RAGAPP_MOUNT_PATH

logger = logging.getLogger("uvicorn")
# The default data directory (in container) for RAGapp data
DEFAULT_RAGAPP_DATA_DIR = os.getenv("RAGAPP_DATA_DIR", "data/ragapps")


class AppDataService:
    _data_mount_path: str = "/app/data"

    @staticmethod
    def remove_app_data(
        app_name: str,
    ):
        if RAGAPP_MOUNT_PATH is not None:
            # Remove app data
            app_data_dir = f"{DEFAULT_RAGAPP_DATA_DIR}/{app_name}"
            if os.path.exists(app_data_dir):
                shutil.rmtree(app_data_dir)
                return True
            else:
                logger.error(f"App data directory {app_data_dir} not found")
                return False
