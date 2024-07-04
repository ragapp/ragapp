from typing import List, ClassVar
from pydantic import Field
from pydantic_settings import BaseSettings
from llama_index.llms.openai import OpenAI
from llama_index.core.llms.function_calling import FunctionCallingLLM
from llama_agents import AgentOrchestrator


class ControlPlaneConfig(BaseSettings):
    llm_provider: ClassVar[str] = "openai"  # Update for other LLM providers later
    llm_model: str = Field(
        default="gpt-3.5-turbo",
        env="MODEL",
    )

    host: str = Field(
        default="localhost",
        env="HOST",
    )
    port: int = Field(
        default=8001,
        env="PORT",
    )

    orchestrator_type: str = Field(
        default="agent",
        env="ORCHESTRATOR_TYPE",
    )

    message_queue_url: str = Field(
        default="http://localhost:8100",
        env="MESSAGE_QUEUE_URL",
        alias="message_queue_url",
    )

    _llm: FunctionCallingLLM = None

    def get_llm(self):
        # TODO: Update for other LLM providers later
        if self._llm is None:
            self._llm = OpenAI(model=self.llm_model)
        return self._llm

    def get_orchestrator(self):
        llm = self.get_llm()

        match self.orchestrator_type:
            case "agent":
                return AgentOrchestrator(llm=self.get_llm())
            case "pipeline":
                raise NotImplementedError("Pipeline orchestrator not implemented yet")
            case _:
                raise ValueError(f"Unknown orchestrator type: {self.orchestrator_type}")
