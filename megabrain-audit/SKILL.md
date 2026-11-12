---
name: megabrain-audit
version: "4.0.0"
description: "Export Atlas evidence packs and verify local SHA-256 chains; Ed25519 stays on the server."
allowed-tools: ["mcp__atlas__*", "terminal"]
---

# Atlas Audit

Evidence lives on Atlas. `atlas.export_evidence` returns receipts, ledger blocks, and `chain_verified`. Local `scripts/merkle_verify.js` checks SHA-256 links only.

## When to Use

- Need a receipt the sandbox cannot forge.
- Checking a downloaded ledger file offline.
- Proving `chain_verified` after a verified mission.

## NOT for

- End-to-end claim/verify (`megabrain-orchestrate`).
- DAG create (`megabrain-pipeline`).
- Headless visual TDD (`megabrain-ui`).
- Calling `megabrain.export_audit_ledger`, `export_evidence_pack`, `time_travel_replay`, `verify_subtask`.
- Time-travel / checkpoint (removed in v1).

## Workflow

Execute via `megabrain call` with a JSON object. The parser rejects non-objects.

```bash
# 1. Export soberano. Sem chave válida o kernel falha fechado.
megabrain call atlas.export_evidence '{"project_id":"proj_alpha","mission_id":"mis_hold"}'

# 2. merkle_verify.js verifica SOMENTE a cadeia local SHA-256. Não verifica Ed25519 nem root soberano.
# Referência/arquivo local não é assinatura verificada.
node scripts/merkle_verify.js ledger.json

# 3. Evidence pack is export_evidence. Mock/parser não é prova live.
megabrain call atlas.get_verification '{"project_id":"proj_alpha","run_id":"run_1"}'

# 4. Replay usa JSON objeto, não flags. Envelope/receipts/replay seguem o schema real.
# Atlas has no time_travel_replay. Reconstruct from exported blocks locally.
```

Índice de bloco: `typeof number` e `Number.isSafeInteger`; strings/null/float/unsafe são rejeitados.
Envelope aceito: array puro ou `{blocks:[...]}`; qualquer chave extra (attestation/receipt/certificate/merkle_root/signature) é `unsupported` no script local.

## Cryptographic Invariants & Audit Guarantees

- **Hash Chain Continuity**: Each block enforces `hash == SHA-256(canonical_json(block - hash))` and links to `previous_hash`.
- **Non-Repudiation**: Verification receipts require valid Ed25519 signatures from trusted verifier keys.
- **Fail-Closed Verification**: Any hash divergence, malformed payload, or broken link halts downstream validation.

## References

- Merkle ledger specification: [references/merkle-ledger-spec.md](references/merkle-ledger-spec.md)
- Ed25519 receipt verification: [references/receipt-ed25519-verification.md](references/receipt-ed25519-verification.md)
- Time-travel deterministic replay: [references/time-travel-replay.md](references/time-travel-replay.md)
