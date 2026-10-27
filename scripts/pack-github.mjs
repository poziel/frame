import {execFileSync} from 'node:child_process';
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

// Stage publishable manifests without changing workspace names or imports.
const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(root, 'dist/github-packages');
const packages = ['core', 'themes', 'tailwind', 'tauri', 'electron'];
const version = JSON.parse(readFileSync(resolve(root, 'package.json'))).version;
if (process.env.RELEASE_TAG && process.env.RELEASE_TAG !== `v${version}`) {
  throw new Error(`Release tag must match package version: v${version}`);
}
mkdirSync(output, {recursive: true});

for (const name of packages) {
  const source = resolve(root, 'packages', name);
  const manifest = JSON.parse(readFileSync(resolve(source, 'package.json')));
  if (manifest.version !== version) {
    throw new Error(`Version mismatch in ${manifest.name}`);
  }
  const stage = mkdtempSync(resolve(output, `${name}-`));
  for (const file of manifest.files) {
    cpSync(resolve(source, file), resolve(stage, file), {recursive: true});
  }
  manifest.name = `@poziel/frame-${name}`;
  manifest.private = false;
  manifest.repository = {
    type: 'git',
    url: 'git+https://github.com/poziel/frame.git',
    directory: `packages/${name}`,
  };
  manifest.publishConfig = {registry: 'https://npm.pkg.github.com'};
  // Peers keep their public alias and semver range so the host's aliased Core
  // satisfies them without requesting a second package from the registry.
  for (const field of ['dependencies', 'optionalDependencies']) {
    for (const [dependency, range] of Object.entries(manifest[field] ?? {})) {
      if (dependency.startsWith('@frame/')) {
        manifest[field][dependency] =
          `npm:@poziel/frame-${dependency.slice(7)}@${range}`;
      }
    }
  }
  delete manifest.scripts;
  delete manifest.devDependencies;
  writeFileSync(
    resolve(stage, 'package.json'),
    JSON.stringify(manifest, null, 2) + '\n'
  );
  execFileSync(
    process.platform === 'win32' ? 'npm.cmd' : 'npm',
    ['pack', '--pack-destination', output],
    {cwd: stage, stdio: 'inherit', shell: process.platform === 'win32'}
  );
}
