import os
from dotenv import load_dotenv
from src.app.constants import ENV_FILE_PATH

load_dotenv(dotenv_path=ENV_FILE_PATH, verbose=False)


if __name__ == "__main__":
    import uvicorn
    from src.app.main import init_app

    app_host = os.getenv("AGENT_HOST", os.getenv("APP_HOST", "0.0.0.0"))
    app_port = int(os.getenv("AGENT_PORT", os.getenv("APP_PORT", 8000)))

    app = init_app()

    uvicorn.run(app=app, host=app_host, port=app_port, loop="asyncio")
