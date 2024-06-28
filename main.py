import os
from dotenv import load_dotenv
from src.app.constants import ENV_FILE_PATH

load_dotenv(dotenv_path=ENV_FILE_PATH, verbose=False)


if __name__ == "__main__":
    import uvicorn
    from src.app.main import init_app

    is_agent = os.getenv("AGENT", "").lower() == "true"

    app_host = os.getenv("APP_HOST", "0.0.0.0")
    app_port = int(os.getenv("APP_PORT", is_agent and 8001 or 8000))

    app = init_app(is_agent)

    uvicorn.run(app=app, host=app_host, port=app_port, loop="asyncio")
