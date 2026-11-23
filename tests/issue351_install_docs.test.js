import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const readme = readFileSync(join(root, 'README.md'), 'utf8');

test('INSTALL_NPM', () => {
  assert.match(readme, /Node >=18/);
  assert.match(readme, /npm install -g @cli_atlas\/cli@4\.0\.1/);
  assert.match(readme, /MEGABRAIN_ENDPOINT/);
  assert.match(readme, /megabrain login/);
  assert.match(readme, /rollback por reinstalar versão anterior/i);
  assert.doesNotMatch(readme, /@megabrain\/cli/);
  assert.doesNotMatch(readme, /\.\/dist\//);
});

test('INSTALL_SCRIPTS', () => {
  assert.match(readme, /local SHA-256 chain only/);
  assert.match(readme, /local regex outline/);
  assert.match(readme, /JSON\/flags/);
  assert.doesNotMatch(readme, /wcag_check\.js style\.css/);
});

test('INSTALL_VERSION', () => {
  assert.match(readme, /4\.0\.1/);
  assert.match(readme, /megabrain --version/);
});
