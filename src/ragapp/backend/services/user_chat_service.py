from sqlmodel import Session, select

from backend.database import DB
from backend.models.orm.chat_request import UserChatRequest
from backend.models.user_info import UserInfo


class UserChatService:
    """
    Service class for UserChatRequest model
    """

    @classmethod
    def get_user_chat_request_count(cls, user: UserInfo, time_frame: str) -> int:
        db: Session = next(DB.get_session())
        user_request = cls._get_user_chat_request_record(db, user, time_frame)
        if user_request:
            return user_request.count
        return 0

    @classmethod
    def update_user_chat_request_count(
        cls, user: UserInfo, time_frame: str, count: int
    ):
        db: Session = next(DB.get_session())
        user_request = cls._get_user_chat_request_record(db, user, time_frame)
        if user_request:
            user_request.count = count
            db.add(user_request)  # Mark the object as modified
        else:
            user_request = UserChatRequest(
                user_id=user.user_id, time_frame=time_frame, count=count
            )
            db.add(user_request)
        db.commit()
        db.refresh(user_request)

    @staticmethod
    def _get_user_chat_request_record(
        db: Session, user: UserInfo, time_frame: str
    ) -> UserChatRequest:
        statement = select(UserChatRequest).where(
            UserChatRequest.user_id == user.user_id,
            UserChatRequest.time_frame == time_frame,
        )
        result = db.exec(statement)
        request = result.one_or_none()
        return request
