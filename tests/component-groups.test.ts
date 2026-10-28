import {expect, test} from 'bun:test';
import {existsSync, readdirSync, readFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import groups from '../packages/core/component-groups.json';
import contracts from '../packages/docs/src/examples/documentation/contracts.json';
import {
  coreComponentSource,
  componentGroupForSource,
  componentGroupOrder,
} from '../packages/docs/src/examples/componentGroups';

const root = new URL('../', import.meta.url);

test('each grouped component has one owner and its source matches the documentation category', () => {
  const seen = new Set<string>();
  for (const [folder, group] of Object.entries(groups)) {
    const directory = new URL(`packages/core/src/components/${folder}/`, root);
    expect(
      readdirSync(directory)
        .filter((file) => file.endsWith('.vue'))
        .sort()
    ).toEqual(group.components.map((name) => name + '.vue').sort());
    for (const name of group.components) {
      expect(seen.has(name)).toBe(false);
      seen.add(name);
      const source = coreComponentSource(name);
      expect(source).toBe(`packages/core/src/components/${folder}/${name}.vue`);
      expect(existsSync(new URL(source, root))).toBe(true);
      expect(componentGroupForSource(source)).toBe(group.title);
      expect(
        existsSync(new URL(`packages/core/src/components/${name}.vue`, root))
      ).toBe(false);
    }
  }
});

test('framework components live together and General is an explicit documentation group', () => {
  for (const name of [
    'FrameShell',
    'FrameQuickPick',
    'FrameQuickPanel',
    'FrameModal',
    'FrameSettings',
    'WorkspacePanes',
    'SidePanel',
    'NavigationBar',
  ]) {
    const source = coreComponentSource(name);
    expect(source).toBe(`packages/core/src/components/framework/${name}.vue`);
    expect(existsSync(new URL(source, root))).toBe(true);
    expect(componentGroupForSource(source)).toBe('General');
  }
  expect(componentGroupOrder).toEqual([
    'Actions',
    'Form Controls',
    'Dates and Times',
    'Colors',
    'Navigation',
    'Layout',
    'Data Display',
    'Feedback',
    'Overlays',
    'General',
    'Modules',
  ]);
});

test('all documented component sources resolve after moving the folders', () => {
  for (const sources of Object.values(contracts.pageSources)) {
    for (const source of sources)
      expect(existsSync(new URL(source, root))).toBe(true);
  }
  for (const source of Object.keys(contracts.contracts))
    expect(existsSync(new URL(source, root))).toBe(true);
});

test('Core relative imports and type exports resolve across component folders', () => {
  const sourceRoot = new URL('packages/core/src/', root);
  const missing: string[] = [];
  for (const name of readdirSync(sourceRoot, {recursive: true}).map(String)) {
    if (!/\.(ts|vue)$/.test(name)) continue;
    const file = fileURLToPath(new URL(name.replaceAll('\\', '/'), sourceRoot));
    const source = readFileSync(file, 'utf8');
    for (const match of source.matchAll(
      /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s*)['"](\.[^'"\n]+)['"]/g
    )) {
      // Vite style/raw subrequests still resolve to the same maintained file.
      const target = resolve(dirname(file), match[1]!.split('?', 1)[0]!);
      if (
        ![target, target + '.ts', target + '.vue', target + '/index.ts'].some(
          existsSync
        )
      )
        missing.push(`${name}: ${match[1]}`);
    }
  }
  expect(missing).toEqual([]);
});
