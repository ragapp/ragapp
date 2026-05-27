import asyncio
import sys
from types import ModuleType
from unittest.mock import MagicMock, patch

import pytest

generate_module = ModuleType("generate")
generate_module.generate_datasource = MagicMock()
sys.modules.setdefault("create_llama", ModuleType("create_llama"))
sys.modules.setdefault("create_llama.backend", ModuleType("backend"))
sys.modules.setdefault("create_llama.backend.app", ModuleType("app"))
sys.modules.setdefault("create_llama.backend.app.engine", ModuleType("engine"))
sys.modules.setdefault("create_llama.backend.app.engine.generate", generate_module)

from backend.controllers.files import FileHandler, InvalidFileNameError


class Upload:
    def __init__(self, content: bytes):
        self.content = content

    async def read(self) -> bytes:
        return self.content


@pytest.fixture
def file_loader():
    loader = MagicMock()
    loader.get_supported_file_extensions.return_value = [".txt", ".pdf", ".csv"]
    return loader


def test_get_data_file_path_rejects_path_traversal():
    with pytest.raises(InvalidFileNameError):
        FileHandler.get_data_file_path("../outside.txt")


def test_get_data_file_path_rejects_nested_paths():
    with pytest.raises(InvalidFileNameError):
        FileHandler.get_data_file_path("nested/file.txt")


def test_upload_file_keeps_files_inside_data_directory(tmp_path, monkeypatch, file_loader):
    monkeypatch.chdir(tmp_path)

    with patch("backend.controllers.files.LoaderManager") as loader_manager:
        loader_manager.return_value.get_loader.return_value = file_loader
        result = asyncio.run(
            FileHandler.upload_file(Upload(b"safe"), "safe.txt", "1", "2")
        )

    assert result.name == "safe.txt"
    assert (tmp_path / "data" / "safe.txt").read_bytes() == b"safe"
    assert not (tmp_path / "safe.txt").exists()


def test_upload_file_rejects_traversal_without_writing_outside(
    tmp_path, monkeypatch, file_loader
):
    monkeypatch.chdir(tmp_path)

    with patch("backend.controllers.files.LoaderManager") as loader_manager:
        loader_manager.return_value.get_loader.return_value = file_loader
        with pytest.raises(InvalidFileNameError):
            asyncio.run(
                FileHandler.upload_file(Upload(b"bad"), "../outside.txt", "1", "2")
            )

    loader_manager.assert_not_called()
    assert not (tmp_path / "outside.txt").exists()


def test_remove_file_rejects_traversal_without_deleting_outside(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    outside_file = tmp_path / "outside.txt"
    outside_file.write_text("keep me")

    with pytest.raises(InvalidFileNameError):
        FileHandler.remove_file("../outside.txt")

    assert outside_file.read_text() == "keep me"


def test_remove_file_deletes_data_file(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    data_dir = tmp_path / "data"
    data_dir.mkdir()
    data_file = data_dir / "safe.txt"
    data_file.write_text("delete me")

    with patch("backend.controllers.files.index_all"):
        FileHandler.remove_file("safe.txt")

    assert not data_file.exists()
