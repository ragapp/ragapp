#!/bin/sh

collection_exists() {
    local collection_name=$1
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$QDRANT_URL/collections/$collection_name")
    if [ "$HTTP_STATUS" -eq 200 ]; then
        return 0  # Collection exists
    else
        return 1  # Collection does not exist
    fi
}

create_collection() {
    local collection_name=$1
    curl -X PUT "$QDRANT_URL/collections/$collection_name" \
         -H "Content-Type: application/json" \
         -d "$(printf '{"vectors": {"size": %d, "distance": "%s"}}' "$VECTOR_SIZE" "$DISTANCE_METRIC")"
}

# Iterate and create collections
for collection_name in $(echo $COLLECTION_NAMES | sed "s/,/ /g")
do
    if collection_exists $collection_name; then
        echo "Collection '$collection_name' already exists."
    else
        echo "Creating collection '$collection_name'."
        create_collection $collection_name
        echo "Collection '$collection_name' created."
    fi
done