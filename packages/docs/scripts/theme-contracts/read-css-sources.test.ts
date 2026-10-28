import {expect, test} from 'bun:test';
import {resolve} from 'node:path';
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
