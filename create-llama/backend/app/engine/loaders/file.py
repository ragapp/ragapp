import os
from llama_parse import LlamaParse
from pydantic import BaseModel, validator


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


def get_file_documents(config: FileLoaderConfig):
    from llama_index.core.readers import SimpleDirectoryReader

    reader = SimpleDirectoryReader(
        config.data_dir,
        recursive=True,
    )
    if config.use_llama_parse:
        parser = llama_parse_parser()
        reader.file_extractor = {".pdf": parser}
    return reader.load_data()
