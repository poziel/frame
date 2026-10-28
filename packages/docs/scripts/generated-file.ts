import {existsSync, readFileSync, writeFileSync} from 'node:fs';

/** Updates an artifact, or checks freshness without any filesystem mutation. */
export function writeGeneratedFile(path: string, source: string): void {
  const previous = existsSync(path)
    ? readFileSync(path, 'utf8').replaceAll('\r\n', '\n')
    : undefined;
  if (previous === source) return;
  if (process.argv.includes('--check'))
    throw new Error(`Stale generated documentation: ${path}`);
  writeFileSync(path, source);
}
