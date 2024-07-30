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
## App paths:
- Manager UI: http://localhost/manager/
- Chat UI: http://localhost/a/cs50/ , http://localhost/a/cs101/

