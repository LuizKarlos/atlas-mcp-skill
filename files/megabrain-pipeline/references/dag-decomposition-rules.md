# DAG Decomposition Rules

Governs task graphs persisted by `atlas.create_mission` (`https://mcp.atlascommand.dev/mcp`).

## Core Decomposition Principles

1. **Atomic Decomposition**:
   - Every complex mission decomposes into granular, non-overlapping subtasks (`PLANNING`, `IMPLEMENTATION`, `TESTING`, `INTEGRATION`).
   - Subtasks must produce discrete, testable deliverables with bounded file diffs.
2. **Single Responsibility Scope**:
   - Each subtask focuses strictly on one responsibility (e.g., single component, test suite, or schema).
   - Context is bounded to immediate dependencies to avoid token bloat and drift.
3. **Strict Explicit Dependencies**:
   - `depends_on_task_id` lists exact prerequisite task IDs; implicit ordering is forbidden.
   - Dependency graphs must be strictly acyclic; cycles trigger immediate validation failure.

## Verification and Tooling

Validate task graphs prior to dispatch:

```bash
megabrain call atlas.create_mission '{"project_id":"proj_alpha","mission_id":"mis_dag","tasks":[{"task_id":"t1"}]}'
node scripts/dag_validator.js tasks.json
```

`create_mission` exige `project_id`, `mission_id` e `tasks`. `max_depth` não faz parte do contrato. Mock/parser não é prova live. `megabrain.decompose` was removed.
