---
name: megabrain-surface
version: 4.0.0
description: Atlas v1 MCP surface: 26 atlas.* tools, USER/ADMIN identity, transports, errors.
---

# Superfície Atlas v1

Servidor: 26 tools `atlas.*`. Sem alias `megabrain.*`. Sem roles Atlas. Sem painel. Sem CLI de missão.

No Hermes o bloco MCP chama-se `atlas`. Tools aparecem como `mcp__atlas__atlas_<action>` (ponto vira underscore). Chame essa tool. O prefixo legado `mcp__megabrain__*` e as 36 tools antigas não existem neste servidor.

Handshake e keepalive `POST /mcp` (`Terminating session: None`) são transporte, não trabalho.

## Identidade canônica

Atlas v1 não registra role. Identidade vem da API key:

- `atlas_user_<hex>` — conta `USER`: projetos, missões, leases, uploads, verificação, evidência.
- `atlas_admin_<hex>` — conta `ADMIN`: criar conta e emitir/rotar/listar/revogar keys. Admin não lê conteúdo de projeto.

Não envie `account_id`, owner, admin, role ou status como autoridade no payload. A key autenticada é a autoridade.

Papéis de harness (`implementer`, `reviewer`) ficam no ambiente da LLM. Não são tools nem parâmetros MCP.

## Catálogo — 26/26

### Serviço e contas

## atlas.health
Assinatura: `atlas.health()` -> status, sqlite_version.
Limite: liveness; sem efeito. Runtime devolve `HEALTHY`.
```bash
megabrain call atlas.health '{}'
```

## atlas.create_account
Assinatura: `atlas.create_account(name, account_type="USER")`.
Limite: admin.
```bash
megabrain call atlas.create_account '{"name":"user-alpha","account_type":"USER"}'
```

## atlas.issue_api_key
Assinatura: `atlas.issue_api_key(account_id)` -> key, raw_key.
Limite: admin; raw_key uma vez; recusa segunda key ativa.
```bash
megabrain call atlas.issue_api_key '{"account_id":"acc_local_1"}'
```

## atlas.rotate_api_key
Assinatura: `atlas.rotate_api_key(account_id)`.
Limite: admin; troca atômica.
```bash
megabrain call atlas.rotate_api_key '{"account_id":"acc_local_1"}'
```

## atlas.list_api_keys
Assinatura: `atlas.list_api_keys(account_id)`.
Limite: admin; metadados, sem segredo.
```bash
megabrain call atlas.list_api_keys '{"account_id":"acc_local_1"}'
```

## atlas.revoke_api_key
Assinatura: `atlas.revoke_api_key(key_id)`.
Limite: admin.
```bash
megabrain call atlas.revoke_api_key '{"key_id":"key_local_1"}'
```

### Projetos e manifests

## atlas.create_project
Assinatura: `atlas.create_project(name)` -> project_id.
```bash
megabrain call atlas.create_project '{"name":"Alpha"}'
```

## atlas.list_projects
Assinatura: `atlas.list_projects()`.
```bash
megabrain call atlas.list_projects '{}'
```

## atlas.get_project
Assinatura: `atlas.get_project(project_id)`.
```bash
megabrain call atlas.get_project '{"project_id":"proj_alpha"}'
```

## atlas.archive_project
Assinatura: `atlas.archive_project(project_id)`.
```bash
megabrain call atlas.archive_project '{"project_id":"proj_alpha"}'
```

## atlas.register_check_manifest
Assinatura: `atlas.register_check_manifest(project_id, manifest_id, manifest_payload)`.
Limite: adapters tipados; sem comando livre.
```bash
megabrain call atlas.register_check_manifest '{"project_id":"proj_alpha","manifest_id":"man_py","manifest_payload":{"checks":[{"name":"unit","adapter":"python.pytest","args":["-q"]}]}}'
```

## atlas.list_check_manifests
Assinatura: `atlas.list_check_manifests(project_id)`.
```bash
megabrain call atlas.list_check_manifests '{"project_id":"proj_alpha"}'
```

### Missões e tarefas

## atlas.create_mission
Assinatura: `atlas.create_mission(project_id, mission_id, tasks, dependencies=None)`.
Limite: DAG acíclico; cada task tem `task_id`; `manifest_id` opcional.
```bash
megabrain call atlas.create_mission '{"project_id":"proj_alpha","mission_id":"mis_hold","tasks":[{"task_id":"t_impl","manifest_id":"man_py"},{"task_id":"t_review"}],"dependencies":[{"task_id":"t_review","depends_on_task_id":"t_impl"}]}'
```

