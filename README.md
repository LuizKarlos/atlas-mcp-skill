# Atlas MCP companion

Pacote de skills e instalador mínimo para o servidor Atlas v1 (26 tools `atlas.*`).

Servidor canônico: [atlascommand.dev](https://atlascommand.dev) (`runtime/atlas_mcp_server.py`, 26 tools `atlas.*`).

O servidor Atlas governa missões, leases, artifacts, verificação Docker e evidência. A LLM executa o trabalho no próprio harness. Este pacote ensina o contrato MCP atual. Não há aliases para as 36 tools `megabrain.*` removidas.

## Contrato

| Onde | Valor |
| :--- | :--- |
| Superfície MCP | 26 tools `atlas.*`, schema fechado, sem alias |
| Identidade | conta `USER` (projetos) e conta `ADMIN` (keys). Atlas não tem roles técnicas |
| Endpoint | `https://mcp.atlascommand.dev/mcp` (prod) ou `http://127.0.0.1:<porta>/mcp` (efêmero) |
| Auth | `Authorization: Bearer <atlas_user_…\|atlas_admin_…>` |
| Hermes | servidor `atlas` → tools `mcp__atlas__atlas_<action>` |
| CLI | instalador + `call`; sem CLI de missão |

Handshake `POST /mcp` e keepalive não são uso. Uso é `tools/call` de `atlas.*`.

## Instalação

Publicação pública ainda não existe e não foi executada (requer Node >=18). Prepare o artefato beta verificável:

```bash
npm run release:pack
(cd dist && sha256sum -c megabrain-cli-4.0.0.tgz.sha256)
npm install -g ./dist/megabrain-cli-4.0.0.tgz
export MEGABRAIN_ENDPOINT=https://mcp.atlascommand.dev/mcp
megabrain --version
# Rollback por reinstalar versão anterior
```

```bash
megabrain setup --dest .agents/skills --endpoint https://mcp.atlascommand.dev/mcp
megabrain call atlas.health '{}'
```

No Hermes, o servidor chama-se `atlas`. Não instale a skill empacotada do repositório do servidor no lugar destas sete pastas.

## Sub-Skills Matrix

| Sub-Skill | Escopo |
| :--- | :--- |
| `megabrain-orchestrate` | Fluxo completo: projeto, missão, claim, verify, submit, evidência |
| `megabrain-pipeline` | DAG acíclico em `atlas.create_mission` / `atlas.get_mission` |
| `megabrain-review` | `atlas.submit_task_review`; same-account, não dual-blind |
| `megabrain-audit` | `atlas.export_evidence`; ledger/receipts do servidor |
| `megabrain-context` | Upload de bytes; AST/OpenAPI no harness local |
| `megabrain-ui` | Visual/WCAG no harness local; não são tools MCP |
| `megabrain-surface` | Catálogo das 26 tools, identidade USER/ADMIN, transporte |

## Local Tooling Scripts

- `dag_validator.js`: acyclicity and waves (`node scripts/dag_validator.js tasks.json`)
- `merkle_verify.js`: local SHA-256 chain only, not Ed25519 (`node scripts/merkle_verify.js ledger.json`)
- `ast_slice.js`: local regex outline; not server Python AST (`node scripts/ast_slice.js src/app.js`)
- `wcag_check.js`: local JSON/flags contrast and target size; not CSS headless (`node scripts/wcag_check.js --fg="#ffffff" --bg="#111827" --width=44 --height=44`)

Estes scripts rodam no harness. Não substituem `atlas.request_verification` nem `atlas.export_evidence`.
