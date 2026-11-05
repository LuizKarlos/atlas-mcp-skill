// ponytail: local-only pack; add remote signing/attestation when CI pipeline lands
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
mkdirSync('dist', { recursive: true });
const out = JSON.parse(execSync('npm pack --json --pack-destination dist', { encoding: 'utf8' }));
const { filename, name, version } = out[0] || {};
if (name !== pkg.name || version !== pkg.version) {
  throw new Error(`Release mismatch: ${name}@${version} !== ${pkg.name}@${pkg.version}`);
}
const tarball = join('dist', filename);
const sha = createHash('sha256').update(readFileSync(tarball)).digest('hex');
writeFileSync(join('dist', `${filename}.sha256`), `${sha}  ${filename}\n`);
console.log(`Packed ${tarball} (sha256: ${sha})`);
