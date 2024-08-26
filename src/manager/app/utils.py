import re


def sanitize_app_name(app_name: str) -> str:
    return re.sub(r"[^\w.-]", "", app_name)
