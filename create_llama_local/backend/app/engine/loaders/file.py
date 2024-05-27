import os
import logging
from llama_parse import LlamaParse
from pydantic import BaseModel, validator

logger = logging.getLogger(__name__)


class FileLoaderConfig(BaseModel):
    data_dir: str = "data"
    use_llama_parse: bool = False

    @validator("data_dir")
    def data_dir_must_exist(cls, v):
        if not os.path.isdir(v):
            raise ValueError(f"Directory '{v}' does not exist")
        return v


def llama_parse_parser():
    if os.getenv("LLAMA_CLOUD_API_KEY") is None:
        raise ValueError(
            "LLAMA_CLOUD_API_KEY environment variable is not set. "
            "Please set it in .env file or in your shell environment then run again!"
        )
    parser = LlamaParse(result_type="markdown", verbose=True, language="en")
    return parser


def get_file_documents(user_id: str, config: FileLoaderConfig):
    from llama_index.core.readers import SimpleDirectoryReader
    user_data_dir = f"{config.data_dir}/{user_id}"
    try:
        reader = SimpleDirectoryReader(
            user_data_dir,
            recursive=True,
            filename_as_id=True,
        )
        if config.use_llama_parse:
            parser = llama_parse_parser()
            reader.file_extractor = {".pdf": parser}
        return reader.load_data()
    except ValueError as e:
        import sys, traceback

        # Catch the error if the data dir is empty
        # and return as empty document list
        _, _, exc_traceback = sys.exc_info()
        function_name = traceback.extract_tb(exc_traceback)[-1].name
        if function_name == "_add_files":
            logger.warning(
                f"Failed to load file documents, error message: {e} . Return as empty document list."
            )
            return []
        else:
            # Raise the error if it is not the case of empty data dir
            raise e
