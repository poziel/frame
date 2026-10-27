import { build } from 'vite';
import { resolve } from 'node:path';

// Build the public, already compiled package as an application would. Keep a real
// value from each entry so the bundler cannot erase the entire fixture.
const cases = [
  { name: 'notifications', entry: '@frame/core/modules/notifications', value: 'NotificationPanel', forbidden: ['monaco-editor', '@xterm/', 'pdfjs-dist', 'markdown-it', '/modules/editor', '/modules/terminal', '/modules/chat'] },
  { name: 'core', entry: '@frame/core', value: 'createFrame', forbidden: ['monaco-editor', '@xterm/', 'pdfjs-dist', 'markdown-it', '/modules/'] },
  { name: 'editor', entry: '@frame/core/modules/editor', value: 'CodeEditor', forbidden: ['@xterm/', 'pdfjs-dist', 'markdown-it', '/modules/terminal', '/modules/chat'] },
  { name: 'editor-installed', entry: '@frame/core/modules/editor', value: 'editorModule', forbidden: ['@xterm/', 'pdfjs-dist', 'markdown-it', '/modules/terminal', '/modules/chat'] },
  { name: 'terminal', entry: '@frame/core/modules/terminal', value: 'Terminal', forbidden: ['monaco-editor', 'pdfjs-dist', 'markdown-it', '/modules/editor', '/modules/chat'] },
  { name: 'chat', entry: '@frame/core/modules/chat', value: 'AIChat', forbidden: ['monaco-editor', '@xterm/', '/modules/editor', '/modules/terminal'] },
  { name: 'viewer', entry: '@frame/core/modules/viewer', value: 'UniversalViewer', forbidden: ['monaco-editor', '@xterm/', 'markdown-it', '/modules/editor', '/modules/terminal'] },
];
for (const fixture of cases) {
  const result = await build({
    configFile: false,
    root: resolve('.'),
    logLevel: 'error',
    plugins: [{
      name: 'frame-module-consumer',
      resolveId(id) { if (id === 'frame-consumer') return '\0frame-consumer'; },
      load(id) { if (id === '\0frame-consumer') return fixture.name === 'editor-installed' ? `import { createFrame } from '@frame/core'; import { editorModule } from '${fixture.entry}'; globalThis.frameConsumer = createFrame().use(editorModule);` : `import { ${fixture.value} } from '${fixture.entry}'; globalThis.frameConsumer = ${fixture.value};`; },
    }],
    build: { write: false, minify: false, cssCodeSplit: true, rolldownOptions: { input: 'frame-consumer' } },
  });
  if (Array.isArray(result) || !('output' in result)) throw new Error('Unexpected build result');
  const chunks = result.output.filter(item => item.type === 'chunk');
  const byName = new Map(chunks.map(chunk => [chunk.fileName, chunk]));
  const eager = new Set<string>();
  function visit(name: string) {
    if (eager.has(name)) return;
    eager.add(name);
    byName.get(name)?.imports.forEach(visit);
  }
  chunks.filter(chunk => chunk.isEntry).forEach(chunk => visit(chunk.fileName));
  const graph = chunks.flatMap(chunk => Object.keys(chunk.modules)).join('\n').replaceAll('\\', '/');
  for (const marker of fixture.forbidden) if (graph.includes(marker)) throw new Error(`${fixture.name} consumer included unrelated dependency: ${marker}`);
  const css = result.output.filter(item => item.type === 'asset' && item.fileName.endsWith('.css')).map(item => String(item.source)).join('\n');
  if (fixture.name !== 'terminal' && /\.frame-terminal(?:[\s.{:-])/.test(css)) throw new Error(`${fixture.name} includes terminal CSS`);
  if (!fixture.name.startsWith('editor') && css.includes('.frame-code-editor')) throw new Error(`${fixture.name} includes editor CSS`);
  if (fixture.name !== 'chat' && css.includes('.frame-ai-chat')) throw new Error(`${fixture.name} includes chat CSS`);
  if (fixture.name !== 'core' && !css.length) throw new Error(`${fixture.name} lost its automatic stylesheet imports`);
  if (fixture.name.startsWith('editor')) {
    const monaco = chunks.filter(chunk => Object.keys(chunk.modules).some(id => id.includes('monaco-editor')));
    if (!monaco.length || monaco.some(chunk => eager.has(chunk.fileName))) throw new Error('Editor engine must be present in lazy chunks');
  }
  if (['viewer', 'chat'].includes(fixture.name)) {
    const pdf = chunks.filter(chunk => Object.keys(chunk.modules).some(id => id.includes('pdfjs-dist') || /ViewerPdf-/.test(id)));
    if (!pdf.length || pdf.some(chunk => eager.has(chunk.fileName))) throw new Error('PDF engine must be present in lazy chunks');
  }
  const initialBytes = chunks.filter(chunk => eager.has(chunk.fileName)).reduce((
    sum,
    chunk
  ) => sum + Buffer.byteLength(chunk.code), 0);
  console.log(`${fixture.name}: isolated production build passed (${Math.round(initialBytes / 1024)} KiB initial JS before minification; engines checked for lazy loading)`);
}
