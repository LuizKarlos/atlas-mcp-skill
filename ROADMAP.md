# Companion Atlas v1 — roadmap

**Contrato:** 26 tools `atlas.*` no servidor Atlas (`3a10b116`). Este pacote é o mapa da LLM até essas tools.
**Baseline anterior:** `4f819dd` descrevia 36 tools `megabrain.*`, CLI de missão, roles e aliases. Esse mapa não bate no socket.

## 1. Por que reescrever

Nos pares A/B de entrega (loja e teatro), o braço A recebeu este pacote + MCP no ar. Resultado: handshake/keepalive, zero `atlas.*`. Ligar ≠ usar.

Causas:

1. Skills ensinavam `megabrain.orchestrate` / `mcp__megabrain__*`. O servidor expõe `atlas.*`. Hermes registra `mcp__atlas__atlas_health`.
2. `When to Use` falava em missão soberana/swarm, não em prova (hold, CSV, recibo).
3. O brief de produto pedia app local e proibia API externa. Sem um passo que só o Atlas assina, o modelo escreve `app.py`.

## 2. Feito nesta fatia

- [x] Catálogo das 26 tools `atlas.*` em `megabrain-surface`.
- [x] Fluxo `health → project → manifest → mission → claim → upload → request_verification → get_verification → submit → export_evidence`.
- [x] Identidade canônica: `USER` / `ADMIN`. Sem roles Atlas (`mission_compiler`, etc.).
- [x] Sem aliases `megabrain.*`. Sem `grant_approval`, checkpoint, swarm, AST/UI no servidor.
- [x] CLI `call` aceita `atlas.<tool>` e `atlas_<tool>`.
- [x] Setup grava servidor `atlas`, não `megabrain`.

## 3. Aberto

- [ ] Publicar o pacote (npm público ainda não existe).
- [ ] Pin do commit deste pacote no A/B (`docs/ALPHA_EVALUATION.md` do Atlas) depois do merge.
- [ ] Próximo par A/B: brief com passo insubstituível (recibo/`chain_verified`). Gate `NO_USE` se A não chamar `atlas.*` de trabalho.
- [ ] Reduzir o companion a instalador mínimo (SPEC §14): `login`/`status`/`call` de missão saem quando o harness nativo cobrir o call.

## 4. Aceite do companion

Instalação limpa copia as sete pastas e configura endpoint/key sem executar tool. Exemplos passam contra servidor v1 e não citam tool removida. Hermes com `mcp_servers.atlas` descobre 26 names `mcp__atlas__atlas_*`.
