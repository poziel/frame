import {existsSync, readFileSync, writeFileSync, readdirSync} from 'node:fs';
import {resolve} from 'node:path';
import MarkdownIt from 'markdown-it';
import {updateGeneratedRegions} from './markdown-regions';
import pagePaths from '../src/markdown/componentPages.json';
import previews from '../src/markdown/previews.json';
import contracts from '../src/examples/documentation/contracts.json';
import services from '../src/examples/documentation/services.json';
import themes from '../src/examples/documentation/themes.json';
import references from '../src/examples/documentation/references.json';
import type {
  ComponentContract,
  ThemeToken,
} from '../src/examples/documentation/types';
import {SourceFormatter} from '../../../scripts/sourceFormatter';

const root = resolve(import.meta.dir, '../../..');
const check = process.argv.includes('--check');
const markdown = new MarkdownIt();
const formatter = new SourceFormatter(resolve(root, '.prettierrc.json'));
const surfaces = contracts.contracts as unknown as Record<
  string,
  ComponentContract
>;
const sources = contracts.pageSources as Record<string, string[]>;
const styling = themes as Record<string, {tokens: ThemeToken[]}>;
const serviceContracts = services as unknown as Record<
  string,
  ComponentContract
>;
const referenceContracts = references as Record<
  string,
  {
    description: string;
    code: string;
    properties: {
      name: string;
      type: string;
      description: string;
      reference?: string;
    }[];
  }
>;

/** Escapes extracted source text for a Markdown table cell. */
function cell(value: unknown): string {
  return String(value ?? '')
    .replaceAll('|', '\\|')
    .replaceAll('\n', ' ')
    .replaceAll('\r', '');
}

/** Emits a complete reference table, including explicit empty sections. */
function table(headers: string[], rows: unknown[][]): string {
  if (!rows.length) return 'No declared entries.\n';
  return `| ${headers.join(' | ')} |\n| ${headers.map(() => '---').join(' | ')} |\n${rows
    .map((row) => `| ${row.map(cell).join(' | ')} |`)
    .join('\n')}\n`;
}

/** Renders actual declared APIs; absent comments remain visible coverage gaps. */
function apiReference(id: string): string {
  if (!sources[id]) throw new Error(`Unknown API documentation id: ${id}`);
  const components = sources[id]!.map((source) => surfaces[source]!);
  if (serviceContracts[id]) components.push(serviceContracts[id]!);
  return components
    .map((component) => {
      const declaration = component as ComponentContract & {
        generic?: string;
        signature?: string;
      };
      let text = `### ${component.name}\n\nSource: \`${component.source}\`\n\n`;
      if (declaration.generic)
        text += `Generic parameters: \`${declaration.generic}\`\n\n`;
      if (declaration.signature)
        text += '```ts\n' + declaration.signature + '\n```\n\n';
      text +=
        '#### Properties\n\n' +
        table(
          ['Name', 'Type', 'Default', 'Description'],
          component.props.map((prop) => [
            '`' + prop.name + '`',
            '`' + prop.type + '`',
            prop.default.kind === 'required'
              ? 'Required'
              : prop.default.kind === 'omitted'
                ? 'Omitted'
                : prop.default.kind === 'derived'
                  ? prop.default.expression
                  : prop.default.value,
            documentedDescription(prop),
          ])
        );
      for (const [name, entries] of [
        ['Events', component.emits],
        ['Slots', component.slots],
        ['Exposed API', component.methods],
      ] as const) {
        text +=
          `\n#### ${name}\n\n` +
          table(
            ['Name', 'Parameters', 'Return type', 'Description'],
            entries.map((entry) => [
              '`' + entry.name + '`',
              '`' + (entry.parameters || 'None') + '`',
              '`' + entry.returns + '`',
              documentedDescription(entry),
            ])
          );
        for (const entry of entries) {
          const overloads = (entry as typeof entry & {signatures?: string[]})
            .signatures;
          if (overloads && overloads.length > 1)
            text += `\nOverloads for \`${entry.name}\`:\n\n\x60\x60\x60ts\n${overloads.join('\n')}\n\x60\x60\x60\n`;
        }
      }
      return text;
    })
    .join('\n');
}

/** Keeps contextual defaults, precedence and deprecation notes beside descriptions. */
function documentedDescription(member: {description: string}): string {
  const tags =
    (member as typeof member & {tags?: {name: string; text?: string}[]}).tags ??
    [];
  const notes = tags
    .filter((tag) =>
      ['remarks', 'deprecated', 'defaultValue'].includes(tag.name)
    )
    .map(
      (tag) =>
        `${tag.name === 'remarks' ? '' : tag.name + ': '}${tag.text ?? ''}`
    );
  return [member.description || 'Source description pending.', ...notes].join(
    ' '
  );
}

/** Renders CSS declarations and their contextual, unevaluated defaults. */
function styleReference(id: string): string {
  if (!sources[id]) throw new Error(`Unknown styling documentation id: ${id}`);
  const tokens = sources[id]!.flatMap(
    (source) => styling[source]?.tokens ?? []
  );
  const unique = [
    ...new Map(
      tokens.map((token) => [
        `${token.name}:${token.selector}:${token.value}`,
        token,
      ])
    ).values(),
  ];
  return (
    table(
      [
        'CSS variable',
        'Theme path',
        'Default expression',
        'Purpose',
        'Context',
      ],
      unique.map((token) => [
        '`' + token.name + '`',
        '`' + token.name.slice(2).replaceAll('-', '.') + '`',
        token.value
          ? '`' + token.value + '`'
          : 'No declared default; supplied by context.',
        token.description || 'Source description pending.',
        '`' + token.selector + '`',
      ])
    ) +
    '\nExpressions are preserved as written; their computed values depend on the active theme and component state.\n'
  );
}

