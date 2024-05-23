#!/bin/sh

# Function to check if a collection exists
collection_exists() {
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$QDRANT_URL/collections/$COLLECTION_NAME")
    if [ "$HTTP_STATUS" -eq 200 ]; then
        return 0  # Collection exists
    else
        return 1  # Collection does not exist
    fi
}

# Function to create a new collection
create_collection() {
    curl -X PUT "$QDRANT_URL/collections/$COLLECTION_NAME" \
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
