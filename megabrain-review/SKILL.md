---
name: megabrain-review
version: "4.0.0"
description: "Submit Atlas task reviews from a separate execution; same-account, never dual-blind."
allowed-tools: ["mcp__atlas__*", "terminal"]
---

# Atlas Review

Review is a second execution of the same USER key calling `atlas.submit_task_review`. Atlas records `same_account_review=true`. That is separate execution, not dual-blind identity.

Anti-slop, voice, and readability run in this harness. They are not MCP tools.

## When to Use

- A mission task requires a review execution distinct from the implementation execution.
- Verdict must be `ACCEPT`, `REJECT`, or `NEEDS_WORK` with rationale.
- Local lint of copy before attaching it as an artifact.

## NOT for

- End-to-end claim/verify (`megabrain-orchestrate`).
- DAG create (`megabrain-pipeline`).
- Headless visual TDD (`megabrain-ui`).
- Calling `megabrain.adjudicate_consensus`, `anti_slop_lint`, `voice_calibrate`, `readability_score`.

## Workflow

Execute via `megabrain call` with a JSON object. The parser rejects non-objects.

```bash
# 1. Review from a distinct execution_id. Consenso exige reviews com approved, score, verdict, notes e rationale locally; Atlas stores one verdict.
megabrain call atlas.submit_task_review '{"project_id":"proj_alpha","mission_id":"mis_hold","task_id":"t_impl","execution_id":"ex_1","review_execution_id":"ex_2","verdict":"ACCEPT","rationale":"gates green"}'

# 2. Anti-slop com JSON objeto, não flags — local harness, then upload bytes if needed.
# 3. Voice calibrate com JSON objeto — local.
# 4. Readability com JSON objeto — local.
```

Consenso determinístico não é autorização nem teste GREEN. Sem árbitro LLM server-side. Jev é só advisory (`advisory_only=true`). Campo `approved` is a local review field, not an Atlas argument.

## Quality Rules & Consensus Criteria

- **Consensus Threshold**: Score ponderado é métrica; não autoriza merge, commit ou teste GREEN.
- **No Server Arbiter**: Sem terceiro árbitro LLM automático. Jev é só advisory.
- **Zero AI Slop**: Strip sycophantic openers, hyperbolic adjectives, and passive hedges. Enforce direct assertions.
- **Review Invariants**: Consenso exige reviews com reviewer, approved, score, verdict, notes e rationale; sem árbitro LLM server-side.

## References

- Dual-blind consensus adjudication: [references/dual-blind-adjudication.md](references/dual-blind-adjudication.md)
- Anti-slop and humanization patterns: [references/anti-slop-patterns.md](references/anti-slop-patterns.md)
- Voice calibration and cadence engineering: [references/voice-calibration.md](references/voice-calibration.md)
