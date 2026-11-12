import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const skill = readFileSync(join(root, 'megabrain-pipeline/SKILL.md'), 'utf8');
const heal = readFileSync(join(root, 'megabrain-pipeline/references/auto-healing-patterns.md'), 'utf8');
const dag = readFileSync(join(root, 'megabrain-pipeline/references/dag-decomposition-rules.md'), 'utf8');
const waves = readFileSync(join(root, 'megabrain-pipeline/references/topological-waves.md'), 'utf8');
const docs = skill + heal + dag + waves;

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

test('DOCS_PIPE_CONTRACT', () => {
  assert.match(skill, /atlas\.create_mission/);
  assert.match(skill, /test_commands/);
  assert.doesNotMatch(skill, /max_depth/);
  assert.doesNotMatch(skill, /wave_index/);
  assert.doesNotMatch(docs, new RegExp(['Luiz', 'Karlos'].join('')));
  assert.ok(calls['atlas.create_mission']?.tasks);
  assert.ok(calls['atlas.claim_task']?.project_id);
  for (const c of extractCalls(skill)) {
    assert.ok(!('max_depth' in c.json) && !('wave_index' in c.json) && !('canary' in c.json));
  }
});

test('DOCS_PIPE_HEAL', () => {
  assert.match(docs, /NOT_EXECUTED/);
  assert.match(skill, /BLOCKED/);
  assert.doesNotMatch(skill, /canary/);
  assert.match(heal, /synthesize_subtask/);
});

test('DOCS_PIPE_QUALIFIED', () => {
  assert.match(skill, /atlas\.get_mission/);
  assert.match(skill, /atlas\.claim_task/);
  assert.match(dag, /atlas\.create_mission/);
  assert.match(waves, /test_commands/);
  assert.ok(calls['atlas.create_mission'] && calls['atlas.get_mission']);
});

test('DOCS_PIPE_VERIFY', () => {
  assert.match(skill, /GREEN/);
  assert.match(skill, /exit_code:\s*0/);
  assert.match(skill, /Sem provider/);
  assert.match(skill, /MALFORMED_RESULT/);
  assert.match(skill, /NOT_EXECUTED/);
  assert.match(waves, /GREEN/);
  assert.match(waves, /exit_code:\s*0/);
  assert.match(waves, /Sem provider/);
  assert.match(waves, /MALFORMED_RESULT/);
  assert.match(waves, /NOT_EXECUTED/);
  assert.doesNotMatch(skill, /(?:verification|test)_result["']?\s*:\s*["']/);
  assert.doesNotMatch(docs, /(?:verification|test)_result["']?\s*:\s*["']/);
});
