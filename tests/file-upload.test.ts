import { describe, expect, test } from 'bun:test';
import { validateFiles } from '../packages/core/src/components/forms/shared/files';
const file = (name: string, type = '', size = 3) => new File(['x'.repeat(size)], name, { type });
describe('file selection validation', () => {
  test('accepts case-insensitive extensions, exact MIME and wildcard MIME', () => {
    const files = [file('A.PNG'), file('a.txt', 'text/plain'), file('a.jpg', 'image/jpeg')];
    expect(validateFiles(files, { multiple: true, accept: '.png, text/plain, image/*' }).accepted).toEqual(files);
    expect(validateFiles([file('bad.exe')], { accept: 'image/*' }).rejected[0]?.code).toBe('type');
  });
  test('allows exact size and rejects oversized files without consuming capacity', () => {
    const result = validateFiles([file('large', '', 4), file('ok')], { maxSize: 3 });
    expect(result.accepted.map(f => f.name)).toEqual(['ok']);
    expect(result.rejected[0]?.code).toBe('size');
  });
  test('single selection and multiple limits reject surplus explicitly', () => {
    const files = [file('a'), file('b'), file('c')];
    expect(validateFiles(files).rejected.map(r => r.code)).toEqual(['count', 'count']);
    expect(validateFiles(files, { multiple: true, maxFiles: 2 }).accepted).toHaveLength(2);
    expect(validateFiles(files, { multiple: true, maxFiles: 0 }).accepted).toHaveLength(0);
  });
  test('empty accept permits unknown MIME and empty input stays empty', () => {
    expect(validateFiles([file('unknown')]).accepted).toHaveLength(1);
    expect(validateFiles([])).toEqual({ accepted: [], rejected: [] });
  });
});
