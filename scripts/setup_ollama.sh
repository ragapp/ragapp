#!/bin/sh

# Pull default models
echo "Pulling embedded models..."
curl -X POST ${OLLAMA_BASE_URL}/api/pull -d '{
  "name": "nomic-embed-text"
}'
echo "Pulling ${MODEL} model..."
curl -X POST ${OLLAMA_BASE_URL}/api/pull -d '{
  "name": "'${MODEL}'"
}'

wait $SERVER_PID