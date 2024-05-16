import os
from src.tasks.indexing import index_all
from src.models.file import File, FileStatus, SUPPORTED_FILE_EXTENSIONS


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
        cls, file, file_name: str
    ) -> File | UnsupportedFileExtensionError:
        """
        Upload a file to the data folder.
        """
        # Check if the file extension is supported
        if file_name.split(".")[-1] not in SUPPORTED_FILE_EXTENSIONS:
            return UnsupportedFileExtensionError(
                f"File {file_name} with extension {file_name.split('.')[-1]} is not supported."
            )
        # Create data folder if it does not exist
        if not os.path.exists("data"):
            os.makedirs("data")

        with open(f"data/{file_name}", "wb") as f:
            f.write(await file.read())
        # Index the data
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
