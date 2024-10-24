from textwrap import dedent
from typing import ClassVar, Dict, Literal, Optional

from pydantic import BaseModel


class DocumentGeneratorTool(BaseModel):
    config_id: ClassVar[str] = "document_generator"
    name: Literal["DocumentGenerator"] = "DocumentGenerator"
    tool_type: Literal["local"] = "local"
    label: Literal["Document Generator"] = "Document Generator"
    description: str = "Generate a document file (PDF, HTML)"
    custom_prompt: Optional[str] = dedent(
        """
        If user request for a report or a post, use document generator tool to create a file and reply with the link to the file.
        
        IMPORTANT:
        - Always remove the "sandbox:" prefix from a link before generating a file.
        - The output link of the generated file must start with '/api/files/output/tool/<file>'. It must be a relative path; do not add the domain name or protocol.
        """
    )
    config: Dict = {}
    enabled: bool = False
