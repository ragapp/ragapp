# RagBox

## Start with docker:
1. Start a docker container with our image:
```shell
docker run -p 8000:8000 --name ragbox ghcr.io/marcusschiesser/ragbox
```

2. Access Web UI to chat or config the app:
- Admin UI: http://localhost:8000/admin
- Chat UI: http://localhost:8000  
  *Note: The Chat UI is only functional after the API key has been configured in Admin UI.
