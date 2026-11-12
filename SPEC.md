# Companion Atlas v1 — contrato

Este pacote ensina a LLM a usar o servidor Atlas. Não é o servidor.

## Superfície

26 tools `atlas.*`. Sem alias `megabrain.*`. Sem resources. Sem prompts MCP. Sem roles Atlas.

Identidade: conta `USER` (projetos) e conta `ADMIN` (keys). A autoridade é a API key, não um campo `role`.

No Hermes o servidor chama-se `atlas`. O nome de chamada é `mcp__atlas__atlas_<action>`.

## Fluxo de trabalho

`health → create_project → register_check_manifest → create_mission → claim_task → begin_upload/complete_upload → request_verification → get_verification → submit_task_result → export_evidence`

Submeter antes de `CHECK_EXECUTION_VERIFIED` devolve `VERIFICATION_REQUIRED`. Handshake/keepalive não contam como uso.

## O que a LLM faz no harness

AST, OpenAPI, WCAG, anti-slop, visual TDD, DAG local. Outputs viram bytes enviados ao Atlas. Não existem tools de AST/UI/swarm no servidor.

## O que o Atlas assina

Hash de artifact, run Docker, ledger, receipt Ed25519, `chain_verified`. A LLM não declara `VERIFIED`.
