import requests
from llama_index.llms.openai import OpenAI
from llama_index.core.agent import ReActAgent
from llama_index.core.tools import BaseTool, FunctionTool

agent_endpoints = {
    "vietnam": "http://localhost:8001",
    "thailand": "http://localhost:8002",
}


def call_vietnamese_agent(text: str):
    """
    Call Vietnamese agent to translate text to Vietnamese
    """
    message_content = f"Please help me translate the following text: {text}"
    response = requests.post(
        f"{agent_endpoints['vietnam']}/api/chat/request",
        json={
            "messages": [
                {
                    "content": message_content,
                    "role": "user",
                }
            ]
        },
    )
    return response.json()["result"]["content"]


def call_thai_agent(text: str):
    """
    Call Thai agent to translate text to Thai
    """
    message_content = f"Please help me translate the following text: {text}"
    response = requests.post(
        f"{agent_endpoints['thailand']}/api/chat/request",
        json={
            "messages": [
                {
                    "content": message_content,
                    "role": "user",
                }
            ]
        },
    )
    return response.json()["result"]["content"]


if __name__ == "__main__":
    llm = OpenAI(model="gpt-3.5-turbo-instruct")

    tools = [
        FunctionTool.from_defaults(call_vietnamese_agent),
        FunctionTool.from_defaults(call_thai_agent),
    ]

    translator_agent = ReActAgent.from_tools(tools=tools, llm=llm, verbose=True)

    # Translate text
    request = (
        "Translate the following text from English to Vietnamese: 'Hello, how are you?'"
    )

    response = translator_agent.chat(request)
    print("Response: ", response)
