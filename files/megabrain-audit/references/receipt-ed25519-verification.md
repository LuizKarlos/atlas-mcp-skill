# Ed25519 Cryptographic Verification Receipts

Governs asymmetric attestation for Atlas receipts (`https://mcp.atlascommand.dev/mcp`).

## Asymmetric Attestation Protocol

Every verified task output is sealed with an asymmetric cryptographic signature:
- **Keypair Roles**: Atlas holds a private Ed25519 signing key; verifier instances register trusted public keys.
- **Receipt Attestation**: Verification receipts sign canonical summaries of task execution (`project_id`, `mission_id`, `task_id`).
- **Tamper Invariance**: Signatures provide non-repudiation and prevent forgery or retro-fitted test passes.

## Receipt Envelope & Verification Flow

Verification receipts encapsulate signature metadata within a canonical envelope:
- `signer_id`: Public identity of signing authority.
- `public_key`: Hex/Base64 Ed25519 public key corresponding to signing identity.
- `payload_hash`: SHA-256 digest of the canonical verification receipt body.
- `signature`: 64-byte Ed25519 signature generated over `payload_hash`.

Do not call `megabrain.verify_subtask`. Ask Atlas for `atlas.export_evidence` and `atlas.get_verification`.

Envelope/receipts seguem o schema real. Presença de referência ou campo `signature` não prova Ed25519. Root ou assinatura que não verifica não é aprovada. não prova Ed25519.
