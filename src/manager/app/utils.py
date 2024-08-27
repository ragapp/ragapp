import os


def check_app_name(app_name: str) -> str:
    if "." in app_name or "/" in app_name or "\\" in app_name:
        raise ValueError("Invalid app name")
    return app_name


def default_state_dir() -> str:
    """
    Use the current working directory as the default state directory
    """
    # Get current working directory
    current_dir = os.getcwd()
    # Create a directory named `data` in the current working directory
    state_dir = os.path.join(current_dir, "data")
    if not os.path.exists(state_dir):
        os.makedirs(state_dir)

    return state_dir
