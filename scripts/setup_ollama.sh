#!/bin/bash

echo "Starting Ollama server..."
ollama serve &
SERVER_PID=$!

echo "Waiting for Ollama server to be active..."
while [ "$(ollama list | grep 'NAME')" == "" ]; do
  sleep 1
done

# Pull default models
echo "Pulling embedded models..."
ollama pull nomic-embed-text
echo "Pulling default LLM models..."
ollama pull phi3

wait $SERVER_PID