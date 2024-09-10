from typing import Self

from pydantic import Field, field_validator

from backend.models.base_env import BaseEnvConfig, NewlineListEnv

DEFAULT_NEXT_QUESTION_PROMPT = """You're a helpful assistant! Your task is to suggest the next question that user might ask. 
Here is the conversation history
---------------------
{conversation}
---------------------
Given the conversation history, please give me 3 questions that you might ask next!
Your answer should be wrapped in three sticks which follows the following format:
```
<question 1>
<question 2>
<question 3>
```"""

DEFAULT_SYSTEM_CITATION_PROMPT = """You have provided information from a knowledge base that has been passed to you in nodes of information.
Each node has useful metadata such as node ID, file name, page, etc.
Please add the citation to the data node for each sentence or paragraph that you reference in the provided information.
The citation format is: . [citation:<node_id>]()
Where the <node_id> is the unique identifier of the data node.

Example:
We have two nodes:
  node_id: xyz
  file_name: llama.pdf
  
  node_id: abc
  file_name: animal.pdf

User question: Tell me a fun fact about Llama.
Your answer:
A baby llama is called \"Cria\" [citation:xyz]().
It often live in desert [citation:abc]().
It's cute animal."""


class ChatConfig(BaseEnvConfig):
    custom_prompt: str | None = Field(
        default="You are a helpful assistant who helps users with their questions.",
        description="Custom system prompt",
        env="CUSTOM_PROMPT",
        preprocess=True,
    )
    conversation_starters: NewlineListEnv | str | None = Field(
        default=None,
        description="Suggested questions for users to start a conversation",
        env="CONVERSATION_STARTERS",
        preprocess=True,
    )
    next_question_prompt: str | None = Field(
        default=None,
        description="Prompt template for suggesting next questions. Set `suggest_next_questions_enabled` to `True` to use this.",
        env="NEXT_QUESTION_PROMPT",
        preprocess=True,
    )
    system_citation_prompt: str | None = Field(
        default=None,
        description="Prompt for inline text citations. Set `inline_text_citations_enabled` to `True` to use this.",
        env="SYSTEM_CITATION_PROMPT",
        preprocess=True,
    )

    def __init__(self, **kwargs):
        # If suggest_next_questions_enabled is provided, set next_question_prompt
        if "suggest_next_questions_enabled" in kwargs:
            if kwargs["suggest_next_questions_enabled"]:
                kwargs["next_question_prompt"] = DEFAULT_NEXT_QUESTION_PROMPT
            else:
                kwargs["next_question_prompt"] = None
            kwargs.pop("suggest_next_questions_enabled")

        # If inline_text_citations_enabled is provided, set system_citation_prompt
        if "inline_text_citations_enabled" in kwargs:
            if kwargs["inline_text_citations_enabled"]:
                kwargs["system_citation_prompt"] = DEFAULT_SYSTEM_CITATION_PROMPT
            else:
                kwargs["system_citation_prompt"] = None
            kwargs.pop("inline_text_citations_enabled")

        super().__init__(**kwargs)

    class Config:
        extra = "ignore"
        json_schema_extra = {
            "example": {
                "custom_prompt": "You are a helpful assistant who helps users with their questions.",
                "conversation_starters": "What is the meaning of life?\nTell me a joke.",
                "suggest_next_questions_enabled": True,
                "inline_text_citations_enabled": True,
            }
        }

    @field_validator(
        "custom_prompt",
        "next_question_prompt",
        "system_citation_prompt",
        mode="before",
    )
    def preprocess_string_prompt(cls, value):
        """
        To convert empty string prompt to None automatically.
        """
        if value == "":
            return None
        return value

    @field_validator("conversation_starters", mode="before")
    def preprocess_conversation_starters(cls, value):
        """
        To convert empty string prompt to None automatically and split the string to list
        """
        if isinstance(value, list):
            return NewlineListEnv(value)
        if isinstance(value, str):
            if value == "":
                return None
            else:
                return NewlineListEnv(value.split("\n"))
        return value

    @classmethod
    def get_config(cls) -> Self:
        config = ChatConfig()
        # Ensure the computed fields are properly set based on the stored values
        return config

    def to_api_response(self):
        return {
            "custom_prompt": self.custom_prompt,
            "conversation_starters": self.conversation_starters,
            "suggest_next_questions_enabled": self.next_question_prompt is not None,
            "inline_text_citations_enabled": self.system_citation_prompt is not None,
        }
