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
RAGAPP_IMAGE=ghcr.io/ragapp/ragapp:latest MANAGER_IMAGE=ghcr.io/ragapp/ragapp-manager:latest docker compose pull
RAGAPP_IMAGE=ghcr.io/ragapp/ragapp:latest MANAGER_IMAGE=ghcr.io/ragapp/ragapp-manager:latest docker compose up
```

## App paths:

- Manager UI: http://localhost/manager
- RAGapps: http://localhost/a/<app_name>
- Keycloak: http://localhost/auth/admin/ragapp/console/

All the apps above will requires login to access. In this deployment, we're using Keycloak to manage app users, to know how to use Keycloak, please check this document: https://www.keycloak.org/docs/latest/server_admin/#assembly-managing-users_server_administration_guide .  
> _Note: This Keycloak instance is for development purposes only. For production, you should use a more secure setup: https://www.keycloak.org/server/configuration-production

By default, we already provided to you a backup of keycloak which included users for testing, the users are:
- RAGapp user: Only allowed to use chat app.
```
user: test
password: 123456
```
- Manager: Able to use chat app and chat admin to configure the app and login into Keycloak to manage other users.
```
user: manager
password: 123456
```
