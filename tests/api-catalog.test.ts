import { expect, test } from 'bun:test';
import { apiEntries, filterApiEntries } from '../packages/docs/src/examples/apiCatalog';
import { typeDocs } from '../packages/docs/src/examples/typeDocs';

test('API catalog includes each documented contract once and identifies all runtime classes', () => {
  expect(apiEntries.map(entry => entry.name).sort()).toEqual(Object.keys(typeDocs).sort());
  expect(apiEntries.filter(entry => entry.kind === 'Class').map(entry => entry.name).sort()).toEqual(['SelectItem','SelectOption','SelectSeparator']);
  expect(apiEntries.find(entry => entry.name === 'FrameMenuItem')?.kind).toBe('Value type');
  for (const entry of apiEntries) {
    const doc = typeDocs[entry.name]!;
    expect(doc.description.length).toBeGreaterThan(0);
    expect(doc.code.length).toBeGreaterThan(0);
    for (const property of doc.properties) if (property.reference) expect(typeDocs[property.reference]).toBeDefined();
  }
});

test('API filtering matches class names and behavior without case sensitivity', () => {
  expect(filterApiEntries('  SELECTOPTION  ').map(entry => entry.name)).toEqual(['SelectItem', 'SelectOption']);
  expect(filterApiEntries('nonexistent-contract')).toEqual([]);
  expect(filterApiEntries('')).toHaveLength(Object.keys(typeDocs).length);
});
