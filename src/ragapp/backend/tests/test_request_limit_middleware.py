import pytest
from fastapi import APIRouter, Depends, FastAPI
from fastapi.testclient import TestClient
from starlette.responses import Response

from backend.models.orm import *  # noqa: F403
from backend.tests.utils import (  # noqa: F401
    mock_admin_jwt_token,
    mock_empty_db,
    mock_user_jwt_token,
)


@pytest.fixture
def test_client():
    from backend.middlewares.rate_limit import request_limit_middleware

    # Define a test router
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

    return client


@pytest.fixture(scope="function")
def set_chat_request_limit_threshold(monkeypatch):
    monkeypatch.setenv("CHAT_REQUEST_LIMIT_THRESHOLD", "5")


def test_request_within_limit(
    set_chat_request_limit_threshold,
    test_client,
    mock_user_jwt_token,  # noqa: F811
    mock_empty_db,  # noqa: F811
):  # noqa: F811
    from backend.middlewares.rate_limit import CHAT_REQUEST_LIMIT_THRESHOLD

    # Simulate requests within the limit
    for _ in range(CHAT_REQUEST_LIMIT_THRESHOLD):
        response = test_client.get(
            "/api/test", cookies={"Authorization": mock_user_jwt_token}
        )
        assert response.status_code == 200
        assert response.text == "OK"


def test_request_exceeding_limit(
    set_chat_request_limit_threshold,
    test_client,
    mock_user_jwt_token,  # noqa: F811
    mock_empty_db,  # noqa: F811
):
    from backend.middlewares.rate_limit import CHAT_REQUEST_LIMIT_THRESHOLD

    # Simulate requests exceeding the limit
    for _ in range(CHAT_REQUEST_LIMIT_THRESHOLD):
        test_client.get("/api/test", cookies={"Authorization": mock_user_jwt_token})
    response = test_client.get(
        "/api/test", cookies={"Authorization": mock_user_jwt_token}
    )
    assert response.status_code == 429  # Assuming 429 Too Many Requests


def test_request_limit_not_applied_for_admin(
    set_chat_request_limit_threshold,
    test_client,
    mock_admin_jwt_token,  # noqa: F811
    mock_empty_db,  # noqa: F811,
):
    from backend.middlewares.rate_limit import (
        CHAT_REQUEST_LIMIT_THRESHOLD,
    )

    # Simulate requests exceeding the limit
    for _ in range(CHAT_REQUEST_LIMIT_THRESHOLD + 1):
        response = test_client.get(
            "/api/test",
            cookies={"Authorization": mock_admin_jwt_token},
        )
        assert response.status_code == 200
        assert response.text == "OK"
