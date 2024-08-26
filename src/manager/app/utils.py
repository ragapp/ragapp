def check_app_name(app_name: str) -> str:
    if "." in app_name or "/" in app_name or "\\" in app_name:
        raise ValueError("Invalid app name")
    return app_name
