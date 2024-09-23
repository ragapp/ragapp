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
docker pull ragapp/ragapp
docker compose pull # to ensure the latest images are pulled
docker network create ragapp-network
docker compose up
```

> _Note_: This will use the release images from from Docker Hub.

The whole state of all services (RAGApps, Manager and Keycloak) will be persisted in the directory set by the `STATE_DIR` environment variable (defaults to `${PWD}/data`).

As Docker Compose doesn't work with relative paths on Windows, you'll need set the `STATE_DIR` variable in the `.env` file to the absolute path of the `data` directory.

### Add tracking script:
To track user sessions on the chat, you can add any tracking script to the chat UI by setting the `TRACKING_SCRIPT` environment variable.  
Example, using [Clarity](https://clarity.microsoft.com/):
```shell
TRACKING_SNIPPET='<script type="text/javascript">
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "YOUR_CLARITY_ID");
</script>' docker-compose up
```

### Using your own domain

Instead of using `localhost`, you can use your own domain with TLS. To do so, please update these variables in the [.env](./.env) file:

- `DOMAIN`: The deployment domain, e.g. `ragapp.org`
- `TLS`: To enable/disable HTTPS. Don't enable TLS if you're using your `localhost` domain.

If you enable TLS for a domain, please make sure of the following:

- The [acme.json](./data/traefik/acme.json) file has `600` permission.
- To set your email address in the [Traefik config](./data/traefik/traefik.yml)

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

### Disabling SSL

The data flow between your instance and the public internet is by default protected by SSL encryption.
If you want to use Keycloak under a self-signed certificate (letsencrypt default certificate when encountering any error during certificate validation or your domain is not already configured), the browser will throw a "SSL_ERROR" or timeout depending on the browser.

Are you having trouble generating the certificate for your domain? Check the following:

- Check that `acme.json` wasn't already generated with an invalid/incomplete key. If so, delete acme.json and re-generate the key.
- Check for read/write permissions on `data/traefik/acme.json`

Disabling SSL:

- Enter the container in interactive mode:

```shell
docker exec -it KEYCLOAK_CONTAINER_ID bash
```

- In the container set the path to use the kcadm.sh script

```bash
export PATH=$PATH:/opt/keycloak/bin
```

- Set keycloak server

```bash
kcadm.sh config credentials --server http://localhost:8080/ \
  --realm master \
  --user admin --password admin
```

- Disable SSL for the main realm

```bash
kcadm.sh update realms/master -s enabled=true -s sslRequired=none
```

From now, you should be able to login into Keycloak, from there you can enable SSL again or disable it for the other realms.
