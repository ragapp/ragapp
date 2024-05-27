import os
from pydantic import BaseModel
from pydantic import Field

SUPPORTED_FILE_EXTENSIONS = ["txt", "pdf", "csv"]


class FileStatus:
    UPLOADED = "uploaded"
    UPLOADING = "uploading"


class File(BaseModel):
    user_id: str = Field(..., description="The identifier of the user who owns the file.")
    name: str = Field(..., description="The name of the file.")
    status: str = Field(..., description="The status of the file.")

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "user123",
                "name": "example.txt",
                "status": "uploaded",
            }
        }
