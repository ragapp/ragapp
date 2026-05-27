import os
from pathlib import Path

from backend.controllers.loader import LoaderManager
from backend.models.file import File, FileStatus
from backend.models.loader import FileLoader
from backend.tasks.indexing import index_all


class UnsupportedFileExtensionError(Exception):
    pass


class InvalidFileNameError(Exception):
    pass


class FileNotFoundError(Exception):
    pass


class FileHandler:
    DATA_DIR = Path("data")

    @classmethod
    def get_current_files(cls):
        """
        Construct the list files by all the files in the data folder.
        """
        if not cls.DATA_DIR.exists():
            return []
        # Get all files in the data folder
        file_names = os.listdir(cls.DATA_DIR)
        # Construct list[File]
        return [
            File(name=file_name, status=FileStatus.UPLOADED) for file_name in file_names
        ]

    @classmethod
    async def upload_file(
        cls, file, file_name: str, fileIndex: str, totalFiles: str
    ) -> File | UnsupportedFileExtensionError:
        """
        Upload a file to the data folder.
        """
        file_path = cls.get_data_file_path(file_name)
        # Check if the file extension is supported
        cls.validate_file_extension(file_name)

        # Create data folder if it does not exist
        cls.DATA_DIR.mkdir(exist_ok=True)

        with file_path.open("wb") as f:
            f.write(await file.read())
        # Index the data
        # Index the data only when it is the last file to upload
        if fileIndex == totalFiles:
            index_all()
        return File(name=file_name, status=FileStatus.UPLOADED)

    @classmethod
    def remove_file(cls, file_name: str) -> None:
        """
        Remove a file from the data folder.
        """
        os.remove(cls.get_data_file_path(file_name))
        # Re-index the data
        index_all()

    @classmethod
    def validate_file_extension(cls, file_name: str):
        """
        Validate the file extension.
        """
        file_ext = os.path.splitext(file_name)[1]
        file_loader: FileLoader = LoaderManager().get_loader("file")
        supported_file_extensions = file_loader.get_supported_file_extensions()
        if file_ext not in supported_file_extensions:
            raise UnsupportedFileExtensionError(
                f"File {file_name} with extension {file_ext} is not supported. Supported file extensions: {supported_file_extensions}"
            )

    @classmethod
    def get_data_file_path(cls, file_name: str) -> Path:
        """
        Return a safe path inside the data directory for a client-supplied file name.
        """
        file_path = Path(file_name)
        if (
            not file_name
            or file_path.name != file_name
            or file_path.is_absolute()
            or "/" in file_name
            or "\\" in file_name
            or "\x00" in file_name
        ):
            raise InvalidFileNameError(f"Invalid file name: {file_name}")

        data_dir = cls.DATA_DIR.resolve()
        resolved_path = (data_dir / file_name).resolve()
        if data_dir != resolved_path.parent:
            raise InvalidFileNameError(f"Invalid file name: {file_name}")
        return resolved_path
