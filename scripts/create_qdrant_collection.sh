#!/bin/sh

# Configuration
QDRANT_HOST="qdrant"
QDRANT_PORT="6333"
COLLECTION_NAME="default"
DISTANCE_METRIC="Cosine"
VECTOR_SIZE=768

# Function to check if a collection exists
collection_exists() {
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://$QDRANT_HOST:$QDRANT_PORT/collections/$COLLECTION_NAME")
    if [ "$HTTP_STATUS" -eq 200 ]; then
        return 0  # Collection exists
    else
        return 1  # Collection does not exist
    fi
}

# Function to create a new collection
create_collection() {
    curl -X PUT "http://$QDRANT_HOST:$QDRANT_PORT/collections/$COLLECTION_NAME" \
         -H "Content-Type: application/json" \
         -d "$(printf '{"vectors": {"size": %d, "distance": "%s"}}' "$VECTOR_SIZE" "$DISTANCE_METRIC")"
}

# Check if collection exists and create it if it doesn't
if collection_exists; then
    echo "Collection '$COLLECTION_NAME' already exists."
else
    echo "Creating collection '$COLLECTION_NAME'."
    create_collection
    echo "Collection '$COLLECTION_NAME' created."
fi
