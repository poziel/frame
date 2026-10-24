import { readFileSync, writeFileSync } from 'node:fs';

const root = new URL('../', import.meta.resolve('confbox'));
const metadata = JSON.parse(readFileSync(new URL('package.json', root), 'utf8'));
const text = `confbox@${metadata.version}\n\n` +
  readFileSync(new URL('LICENSE', root), 'utf8') + '\n\n' +
  readFileSync(new URL('dist/THIRD-PARTY-LICENSES.md', root), 'utf8');
writeFileSync(new URL('../../../docs/licenses/confbox.txt', import.meta.url), text);
console.log(`Collected Confbox ${metadata.version} and bundled parser licenses`);
