from datetime import datetime

from pydantic import BaseModel, computed_field, validator


class ServiceInfo(BaseModel):
    id: str
    name: str
    app_name: str | None
    created_at: str
    started_at: str | None
    updated_at: str | None
    status: str
    image: str
    restart_count: int

    @computed_field  # type: ignore
    @property
    def url(self) -> str:
        return f"/a/{self.app_name}"

    @validator("created_at", "updated_at", "started_at", pre=True)
    def format_datetime(cls, v):
        if v is None:
            return v
        dt = datetime.strptime(v.split(".")[0], "%Y-%m-%dT%H:%M:%S")
        return dt.strftime("%Y-%m-%d %H:%M:%S")
