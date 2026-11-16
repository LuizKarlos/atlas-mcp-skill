import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const skill = readFileSync(join(root, 'megabrain-audit/SKILL.md'), 'utf8');
const merkle = readFileSync(join(root, 'megabrain-audit/references/merkle-ledger-spec.md'), 'utf8');
const receipt = readFileSync(join(root, 'megabrain-audit/references/receipt-ed25519-verification.md'), 'utf8');
const replay = readFileSync(join(root, 'megabrain-audit/references/time-travel-replay.md'), 'utf8');
const docs = skill + merkle + receipt + replay;

test('DOCS_AUDIT_CHAIN', () => {
  assert.match(skill, /merkle_verify\.js/);
  assert.match(docs, /somente a cadeia local/);
  assert.match(docs, /Referência não é assinatura verificada/);
  assert.doesNotMatch(skill, /--work_id/);
  assert.doesNotMatch(docs, new RegExp(['Luiz', 'Karlos'].join('')));
});

test('DOCS_AUDIT_EXPORT', () => {
  assert.match(skill, /atlas\.export_evidence/);
  assert.match(merkle, /falha fechado/);
});

test('DOCS_AUDIT_REPLAY', () => {
  assert.match(receipt, /não prova Ed25519/);
  assert.match(replay, /JSON objeto/);
  assert.match(docs, /não prova Ed25519/);
  assert.match(skill, /Number\.isSafeInteger/);
  assert.match(skill, /\{blocks/);
  assert.doesNotMatch(skill, /target_index/);
  const calls = [...skill.matchAll(/megabrain call (\S+) '([^']+)'/g)].map(m => ({ tool: m[1], json: JSON.parse(m[2]) }));
  assert.ok(calls.length >= 2);
  assert.ok(calls.find(c => c.tool === 'atlas.export_evidence')?.json.project_id);
});
