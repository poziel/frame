import { writeFile } from "node:fs/promises";
import { bundledThemesInfo } from "shiki/themes";

const entries = bundledThemesInfo.map(theme => ({ ...theme, member: theme.id.split(/[^a-z0-9]+/i).map(part => part[0]!.toUpperCase() + part.slice(1)).join("") }));
if (new Set(entries.map(entry => entry.member)).size !== entries.length) throw new Error("Theme enum member collision");
const banner = "// Generated from Shiki's bundled themes by scripts/generate-code-themes.ts.\n";
await writeFile(new URL("../src/frame/codeThemes.ts", import.meta.url), banner +
  "export enum CodeBlockTheme {\n" + entries.map(theme => `  ${theme.member} = ${JSON.stringify(theme.id)},`).join("\n") + "\n}\n\n" +
  "export const codeBlockThemes: readonly CodeBlockTheme[] = Object.values(CodeBlockTheme);\n" +
  "export const codeBlockThemeOptions = [\n" + entries.map(theme => `  { value: CodeBlockTheme.${theme.member}, label: ${JSON.stringify(theme.displayName)}, type: ${JSON.stringify(theme.type)} },`).join("\n") + "\n] as const;\n");
await writeFile(new URL("../src/frame/codeThemeLoaders.ts", import.meta.url), banner +
  'import { CodeBlockTheme } from "./codeThemes";\n\nexport const codeThemeLoaders = {\n' +
  entries.map(theme => `  [CodeBlockTheme.${theme.member}]: () => import(${JSON.stringify("@shikijs/themes/" + theme.id)}),`).join("\n") + "\n};\n");
console.log(`Generated ${entries.length} public theme choices and lazy loaders.`);
