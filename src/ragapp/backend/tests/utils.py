import os
import tempfile
from unittest.mock import patch

import jwt
import pytest


@pytest.fixture
def mock_env():
    """Fixture to create a mock environment based on the .env file"""
    with patch.dict(
        os.environ,
        {
            "OPENAI_API_KEY": "test",
            "MODEL_PROVIDER": "openai",
            "MODEL": "gpt-4o-mini",
            "EMBEDDING_MODEL": "text-embedding-3-small",
            "EMBEDDING_DIM": "1536",
            "APP_HOST": "0.0.0.0",
            "APP_PORT": "8000",
            "FILESERVER_URL_PREFIX": "/api/files",
            "TOP_K": "3",
            "VECTOR_STORE_PROVIDER": "chroma",
            "STORAGE_DIR": "storage/context",
            "CHROMA_COLLECTION": "default",
            "CHROMA_PATH": "storage/chromadb",
        },
        clear=True,
    ):
        # Use a temporary directory for CHROMA_PATH
        with tempfile.TemporaryDirectory() as temp_dir:
            os.environ["CHROMA_PATH"] = temp_dir
            yield


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
