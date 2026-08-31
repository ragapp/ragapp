from pydantic import BaseModel, Field




class FileStatus:
    UPLOADED = "uploaded"
    UPLOADING = "uploading"


class File(BaseModel):
    name: str = Field(..., description="The name of the file.")
    status: str = Field(..., description="The status of the file.")
    verification: dict | None = Field(
        default=None,
        description="Optional document-trust verification (Stipple) attached when the verifier is enabled.",
    )

    class Config:
        json_schema_extra = {
            "example": {
                "name": "example.txt",
                "status": "uploaded",
                "verification": {
                    "authenticity": {
                        "warrant_id": "warrant_...",
                        "risk_band": "low",
                        "inspection_quality": "thorough",
                        "recommended_action": "no_action_required",
                    }
                },
            }
        }
