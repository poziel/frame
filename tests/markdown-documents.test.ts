import {describe, expect, test} from 'bun:test';
import {
  parseDocument,
  resolveDocumentLink,
} from '../packages/docs/src/markdown/document';

describe('Markdown documentation', () => {
  test('extracts tabs without treating fenced headings or markers as structure', () => {
    const page = parseDocument(
      '# Button\n\nA control.\n\n## Features\n\n<!-- frame:example id="button.basic" -->\n\n```md\n## APIs\n<!-- frame:example id="ignored" -->\n```\n\n## APIs\n\nA reference.\n\n## Styling\n\nTokens.'
    );
    expect(page.title).toBe('Button');
    expect(page.sections.map((section) => section.id)).toEqual([
      'features',
      'api',
      'theming',
    ]);
    expect(
      page.sections[0]?.blocks.filter((block) => block.kind === 'example')
    ).toEqual([{kind: 'example', id: 'button.basic'}]);
    expect(
      page.sections[0]?.blocks.some(
        (block) => block.kind === 'code' && block.code.includes('ignored')
      )
    ).toBe(true);
  });

  test('rejects duplicate tabs and malformed live markers', () => {
    expect(() => parseDocument('# X\n## APIs\n## APIs')).toThrow('Duplicate');
    expect(() => parseDocument('# X\n<!-- frame:example -->')).toThrow(
      'Invalid'
    );
  });

  test('disables executable HTML and unsafe links', () => {
    const page = parseDocument(
      '# X\n<script>alert(1)</script>\n[bad](javascript:alert(1))'
    );
    expect(JSON.stringify(page)).not.toContain('<script>');
    expect(JSON.stringify(page)).not.toContain('href="javascript:');
  });

  test('preserves list structure around nested code fences', () => {
    const page = parseDocument(
      '# Setup\n\n1. Install:\n\n   ```sh\n   bun install\n   ```\n\n2. Run the app.'
    );
    expect(page.introduction).toHaveLength(1);
    expect(page.introduction[0]?.kind).toBe('html');
    expect(JSON.stringify(page.introduction)).toContain('<ol>');
    expect(JSON.stringify(page.introduction)).toContain('</ol>');
  });

  test('resolves relative Markdown links and fragments without losing the page', () => {
    expect(
      resolveDocumentLink(
        'components/forms/switch.md',
        '../../styling/theme-variables.md#tokens'
      )
    ).toBe('styling/theme-variables.md#tokens');
    expect(resolveDocumentLink('components/button.md', '#basic-usage')).toBe(
      'components/button.md#basic-usage'
    );
    expect(resolveDocumentLink('README.md', '../packages/core/README.md')).toBe(
      'packages/core/README.md'
    );
    expect(
      resolveDocumentLink('README.md', 'https://vuejs.org')
    ).toBeUndefined();
  });

  test('renders local links as reloadable website routes and preserves authored destinations', () => {
    const page = parseDocument(
      '# Start\n\n[Guide](../guides/hosts.md#capabilities)\n\n[Source](../../packages/core/src/index.ts)',
      'components/buttons.md'
    );
    const html = page.introduction
      .filter((block) => block.kind === 'html')
      .map((block) => block.html)
      .join('');
    expect(html).toContain(
      'href="#/docs/guides%2Fhosts.md?anchor=capabilities"'
    );
    expect(html).toContain(
      'data-document-href="../guides/hosts.md#capabilities"'
    );
    expect(html).toContain(
      'https://github.com/poziel/frame/blob/main/packages/core/src/index.ts'
    );
  });
});
