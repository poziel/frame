import {existsSync, readFileSync, readdirSync} from 'node:fs';
import {dirname, extname, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import MarkdownIt from 'markdown-it';
import {parseDocument} from '../src/markdown/document';
import componentPages from '../src/markdown/componentPages.json';
import previews from '../src/markdown/previews.json';

/** A local destination extracted from Markdown syntax outside fenced code. */
export interface MarkdownLink {

  /** Authored destination including an optional fragment. */
  href: string;

  /** Source line for an actionable diagnostic. */
  line: number;
}

/** Structural Markdown data used for link and coverage validation. */
export interface MarkdownInventory {

  /** Heading fragments, including duplicate-heading suffixes. */
  anchors: Set<string>;

  /** Markdown links and images outside literal code. */
  links: MarkdownLink[];
}

/** Full validation result; legacy link debt is reported separately. */
export interface MarkdownValidation {

  /** New canonical content or migration coverage failures. */
  errors: string[];

  /** Existing noncanonical consumer documentation link failures. */
  warnings: string[];

  /** Number of consumer Markdown documents inspected. */
  documents: number;
}

const markdown = new MarkdownIt({html: false});
const repositoryRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../..'
);

/** Extracts actual AST links and the renderer's heading slug convention. */
export function inspectMarkdown(source: string): MarkdownInventory {
  const tokens = markdown.parse(source, {});
  const anchors = new Set<string>();
  const counts = new Map<string, number>();
  const links: MarkdownLink[] = [];
  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index]!;
    if (token.type === 'heading_open') {
      const title = tokens[index + 1]?.content ?? '';
      const base = title
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s_-]/gu, '')
        .trim()
        .replace(/\s+/g, '-');
      const count = counts.get(base) ?? 0;
      counts.set(base, count + 1);
      anchors.add(count ? `${base}-${count}` : base);
    }
    for (const child of token.children ?? []) {
      const href =
        child.type === 'link_open'
          ? child.attrGet('href')
          : child.type === 'image'
            ? child.attrGet('src')
            : undefined;
      if (href) links.push({href, line: (token.map?.[0] ?? 0) + 1});
    }
  }
  return {anchors, links};
}

/** Checks a local link against real files and Markdown heading fragments. */
export function validateLocalLink(
  sourcePath: string,
  href: string,
  root = repositoryRoot
): string | undefined {
  if (/^(?:[a-z][\w+.-]*:|\/\/|\/)/i.test(href)) return;
  const hash = href.indexOf('#');
  let path = hash < 0 ? href : href.slice(0, hash);
  let fragment = hash < 0 ? '' : href.slice(hash + 1);
  try {
    path = decodeURIComponent(path.split('?')[0]!);
    fragment = decodeURIComponent(fragment);
  } catch {
    return `invalid URL encoding: ${href}`;
  }
  const target = path ? resolve(dirname(sourcePath), path) : sourcePath;
  if (!existsSync(target))
    return `missing destination: ${relative(root, target)}`;
  if (fragment && extname(target).toLowerCase() === '.md') {
    const inventory = inspectMarkdown(readFileSync(target, 'utf8'));
    if (!inventory.anchors.has(fragment)) {
      return `missing fragment #${fragment} in ${relative(root, target)}`;
    }
  }
}

/** Lists maintained Markdown recursively without dependencies or build output. */
function markdownFiles(directory: string): string[] {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, {withFileTypes: true}).flatMap((entry) => {
    if (['node_modules', 'dist', '.ai-workspace', '.git'].includes(entry.name))
      return [];
    const path = resolve(directory, entry.name);
    return entry.isDirectory()
      ? markdownFiles(path)
      : entry.name.endsWith('.md')
        ? [path]
        : [];
  });
}

/** Validates migration inventory, live markers, and every consumer-local link. */
export function checkMarkdown(root = repositoryRoot): MarkdownValidation {
  const result: MarkdownValidation = {errors: [], warnings: [], documents: 0};
  const canonical = new Set(
    Object.values(componentPages).map((path) => resolve(root, 'docs', path))
  );
  const layoutIds = [
    'navigation-bar',
    'primary-sidebar',
    'secondary-sidebar',
    'panel',
    'menu-bar',
    'status-bar',
    'workspace',
    'docks',
  ];
  for (const id of layoutIds) {
    const path = resolve(root, `docs/layouts/${id}.md`);
    canonical.add(path);
    if (!existsSync(path))
      result.errors.push(`layouts/${id}.md: missing layout document`);
    else {
      const document = parseDocument(readFileSync(path, 'utf8'));
      if (
        document.sections.map((section) => section.title).join('|') !==
        'Features|APIs|Styling'
      ) {
        result.errors.push(
          `layouts/${id}.md: expected exactly Features, APIs, Styling H2 sections`
        );
      }
    }
  }
  for (const name of ['overview', 'how-it-works', 'getting-started', 'hosts']) {
    const path = resolve(root, `docs/guides/${name}.md`);
    if (!existsSync(path))
      result.errors.push(`guides/${name}.md: missing guide document`);
    if (name === 'overview' || name === 'how-it-works') canonical.add(path);
  }
  const previewIds = new Set(
    Object.entries(previews).flatMap(([page, examples]) =>
      Object.keys(examples).map((example) => `${page}.${example}`)
    )
  );
  for (const [id, path] of Object.entries(componentPages)) {
    const absolute = resolve(root, 'docs', path);
    if (!existsSync(absolute)) {
      result.errors.push(
        `${path}: missing canonical component document (${id})`
      );
      continue;
    }
    try {
      const document = parseDocument(readFileSync(absolute, 'utf8'));
      if (!document.title) result.errors.push(`${path}: missing H1 title`);
      if (
        document.sections.map((section) => section.title).join('|') !==
        'Features|APIs|Styling'
      ) {
        result.errors.push(
          `${path}: expected exactly Features, APIs, Styling H2 sections`
        );
      }
      for (const section of document.sections) {
        for (const block of section.blocks) {
          if (block.kind === 'example' && !previewIds.has(block.id)) {
            result.errors.push(`${path}: unknown live example ${block.id}`);
          }
        }
      }
    } catch (error) {
      result.errors.push(`${path}: ${String(error)}`);
    }
  }
  const consumers = markdownFiles(resolve(root, 'docs')).filter((path) => {
    const key = relative(resolve(root, 'docs'), path).replaceAll('\\', '/');
    return (
      !key.startsWith('contributing/') &&
      !key.startsWith('superpowers/') &&
      key !== 'components/component-documentation.md'
    );
  });
  const packageReadmes = markdownFiles(resolve(root, 'packages')).filter(
    (path) => path.endsWith('README.md')
  );
  for (const path of [...consumers, ...packageReadmes]) {
    result.documents++;
    const diagnostics = canonical.has(path) ? result.errors : result.warnings;
    for (const link of inspectMarkdown(readFileSync(path, 'utf8')).links) {
      const problem = validateLocalLink(path, link.href, root);
      if (problem)
        diagnostics.push(
          `${relative(root, path)}:${link.line}: ${problem} (${link.href})`
        );
    }
  }
  return result;
}

if (import.meta.main) {
  const result = checkMarkdown();
  for (const warning of result.warnings)
    console.warn(`Legacy link: ${warning}`);
  for (const error of result.errors) console.error(error);
  console.log(
    `${result.documents} Markdown documents checked; ${result.errors.length} errors; ${result.warnings.length} legacy link warnings.`
  );
  process.exitCode = result.errors.length ? 1 : 0;
}
