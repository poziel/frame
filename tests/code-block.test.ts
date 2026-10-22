import { expect, test } from "bun:test";
import { themeNames } from "../packages/core/node_modules/@shikijs/themes";
import { CodeBlockTheme, codeBlockThemes } from "../packages/core/src/frame/codeThemes";
import { codeStartLine, plainCodeLines } from "../packages/core/src/frame/codeBlock";
import { highlightCode } from "../packages/core/src/frame/codeHighlight";

test("the public theme enum exposes every installed Shiki theme", () => {
  expect([...codeBlockThemes].sort()).toEqual([...themeNames].sort());
});

test("plain code preserves blank and trailing lines while normalizing line endings for display", () => {
  expect(plainCodeLines("one\r\n\r\ntwo\r").map(line => line[0]!.content)).toEqual(["one", "", "two", ""]);
  expect(plainCodeLines("")).toEqual([[{ content: "" }]]);
});

test("line-number offsets stay positive and integral", () => {
  expect([codeStartLine(-5), codeStartLine(0), codeStartLine(40.8), codeStartLine(NaN), codeStartLine(Infinity)]).toEqual([1, 1, 40, 1, 1]);
});

test("Shiki tokenizes source and themes without modifying displayed code", async () => {
  const code = 'const greeting = "Hello";\n';
  const dark = await highlightCode(code, "typescript", CodeBlockTheme.DarkPlus);
  const light = await highlightCode(code, "ts", CodeBlockTheme.LightPlus);
  expect(dark.lines.map(line => line.map(token => token.content).join("")).join("\n")).toBe(code);
  expect(new Set(dark.lines.flat().map(token => token.color)).size).toBeGreaterThan(1);
  expect(dark.background).not.toBe(light.background);
});

test("unknown and inherited-object language names fall back to literal source", async () => {
  for (const language of ["not-a-language", "__proto__", "constructor", "text"]) {
    const result = await highlightCode('<img onerror="execute()">', language, CodeBlockTheme.DarkPlus);
    expect(result.lines.flat().map(token => token.content).join("")).toBe('<img onerror="execute()">');
  }
});
