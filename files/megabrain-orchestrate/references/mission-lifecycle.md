# Mission Lifecycle Specification

Governs Atlas v1 mission state via MCP (`https://mcp.atlascommand.dev/mcp`). Companion CLI may call tools; it does not own mission logic.

## Lifecycle States

- **ACTIVE**: `atlas.create_mission` persisted an acyclic DAG. Tasks start `PENDING`.
- **RUNNING**: `atlas.claim_task` issued lease, fence, nonce; execution is `RUNNING`.
- **VERIFICATION**: `atlas.request_verification` created a `PENDING` run; worker records the signed result.
- **COMPLETED**: terminal DAG tasks submitted after `CHECK_EXECUTION_VERIFIED` when required.
- **ARCHIVED**: `atlas.archive_mission`. Stays archived.
- **FAILED**: unrecoverable check or exhausted lease; fail-closed.

```
ACTIVE ──> RUNNING ──┬──> VERIFICATION ──> RUNNING
                     ├──> COMPLETED
                     └──> ARCHIVED / FAILED
```

There is no CHECKPOINT state. Atlas v1 does not snapshot or roll back client files.

## Protocol

1. **Create** (`atlas.create_mission`): `project_id`, `mission_id`, `tasks`, optional `dependencies`.
2. **Claim** (`atlas.claim_task`): returns `execution_id`, `lease_id`, `fence_token`, `nonce`.
3. **Verify** (`atlas.request_verification` then `atlas.get_verification`).
4. **Submit** (`atlas.submit_task_result`) with the same lease/fence/nonce.
5. **Export** (`atlas.export_evidence`).

```bash
megabrain call atlas.create_mission '{"project_id":"proj_alpha","mission_id":"mis_hold","tasks":[{"task_id":"t_impl"}]}'
megabrain call atlas.claim_task '{"project_id":"proj_alpha","mission_id":"mis_hold"}'
```

`inspect` de missão inexistente devolve MISSION_NOT_FOUND. Mock/parser não é prova live.
