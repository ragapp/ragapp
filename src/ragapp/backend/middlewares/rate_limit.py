import os
import time

import jwt
from backend.services.user_chat_service import UserChatService
from fastapi import HTTPException, Request, status
from fastapi.responses import Response
from jwt import InvalidTokenError

JWT_COOKIE_NAME = "Authorization"  # The name of the cookie that stores the JWT token
JWT_USER_ID_CLAIM = "preferred_username"  # The claim in the JWT token that stores the user ID or user name
CHAT_REQUEST_LIMIT_THRESHOLD = int(os.environ.get("CHAT_REQUEST_LIMIT_THRESHOLD", 5))


async def request_limit_middleware(request: Request) -> Response:
    time_frame = _get_time_frame()
    user_id = _extract_user_id_from_request(request)
    request_count = UserChatService.get_user_chat_request_count(user_id, time_frame)
    if request_count >= CHAT_REQUEST_LIMIT_THRESHOLD:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"You have exceeded {CHAT_REQUEST_LIMIT_THRESHOLD} chat requests. Please try again later.",
        )

    UserChatService.update_user_chat_request_count(
        user_id, time_frame, request_count + 1
    )


def _get_time_frame():
    """
    Provide the time frame for the request count
    """
    # Use current date as the time frame
    return time.strftime("%Y-%m-%d")


def _extract_user_id_from_request(request: Request) -> str:
    cookie = request.cookies.get(JWT_COOKIE_NAME)
    if not cookie:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized"
        )
    try:
        payload = _decode_jwt(cookie)
        username = payload.get(JWT_USER_ID_CLAIM)
        return username
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication"
        )


def _decode_jwt(token: str):
    try:
        # Remove Bearer prefix
        token = token.split(" ")[1]
        payload = jwt.decode(token, options={"verify_signature": False})
        return payload
    except InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        )
