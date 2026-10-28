import {expect, test} from 'bun:test';
import {resolve} from 'node:path';
import {consumerMarkdownAssets} from '../packages/docs/scripts/markdown-assets';

test('publishes complete references in a repository-shaped raw Markdown tree', () => {
  const assets = consumerMarkdownAssets(resolve(import.meta.dir, '..'));
  expect(assets.get('markdown/docs/components/buttons.md')).toContain(
    '#### Properties'
  );
  expect(assets.get('markdown/docs/layouts/workspace.md')).toContain('## APIs');
  expect(assets.has('markdown/packages/core/README.md')).toBe(true);
  expect(assets.get('llms.txt')).toContain(
    'markdown/docs/components/buttons.md'
  );
  expect(
    [...assets.keys()].some(
      (path) =>
        path.includes('/superpowers/') ||
        path.includes('/contributing/') ||
        path.includes('component-documentation.md')
    )
  ).toBe(false);
});
