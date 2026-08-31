"""Tests for the optional Stipple document-verification gate."""

import os
import sys
from pathlib import Path
from unittest.mock import patch

import pytest

# Ensure the backend package is importable from the ragapp root
_RAGAPP_ROOT = str(Path(__file__).resolve().parents[1])
if _RAGAPP_ROOT not in sys.path:
    sys.path.insert(0, _RAGAPP_ROOT)

from backend.services.document_verification import (  # noqa: E402
    is_blocked,
    verification_block,
)


class TestIsBlocked:
    def test_default_policy_blocks_only_high(self, monkeypatch):
        monkeypatch.delenv("STIPPLE_VERIFIER_BLOCK_BANDS", raising=False)
        assert is_blocked({"authenticity": {"risk_band": "high"}}) is True
        assert is_blocked({"authenticity": {"risk_band": "medium"}}) is False
        assert is_blocked({"authenticity": {"risk_band": "low"}}) is False

    def test_none_verification_never_blocks(self):
        assert is_blocked(None) is False

    def test_missing_band_never_blocks(self):
        assert is_blocked({"authenticity": {}}) is False

    def test_custom_band_config(self, monkeypatch):
        monkeypatch.setenv("STIPPLE_VERIFIER_BLOCK_BANDS", "medium,high")
        assert is_blocked({"authenticity": {"risk_band": "medium"}}) is True
        assert is_blocked({"authenticity": {"risk_band": "low"}}) is False

    def test_case_insensitive(self, monkeypatch):
        monkeypatch.setenv("STIPPLE_VERIFIER_BLOCK_BANDS", "HIGH")
        assert is_blocked({"authenticity": {"risk_band": "high"}}) is True


class TestVerificationBlock:
    def test_returns_none_when_api_unreachable(self):
        # With an unreachable base URL, the gate opens (returns None)
        with patch(
            "backend.services.document_verification.STIPPLE_BASE_URL",
            "http://127.0.0.1:1",  # nothing listens here
        ):
            result = verification_block(__file__)
        assert result is None

    def test_live_free_tier_returns_warrant(self):
        """Live smoke test against the anonymous free tier; skipped offline."""
        import urllib.request

        try:
            urllib.request.urlopen("https://www.stipple.sh/livez", timeout=10)
        except Exception:
            pytest.skip("Stipple API unreachable; skipping live test")

        # Use this test file itself as the "document" (txt -> extract abstains,
        # but the warrant path still returns signals)
        import tempfile

        tmp = tempfile.NamedTemporaryFile(suffix=".pdf", delete=False)
        # A minimal valid PDF (1 blank page)
        tmp.write(
            b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
            b"2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n"
            b"3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]>>endobj\n"
            b"xref\n0 4\ntrailer<</Size 4/Root 1 0 R>>\n%%EOF"
        )
        tmp.close()
        try:
            result = verification_block(tmp.name)
        finally:
            os.unlink(tmp.name)
        assert result is not None
        auth = result["authenticity"]
        assert auth["risk_band"] in ("low", "medium", "high")
        assert auth["warrant_id"]
