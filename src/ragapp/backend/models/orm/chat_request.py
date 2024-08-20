from typing import Optional

from sqlmodel import Field, Index, SQLModel


class UserChatRequest(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str
    window_frame: str = Field(
        description="The window frame of the request count",
    )
    count: int = Field(
        description="The number of requests made in the window frame",
    )
    __table_args__ = (
        Index("idx_user_id", "user_id"),
        Index("idx_window_frame", "window_frame"),
    )
