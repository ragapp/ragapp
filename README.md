# RagBox

## Start with docker locally:
1. Build a docker image:
```shell
docker build -t schiesser-it/rag-box .
```

2. Start an app container with the image:
```shell
OPENAI_API_KEY=<your_openai_api_key> && \
docker run \
  --rm \
  -p 8000:8000 \
  -e OPENAI_API_KEY=$OPENAI_API_KEY \
  schiesser-it/rag-box
```