## atlas.list_missions
Assinatura: `atlas.list_missions(project_id)`.
```bash
megabrain call atlas.list_missions '{"project_id":"proj_alpha"}'
```

## atlas.get_mission
Assinatura: `atlas.get_mission(project_id, mission_id)`.
```bash
megabrain call atlas.get_mission '{"project_id":"proj_alpha","mission_id":"mis_hold"}'
```

## atlas.archive_mission
Assinatura: `atlas.archive_mission(project_id, mission_id)`.
```bash
megabrain call atlas.archive_mission '{"project_id":"proj_alpha","mission_id":"mis_hold"}'
```

## atlas.claim_task
Assinatura: `atlas.claim_task(project_id, mission_id=None, timeout_seconds=300)` -> execution_id, lease_id, fence_token, nonce.
```bash
megabrain call atlas.claim_task '{"project_id":"proj_alpha","mission_id":"mis_hold","timeout_seconds":300}'
```

## atlas.renew_task_lease
Assinatura: `atlas.renew_task_lease(project_id, lease_id, fence_token, nonce, extend_seconds=300)`.
```bash
megabrain call atlas.renew_task_lease '{"project_id":"proj_alpha","lease_id":"lease_1","fence_token":1,"nonce":"n1","extend_seconds":300}'
```

## atlas.submit_task_result
Assinatura: `atlas.submit_task_result(project_id, lease_id, fence_token, nonce, result_status="COMPLETED", payload=None)`.
Limite: se a política exige verify, submeter antes de `CHECK_EXECUTION_VERIFIED` devolve `VERIFICATION_REQUIRED` e preserva o lease.
```bash
megabrain call atlas.submit_task_result '{"project_id":"proj_alpha","lease_id":"lease_1","fence_token":1,"nonce":"n1","result_status":"COMPLETED"}'
```

## atlas.submit_task_review
Assinatura: `atlas.submit_task_review(project_id, mission_id, task_id, execution_id, review_execution_id, verdict, rationale)`.
Limite: `review_execution_id` distinto. Mesma key: `same_account_review=true`. Não é dual-blind.
```bash
megabrain call atlas.submit_task_review '{"project_id":"proj_alpha","mission_id":"mis_hold","task_id":"t_impl","execution_id":"ex_1","review_execution_id":"ex_2","verdict":"ACCEPT","rationale":"checks verified"}'
```

### Artifacts, verificação e evidência

## atlas.begin_upload
Assinatura: `atlas.begin_upload(project_id, mission_id, task_id, execution_id, lease_id, fence_token, nonce)`.
```bash
megabrain call atlas.begin_upload '{"project_id":"proj_alpha","mission_id":"mis_hold","task_id":"t_impl","execution_id":"ex_1","lease_id":"lease_1","fence_token":1,"nonce":"n1"}'
```

## atlas.complete_upload
Assinatura: `atlas.complete_upload(project_id, session_id, data_text|data_base64|data_hex)`.
Limite: Atlas calcula hash. Sem URL pública.
```bash
megabrain call atlas.complete_upload '{"project_id":"proj_alpha","session_id":"up_1","data_text":"ok"}'
```

## atlas.request_verification
Assinatura: `atlas.request_verification(project_id, mission_id, task_id, execution_id, snapshot_b64, image_digest=None)`.
Limite: cria run `PENDING`. O cliente não grava o resultado. Worker Docker assina.
```bash
megabrain call atlas.request_verification '{"project_id":"proj_alpha","mission_id":"mis_hold","task_id":"t_impl","execution_id":"ex_1","snapshot_b64":"UEsDBBQAAAAAAD19bF2iim3vFwAAABcAAAAIAAAAY2hlY2sucHlpbXBvcnQgc3lzCnN5cy5leGl0KDApClBLAQIUAxQAAAAAAD19bF2iim3vFwAAABcAAAAIAAAAAAAAAAAAAACAAQAAAABjaGVjay5weVBLBQYAAAAAAQABADYAAAA9AAAAAAA="}'
```

## atlas.get_verification
Assinatura: `atlas.get_verification(project_id, run_id)`.
Limite: `CHECK_EXECUTION_VERIFIED` só após assinatura e vínculos.
```bash
megabrain call atlas.get_verification '{"project_id":"proj_alpha","run_id":"run_1"}'
```

