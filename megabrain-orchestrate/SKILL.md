---
name: megabrain-orchestrate
version: "4.0.0"
description: "Run Atlas v1 missions: claim, verify, submit, and export evidence via atlas.* MCP tools."
allowed-tools: ["mcp__atlas__*", "terminal"]
---

# Atlas Orchestrate

Use Atlas to govern a mission you execute in this harness: project, DAG, exclusive lease, Docker verification, and signed evidence. Atlas does not write your files. You do. Atlas attests what it verified.

## When to Use

- The user needs a receipt, ledger, or verified check that the sandbox cannot sign.
- Work has more than one task with a real dependency (implement then review).
- A later claim must not steal a live lease.

## NOT for

- Building an app that only needs local HTTP and SQLite. Disk replaces Atlas there.
- AST slicing (`megabrain-context` local scripts).
- WCAG or visual TDD (`megabrain-ui` local scripts).
- Inventing `chain_verified: true` without `atlas.export_evidence`.

## Workflow

Call the Hermes tool `mcp__atlas__atlas_<action>` (server name `atlas`). Equivalent CLI: `megabrain call atlas.<action>` with a JSON object. The parser rejects non-objects.

Ordem obrigatória quando a tarefa exige verificação:

`claim → begin_upload/complete_upload → request_verification → get_verification → submit_task_result → export_evidence`

Submeter antes de `CHECK_EXECUTION_VERIFIED` devolve `VERIFICATION_REQUIRED` e preserva o lease.

```bash
# 1. Liveness. Runtime devolve HEALTHY.
megabrain call atlas.health '{}'

# 2. Isolated project. project_id is required on later calls.
megabrain call atlas.create_project '{"name":"Alpha"}'

# 3. Typed check manifest. No free-form shell.
megabrain call atlas.register_check_manifest '{"project_id":"proj_alpha","manifest_id":"man_py","manifest_payload":{"adapter":"python.pytest","checks":[{"id":"unit","command":["python","-m","pytest","-q"]}]}}'

# 4. Acyclic DAG. prompt/idempotency_key/workspace_root are not Atlas fields.
megabrain call atlas.create_mission '{"project_id":"proj_alpha","mission_id":"mis_hold","tasks":[{"task_id":"t_impl","manifest_id":"man_py"},{"task_id":"t_review"}],"dependencies":[{"task_id":"t_review","depends_on_task_id":"t_impl"}]}'

# 5. Claim: execution_id, lease_id, fence_token, nonce. Work locally.
megabrain call atlas.claim_task '{"project_id":"proj_alpha","mission_id":"mis_hold"}'

# 6. Bytes in, hash on the server.
megabrain call atlas.begin_upload '{"project_id":"proj_alpha","mission_id":"mis_hold","task_id":"t_impl","execution_id":"ex_1","lease_id":"lease_1","fence_token":1,"nonce":"n1"}'
megabrain call atlas.complete_upload '{"project_id":"proj_alpha","session_id":"up_1","data_text":"ok"}'

# 7. Snapshot the work. Worker signs. Client never writes the verdict.
megabrain call atlas.request_verification '{"project_id":"proj_alpha","mission_id":"mis_hold","task_id":"t_impl","execution_id":"ex_1","snapshot_b64":"H4sIAAAAAAAAA+3BAQEAAACCoPVPbQwfoAAAAAAAAAAAAAAAAAAAAIC3AYbORR0KAAAA"}'
megabrain call atlas.get_verification '{"project_id":"proj_alpha","run_id":"run_1"}'

# 8. Same lease/fence/nonce. Then export.
megabrain call atlas.submit_task_result '{"project_id":"proj_alpha","lease_id":"lease_1","fence_token":1,"nonce":"n1","result_status":"COMPLETED"}'
megabrain call atlas.export_evidence '{"project_id":"proj_alpha","mission_id":"mis_hold"}'
```

Renew before expiry: `atlas.renew_task_lease`. Do not call `megabrain.orchestrate`, `coordinate_mission_swarm`, `create_checkpoint` or `rollback_checkpoint`: they are not on this server. Sem evidence_bundle o kernel antigo bloqueava IMPLEMENTATION com INSUFFICIENT_EVIDENCE; no Atlas v1 a prova é `request_verification` + `export_evidence`. Sem worker o run fica PENDING, não SUCCESS. Sem executor o kernel antigo devolvia NOT_EXECUTED; o CLI não envia callable JSON.

## UX & Operational Rules

- **Anti-Context-Dumping**: Dispatch minimal context packets (pacotes mínimos delimitados). Never dump full workspace trees.
- **Structured Communication**: Return project_id, mission_id, lease_id, run_id, and `chain_verified`.

## References

- Mission lifecycle: [references/mission-lifecycle.md](references/mission-lifecycle.md)
- Swarm removed: [references/swarm-coordination.md](references/swarm-coordination.md)
