# same as https://github.com/run-llama/create-llama/blob/81ef7f0f9362f34339669bdc81f8ab885701f73b/templates/components/vectordbs/python/llamacloud/service.py
import logging
import os
import time
import typing
from io import BytesIO
from typing import Any, Dict, List, Optional, Set, Tuple, Union

import requests
from app.api.routers.models import SourceNodes
from app.engine.index import get_client
from fastapi import BackgroundTasks
from llama_cloud import ManagedIngestionStatus, PipelineFileCreateCustomMetadataValue
from llama_index.core.schema import NodeWithScore
from pydantic import BaseModel

logger = logging.getLogger("uvicorn")


class LlamaCloudFile(BaseModel):
    file_name: str
    pipeline_id: str

    def __eq__(self, other):
        if not isinstance(other, LlamaCloudFile):
            return NotImplemented
        return (
            self.file_name == other.file_name and self.pipeline_id == other.pipeline_id
        )

    def __hash__(self):
        return hash((self.file_name, self.pipeline_id))


class LLamaCloudFileService:
    LOCAL_STORE_PATH = "output/llamacloud"
    DOWNLOAD_FILE_NAME_TPL = "{pipeline_id}${filename}"

    @classmethod
    def get_all_projects_with_pipelines(cls) -> List[Dict[str, Any]]:
        try:
            client = get_client()
            projects = client.projects.list_projects()
            pipelines = client.pipelines.search_pipelines()
            return [
                {
                    **(project.dict()),
                    "pipelines": [
                        {"id": p.id, "name": p.name}
                        for p in pipelines
                        if p.project_id == project.id
                    ],
                }
                for project in projects
            ]
        except Exception as error:
            logger.error(f"Error listing projects and pipelines: {error}")
            return []

    @classmethod
    def add_file_to_pipeline(
        cls,
        project_id: str,
        pipeline_id: str,
        upload_file: Union[typing.IO, Tuple[str, BytesIO]],
        custom_metadata: Optional[Dict[str, PipelineFileCreateCustomMetadataValue]],
    ) -> str:
        client = get_client()
        file = client.files.upload_file(project_id=project_id, upload_file=upload_file)
        files = [
            {
                "file_id": file.id,
                "custom_metadata": {"file_id": file.id, **(custom_metadata or {})},
            }
        ]
        files = client.pipelines.add_files_to_pipeline(pipeline_id, request=files)

        # Wait 2s for the file to be processed
        max_attempts = 20
        attempt = 0
        while attempt < max_attempts:
            result = client.pipelines.get_pipeline_file_status(pipeline_id, file.id)
            if result.status == ManagedIngestionStatus.ERROR:
                raise Exception(f"File processing failed: {str(result)}")
            if result.status == ManagedIngestionStatus.SUCCESS:
                # File is ingested - return the file id
                return file.id
            attempt += 1
            time.sleep(0.1)  # Sleep for 100ms
        raise Exception(
            f"File processing did not complete after {max_attempts} attempts."
        )

    @classmethod
    def download_pipeline_file(
        cls,
        file: LlamaCloudFile,
        force_download: bool = False,
    ):
        client = get_client()
        file_name = file.file_name
        pipeline_id = file.pipeline_id

        # Check is the file already exists
        downloaded_file_path = cls._get_file_path(file_name, pipeline_id)
        if os.path.exists(downloaded_file_path) and not force_download:
            logger.debug(f"File {file_name} already exists in local storage")
            return
        try:
            logger.info(f"Downloading file {file_name} for pipeline {pipeline_id}")
            files = client.pipelines.list_pipeline_files(pipeline_id)
            if not files or not isinstance(files, list):
                raise Exception("No files found in LlamaCloud")
            for file_entry in files:
                if file_entry.name == file_name:
                    file_id = file_entry.file_id
                    project_id = file_entry.project_id
                    file_detail = client.files.read_file_content(
                        file_id, project_id=project_id
                    )
                    cls._download_file(file_detail.url, downloaded_file_path)
                    break
        except Exception as error:
            logger.info(f"Error fetching file from LlamaCloud: {error}")

    @classmethod
    def download_files_from_nodes(
        cls, nodes: List[NodeWithScore], background_tasks: BackgroundTasks
    ):
        files = cls._get_files_to_download(nodes)
        for file in files:
            logger.info(f"Adding download of {file.file_name} to background tasks")
            background_tasks.add_task(
                LLamaCloudFileService.download_pipeline_file, file
            )

    @classmethod
    def _get_files_to_download(cls, nodes: List[NodeWithScore]) -> Set[LlamaCloudFile]:
        source_nodes = SourceNodes.from_source_nodes(nodes)
        llama_cloud_files = [
            LlamaCloudFile(
                file_name=node.metadata.get("file_name"),
                pipeline_id=node.metadata.get("pipeline_id"),
            )
            for node in source_nodes
            if (
                node.metadata.get("pipeline_id") is not None
                and node.metadata.get("file_name") is not None
            )
        ]
        # Remove duplicates and return
        return set(llama_cloud_files)

    @classmethod
    def _get_file_name(cls, name: str, pipeline_id: str) -> str:
        return cls.DOWNLOAD_FILE_NAME_TPL.format(pipeline_id=pipeline_id, filename=name)

    @classmethod
    def _get_file_path(cls, name: str, pipeline_id: str) -> str:
        return os.path.join(cls.LOCAL_STORE_PATH, cls._get_file_name(name, pipeline_id))

    @classmethod
    def _download_file(cls, url: str, local_file_path: str):
        logger.info(f"Saving file to {local_file_path}")
        # Create directory if it doesn't exist
        os.makedirs(cls.LOCAL_STORE_PATH, exist_ok=True)
        # Download the file
        with requests.get(url, stream=True) as r:
            r.raise_for_status()
            with open(local_file_path, "wb") as f:
                for chunk in r.iter_content(chunk_size=8192):
                    f.write(chunk)
        logger.info("File downloaded successfully")
