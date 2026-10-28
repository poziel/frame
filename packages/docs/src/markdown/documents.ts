/** Canonical consumer Markdown, also published for offline readers. */
const sources = import.meta.glob(
  [
    '../../../../docs/**/*.md',
    '!../../../../docs/superpowers/**',
    '!../../../../docs/contributing/**',
    '!../../../../docs/components/component-documentation.md',
  ],
  {query: '?raw', import: 'default', eager: true}
) as Record<string, string>;
const readmes = import.meta.glob(
  [
    '../../../**/README.md',
    '!../../../**/node_modules/**',
    '!../../../**/dist/**',
  ],
  {
    query: '?raw',
    import: 'default',
    eager: true,
  }
) as Record<string, string>;

/** Browser-readable documents; internal contributor plans remain outside it. */
export const documents: Record<string, string> = Object.fromEntries([
  ...Object.entries(sources)
    .filter(([path]) => !/\/(?:superpowers|contributing)\//.test(path))
    .map(([path, text]) => [path.replace('../../../../docs/', ''), text]),
  ...Object.entries(readmes).map(([path, text]) => [
    `packages/${path.replace('../../../', '')}`,
    text,
  ]),
]);
