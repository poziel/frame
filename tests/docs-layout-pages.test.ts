import { describe, expect, test } from 'bun:test';
import { layoutPages, resolveLayoutPageId } from '../packages/docs/src/layouts/layoutPages';

describe('documentation layout destinations', () => {
  test('sidebar and panel view bars share their container page', () => {
    expect(resolveLayoutPageId('primary-view-bar')).toBe('primary-sidebar');
    expect(resolveLayoutPageId('secondary-view-bar')).toBe('secondary-sidebar');
    expect(resolveLayoutPageId('panel-view-bar')).toBe('panel');
    expect(layoutPages.filter(page => page.id.endsWith('view-bar'))).toEqual([]);
  });
  test('canonical routes remain available and unknown routes are rejected', () => {
    for (const page of layoutPages) expect(resolveLayoutPageId(page.id)).toBe(page.id);
    for (const id of ['missing', 'constructor', 'toString', '__proto__']) expect(resolveLayoutPageId(id)).toBeUndefined();
  });
});
