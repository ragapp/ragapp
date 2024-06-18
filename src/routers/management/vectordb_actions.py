from fastapi import APIRouter, HTTPException, Request, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import os

vectordb_actions_router = r = APIRouter()

# Define a Pydantic model for the request body
class CollectionRequest(BaseModel):
    collection_name: str


# Define the endpoint to receive the collection name
@r.post("")
async def set_collection(request: Request, collection: CollectionRequest):
    try:
        collection_name = collection.collection_name
        # Perform any logic with the collection name here
        # For demonstration, we'll just log it and return a response
        print(f"Received collection name: {collection_name}")

        os.environ['QDRANT_COLLECTION'] = collection_name

        # Return a JSON response
        return JSONResponse(content={"message": f"Collection '{collection_name}' received successfully."})

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Add more routes if needed
