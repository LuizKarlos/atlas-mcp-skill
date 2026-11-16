import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const skill = readFileSync(join(root, 'megabrain-orchestrate/SKILL.md'), 'utf8');
const life = readFileSync(join(root, 'megabrain-orchestrate/references/mission-lifecycle.md'), 'utf8');
const swarm = readFileSync(join(root, 'megabrain-orchestrate/references/swarm-coordination.md'), 'utf8');
const docs = skill + life + swarm;

function extractCalls(markdown) {
  const blocks = [...markdown.matchAll(/```bash\n([\s\S]*?)```/g)];
  const calls = [];
  for (const b of blocks) {
    for (const m of b[1].matchAll(/megabrain\s+call\s+([\w.]+)\s+'([^']+)'/g)) {
      const parsed = JSON.parse(m[2]);
      assert.equal(typeof parsed, 'object');
      assert.notEqual(parsed, null);
      assert.equal(Array.isArray(parsed), false);
      calls.push({ tool: m[1], json: parsed });
    }
  }
  return calls;
}
const calls = Object.fromEntries(extractCalls(skill).map(c => [c.tool, c.json]));

test('DOCS_ORCH_CONTRACT', () => {
  assert.match(skill, /atlas\.create_mission/);
  assert.match(skill, /atlas\.claim_task/);
  assert.match(skill, /atlas\.request_verification/);
  assert.match(skill, /atlas\.export_evidence/);
  assert.doesNotMatch(skill, /budget_tokens/);
  assert.doesNotMatch(docs, new RegExp(['Luiz', 'Karlos'].join('')));
  const mission = calls['atlas.create_mission'];
  assert.ok(mission && mission.project_id && mission.mission_id && Array.isArray(mission.tasks));
  for (const c of extractCalls(skill)) {
    assert.ok(!('budget_tokens' in c.json) && !('max_concurrency' in c.json));
    assert.ok(!String(c.tool).startsWith('megabrain.'));
  }
});

test('DOCS_SWARM_BLOCKED', () => {
  assert.match(docs, /INSUFFICIENT_EVIDENCE/);
  assert.match(docs, /NOT_EXECUTED/);
  assert.doesNotMatch(skill, /max_concurrency/);
  assert.match(swarm, /agent_id/);
});

test('DOCS_QUALIFIED_NAMES', () => {
  assert.match(skill, /atlas\.begin_upload/);
  assert.match(skill, /atlas\.submit_task_result/);
  assert.match(life, /MISSION_NOT_FOUND/);
  assert.ok(calls['atlas.health']);
  assert.ok(calls['atlas.claim_task']?.project_id);
  assert.ok(calls['atlas.export_evidence']?.project_id && calls['atlas.export_evidence']?.mission_id);
});
