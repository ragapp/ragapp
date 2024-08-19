import datetime

import jwt
import pytest
from fastapi import APIRouter, Depends, FastAPI
from fastapi.testclient import TestClient
from sqlalchemy.pool import StaticPool
from sqlmodel import Session as SQLSession
from sqlmodel import SQLModel, create_engine
from starlette.responses import Response

from backend.middleware import CHAT_REQUEST_LIMIT_THRESHOLD, request_limit_middleware

# Mock database
DB_URI = "sqlite:///:memory:"
engine = create_engine(
    DB_URI,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
SQLModel.metadata.create_all(engine)


def override_get_db_session():
    db = SQLSession(engine)
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(autouse=True)
def mock_db_session(monkeypatch):
    monkeypatch.setattr("backend.database.get_db_session", override_get_db_session)


# Mock FastAPI app and router
# Define a router
router = APIRouter()


# Mock endpoint to use with the middleware
@router.get("/test")
async def test_endpoint():
    return Response("OK")


# Create a FastAPI app and include a dummy router with the middleware for testing
app = FastAPI()
app.include_router(
    router,
    prefix="/api",
    tags=["Test"],
    dependencies=[Depends(request_limit_middleware)],
)
client = TestClient(app)


# Utility function to create a dummy valid JWT token
def create_valid_jwt_token():
    payload = {
        "preferred_username": "test_user",
        "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=30),
    }
    token = jwt.encode(payload, "secret", algorithm="HS256")
    return f"Bearer {token}"


def test_request_within_limit():
    valid_jwt_token = create_valid_jwt_token()

    # Simulate requests within the limit
    for _ in range(CHAT_REQUEST_LIMIT_THRESHOLD):
        response = client.get("/api/test", cookies={"Authorization": valid_jwt_token})
        assert response.status_code == 200
        assert response.text == "OK"


def test_request_exceeding_limit():
    valid_jwt_token = create_valid_jwt_token()
    # Simulate requests exceeding the limit
    for _ in range(CHAT_REQUEST_LIMIT_THRESHOLD):
        client.get("/api/test", cookies={"Authorization": valid_jwt_token})
    response = client.get("/api/test", cookies={"Authorization": valid_jwt_token})
    assert response.status_code == 429  # Assuming 429 Too Many Requests
    assert "Too many requests" in response.json()["detail"]
