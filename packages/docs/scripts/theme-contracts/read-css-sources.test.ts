import {expect, test} from 'bun:test';
import {resolve} from 'node:path';
import {mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {readCssSources} from './read-css-sources';

test('local CSS imports preserve source ownership and tolerate cycles', () => {
  const first = resolve('first.css');
  const nested = resolve('nested.css');
  const sources = new Map([
    [
      first,
      '@import "./nested.css"; @import url("https://example.com/remote.css"); .first {}',
    ],
    [nested, '@import "./first.css"; .nested {}'],
  ]);
  const result = readCssSources(first, (path) => {
    const source = sources.get(path);
    if (source === undefined) throw new Error('Unexpected external read');
    return source;
  });
  expect([...result.keys()]).toEqual([nested, first]);
});

test('Sass composition keeps nested rules and token comments with their source owner', () => {
  const directory = mkdtempSync(resolve(tmpdir(), 'frame-theme-contracts-'));
  try {
    const entry = resolve(directory, 'index.scss');
    const owner = resolve(directory, '_surface.scss');
    writeFileSync(entry, '@use "surface"; .entry { color: red; }');
    writeFileSync(
      owner,
      '.surface { &:hover { /* Surface color. */ color: var(--frame-text); } }'
    );
    const sheets = readCssSources(entry);
    expect(sheets.get(owner)).toContain('.surface:hover');
    expect(sheets.get(owner)).toContain('/* Surface color. */');
    expect(sheets.get(entry)).toContain('.entry');
    expect(sheets.get(entry)).not.toContain('.surface');
  } finally {
    rmSync(directory, {recursive: true, force: true});
  }
});

test('Vue style queries compile the selected embedded Sass owner', () => {
  const directory = mkdtempSync(resolve(tmpdir(), 'frame-theme-contracts-'));
  try {
    const owner = resolve(directory, 'Surface.vue');
    writeFileSync(
      owner,
      '<template><div /></template><style lang="scss">.surface { &:hover { color: var(--frame-text); } }</style>'
    );
    expect(
      readCssSources(`${owner}?vue&type=style&index=0&lang.scss`).get(owner)
    ).toContain('.surface:hover');
  } finally {
    rmSync(directory, {recursive: true, force: true});
  }
});
