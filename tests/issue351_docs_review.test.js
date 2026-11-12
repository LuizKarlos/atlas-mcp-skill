import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const skill = readFileSync(join(root, 'megabrain-review/SKILL.md'), 'utf8');
const slop = readFileSync(join(root, 'megabrain-review/references/anti-slop-patterns.md'), 'utf8');
const dual = readFileSync(join(root, 'megabrain-review/references/dual-blind-adjudication.md'), 'utf8');
const voice = readFileSync(join(root, 'megabrain-review/references/voice-calibration.md'), 'utf8');
const docs = skill + slop + dual + voice;

test('DOCS_REV_APPROVED', () => {
  assert.match(skill, /atlas\.submit_task_review/);
  assert.match(skill, /approved/);
  assert.match(docs, /não é autorização/);
  assert.match(docs, /advisory/);
  assert.doesNotMatch(docs, new RegExp(['Luiz', 'Karlos'].join('')));
});

test('DOCS_REV_NO_ARBITER', () => {
  assert.match(skill, /Jev é só advisory/);
  assert.match(dual, /nenhum árbitro LLM server-side/);
  assert.doesNotMatch(skill, /third-party arbiter/);
});

test('DOCS_REV_JSON', () => {
  assert.match(skill, /Anti-slop com JSON objeto/);
  assert.match(skill, /Voice calibrate com JSON objeto/);
  assert.match(slop, /JSON objeto/);
  assert.match(voice, /JSON objeto/);
  assert.doesNotMatch(slop, /call anti_slop_lint --text/);
});

test('DOCS_REV_CALLS_AND_AST', () => {
  const calls = [...skill.matchAll(/megabrain call (\S+) '([^']+)'/g)].map(m => ({ tool: m[1], json: JSON.parse(m[2]) }));
  assert.ok(calls.length >= 1);
  for (const c of calls) assert.equal(typeof c.json, 'object');
  const adj = calls.find(c => c.tool === 'atlas.submit_task_review')?.json;
  assert.ok(adj && adj.project_id && adj.mission_id && adj.task_id && adj.execution_id && adj.review_execution_id && adj.verdict && adj.rationale);
  const kPath = process.env.MEGABRAIN_KERNEL_SOURCE || '/srv/megabrain-dev/repository/runtime/atlas_mcp_server.py';
  const sigs = existsSync(kPath)
    ? JSON.parse(execSync('python3 - <<PY\nimport ast, json\ntree = ast.parse(open("' + kPath + '").read())\nprint(json.dumps({n.name: [a.arg for a in n.args.args if a.arg not in ("self",)] for n in ast.walk(tree) if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef))}))\nPY', { encoding: 'utf8' }))
    : { atlas_submit_task_review: ['project_id', 'mission_id', 'task_id', 'execution_id', 'review_execution_id', 'verdict', 'rationale'] };
  const allowed = sigs.atlas_submit_task_review || ['project_id', 'mission_id', 'task_id', 'execution_id', 'review_execution_id', 'verdict', 'rationale'];
  assert.ok(Object.keys(adj).every(k => allowed.includes(k)));
});
