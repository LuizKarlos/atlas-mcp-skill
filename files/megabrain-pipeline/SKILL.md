---
name: megabrain-pipeline
version: "4.0.0"
description: "Build acyclic Atlas DAGs, claim unblocked tasks, and inspect mission waves locally."
allowed-tools: ["mcp__atlas__*", "terminal"]
---

# Atlas Pipeline

Decompose work into an acyclic task DAG, persist it with `atlas.create_mission`, and claim ready tasks. Waves are derived from dependencies; Atlas does not expose `get_parallel_waves` or `execute_pipeline`.

## When to Use

- More than one task, with explicit `depends_on_task_id`.
- Need `atlas.get_mission` to see which tasks are still `PENDING`.
- Local acyclicity check before create (`scripts/dag_validator.js`).

## NOT for

- End-to-end verify/submit (`megabrain-orchestrate`).
- Review verdicts (`megabrain-review`).
- Headless visual TDD (`megabrain-ui`).
- Calling `megabrain.decompose`, `execute_pipeline`, `heal_dependency_graph`, `synthesize_subtask`.

## Workflow

Execute via `megabrain call` with a qualified `atlas.*` name and a JSON object. The parser rejects non-objects.

```bash
# 1. Persist DAG. prompt is not an Atlas field. Sem profundidade máxima.
megabrain call atlas.create_mission '{"project_id":"proj_alpha","mission_id":"mis_dag","tasks":[{"task_id":"t1","title":"plan"},{"task_id":"t2"}],"dependencies":[{"task_id":"t2","depends_on_task_id":"t1"}]}'

# 2. Inspect tasks and edges. Mock/parser não é prova live.
megabrain call atlas.get_mission '{"project_id":"proj_alpha","mission_id":"mis_dag"}'

# 3. Claim the next unblocked PENDING task. GREEN/exit_code: 0 only after real local tests; do not fabricate GREEN. Negatives are NOT_EXECUTED or MALFORMED_RESULT on the harness, not on Atlas. Sem índice de wave. Sem provider.
megabrain call atlas.claim_task '{"project_id":"proj_alpha","mission_id":"mis_dag"}'

# 4. Local wave preview (not a server tool).
node scripts/dag_validator.js tasks.json

# 5. Blocked cycle or missing edge: fail closed. Atlas rejects cyclic create_mission. There is no heal_dependency_graph; fix the DAG and create a new mission. Cura reconhecida e estado terminal. Sem execução de provider. BLOCKED tasks stay blocked until dependencies complete.
```

Local tests belong in the harness. Atlas only attests via `atlas.request_verification`. test_commands are local, not an Atlas argument.

## UX & Fault Tolerance Rules

- **Path Isolation**: Concurrent claimed tasks must operate on mutually exclusive file paths.
- **Fail-Closed on Cycles**: Abort immediately if cyclic dependencies or graph deadlocks occur.
- **Bounded Healing**: Cap local retries (default: 2) before fail-closed escalation. No server auto-heal.

## References

- DAG decomposition rules: [references/dag-decomposition-rules.md](references/dag-decomposition-rules.md)
- Topological wave partitioning: [references/topological-waves.md](references/topological-waves.md)
- Auto-healing graph patterns: [references/auto-healing-patterns.md](references/auto-healing-patterns.md)
