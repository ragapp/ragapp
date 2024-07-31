## Single RAGApp deployment

## Features

Deploy RAGapp with [Ollama](https://ollama.com/) and [Qdrant](https://qdrant.tech/) easily in your own infrastructure.

Using the `MODEL` environment variable, you can specify which model to use, e.g. [`llama3`](https://ollama.com/library/llama3):

```shell
MODEL=llama3 docker-compose up
```

If you don't specify the `MODEL` variable, the default model used is `phi3`, which is less capable than `llama3` but faster to download.

> _Note_: The `setup` container in the `docker-compose.yml` file will download the selected model into the [`ollama`](./ollama/) folder - this will take a few minutes.

#### Specify the Ollama host

Using the `OLLAMA_BASE_URL` environment variables, you can specify which Ollama host to use.
If you don't specify the `OLLAMA_BASE_URL` variable, the default points to the Ollama instance started by Docker Compose (`http://ollama:11434`).

If you're running a local Ollama instance, you can choose to connect it to RAGapp by setting the `OLLAMA_BASE_URL` variable to `http://host.docker.internal:11434`:

```shell
MODEL=llama3 OLLAMA_BASE_URL=http://host.docker.internal:11434 docker-compose up
```

> _Note_: `host.docker.internal` is not available on Linux machines, you'll have to use `172.17.0.1` instead. For details see [Issue #78](https://github.com/ragapp/ragapp/issues/78).

#### GPU acceleration

Using a local Ollama instance is necessary if you're running RAGapp on macOS, as Docker for Mac does not support GPU acceleration.

To enable Docker access to NVIDIA GPUs on Linux, [install the NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html).

## App paths:

- Chat UI: http://localhost:8000
- Admin UI: http://localhost:8000/admin
