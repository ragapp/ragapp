# Governance audit trails for enterprise RAG

Enterprise RAG deployments often need to explain which data was retrieved,
which answer was generated, which policy checks ran, and whether a human
approved the response. This document defines a small, vendor-neutral audit
event shape that can be used before wiring a full governance service.

The audit trail should capture evidence for each retrieval-to-response step
without storing raw private documents by default.

## Event contract

Use one event per user-facing RAG answer:

- `event_id`: stable unique id for the answer event.
- `conversation_id`: stable id for the chat or workflow session.
- `timestamp`: ISO 8601 UTC timestamp.
- `actor`: user, service, or agent that requested the answer.
- `retrieval.query`: redacted or summarized retrieval query.
- `retrieval.sources`: retrieved source records with `source_id`, `document_id`,
  `chunk_id`, `score`, and `metadata`.
- `generation.model`: model or provider label used for the answer.
- `generation.answer_hash`: hash or fingerprint of the generated answer.
- `generation.citations`: source ids cited by the answer.
- `policy_checks`: ordered checks that ran before release.
- `decision`: `allow`, `block`, `needs_review`, or `redacted`.
- `review`: reviewer and approval metadata when human review is required.
- `redaction`: fields removed or hashed before long-term storage.

See [`examples/governance-audit-event.json`](../examples/governance-audit-event.json)
for a complete example.

## Policy checks

Start with deterministic checks that are easy to inspect:

- every material claim cites at least one retrieved source
- cited source ids exist in the retrieval set
- restricted source labels are blocked or routed to review
- private user data is redacted before persistent audit storage
- low-confidence retrieval or conflicting sources route to review

These checks do not certify legal or regulatory compliance. They provide
reviewable evidence that a RAG answer followed the configured retrieval,
citation, redaction, and approval policy.

## Human review routing

Route an answer to `needs_review` when:

- the retrieval set includes restricted, regulated, or customer-confidential data
- the answer cites no sources or cites sources not present in the retrieval set
- policy checks disagree
- the answer will be used for legal, financial, medical, employment, or other
  high-impact decisions

Store reviewer decisions as metadata. Avoid storing raw prompts, private
documents, or full generated answers unless the deployment has an explicit
retention policy for those fields.
