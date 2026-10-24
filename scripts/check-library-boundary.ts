import { readFile, mkdir, cp } from "node:fs/promises";
const coreRoot = new URL("../packages/core/", import.meta.url);
const source = await readFile(new URL("dist/frame.js", coreRoot), "utf8");
// Shared token names may describe optional Features; their implementations and
// selectors must still stay out of Core. Ignore only the CSS variable names.
const implementation = source.replace(/--frame-[\w-]+/g, '');
for (const marker of ["FRAME COMPONENTS", "Find a component…", "The demo preferences are live", "Personal workspace", "Sample tools", "@frame/features", "notification-center", "Notification history"]) {
  if (implementation.includes(marker)) throw new Error(`Documentation leaked into core: ${marker}`);
}
const css = await readFile(new URL("dist/frame.css", coreRoot), "utf8");
if (css.includes(".notification-center") || css.includes(".notification-list")) throw new Error("Optional notification panel CSS leaked into core");
await mkdir(new URL("licenses/", coreRoot), { recursive: true });
await cp(new URL("../docs/licenses/", import.meta.url), new URL("licenses/", coreRoot), { recursive: true });
console.log("Core package boundary verified: no optional notification panel, catalog, documentation pages, or demo status content.");
