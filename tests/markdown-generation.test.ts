import {expect, test} from 'bun:test';
import {updateGeneratedRegions} from '../packages/docs/scripts/markdown-regions';

test('updates owned regions without touching prose or fenced marker examples', () => {
  const source =
    '# Page\n\nKeep this.\n\n```md\n<!-- frame:generated api="ignored" -->\n```\n\n<!-- frame:generated api="button" -->\nOld table\n<!-- /frame:generated -->\n\nKeep this too.\n';
  const result = updateGeneratedRegions(source, (kind, id) => `${kind}: ${id}`);
  expect(result).toContain('api: button');
  expect(result).not.toContain('Old table');
  expect(result).toContain('Keep this too.');
  expect(result).toContain('api="ignored"');
  expect(updateGeneratedRegions(result, (kind, id) => `${kind}: ${id}`)).toBe(
    result
  );
});

test('rejects malformed and unclosed generation boundaries', () => {
  expect(() =>
    updateGeneratedRegions('<!-- frame:generated -->', () => '')
  ).toThrow('Invalid');
  expect(() =>
    updateGeneratedRegions('<!-- frame:generated api="x" -->', () => '')
  ).toThrow('Unclosed');
  expect(() =>
    updateGeneratedRegions('<!-- /frame:generated -->', () => '')
  ).toThrow('Unexpected');
});
