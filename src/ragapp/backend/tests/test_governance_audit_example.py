import json
from pathlib import Path


def test_governance_audit_example_has_reviewable_rag_trace():
    repo_root = Path(__file__).resolve().parents[4]
    audit_event = json.loads(
        (repo_root / "examples" / "governance-audit-event.json").read_text()
    )

    assert audit_event["event_id"]
    assert audit_event["conversation_id"]
    assert audit_event["timestamp"].endswith("Z")

    source_ids = {
        source["source_id"] for source in audit_event["retrieval"]["sources"]
    }
    citations = set(audit_event["generation"]["citations"])

    assert citations
    assert citations.issubset(source_ids)
    assert audit_event["generation"]["answer_hash"].startswith("sha256:")

    checks = {
        check["check_id"]: check["status"]
        for check in audit_event["policy_checks"]
    }
    assert checks["citations_in_retrieval_set"] == "pass"
    assert checks["private_data_redaction"] == "pass"
    assert checks["restricted_source_review"] == "needs_review"

    assert audit_event["decision"] == "needs_review"
    assert audit_event["review"]["required"] is True
    assert "actor.id" in audit_event["redaction"]["fields"]
    assert "generation.answer" in audit_event["redaction"]["fields"]
