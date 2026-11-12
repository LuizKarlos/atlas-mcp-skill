# Time-Travel Deterministic Replay

Atlas v1 does not replay or roll back missions. Reconstruct from `atlas.export_evidence` blocks locally.

## Local reconstruction

- **Sequential Event Sourcing**: Play exported blocks from genesis to the head.
- **Hash-Chain Validation**: `scripts/merkle_verify.js`.
- **No server replay**: `megabrain.time_travel_replay` was removed.

Replay usa JSON objeto, não flags `--work_id`. Cadeia local válida não implica receipt Ed25519 verificado.

Local envelopes may include `target_event_id` or `target_timestamp` when walking a saved file. `target_index` is not part of the contract.
