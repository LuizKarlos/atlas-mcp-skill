import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const readme = readFileSync(join(root, 'README.md'), 'utf8');

test('PUBLIC_CHANNEL_CONTRACT_NOT_LIVE', () => {
  // Public channel contract asserts not published yet
  assert.match(readme, /publicação pública ainda não existe/i);
  assert.doesNotMatch(readme, /npm install -g @megabrain\/cli/);
  assert.doesNotMatch(readme, /npm view/i);
  assert.doesNotMatch(readme, /gh release/i);
  assert.doesNotMatch(readme, /github\.com\/[^/]+\/[^/]+\/releases/i);

  // Local tarball artifact from s22 preserved
  assert.match(readme, /npm install -g \.\/dist\/megabrain-cli-3\.2\.0\.tgz/);
  assert.match(readme, /Node >=18/);
  assert.match(readme, /3\.2\.0/);
  assert.match(readme, /sha256sum -c/);
  assert.match(readme, /rollback/i);
});
