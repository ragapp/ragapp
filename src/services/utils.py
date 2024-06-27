from typing import List
from llama_agents.message_queues import SimpleRemoteClientMessageQueue
from llama_index.llms.openai import OpenAI


def get_message_queue():
    return SimpleRemoteClientMessageQueue(base_url="http://localhost:8100")


# TODO: Move to the model config
def init_llm(llm_provider: str, llm_model: str):
    match llm_provider:
        case "openai":
            return OpenAI(model=llm_model)
        case _:
            raise ValueError(f"Unknown llm provider: {llm_provider}")


# TODO: Move to the tool config
def get_tools(tools: List[str]):
    from create_llama.backend.app.engine.tools import ToolFactory

    all_tools = ToolFactory.from_env()

    print(f"Loaded {len(all_tools)} tools")

    return [tool for tool in all_tools if tool.name in tools]