/** Updates artifacts only when changed, or detects stale output without writes. */
function output(path: string, text: string): void {
  const full = resolve(root, path);
  const previous = existsSync(full)
    ? readFileSync(full, 'utf8').replaceAll('\r\n', '\n')
    : '';
  if (previous === text) return;
  if (check) throw new Error(`Stale generated documentation: ${path}`);
  writeFileSync(full, text);
}

/** Reads authored feature headings, descriptions and code for compatibility consumers. */
function featuresFrom(source: string, id: string): unknown[] {
  const configurations =
    (previews as Record<string, Record<string, object>>)[id] ?? {};
  const tokens = markdown.parse(source, {});
  const features: unknown[] = [];
  let title = '',
    description = '';
  let current:
    | {
        id: string;
        title: string;
        description: string;
        code: string;
        variant: string;
      }
    | undefined;
  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index]!;
    if (token.type === 'heading_open' && token.tag === 'h3') {
      title = tokens[index + 1]?.content ?? '';
      description = '';
    }
    if (
      token.type === 'inline' &&
      !token.content.startsWith('<!--') &&
      tokens[index - 1]?.type === 'paragraph_open'
    )
      description ||= token.content;
    const marker =
      token.type === 'inline'
        ? token.content.match(/^<!-- frame:example id="([\w.-]+)" -->$/)
        : undefined;
    if (marker) {
      const featureId = marker[1]!.slice(id.length + 1);
      if (!configurations[featureId])
        throw new Error(`Unregistered example: ${marker[1]}`);
      current = {
        id: featureId,
        title,
        description,
        code: '',
        variant: 'default',
        ...configurations[featureId],
      };
      features.push(current);
    }
    if (token.type === 'fence' && current && !current.code)
      current.code = token.content.trimEnd();
  }
  return features;
}

const content: Record<string, unknown> = {};
for (const [id, path] of Object.entries(pagePaths)) {
  const file = `docs/${path}`;
  const updated = await formatter.format(
    updateGeneratedRegions(
      readFileSync(resolve(root, file), 'utf8'),
      (kind, key) => {
        if (kind === 'api') return apiReference(key);
        if (kind === 'styles') return styleReference(key);
        throw new Error(`Unexpected region kind: ${kind}`);
      }
    ),
    resolve(root, file)
  );
  output(file, updated);
  content[id] = {features: featuresFrom(updated, id)};
}
const typeContent: Record<string, unknown> = {};
for (const file of readdirSync(resolve(root, 'docs/reference/api')).filter(
  (file) => file.endsWith('.md')
)) {
  const path = `docs/reference/api/${file}`;
  let source = readFileSync(resolve(root, path), 'utf8');
  source = updateGeneratedRegions(source, (kind, name) => {
    if (kind !== 'type') throw new Error(`Unexpected type region: ${kind}`);
    const reference = referenceContracts[name];
    return reference
      ? '```ts\n' +
          reference.code +
          '\n```\n\n' +
          table(
            ['Name', 'Type', 'Description'],
            reference.properties.map((prop) => [
              '`' + prop.name + '`',
              '`' + prop.type + '`',
              prop.description || 'Source description pending.',
            ])
          )
      : 'This contract is described by the authored notes below.\n';
  });
  source = await formatter.format(source, resolve(root, path));
  output(path, source);
  const tokens = markdown.parse(source, {});
  const description =
    tokens.find(
      (token, index) =>
        token.type === 'inline' && tokens[index - 1]?.type === 'paragraph_open'
    )?.content ?? '';
  const code =
    tokens.find((token) => token.type === 'fence')?.content.trimEnd() ?? '';
  const authored = tokens
    .filter((token) => token.type === 'inline')
    .map((token) => token.content.replace(/\n\s*/g, ' '))
    .map((text) => text.match(/^\*\*(.+?)\*\* \((.*?)\): (.*)$/))
    .filter((match): match is RegExpMatchArray => !!match)
    .map((match) => {
      const reference = match[3]!.match(/ See \[([^\]]+)\]\([^)]+\)\.$/)?.[1];
      return {
        name: match[1]!,
        type: match[2]!,
        description: match[3]!.replace(/ See \[[^\]]+\]\([^)]+\)\.$/, ''),
        ...(reference ? {reference} : {}),
      };
    });
  const properties = authored.length
    ? authored
    : (referenceContracts[file.slice(0, -3)]?.properties ?? []);
  typeContent[file.slice(0, -3)] = {description, code, properties};
}
output(
  'docs/reference/api.md',
  await formatter.format(
    '# Public API reference\n\nThese articles combine source-derived declarations and member tables with authored usage explanations.\n\n' +
      Object.keys(typeContent)
        .sort()
        .map((name) => `- [${name}](api/${name}.md)`)
        .join('\n') +
      '\n',
    resolve(root, 'docs/reference/api.md')
  )
);
output(
  'packages/docs/src/markdown/content.generated.json',
  await formatter.format(
    JSON.stringify(content),
    resolve(root, 'packages/docs/src/markdown/content.generated.json')
  )
);
output(
  'packages/docs/src/markdown/types.generated.json',
  await formatter.format(
    JSON.stringify(typeContent),
    resolve(root, 'packages/docs/src/markdown/types.generated.json')
  )
);
console.log(
  `Generated Markdown references for ${Object.keys(content).length} pages and ${Object.keys(typeContent).length} API documents.`
);
