# RagBox

## Development

```shell
poetry install --no-root
make build-frontends
make dev
```

Note: To check out the admin UI during development, please go to http://localhost:3000/admin.

## Test Build

The latest `main` branch is published to the Docker registry from Github packages.

To run, start a docker container with our image:

```shell
docker run -p 8000:8000 ghcr.io/marcusschiesser/ragbox
```

## Usage

Access Web UI to chat or config the app:

- Admin UI: http://localhost:8000/admin
- Chat UI: http://localhost:8000  
  \*Note: The Chat UI is only functional after the API key has been configured in the Admin UI.
