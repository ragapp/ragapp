import platform


def get_hostname() -> str:
    return platform.node()
