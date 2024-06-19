from typing import List, Self
from pydantic import Field, validator, field_validator
from src.models.base_env import BaseEnvConfig, NewlineListEnv


class ChatConfig(BaseEnvConfig):
    system_prompt: str | None = Field(
        default="You are a helpful assistant who helps users with their questions.",
        description="The system prompt to use for the LLM.",
        env="SYSTEM_PROMPT",
        preprocess=True,
    )
    conversation_starters: NewlineListEnv | str | None = Field(
        default=None,
        description="Suggested questions for users to start a conversation",
        env="CONVERSATION_STARTERS",
        preprocess=True,
    )

    class Config:
        extra = "ignore"
        json_schema_extra = {
            "example": {
                "system_prompt": "You are a helpful assistant who helps users with their questions.",
                "conversation_starters": "What is the meaning of life?\nTell me a joke.",
            }
        }

    @field_validator("system_prompt", mode="before")
    def preprocess_system_prompt(cls, value):
        """
        To convert empty string prompt to None automatically
        """
        if value == "":
            return None
        return value

    @field_validator("conversation_starters", mode="before")
    def preprocess_conversation_starters(cls, value):
        """
        To convert empty string prompt to None automatically and split the string to list
        """
        if type(value) == list:
            return NewlineListEnv(value)
        if type(value) == str:
            if value == "":
                return None
            else:
                return NewlineListEnv(value.split("\n"))

    @classmethod
    def get_config(cls) -> Self:
        return ChatConfig()
