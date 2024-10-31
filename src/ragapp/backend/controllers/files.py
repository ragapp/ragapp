import os

from backend.controllers.loader import LoaderManager
from backend.models.file import File, FileStatus
from backend.models.loader import FileLoader
from backend.tasks.indexing import index_all


class UnsupportedFileExtensionError(Exception):
    pass


class FileNotFoundError(Exception):
    pass


class FileHandler:
    @classmethod
    def get_current_files(cls):
        """
        Construct the list files by all the files in the data folder.
        """
        if not os.path.exists("data"):
            return []
        # Get all files in the data folder
        file_names = os.listdir("data")
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
        # Check if the file extension is supported
        cls.validate_file_extension(file_name)

        # Create data folder if it does not exist
        if not os.path.exists("data"):
            os.makedirs("data")

        with open(f"data/{file_name}", "wb") as f:
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
        os.remove(f"data/{file_name}")
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
