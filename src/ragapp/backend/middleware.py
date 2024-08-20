import os
import time

import jwt
from fastapi import HTTPException, Request, status
from fastapi.responses import Response
from jwt import InvalidTokenError
from sqlalchemy.orm import Session

from backend.controllers.chat_request import (
    get_user_chat_request_count,
    update_user_chat_request_count,
)
from backend.database import DB

JWT_COOKIE_NAME = "Authorization"
JWT_USER_ID_CLAIM = "preferred_username"
CHAT_REQUEST_LIMIT_THRESHOLD = os.environ.get("CHAT_REQUEST_LIMIT_THRESHOLD", 5)


async def request_limit_middleware(request: Request) -> Response:
    window_frame = _get_window_frame()
    user_id = _extract_user_id_from_request(request)
    db: Session = next(DB.get_session())
    request_count = get_user_chat_request_count(db, user_id, window_frame)
    if request_count >= CHAT_REQUEST_LIMIT_THRESHOLD:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests. Please try again later.",
        )

    update_user_chat_request_count(db, user_id, window_frame, request_count + 1)


def _get_window_frame():
    """
    Provide the window frame for the request count
    """
    # Use current date as the window frame
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
        # Remove Barear prefix
        token = token.split(" ")[1]
        payload = jwt.decode(token, options={"verify_signature": False})
        return payload
    except InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        )
