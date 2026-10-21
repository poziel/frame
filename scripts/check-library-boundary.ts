import { readFile, mkdir, cp } from "node:fs/promises";
const source = await readFile("packages/frame/dist/frame.js", "utf8");
for (const marker of ["FRAME COMPONENTS", "Find a component…", "The demo preferences are live", "Personal workspace", "Sample tools"]) {
  if (source.includes(marker)) throw new Error(`Documentation leaked into core: ${marker}`);
}
await mkdir("packages/frame/licenses", { recursive: true });
await cp("public/licenses", "packages/frame/licenses", { recursive: true });
console.log("Core package boundary verified: no catalog, documentation pages, or demo status content.");
