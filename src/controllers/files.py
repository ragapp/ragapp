import os
from src.tasks.indexing import index_all
from src.models.file import File, FileStatus, SUPPORTED_FILE_EXTENSIONS
from typing import List, Union
from fastapi import UploadFile, HTTPException

class UnsupportedFileExtensionError(Exception):
    pass


class FileNotFoundError(Exception):
    pass


class FileHandler:

    @classmethod
    def remove_file(cls, collection: str, file_name: str) -> None:
        """
        Remove a file from the data folder.
        """
        # Adjust the file path to include the collection
        file_path = f"data/{collection}/{file_name}"
        
        try:
            os.remove(file_path)
        except FileNotFoundError:
            raise HTTPException(
                status_code=404,
                detail=f"File '{file_name}' not found in collection '{collection}'."
            )
        # Re-index the data
        index_all()

    @classmethod
    def get_current_files(cls, collection: str) -> List[File]:
        """
        Construct the list of files for a specific collection.
        """
        collection_path = os.path.join("data", collection)
        
        if not os.path.exists(collection_path):
            return []
        
        file_names = os.listdir(collection_path)
        
        return [
            File(name=file_name, status=FileStatus.UPLOADED) for file_name in file_names
        ]

    @classmethod
    async def upload_file(
        cls, collection: str, file: UploadFile, file_name: str
    ) -> Union[File, UnsupportedFileExtensionError]:
        """
        Upload a file to the data folder under the specified collection.
        """
        # Check if the file extension is supported
        if file_name.split(".")[-1] not in SUPPORTED_FILE_EXTENSIONS:
            return UnsupportedFileExtensionError(
                f"File {file_name} with extension {file_name.split('.')[-1]} is not supported."
            )
        
        # Create collection folder if it does not exist
        collection_path = f"data/{collection}"
        if not os.path.exists(collection_path):
            os.makedirs(collection_path)

        # Save the file to the collection folder
        file_location = f"{collection_path}/{file_name}"
        with open(file_location, "wb") as f:
            f.write(await file.read())

        # Index the data (ensure this function is defined somewhere)
        index_all()

        return File(name=file_name, status=FileStatus.UPLOADED)