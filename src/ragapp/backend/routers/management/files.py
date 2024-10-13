import os
import csv
from fastapi import APIRouter, UploadFile, Form
from fastapi.responses import JSONResponse
from scapy.all import rdpcap  # Import the necessary method from Scapy

from backend.controllers.files import FileHandler, UnsupportedFileExtensionError
from backend.models.file import File, SUPPORTED_FILE_EXTENSIONS

files_router = r = APIRouter()

@r.get("")
def fetch_files() -> list[File]:
    """
    Get the current files.
    """
    return FileHandler.get_current_files()

@r.post("")
async def add_file(file: UploadFile, fileIndex: str = Form(), totalFiles: str = Form()):
    """
    Upload a new file.
    """
    file_extension = file.filename.split('.')[-1]
    
    if file_extension not in SUPPORTED_FILE_EXTENSIONS:
        return JSONResponse(
            status_code=400,
            content={
                "error": "UnsupportedFileExtensionError",
                "message": f"File extension '{file_extension}' is not supported.",
            },
        )
    
    # Handle pcapng file conversion to CSV
    if file_extension == "pcapng":
        # Read the pcapng file using scapy
        pcap_data = rdpcap(await file.read())
        csv_filename = f"{os.path.splitext(file.filename)[0]}.csv"

        with open(csv_filename, mode='w', newline='') as csv_file:
            csv_writer = csv.writer(csv_file)
            # Write CSV headers
            csv_writer.writerow(["Timestamp", "Source", "Destination", "Protocol", "Length"])

            # Write each packet's details to the CSV
            for packet in pcap_data:
                if hasattr(packet, 'time') and hasattr(packet, 'src') and hasattr(packet, 'dst'):
                    csv_writer.writerow([packet.time, packet.src, packet.dst, packet.proto, len(packet)])

        # Now you can return the CSV file or save it to your desired location
        return JSONResponse(
            status_code=200,
            content={"message": f"File {file.filename} uploaded and converted to {csv_filename}."},
        )

    # Normal file upload handling
    res = await FileHandler.upload_file(file, str(file.filename), fileIndex, totalFiles)
    return res

@r.delete("/{file_name}")
def remove_file(file_name: str):
    """
    Remove a file.
    """
    try:
        FileHandler.remove_file(file_name)
    except FileNotFoundError:
        # Ignore the error if the file is not found
        pass
    return JSONResponse(
        status_code=200,
        content={"message": f"File {file_name} removed successfully."},
    )
