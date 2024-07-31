## Multiple RAGApp Deployment
## Features
- Multiple RAGApp containers.
- Manage RAGApp containers through the Manager UI.
- Utilize Traefik as a reverse proxy to authenticate and manage admin routes.

## How to start?
Navigate to the `deployments/multiple-ragapps` directory in your local repository and run docker compose:
```shell
cd deployments/multiple-ragapps && docker compose up -d
```
> _Note_: You can also use `docker compose up --build` command to build and start using your local image.

## App paths:
- Manager UI: http://localhost/manager/
- Chat UI: http://localhost/a/cs50/ , http://localhost/a/cs101/

## Change admin credentials: 
The default username and password is `admin`. You should probably change it to your own new credentials:
1. Create a new hashed password by `openssl`:
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
docker compose up -d
```
