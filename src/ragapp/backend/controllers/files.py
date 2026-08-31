import os

from backend.controllers.loader import LoaderManager
from backend.models.file import File, FileStatus
from backend.models.loader import FileLoader
from backend.services.document_verification import is_blocked, verification_block
from backend.tasks.indexing import index_all


class UnsupportedFileExtensionError(Exception):
    pass


class DocumentVerificationBlockedError(Exception):
    """Raised when the optional Stipple trust gate blocks a document from indexing."""

    def __init__(self, file_name: str, verification: dict):
        band = (verification.get("authenticity") or {}).get("risk_band", "?")
        warrant = (verification.get("authenticity") or {}).get("warrant_id", "?")
        super().__init__(
            f"Document {file_name} blocked by trust gate (risk_band={band}, warrant={warrant})"
        )
        self.verification = verification


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
        cls.validate_file_extension(file_name)

        # Create data folder if it does not exist
        if not os.path.exists("data"):
            os.makedirs("data")

        with open(f"data/{file_name}", "wb") as f:
            f.write(await file.read())

        # Optional pre-indexing trust gate (off by default).
        # Enable with STIPPLE_VERIFIER_ENABLED=1. In enforcing mode
        # (STIPPLE_VERIFIER_ENFORCE=1) high-risk documents raise
        # DocumentVerificationBlockedError instead of being indexed.
        verification = None
        if os.getenv("STIPPLE_VERIFIER_ENABLED", "").lower() in ("1", "true", "yes"):
            verification = verification_block(f"data/{file_name}")
            if verification and is_blocked(verification) and os.getenv(
                "STIPPLE_VERIFIER_ENFORCE", ""
            ).lower() in ("1", "true", "yes"):
                os.remove(f"data/{file_name}")
                raise DocumentVerificationBlockedError(file_name, verification)

        # Index the data
        # Index the data only when it is the last file to upload
        if fileIndex == totalFiles:
            index_all()
        return File(name=file_name, status=FileStatus.UPLOADED, verification=verification)

    @classmethod
    def remove_file(cls, file_name: str) -> None:
        """
        Remove a file from the data folder.
        """
        os.remove(f"data/{file_name}")
        # Re-index the data
        index_all()

    @classmethod
    def validate_file_extension(cls, file_name: str):
        """
        Validate the file extension.
        """
        file_ext = os.path.splitext(file_name)[1]
        file_loader: FileLoader = LoaderManager().get_loader("file")
        supported_file_extensions = file_loader.get_supported_file_extensions()
        if file_ext not in supported_file_extensions:
            raise UnsupportedFileExtensionError(
                f"File {file_name} with extension {file_ext} is not supported. Supported file extensions: {supported_file_extensions}"
            )