## atlas.export_evidence
Assinatura: `atlas.export_evidence(project_id, mission_id)` -> receipts, ledger, chain_verified.
Limite: `chain_verified: true` só com cadeia íntegra. Não confie no booleano sem os blocos.
```bash
megabrain call atlas.export_evidence '{"project_id":"proj_alpha","mission_id":"mis_hold"}'
```

## atlas.get_usage
Assinatura: `atlas.get_usage(project_id)` -> volumetrics, limits null.
```bash
megabrain call atlas.get_usage '{"project_id":"proj_alpha"}'
```

## Aliases underscore — 26/26

Regra 1:1: `atlas.<tool>` ↔ `atlas_<tool>`. Alias não é tool nova. Sem `megabrain.*`.

```bash
megabrain call atlas_health '{}'
```
Equivalente a `megabrain call atlas.health '{}'`.

- atlas.health -> atlas_health
- atlas.create_account -> atlas_create_account
- atlas.issue_api_key -> atlas_issue_api_key
- atlas.rotate_api_key -> atlas_rotate_api_key
- atlas.list_api_keys -> atlas_list_api_keys
- atlas.revoke_api_key -> atlas_revoke_api_key
- atlas.create_project -> atlas_create_project
- atlas.list_projects -> atlas_list_projects
- atlas.get_project -> atlas_get_project
- atlas.archive_project -> atlas_archive_project
- atlas.register_check_manifest -> atlas_register_check_manifest
- atlas.list_check_manifests -> atlas_list_check_manifests
- atlas.create_mission -> atlas_create_mission
- atlas.list_missions -> atlas_list_missions
- atlas.get_mission -> atlas_get_mission
- atlas.archive_mission -> atlas_archive_mission
- atlas.claim_task -> atlas_claim_task
- atlas.renew_task_lease -> atlas_renew_task_lease
- atlas.submit_task_result -> atlas_submit_task_result
- atlas.submit_task_review -> atlas_submit_task_review
- atlas.begin_upload -> atlas_begin_upload
- atlas.complete_upload -> atlas_complete_upload
- atlas.request_verification -> atlas_request_verification
- atlas.get_verification -> atlas_get_verification
- atlas.export_evidence -> atlas_export_evidence
- atlas.get_usage -> atlas_get_usage

Gramática: aceita `atlas.health` e `atlas_health`; rejeita `atlas.`, `atlas..health`, `megabrain.health` e string vazia. Argumentos: JSON objeto.

No Hermes, o nome de chamada é `mcp__atlas__atlas_health` (e o análogo para cada tool). Não invente `mcp__megabrain__*`.

## Resources — parte 4

O servidor Atlas v1 não publica resources MCP. Estado sai das tools `atlas.get_*` / `atlas.export_evidence`.

`megabrain call` NAO le resources; resources exigem `POST /mcp` com Bearer — e neste servidor a lista é vazia.

## Prompts — parte 5

O servidor Atlas v1 não publica prompts MCP (`sovereign-mission` e `consensus-adjudication` foram removidos).

`megabrain call` NAO executa prompts; prompts exigem `POST /mcp` com Bearer — e neste servidor a lista é vazia.

## Identidade (substitui Roles)

Nota kernel-only: zero providers/models; a key não executa inferência.

Contas:

- `USER` — opera o fluxo MCP do próprio projeto.
- `ADMIN` — ciclo de vida de contas e keys.

Não há catálogo `mission_compiler` / `cartographer` / `implementer` / `reviewer` / `failure_diagnostician` / `creative_copywriter` no servidor. Esses nomes, se existirem, são do harness da LLM.

## Transportes e autenticação

### 1. Streamable HTTP
- Entrypoint: `POST /mcp`
- Endpoints: `http://127.0.0.1:20130/mcp` (local) e `https://mcp.atlascommand.dev/mcp` (deploy).
- Teste A/B: porta efêmera, nunca 20130.
- Headers obrigatórios:
  - `Content-Type: application/json`
  - `Accept: application/json, text/event-stream`
  - `Authorization: Bearer <token>`
  - `MCP-Protocol-Version: 2026-07-28`
  - `Mcp-Method: <method>`
  - `Mcp-Name: <name>` (em `tools/call`)
