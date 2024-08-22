import tempfile

import jwt
import pytest


@pytest.fixture(scope="function")
def mock_empty_db(monkeypatch):
    """
    Create a temporary SQLite datbase with empty data in file for testing.
    """
    db_file = tempfile.NamedTemporaryFile(delete=True)
    db_uri = f"sqlite:///{db_file.name}"
    monkeypatch.setenv("DB_URI", db_uri)


@pytest.fixture
def mock_user_jwt_token():
    """
    Generate a JWT token for testing.
    """
    payload = {
        "preferred_username": "test_user",
    }
    token = jwt.encode(payload, "secret", algorithm="HS256")
    return f"Bearer {token}"


@pytest.fixture
def mock_admin_jwt_token():
    """
    Generate a JWT token for testing.
    """
    payload = {
        "preferred_username": "manager",
        "X-Forwarded-Roles": ["admin-manager"],
    }
    token = jwt.encode(payload, "secret", algorithm="HS256")
    return f"Bearer {token}"
