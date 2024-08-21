## RAGApp with Manager

## Features

- Manage RAGApp containers through a manager UI
- Start/Stop multiple RAGApp containers
- Deploy with Traefik (reverse proxy) and Keycloak (Authentication and user management)

## How to start?

Navigate to the `deployments/multiple-ragapps` directory and run Docker Compose:

```shell
cd deployments/multiple-ragapps
docker compose pull # to ensure the latest images are pulled
docker network create ragapp-network
docker compose up
```

> _Note_: This will use the release images from from Docker Hub.

### Start local build

To use a local build instead, call:

```shell
docker compose up --build
```

### Use the test image (main branch)

To use the latest test version from the `main` branch, call:

```shell
docker pull ghcr.io/ragapp/ragapp:latest
docker pull ghcr.io/ragapp/ragapp-manager:latest
RAGAPP_IMAGE=ghcr.io/ragapp/ragapp:latest MANAGER_IMAGE=ghcr.io/ragapp/ragapp-manager:latest docker compose up
```

## Using the App

The app provides the following endpoints:

- Manager UI: http://localhost/manager
- RAGapps: http://localhost/a/<app_name>
- Authentication: http://localhost/auth/admin/ragapp/console/

All the endpoints above will require a user to login. Users are managed by [Keycloak](https://www.keycloak.org/). Check [Managing Users](https://www.keycloak.org/docs/latest/server_admin/#assembly-managing-users_server_administration_guide) to configure users and roles.

> \_Note: This Keycloak instance is for development purposes only. For production, you should use secure setup: https://www.keycloak.org/server/configuration-production

### Example users

By default, we already configured Keycloak with the following users:

- RAGapp user: Only allowed to use chat app.

```
user: test
password: 123456
```

- Manager: Can chat, configure the RAGapps and login into Keycloak to manage users.

```
user: manager
password: 123456
```

### Rate limiting for chat requests

By default, each user can make 20 chat requests per day. If you want to change this limit, just update the `CHAT_REQUEST_LIMIT_THRESHOLD` number in the `manager` config section of the [docker-compose.yml](./docker-compose.yml) file.
