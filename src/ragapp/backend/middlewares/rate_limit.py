import os
import time

from fastapi import HTTPException, Request, status
from fastapi.responses import Response

from backend.models.user_info import UserInfo
from backend.services.user_chat_service import UserChatService

CHAT_REQUEST_LIMIT_THRESHOLD = int(os.getenv("CHAT_REQUEST_LIMIT_THRESHOLD", 0))
CHAT_REQUEST_LIMIT_ENABLED = CHAT_REQUEST_LIMIT_THRESHOLD > 0


async def request_limit_middleware(request: Request) -> Response:
    if CHAT_REQUEST_LIMIT_ENABLED:
        user = UserInfo.from_request(request)
        time_frame = _get_time_frame()
        request_count = UserChatService.get_user_chat_request_count(user, time_frame)
        if not user.is_admin and request_count >= CHAT_REQUEST_LIMIT_THRESHOLD:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"You have exceeded {CHAT_REQUEST_LIMIT_THRESHOLD} chat requests. Please try again later.",
            )

        UserChatService.update_user_chat_request_count(
            user, time_frame, request_count + 1
        )


def _get_time_frame():
    """
    Provide the time frame for the request count
    """
    # Use current date as the time frame
    return time.strftime("%Y-%m-%d")
