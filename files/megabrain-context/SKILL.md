---
name: megabrain-context
version: "4.0.0"
description: "Slice local AST outlines and upload bytes to Atlas; no server-side AST or OpenAPI tools."
allowed-tools: ["mcp__atlas__*", "terminal"]
---

# Atlas Context

AST slicing and OpenAPI drafts run in this harness. Atlas stores the bytes you upload. There is no `slice_ast_context` or `synthesize_backend_contract` on the server.

## When to Use

- Need a local outline before claiming a task.
- Need Atlas to hash a snapshot or source bundle (`atlas.begin_upload` / `atlas.complete_upload`).
- Building an OpenAPI 3.1 file locally, then uploading it.

## NOT for

- End-to-end claim/verify (`megabrain-orchestrate`).
- DAG create (`megabrain-pipeline`).
- Headless visual TDD (`megabrain-ui`).
- Calling `megabrain.slice_ast_context`, `dispatch_subtask`, `synthesize_backend_contract`.

## Workflow

Execute via `megabrain call` with a JSON object. The parser rejects non-objects.

```bash
# 1. AST Python no servidor não existe. Outline local:
node scripts/ast_slice.js src/server.ts

# 2. ast_slice.js é outline local limitado (regex). Preserva interface TypeScript; não é AST semântico.
# Sem flags de JSON. Mock/parser não é prova live. Sem prometer teto de tokens sem medir.

# 3. Upload the slice or snapshot. work_id/task_id reais já criados via Atlas.
megabrain call atlas.begin_upload '{"project_id":"proj_alpha","mission_id":"mis_hold","task_id":"t_impl","execution_id":"ex_1","lease_id":"lease_1","fence_token":1,"nonce":"n1"}'
megabrain call atlas.complete_upload '{"project_id":"proj_alpha","session_id":"up_1","data_text":"export function foo(): void {}"}'

# 4. OpenAPI 3.1 com JSON objeto, não flags — write the file locally, then upload.
```

Dispatch com scope explícito is a harness rule (`allowed_scope`), not an Atlas tool.

## Context Minification & Contract Invariants

- **Context Ceiling**: Outline local e AST servidor são evidências diferentes. Não prometer teto de tokens sem medir o dispatch real.
- **Strict OpenAPI 3.1**: Enforce `additionalProperties: false` on inputs and outputs to prevent untyped schema drift.
- **Deterministic Fixtures**: Seed contract mocks deterministically to guarantee reproducible integration testing.
- Sintaxes exercitadas pelo outline local (regex): interface TS multilinha, assinatura de função JS e def/class Python; fixture: tests/issue351_ast_interface.test.js e tests/issue351_ast_function_signature.test.js; método: regex/balanceamento de chaves; limite: não é AST semântico e não cobre sintaxe fora dessas formas.

## References

- AST virtualization specification: [references/ast-virtualization.md](references/ast-virtualization.md)
- OpenAPI contract synthesis specification: [references/openapi-contract-synthesis.md](references/openapi-contract-synthesis.md)
