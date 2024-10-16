from typing import ClassVar, Dict, Literal, Optional

from pydantic import BaseModel


class DocumentGeneratorTool(BaseModel):
    config_id: ClassVar[str] = "document_generator"
    name: Literal["DocumentGenerator"] = "DocumentGenerator"
    tool_type: Literal["llamahub"] = "llamahub"
    label: Literal["Document Generator"] = "Document Generator"
    description: str = "Generate a document file (PDF, HTML)"
    custom_prompt: Optional[str] = None
    config: Dict = {}
    enabled: bool = False
