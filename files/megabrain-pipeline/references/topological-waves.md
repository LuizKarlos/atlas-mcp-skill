# Topological Wave Partitioning

Waves are a local view of an Atlas DAG. Atlas does not expose `get_parallel_waves` or `execute_pipeline`.

## Partitioning Algorithm (Kahn's In-Degree)

1. **In-Degree Calculation**: Count unresolved incoming dependencies per task from `atlas.get_mission`.
2. **Wave Extraction**: Collect all tasks where `in_degree == 0` into the current wave.
3. **Graph Reduction**: Claim and finish the current wave; decrement dependents.
4. **Iterative Progression**: Repeat until all nodes are resolved or fail-closed if a cycle is detected.

## Parallel Execution and Path Isolation

- **Independent Concurrency**: Tasks in a wave may be claimed by separate harness sessions sharing the USER key.
- **Path Isolation**: Concurrent tasks must operate on mutually exclusive file paths.
- **Lock Enforcement**: Exclusive path locks live in the harness, not in Atlas. `arbitrate_concurrency` is not a server tool.

## Execution via CLI

```bash
megabrain call atlas.get_mission '{"project_id":"proj_alpha","mission_id":"mis_dag"}'
node scripts/dag_validator.js tasks.json
```

Local tests use `test_commands` in the harness: execute the command and treat GREEN with exit_code: 0 only after real proof (não fabricar GREEN; negativos são NOT_EXECUTED ou MALFORMED_RESULT). Sem `wave_index`. Sem provider.