- Objeto `params._meta` obrigatório:
  - `io.modelcontextprotocol/protocolVersion`: `"2026-07-28"`
  - `io.modelcontextprotocol/clientCapabilities`: objeto de capacidades do cliente
  - `io.modelcontextprotocol/clientInfo`: objeto de identificação do cliente

### 2. stdio async
- Entrypoint: servidor Atlas stdio no harness local.

### 3. JSON-RPC stdio
- Entrypoint: newline-delimited JSON-RPC 2.0, sem `call_tool` in-process.

### Regras de Autenticação e Segurança
- `Authorization: Bearer <token>` obrigatório para `/mcp`.
- Tokens em query string (`?token=`, `?key=`, `?bearer=`) são rejeitados com HTTP 401.
- Cookies de sessão web (`mb_user_session`, `mb_admin_session`) não autenticam `/mcp`.

### Exemplo curl / JSON-RPC `tools/list`
```bash
curl -X POST https://mcp.atlascommand.dev/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Authorization: Bearer ${MEGABRAIN_TOKEN}" \
  -H "MCP-Protocol-Version: 2026-07-28" \
  -H "Mcp-Method: tools/list" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{"_meta":{"io.modelcontextprotocol/protocolVersion":"2026-07-28","io.modelcontextprotocol/clientCapabilities":{},"io.modelcontextprotocol/clientInfo":{"name":"atlas-cli","version":"4.0.0"}}}}'
```

## Observabilidade

### Endpoint /metrics
- `GET /metrics`: ASGI, sem auth, formato Prometheus `text/plain; version=0.0.4`.
- Métricas expostas (nomes históricos no processo; a tool de produto é `atlas.get_usage`):
  - `megabrain_tool_calls_total{tool,arm,outcome,error_code}`
  - `megabrain_arm_calls_total{arm}`
  - `megabrain_errors_total`
  - `megabrain_tool_errors_total{tool}`
  - `megabrain_tool_duration_seconds_bucket`
  - `megabrain_tool_duration_seconds_sum`
  - `megabrain_tool_duration_seconds_count`
  - `megabrain_tool_duration_seconds_total`

### Notificações de progresso
```json
{
  "jsonrpc": "2.0",
  "method": "notifications/progress",
  "params": {
    "progressToken": "tok-1",
    "progress": 50,
    "total": 100,
    "message": "executing task"
  }
}
```
Ordem obrigatória: progresso antes do resultado.

Volumetria de produto:
```bash
megabrain call atlas.get_usage '{"project_id":"proj_alpha"}'
```
Retorno: `volumetrics` (`artifact_bytes`, `artifact_count`, `verification_count`, `missions_count`, `tasks_count`) e `limits` (`max_artifact_bytes`, `max_verifications`, `max_concurrent_tasks` = null).
Contadores vivos vs snapshot; sem SLA sem medição.
Campos de telemetria histórica (`total_calls`, `total_errors`, `tool_distribution`, `uptime_seconds`) não são a tool v1.

## Contrato de erro

Resultados operacionais admitem: `status:"completed"` (sucesso), `status:"error"`, `isError:true`, `structuredContent` com `status/error_code`, e content text JSON.

```json
{"status":"completed"}
```

```json
{"status":"error","error_code":"INVALID_ENDPOINT"}
```

O campo `error_code` bounded segue a regex `^[A-Z][A-Z0-9_]{0,63}$`. Qualquer valor ausente ou malformado cai em `TOOL_ERROR` no outcome SDK.

Códigos documentados:

- `INVALID_ARGUMENT`
- `INVALID_ENDPOINT`
- `NO_EXECUTABLE_ROUTE`
- `FALLBACK_NOT_SUPPORTED`
- `INSUFFICIENT_EVIDENCE`
- `NOT_EXECUTED`
- `NOT_DISPATCHED`
- `UNAUTHORIZED_RELEASE`
- `MISSION_NOT_FOUND`
- `EXECUTION_FAILURE`
- `DEPENDENCY_BLOCKED`
- `LOCK_ACQUISITION_FAILED`
- `TIMEOUT_EXCEEDED`
- `VERIFICATION_REQUIRED`
- `UNEXPECTED_ARGUMENT`

A regra `businessFail` (CLI) define exit 1 para `isError`, `status:error` top-level, `structuredContent.status:error`, `structuredContent.error_code` não vazio, ou content text JSON com `status:error`/`error_code` não vazio; exit 0 em texto não-JSON/saudável.
