from fastapi import APIRouter, UploadFile
from fastapi.responses import JSONResponse
from src.models.file import File
from src.controllers.files import FileHandler, UnsupportedFileExtensionError

files_router = r = APIRouter()


@r.get("")
def fetch_files() -> list[File]:
    """
    Get the current files.
    """
    return FileHandler.get_current_files()


@r.post("")
async def add_file(file: UploadFile):
    """
    Upload a new file.
    """
    res = await FileHandler.upload_file(file, str(file.filename))
    if isinstance(res, UnsupportedFileExtensionError):
        # Return 400 response with message if the file extension is not supported
        return JSONResponse(
            status_code=400,
            content={
                "error": "UnsupportedFileExtensionError",
                "message": str(res),
            },
        )
    return res


@r.delete("/{file_name}")
def remove_file(file_name: str):
    """
    Remove a file.
    """
    try:
        FileHandler.remove_file(file_name)
    except FileNotFoundError:
        # Ignore the error if the file is not found
        # This is to ensure that the file is removed even if it is not found
        # and we don't have to show an unnecessary error message to the user
        pass
    return JSONResponse(
        status_code=200,
        content={"message": f"File {file_name} removed successfully."},
    )
