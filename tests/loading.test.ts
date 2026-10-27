import { expect, test } from "bun:test";
import { createRequire } from "node:module";
import { frameLoaderVariants } from "../packages/core/src/components/feedback/loading";

test("the loader catalog exposes every installed LDRS web component", async () => {
  const require = createRequire(new URL("../packages/core/package.json", import.meta.url));
  const declarations = await Bun.file(require.resolve("ldrs").replace(/\.js$/, ".d.ts")).text();
  const exported = [...declarations.matchAll(/default as (\w+)/g)].map(match => match[1]!.replace(/([a-z])([A-Z0-9])/g, "$1-$2").toLowerCase()).sort();
  expect([...frameLoaderVariants].sort()).toEqual(exported);
  expect(new Set(frameLoaderVariants).size).toBe(44);
});
