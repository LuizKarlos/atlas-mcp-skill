import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const readme = readFileSync(join(root, 'README.md'), 'utf8');

test('PUBLIC_CHANNEL_NPM_CONTRACT', () => {
  // Published npm package is the official channel; the tarball is not distributed.
  assert.match(readme, /npm install -g @cli_atlas\/cli@4\.0\.1/);
  assert.ok(readme.includes('https://github.com/LuizKarlos/atlas'));
  assert.match(readme, /app\.atlascommand\.dev/);
  assert.match(readme, /Node >=18/);
  assert.match(readme, /4\.0\.1/);
  assert.match(readme, /rollback/i);
  assert.doesNotMatch(readme, /npm install -g \.\/dist\//);
  assert.doesNotMatch(readme, /megabrain-cli-4\.0\.0\.tgz/);
});
