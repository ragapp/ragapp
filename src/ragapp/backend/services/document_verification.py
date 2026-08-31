"""Optional document-authenticity verification via the Stipple API.

Stipple (https://www.stipple.sh) inspects a document for forensic
authenticity signals — a risk band, inspection quality, and per-signal
evidence — before it enters the RAG index. For an enterprise RAG app this
adds a pre-indexing trust gate: tampered payslips, edited invoices, or
AI-generated filler get flagged (or blocked) instead of silently becoming
ground truth for every future answer.

Free anonymous tier: no API key required. Set STIPPLE_API_KEY for your own
metering. All functions are best-effort: failures return None / record an
error and never break an upload.
"""

import json
import os
import urllib.request
import uuid
from pathlib import Path
from typing import Optional

STIPPLE_BASE_URL = os.getenv("STIPPLE_VERIFIER_BASE_URL", "https://www.stipple.sh")
_REQUEST_TIMEOUT = 300  # seconds

# Risk bands that block indexing when the trust gate is in enforcing mode.
DEFAULT_BLOCK_BANDS = ("high",)


def _headers() -> dict:
    headers = {
        "User-Agent": "ragapp-stipple-verifier/1.0",
        "Accept": "application/json",
    }
    api_key = os.getenv("STIPPLE_API_KEY", "").strip()
    if api_key:
        headers["Authorization"] = "Bearer " + api_key
    return headers


def _post_file(endpoint: str, file_path: str) -> Optional[dict]:
    """POST a document as multipart to a Stipple endpoint. Best-effort."""
    try:
        p = Path(file_path)
        boundary = "----ragapp-stipple" + uuid.uuid4().hex
        with open(p, "rb") as f:
            content = f.read()
        body = b"".join(
            [
                (
                    f"--{boundary}\r\n"
                    f'Content-Disposition: form-data; name="file"; '
                    f'filename="{p.name}"\r\n'
                    "Content-Type: application/octet-stream\r\n\r\n"
                ).encode(),
                content,
                b"\r\n",
                f"--{boundary}--\r\n".encode(),
            ]
        )
        req = urllib.request.Request(
            STIPPLE_BASE_URL + endpoint,
            data=body,
            method="POST",
            headers={
                **_headers(),
                "Content-Type": f"multipart/form-data; boundary={boundary}",
            },
        )
        with urllib.request.urlopen(req, timeout=_REQUEST_TIMEOUT) as resp:
            return json.loads(resp.read().decode())
    except Exception:  # noqa: BLE001 - verification is best-effort by design
        return None


def verify_document(file_path: str) -> Optional[dict]:
    """Forensic authenticity inspection. Compact warrant dict or None."""
    result = _post_file("/v1/warrants", file_path)
    if not result:
        return None
    return {
        "warrant_id": result.get("warrant_id"),
        "risk_band": result.get("risk_band"),
        "risk_score": result.get("risk_score"),
        "inspection_quality": result.get("inspection_quality"),
        "recommended_action": result.get("recommended_action"),
        "summary": result.get("summary"),
    }


def verification_block(file_path: str) -> Optional[dict]:
    """Build the document_verification block for one uploaded file.

    Returns None when the API is unreachable — callers should proceed with
    indexing (gate opens on failure) and simply omit the block.
    """
    warrant = verify_document(file_path)
    if not warrant:
        return None
    block: dict = {"authenticity": warrant}
    ai = _post_file("/v1/detect-ai-text", file_path)
    if ai:
        block["ai_text"] = (
            {"applicable": False}
            if ai.get("applicable") is False
            else {
                "applicable": True,
                "probability": ai.get("probability"),
                "lean": ai.get("lean"),
                "tells": ai.get("tells"),
            }
        )
    return block


def is_blocked(verification: Optional[dict]) -> bool:
    """True when an enforcing gate should block indexing of this document."""
    if not verification:
        return False
    band = (verification.get("authenticity") or {}).get("risk_band")
    block_bands = os.getenv("STIPPLE_VERIFIER_BLOCK_BANDS", ",".join(DEFAULT_BLOCK_BANDS))
    blocked = {b.strip().lower() for b in block_bands.split(",") if b.strip()}
    return band in blocked
