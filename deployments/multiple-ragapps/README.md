## RAGApp with Manager

## Features

- Manage RAGApp containers through a manager UI
- Start/Stop multiple RAGApp containers
- Deploy with Traefik (reverse proxy) and Keycloak (Authentication and user management)
- Persistence of the RAGApps data and configuration in the file system

## How to start?

Navigate to the `deployments/multiple-ragapps` directory and run Docker Compose:

```shell
cd deployments/multiple-ragapps
```

### Config environment variables:
Please update below variables in the [.env](./.env) file or set it directly in your shell:

`STATE_DIR` (required): The absolute path to the directory hold all state of all services (RAGApps, Manager and Keycloak). If you're starting with the example data, please set it to the `data` folder from the current directory.

`DOMAIN` (required): The deployment domain, default is `localhost`.

`TLS`: To enable/disable HTTPS. Don't set this if you're using `localhost` domain.


> _Note_: If you enable TLS for the domain, please make sure the [acme.json](./data/traefik/acme.json) has `600` permission.

### Run services

Run these commands to pull all latest images and start them in Docker:

```shell
docker pull ragapp/ragapp
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

A user session has a specific timeout which can be [configured in Keycloak](https://www.keycloak.org/docs/latest/server_admin/#_timeouts). To log out before the timeout follow this link: http://localhost/auth/realms/ragapp/protocol/openid-connect/logout

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

By default, each user can make 20 chat requests per day. If you want to change this limit, just update the `CHAT_REQUEST_LIMIT_THRESHOLD` number in the `manager` config section of the [docker-compose.yml](./docker-compose.yml) file. To disable the limit, you can remove the treshold or set it to `0`.
