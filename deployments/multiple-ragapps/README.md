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
- Keycloak: http://localhost/auth

All the apps above will requires login to access. In this deployment, we're using Keycloak to manage app users, to know how to use Keycloak, please check this document: https://www.keycloak.org/docs/latest/server_admin/#assembly-managing-users_server_administration_guide .  
By default, we already provided to you a backup of keycloak which included users for testing, the users are:
- RAGapp user: Only allowed to use chat app.
```
user: test
password: 123456
```
- Admin: Able to use chat app and chat admin to configure the app and login into Keycloak to manage other users.
```
user: admin
password: admin
```

## Operations:


## Change admin credentials:

The default username and password is `admin`. You can change it to use your own credentials:

1. Create a new hashed password using `openssl`:

```shell
openssl passwd -apr1 new_password
```

2. Export new user name and password to environment variables:

```shell
export USERNAME=your_username
export HASHED_PASSWORD=the_hashed_password
```

You can also update them directly in the [./docker-compose.yml](docker-compose.yml) file. By changing the `traefik.http.middlewares.admin-auth.basicauth.users` config of the `traefik` service.

3. Restart the service:

```
docker compose up
```
