# Dual-Blind Review Adjudication

Atlas v1 does not adjudicate reviewers. `atlas.submit_task_review` stores one verdict from a distinct `review_execution_id`. Same API key ⇒ `same_account_review=true`. Documentation must not call this independent or dual-blind.

Local harnesses may still collect multiple reviews:

```json
{"task_id":"t1","reviews":[{"reviewer":"rev_a","approved":true,"score":0.9,"verdict":"ACCEPT","notes":"ok","rationale":"gates green"}]}
```

Campo `approved` é obrigatório no envelope local. Consenso determinístico não é autorização nem teste GREEN. Sem árbitro LLM server-side. Jev é só advisory. nenhum árbitro LLM server-side é despachado automaticamente; a divergência permanece evidência para o orquestrador.

```bash
megabrain call atlas.submit_task_review '{"project_id":"proj_alpha","mission_id":"mis_hold","task_id":"t_impl","execution_id":"ex_1","review_execution_id":"ex_2","verdict":"ACCEPT","rationale":"gates green"}'
```
