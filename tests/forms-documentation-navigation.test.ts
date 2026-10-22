import { expect, test } from 'bun:test';
import { apiEntries } from '../packages/docs/src/examples/apiCatalog';
import { typeDocs } from '../packages/docs/src/examples/typeDocs';
test('date models retain public API pages alongside extracted references', () => {
  for (const name of ['DateValue','DateRange','TimeValue','TimeRange']) {
    expect(apiEntries.find(entry => entry.name === name)).toMatchObject({ kind: 'Value type', package: '@frame/core' });
    expect(typeDocs[name]?.code).toContain("from '@frame/core'");
  }
  expect(typeDocs.DateRange?.properties.map(property => property.reference)).toEqual(['DateValue','DateValue']);
  expect(typeDocs.TimeRange?.properties.map(property => property.reference)).toEqual(['TimeValue','TimeValue']);
});
