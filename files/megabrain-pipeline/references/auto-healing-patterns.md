# Auto-Healing Graph Patterns

Atlas v1 does not heal a live DAG. Cyclic or blocked graphs fail closed at `atlas.create_mission`. Fix the graph locally and create a new mission.

## Local diagnosis

- **Blockage Diagnosis**: `atlas.get_mission` shows `PENDING` vs `RUNNING` vs completed.
- **No re-wiring**: do not mutate an ACTIVE mission's edges.
- **Topological Integrity**: `scripts/dag_validator.js` before create.

## Remediation

When a local test gate fails:

1. Capture stderr and exit codes in the harness.
2. Claim is not a second chance to skip verification.
3. Bounded local retries (default: 2); then fail-closed.
4. `synthesize_subtask` / `heal_dependency_graph` / `verify_subtask` are not Atlas tools.

Cura reconhecida e estado terminal. Sem executor o harness devolve NOT_EXECUTED, nunca SUCCESS falso. Sem execução de provider.
