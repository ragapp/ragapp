from sqlmodel import Session, select

from backend.models.orm.chat_request import UserChatRequest


def get_user_chat_request_count(db: Session, user_id: str, time_frame: str) -> int:
    user_request = _get_user_chat_request_record(db, user_id, time_frame)
    if user_request:
        return user_request.count
    return 0


def update_user_chat_request_count(
    db: Session, user_id: str, time_frame: str, count: int
):
    user_request = _get_user_chat_request_record(db, user_id, time_frame)
    if user_request:
        user_request.count = count
        db.add(user_request)  # Mark the object as modified
    else:
        user_request = UserChatRequest(
            user_id=user_id, time_frame=time_frame, count=count
        )
        db.add(user_request)
    db.commit()
    db.refresh(user_request)


def _get_user_chat_request_record(
    db: Session, user_id: str, time_frame: str
) -> UserChatRequest:
    statement = select(UserChatRequest).where(
        UserChatRequest.user_id == user_id,
        UserChatRequest.time_frame == time_frame,
    )
    result = db.exec(statement)
    request = result.one_or_none()
    return request
