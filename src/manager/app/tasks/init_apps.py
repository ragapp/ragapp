from app.docker_client import get_docker_client
from app.services import AppService


def main():
    """
    To start missing apps and remove orphaned apps
    """
    # Create docker client
    docker_client = get_docker_client()

    # Start missing apps
    AppService.start_apps(docker_client)

    # Remove orphaned apps
    AppService.remove_orphaned_apps(docker_client)


if __name__ == "__main__":
    main()
