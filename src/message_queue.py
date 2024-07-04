import os
import asyncio
from llama_agents import SimpleMessageQueue


if __name__ == "__main__":
    host = os.getenv("MESSAGE_QUEUE_HOST", "localhost")
    port = int(os.getenv("MESSAGE_QUEUE_PORT", "8100"))
    message_queue = SimpleMessageQueue(
        host=host,
        port=port,
    )
    asyncio.run(message_queue.launch_server())
