import os

from backend.models.file import SUPPORTED_FILE_EXTENSIONS, File, FileStatus
from backend.tasks.indexing import index_all


class UnsupportedFileExtensionError(Exception):
    pass


class FileNotFoundError(Exception):
    pass


class FileHandler:
    @classmethod
    def get_current_files(cls):
        """
        Construct the list files by all the files in the data folder.
        """
        if not os.path.exists("data"):
            return []
        # Get all files in the data folder
        file_names = os.listdir("data")
        # Construct list[File]
        return [
            File(name=file_name, status=FileStatus.UPLOADED) for file_name in file_names
        ]

    @classmethod
    async def upload_file(
        cls, file, file_name: str, fileIndex: str, totalFiles: str
    ) -> File | UnsupportedFileExtensionError:
        """
        Upload a file to the data folder.
        """
        # Check if the file extension is supported
        if file_name.split(".")[-1] not in SUPPORTED_FILE_EXTENSIONS:
            return UnsupportedFileExtensionError(
                f"File {file_name} with extension {file_name.split('.')[-1]} is not supported."
            )
        # Create data folder if it does not exist
        if not os.path.exists("data"):
            os.makedirs("data")

        with open(f"data/{file_name}", "wb") as f:
            f.write(await file.read())
        # Index the data
        # Index the data only when it is the last file to upload
        if fileIndex == totalFiles:
            index_all()
        return File(name=file_name, status=FileStatus.UPLOADED)

    @classmethod
    def remove_file(cls, file_name: str) -> None:
        """
        Remove a file from the data folder.
        """
        os.remove(f"data/{file_name}")
        # Re-index the data
        index_all()
        
    @staticmethod
    async def upload_file(file: UploadFile, file_name: str, fileIndex: str, totalFiles: str):
        # Save the uploaded file to a temporary location
        temp_file_path = f"/tmp/{file_name}"
        with open(temp_file_path, "wb") as f:
            f.write(await file.read())

        # Check the file extension and process accordingly
        if file_name.endswith('.pcapng'):
            return await FileHandler.convert_pcapng_to_csv(temp_file_path)

        # Handle other file types as necessary...
        return {"message": "File uploaded successfully."}

    @staticmethod
    async def convert_pcapng_to_csv(pcapng_file_path: str):
        # Read the PCAPNG file
        packets = rdpcap(pcapng_file_path)
        
        # Create a DataFrame to store packet details
        packet_data = []
        for packet in packets:
            packet_data.append({
                'time': packet.time,
                'length': len(packet),
                'info': str(packet.summary()),
            })

        # Convert to DataFrame and then to CSV
        df = pd.DataFrame(packet_data)
        csv_file_path = pcapng_file_path.replace('.pcapng', '.csv')
        df.to_csv(csv_file_path, index=False)

        # Clean up the temporary PCAPNG file if needed
        os.remove(pcapng_file_path)

        return {"message": f"File converted successfully to {csv_file_path}"}
