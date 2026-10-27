import { readFile, mkdir, cp } from "node:fs/promises";
const coreRoot = new URL("../packages/core/", import.meta.url);
// Multi-entry builds can put the main entry's implementation in shared chunks.
// Follow static imports/re-exports; lazy syntax grammars are checked separately.
const visited = new Set<string>();
async function readStaticGraph(url: URL): Promise<string> {
  if (visited.has(url.href)) return '';
  visited.add(url.href);
  const source = await readFile(url, 'utf8');
  const imports = [...source.matchAll(/(?:\bfrom\s*|\bimport\s*)["'](\.[^"']+\.js)["']/g)];
  return source + '\n' + (await Promise.all(imports.map(match => readStaticGraph(new URL(match[1]!, url))))).join('\n');
}
const source = await readStaticGraph(new URL("dist/frame.js", coreRoot));
// Token names are shared with modules; implementations and selectors are isolated.
const implementation = source.replace(/--frame-[\w-]+/g, '');
for (const marker of ["FRAME COMPONENTS", "Find a component…", "The demo preferences are live", "Personal workspace", "Sample tools", "@frame/features", "notification-center", "Notification history"]) {
  if (implementation.includes(marker)) throw new Error(`Optional module or documentation leaked into the main Core entry: ${marker}`);
}
const css = await readFile(new URL("dist/frame.css", coreRoot), "utf8");
if (css.includes(".notification-center") || css.includes(".notification-list")) throw new Error("Optional notification panel CSS leaked into the main Core entry");
await mkdir(new URL("licenses/", coreRoot), { recursive: true });
await cp(new URL("../docs/licenses/", import.meta.url), new URL("licenses/", coreRoot), { recursive: true });
console.log("Core package boundary verified: no optional notification panel, catalog, documentation pages, or demo status content.");
