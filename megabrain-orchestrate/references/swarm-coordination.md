# Swarm coordination — removed in Atlas v1

`megabrain.coordinate_mission_swarm` is not a server tool. Atlas does not schedule agents, budgets, or `agent_id`.

Concurrency is exclusive leases: two `atlas.claim_task` calls, one winner. Failed or expired leases re-queue the task.

If a harness runs more than one LLM, they share the same USER API key. That is same-account parallelism, not a swarm.

INSUFFICIENT_EVIDENCE and NOT_EXECUTED were kernel statuses of the removed swarm tool. On Atlas v1, missing verification is `VERIFICATION_REQUIRED`; a pending Docker run is not SUCCESS.
