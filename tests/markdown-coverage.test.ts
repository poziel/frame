import {describe, expect, test} from 'bun:test';
import {mkdtempSync, mkdirSync, rmSync, writeFileSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {
  checkMarkdown,
  inspectMarkdown,
  validateLocalLink,
} from '../packages/docs/scripts/check-markdown';

/** Runs a file-link assertion against an isolated temporary documentation tree. */
function withDocuments(run: (root: string) => void) {
  const scratch = resolve(import.meta.dir, '../.ai-workspace');
  mkdirSync(scratch, {recursive: true});
  const root = mkdtempSync(join(scratch, 'markdown-validation-'));
  try {
    mkdirSync(join(root, 'guides'));
    writeFileSync(join(root, 'guides/start.md'), '# Start\n');
    writeFileSync(
      join(root, 'target.md'),
      '# Target\n\n## API options\n\n## API options\n'
    );
    run(root);
  } finally {
    rmSync(root, {recursive: true, force: true});
  }
}

describe('Markdown migration coverage', () => {
  test('all canonical component documents and their live examples are valid', () => {
    expect(checkMarkdown().errors).toEqual([]);
  });

  test('extracts Markdown links and ignores fenced and inline literal links', () => {
    const source =
      '# Example\n\n[Actual](target.md) and `[Literal](missing.md)`\n\n```md\n[Also literal](missing.md)\n```\n\n![Image](image.svg)';
    expect(inspectMarkdown(source).links.map((link) => link.href)).toEqual([
      'target.md',
      'image.svg',
    ]);
  });

  test('resolves references and ignores HTML pretending to be a Markdown link', () => {
    const source =
      '[Reference][target]\n\n[target]: destination.md#section\n\n<a href="missing.md">HTML</a>';
    expect(inspectMarkdown(source).links.map((link) => link.href)).toEqual([
      'destination.md#section',
    ]);
  });

  test('validates relative paths, duplicate fragments, and encoded fragments', () => {
    withDocuments((root) => {
      const source = join(root, 'guides/start.md');
      expect(
        validateLocalLink(source, '../target.md#api%2Doptions-1', root)
      ).toBeUndefined();
      expect(validateLocalLink(source, '../target.md#missing', root)).toContain(
        'missing fragment'
      );
      expect(validateLocalLink(source, '../absent.md', root)).toContain(
        'missing destination'
      );
      expect(
        validateLocalLink(source, 'https://example.com/missing.md', root)
      ).toBeUndefined();
    });
  });
});
