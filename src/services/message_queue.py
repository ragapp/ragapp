import asyncio
from llama_agents import SimpleMessageQueue


if __name__ == "__main__":
    message_queue = SimpleMessageQueue(port=8100)
    asyncio.run(message_queue.launch_server())
