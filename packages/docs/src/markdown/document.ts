import MarkdownIt from 'markdown-it';

/** Renderable Markdown or an explicitly registered live example. */
export type DocumentBlock =
  | {kind: 'html'; html: string}
  | {kind: 'code'; code: string; language: string}
  | {kind: 'example'; id: string};

/** A top-level article section or documentation tab. */
export interface DocumentSection {

  /** Stable tab key or heading slug. */
  id: string;

  /** Reader-facing heading. */
  title: string;

  /** Content below the heading. */
  blocks: DocumentBlock[];
}

/** A consumer document, independently readable without Vue. */
export interface ParsedDocument {

  /** First level-one heading. */
  title: string;

  /** Content above the first section. */
  introduction: DocumentBlock[];

  /** Sections in authored order. */
  sections: DocumentSection[];
}

const markdown = new MarkdownIt({html: false, linkify: false});
const tabIds: Record<string, string> = {
  Features: 'features',
  APIs: 'api',
  Styling: 'theming',
};
const defaultLink = markdown.renderer.rules.link_open;
markdown.renderer.rules.link_open = (
  tokens,
  index,
  options,
  environment,
  renderer
) => {
  const token = tokens[index]!;
  const attribute = token.attrGet('href');
  const href = attribute === null ? null : String(attribute);
  const path = (environment as {path?: string}).path;
  if (href && path) {
    const destination = resolveDocumentLink(path, href);
    if (destination) {
      const [file, fragment] = destination.split('#', 2);
      token.attrSet('data-document-href', href);
      token.attrSet(
        'href',
        `#/docs/${encodeURIComponent(file!)}${fragment ? `?anchor=${encodeURIComponent(fragment)}` : ''}`
      );
    } else if (
      !/^(?:[a-z][\w+.-]*:|\/\/)/i.test(href) &&
      /\.(?:vue|ts|js|css|json|txt)(?:#.*)?$/.test(href)
    ) {
      const parts =
        `${path.startsWith('packages/') ? '' : 'docs/'}${path.slice(0, path.lastIndexOf('/') + 1)}${href}`.split(
          '/'
        );
      const normalized: string[] = [];
      for (const part of parts) {
        if (part === '..') normalized.pop();
        else if (part && part !== '.') normalized.push(part);
      }
      token.attrSet(
        'href',
        `https://github.com/poziel/frame/blob/main/${normalized.join('/')}`
      );
    }
  }
  return defaultLink
    ? defaultLink(tokens, index, options, environment, renderer)
    : renderer.renderToken(tokens, index, options);
};

/** Produces predictable Unicode-aware heading anchors. */
function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .trim()
    .replace(/\s+/g, '-');
}

/** Parses structure while keeping fenced code and arbitrary HTML inert. */
export function parseDocument(source: string, path?: string): ParsedDocument {
  const tokens = markdown.parse(source, {});
  const document: ParsedDocument = {title: '', introduction: [], sections: []};
  let blocks = document.introduction;
  let pending: typeof tokens = [];
  const anchors = new Map<string, number>();
  const flush = () => {
    if (pending.length)
      blocks.push({
        kind: 'html',
        html: markdown.renderer.render(pending, markdown.options, {path}),
      });
    pending = [];
  };
  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index]!;
    if (token.type === 'heading_open' && token.level === 0) {
      const title = tokens[index + 1]?.content ?? '';
      const base = slug(title),
        count = anchors.get(base) ?? 0;
      anchors.set(base, count + 1);
      token.attrSet('id', count ? `${base}-${count}` : base);
      if (token.tag === 'h1' && !document.title) {
        flush();
        document.title = title;
        index += 2;
        continue;
      }
      if (token.tag === 'h2') {
        flush();
        const id = tabIds[title] ?? base;
        if (document.sections.some((section) => section.id === id))
          throw new Error(`Duplicate documentation section: ${title}`);
        const section = {id, title, blocks: [] as DocumentBlock[]};
        document.sections.push(section);
        blocks = section.blocks;
        index += 2;
        continue;
      }
    }
    if (
      token.type === 'paragraph_open' &&
      token.level === 0 &&
      tokens[index + 1]?.type === 'inline'
    ) {
      const text = tokens[index + 1]!.content.trim();
      if (text.startsWith('<!-- frame:example')) {
        const match = text.match(/^<!-- frame:example id="([\w.-]+)" -->$/);
        if (!match) throw new Error(`Invalid live example marker: ${text}`);
        flush();
        blocks.push({kind: 'example', id: match[1]!});
        index += 2;
        continue;
      }
      if (/^<!--\s*\/?frame:generated\b[\s\S]*-->$/.test(text)) {
        index += 2;
        continue;
      }
    }
    if (token.type === 'fence' && token.level === 0) {
      flush();
      blocks.push({
        kind: 'code',
        code: token.content,
        language: token.info.trim().split(/\s+/)[0] || 'text',
      });
      continue;
    }
    pending.push(token);
  }
  flush();
  return document;
}

/** Resolves local Markdown links and anchors relative to their source file. */
export function resolveDocumentLink(
  current: string,
  href: string
): string | undefined {
  if (/^(?:[a-z][\w+.-]*:|\/\/)/i.test(href)) return undefined;
  const [path, fragment] = href.split('#', 2);
  if (path && !path.endsWith('.md')) return undefined;
  const segments = (
    path ? `${current.slice(0, current.lastIndexOf('/') + 1)}${path}` : current
  ).split('/');
  const normalized: string[] = [];
  for (const segment of segments) {
    if (segment === '..') normalized.pop();
    else if (segment && segment !== '.') normalized.push(segment);
  }
  const resolved = normalized.join('/').replace(/^docs\//, '');
  return resolved + (fragment === undefined ? '' : `#${fragment}`);
}
