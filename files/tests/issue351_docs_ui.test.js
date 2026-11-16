import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const skill = readFileSync(join(root, 'megabrain-ui/SKILL.md'), 'utf8');
const tokens = readFileSync(join(root, 'megabrain-ui/references/design-tokens-spec.md'), 'utf8');
const visual = readFileSync(join(root, 'megabrain-ui/references/visual-tdd-methodology.md'), 'utf8');
const wcag = readFileSync(join(root, 'megabrain-ui/references/wcag-target-sizes.md'), 'utf8');
const docs = skill + tokens + visual + wcag;

test('DOCS_UI_CONTENT', () => {
  assert.match(skill, /atlas\.complete_upload/);
  assert.match(skill, /html_content/);
  assert.match(skill, /css_content/);
  assert.doesNotMatch(skill, /localhost:3000/);
  assert.doesNotMatch(docs, new RegExp(['Luiz', 'Karlos'].join('')));
});

test('DOCS_UI_NO_SSRF', () => {
  assert.match(visual, /Sem SSRF/);
  assert.match(skill, /html_content/);
  assert.doesNotMatch(skill, /css_path/);
});

test('DOCS_UI_WCAG_LOCAL', () => {
  assert.match(wcag, /JSON\/flags/);
  assert.match(docs, /não é.*headless/i);
  assert.match(tokens, /css_content/);
  assert.doesNotMatch(tokens, /--css_path/);
});

test('DOCS_UI_CALLS_AND_AST', () => {
  const calls = [...skill.matchAll(/megabrain call (\S+) '([^']+)'/g)].map(m => ({ tool: m[1], json: JSON.parse(m[2]) }));
  assert.ok(calls.length >= 1);
  for (const c of calls) assert.equal(typeof c.json, 'object');
  const cap = calls.find(c => c.tool === 'atlas.complete_upload');
  assert.ok(cap && cap.json.project_id && cap.json.session_id);
  assert.match(skill, /127\.0\.0\.1/);
  const buf = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
  assert.equal(buf.subarray(0, 4).toString('latin1'), '\x89PNG');
  assert.match(skill, /89 50 4E 47/);
  const kPath = process.env.MEGABRAIN_KERNEL_SOURCE || '/srv/megabrain-dev/repository/runtime/atlas_mcp_server.py';
  const sigs = existsSync(kPath)
    ? JSON.parse(execSync('python3 - <<PY\nimport ast, json\ntree = ast.parse(open("' + kPath + '").read())\nprint(json.dumps({n.name: [a.arg for a in n.args.args if a.arg not in ("self",)] for n in ast.walk(tree) if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef))}))\nPY', { encoding: 'utf8' }))
    : { atlas_complete_upload: ['project_id', 'session_id', 'data_text', 'data_base64', 'data_hex'] };
  const allowed = sigs.atlas_complete_upload || ['project_id', 'session_id', 'data_text', 'data_base64', 'data_hex'];
  assert.ok(Object.keys(cap.json).every(k => allowed.includes(k)));
});
