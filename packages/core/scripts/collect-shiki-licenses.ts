import { dirname, join, resolve } from "node:path";
import { readFileSync, readdirSync, existsSync, writeFileSync } from "node:fs";

const seen = new Set<string>();
const notices: string[] = [];
function collect(name: string, from: string) {
  if (name.startsWith("@types/")) return;
  let dir = dirname(Bun.resolveSync(name, from));
  while (!existsSync(join(dir, "package.json")) || JSON.parse(readFileSync(join(dir, "package.json"), "utf8")).name !== name) {
    const parent = dirname(dir);
    if (parent === dir) throw new Error(`Cannot find package metadata: ${name}`);
    dir = parent;
  }
  const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
  const key = `${name}@${pkg.version}`;
  if (seen.has(key)) return;
  seen.add(key);
  const licenses = readdirSync(dir).filter(file => /^(licen[cs]e|copying)([.-]|$)/i.test(file));
  if (!licenses.length) throw new Error(`Missing license: ${key}`);
  notices.push(`${key}\n${licenses.map(file => readFileSync(join(dir, file), "utf8")).join("\n")}\n`);
  for (const dep of Object.keys(pkg.dependencies ?? {})) collect(dep, dir);
}
collect("shiki", resolve(import.meta.dir, ".."));
writeFileSync(resolve(import.meta.dir, "../../../docs/licenses/shiki.txt"), notices.join("\n---\n\n"));
console.log(`Collected ${seen.size} Shiki dependency licenses`);
