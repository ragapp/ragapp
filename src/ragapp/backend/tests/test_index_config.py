import os
from unittest.mock import patch

import pytest
from app.engine.index import get_index
from fastapi import FastAPI
from fastapi.testclient import TestClient
from llama_index.core.indices import VectorStoreIndex
from llama_index.indices.managed.llama_cloud import LlamaCloudIndex

from backend.routers.management.llamacloud import llamacloud_router
from backend.tests.utils import mock_env  # noqa: F401


def create_test_app():
    app = FastAPI()
    app.include_router(llamacloud_router, prefix="/api/management/llamacloud")
    return app


test_app = create_test_app()
client = TestClient(test_app)


@pytest.mark.usefixtures("mock_env")
def test_get_index_llamacloud_enabled():
    with patch.dict(os.environ, {"USE_LLAMA_CLOUD": "true", "OPENAI_API_KEY": "test"}):
        index = get_index()
        assert isinstance(index, LlamaCloudIndex)


@pytest.mark.usefixtures("mock_env")
def test_get_index_llamacloud_disabled():
    index = get_index()
    assert isinstance(index, VectorStoreIndex)


@pytest.mark.usefixtures("mock_env")
def test_update_llamacloud_config_changes_get_index():
    index = get_index()
    assert isinstance(index, VectorStoreIndex)

    # Start with with llama cloud disabled
    new_config = {
        "llama_cloud_index_name": "test_index",
        "llama_cloud_project_name": "test_project",
        "llama_cloud_api_key": "new_test_api_key",
    }
    response = client.put("/api/management/llamacloud", json=new_config)
    print(response.content)
    assert response.status_code == 200

    # Enable llama cloud
    with patch.dict(os.environ, {"USE_LLAMA_CLOUD": "true"}):
        index = get_index()
        assert isinstance(index, LlamaCloudIndex)

    response = client.put("/api/management/llamacloud", json={})
    print(response.content)
    assert response.status_code == 200

    index = get_index()
    assert isinstance(index, VectorStoreIndex)
