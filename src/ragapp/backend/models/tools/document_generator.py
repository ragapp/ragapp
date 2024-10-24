from typing import ClassVar, Dict, Literal, Optional

from pydantic import BaseModel


class DocumentGeneratorTool(BaseModel):
    config_id: ClassVar[str] = "document_generator"
    name: Literal["DocumentGenerator"] = "DocumentGenerator"
    tool_type: Literal["local"] = "local"
    label: Literal["Document Generator"] = "Document Generator"
    description: str = "Generate a document file (PDF, HTML)"
    custom_prompt: Optional[str] = (
        """If user request for a report or a post, use document generator tool to create a file and reply with the link to the file."""
    )
    config: Dict = {}
    enabled: bool = False
