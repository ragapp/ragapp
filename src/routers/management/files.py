from fastapi import APIRouter, UploadFile, Request, HTTPException, Query, File as FastAPIFile
from typing import List
from fastapi.responses import JSONResponse
from src.models.file import File
from src.controllers.files import FileHandler, UnsupportedFileExtensionError

files_router = r = APIRouter()


@r.get("")
def fetch_files(collection: str = Query(...)) -> List[File]:
    """
    Get the current files for a specific collection.
    """
    try:
        return FileHandler.get_current_files(collection)
    except FileNotFoundError:
        raise HTTPException(
            status_code=404,
            detail=f"Collection '{collection}' not found or has no files."
        )


@files_router.post("/{collection}")
async def add_file(collection: str, file: UploadFile = FastAPIFile(...)):
    """
    Upload a new file to a specific collection.
    """
    try:
        res = await FileHandler.upload_file(collection, file, file.filename)
        if isinstance(res, UnsupportedFileExtensionError):
            return JSONResponse(
                status_code=400,
                content={
                    "error": "UnsupportedFileExtensionError",
                    "message": str(res),
                },
            )
        return res
    except FileNotFoundError:
        raise HTTPException(
            status_code=404,
            detail=f"Collection '{collection}' not found. File upload failed."
        )


# Example file removal endpoint
@r.delete("/api/management/files/{collection}/{file_name}")
async def remove_file(collection: str, file_name: str):
    """
    Remove a file from a specific collection.
    """
    try:
        FileHandler.remove_file(collection, file_name)
    except HTTPException as e:
        return JSONResponse(
            status_code=e.status_code,
            content={
                "error": "FileNotFoundError",
                "message": e.detail,
            },
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "error": "InternalError",
                "message": str(e),
            },
        )
    return JSONResponse(
        status_code=200,
        content={"message": f"File '{file_name}' removed successfully from collection '{collection}'."},
    )


@r.delete("/{collection}/{file_name}")
async def remove_file(collection: str, file_name: str):
    """
    Remove a file from a specific collection.
    """
    try:
        FileHandler.remove_file(collection, file_name)
    except HTTPException as e:
        raise e  # Propagate the exception with the appropriate status code and message
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while trying to remove the file: {str(e)}"
        )
    return {"message": f"File '{file_name}' removed successfully from collection '{collection}'."}