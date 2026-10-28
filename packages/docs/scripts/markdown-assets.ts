import {readFileSync, readdirSync} from 'node:fs';
import {resolve, relative} from 'node:path';
import type {Plugin} from 'vite';

/** Collects a repository-shaped Markdown tree so relative links work offline. */
export function consumerMarkdownAssets(root: string): Map<string, string> {
  const result = new Map<string, string>();
  const collect = (directory: string, readmesOnly: boolean) => {
    for (const item of readdirSync(resolve(root, directory), {
      withFileTypes: true,
    })) {
      if (item.isDirectory()) {
        if (
          ![
            'node_modules',
            'dist',
            'superpowers',
            'contributing',
            '.ai-workspace',
          ].includes(item.name)
        )
          collect(`${directory}/${item.name}`, readmesOnly);
        continue;
      }
      if (!item.isFile()) continue;
      const path = resolve(item.parentPath, item.name);
      const name = relative(root, path).replaceAll('\\', '/');
      if (
        (!name.endsWith('.md') &&
          !(name.startsWith('docs/licenses/') && name.endsWith('.txt'))) ||
        /\/(?:node_modules|dist|superpowers|contributing|\.ai-workspace)\//.test(
          name
        )
      )
        continue;
      if (readmesOnly && item.name !== 'README.md') continue;
      if (name === 'docs/components/component-documentation.md') continue;
      result.set(`markdown/${name}`, readFileSync(path, 'utf8'));
    }
  };
  collect('docs', false);
  collect('packages', true);
  result.set(
    'markdown/README.md',
    readFileSync(resolve(root, 'README.md'), 'utf8')
  );
  const entries = [...result.keys()]
    .filter((path) => path.endsWith('.md'))
    .sort();
  const index =
    '# Frame Markdown documentation\n\n' +
    entries.map((path) => `- [${path.slice(9)}](${path.slice(9)})`).join('\n') +
    '\n';
  result.set('markdown/index.md', index);
  result.set('markdown/llms.txt', index);
  result.set(
    'llms.txt',
    '# Frame\n\nConsumer documentation, generated from the same Markdown displayed on this website.\n\n' +
      entries.map((path) => `- [${path.slice(9)}](${path})`).join('\n') +
      '\n'
  );
  return result;
}

/** Publishes complete raw Markdown in production and serves it during dev. */
export function markdownAssets(root: string): Plugin {
  let base = '/';
  return {
    name: 'frame-markdown-assets',
    configResolved(config) {
      base = config.base;
    },
    generateBundle() {
      for (const [fileName, source] of consumerMarkdownAssets(root))
        this.emitFile({type: 'asset', fileName, source});
    },
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const url = new URL(request.url ?? '/', 'http://localhost');
        const path = decodeURIComponent(url.pathname)
          .replace(
            new RegExp(`^${base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`),
            ''
          )
          .replace(/^\//, '');
        if (!path.startsWith('markdown/') && path !== 'llms.txt') {
          next();
          return;
        }
        const source = consumerMarkdownAssets(root).get(path);
        if (source === undefined) {
          response.statusCode = 404;
          response.end('Markdown document not found.');
          return;
        }
        response.setHeader('Content-Type', 'text/plain; charset=utf-8');
        response.end(source);
      });
    },
  };
}
