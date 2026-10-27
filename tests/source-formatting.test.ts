import {expect, test} from 'bun:test';
import {fileURLToPath} from 'node:url';
import {SourceFormatter} from '../scripts/sourceFormatter';

const formatter = new SourceFormatter(
  fileURLToPath(new URL('../.prettierrc.json', import.meta.url))
);

test('the broad formatter retains documented class and interface spacing', async () => {
  const source =
    "import type {Thing} from './thing';\ninterface Options {\n/** Identifier. */\nid:string;\n/** Label. */\nlabel:string;\n}\nclass Controller {\n/** State. */\nstate=false;\n/** Updates state.\n * @param value - New state.\n */\nset(value:boolean){this.state=value}\n}";
  const result = await formatter.format(source, 'controller.ts');
  expect(result).toContain("from './thing';\n\ninterface Options {\n\n");
  expect(result).toContain('id: string;\n\n  /** Label. */');
  expect(result).toContain('class Controller {\n\n');
  expect(result).toContain('state = false;\n\n  /**');
  expect(result).toContain('@param value - New state.');
  expect(await formatter.format(result, 'controller.ts')).toBe(result);
});

test('the broad formatter integrates the parameter rule in the same pipeline', async () => {
  const result = await formatter.format(
    'function f(a,b,c,d,e,f,g){}\nfunction small(\na:number,\nb:number\n){}',
    'functions.ts'
  );
  expect(result).toContain(
    'function f(\n  a,\n  b,\n  c,\n  d,\n  e,\n  f,\n  g\n)'
  );
  expect(result).toContain('function small(a: number, b: number)');
  expect(await formatter.format(result, 'functions.ts')).toBe(result);
});

test('Vue scripts, templates and styles use the complete project conventions', async () => {
  const source =
    '<script setup lang="ts">\ninterface Props {\n/** Label. */\nlabel:string\n}\n</script>\n<template><button type="button">{{label}}</button></template>\n<style scoped>.control{color:var(--frame-text);padding:0}</style>';
  const result = await formatter.format(source, 'Control.vue');
  expect(result).toContain('interface Props {\n\n  /** Label. */');
  expect(result).toContain('{{ label }}');
  expect(result).toContain('color: var(--frame-text);');
  expect(await formatter.format(result, 'Control.vue')).toBe(result);
});

test('CSS formatting preserves declaration order and custom properties', async () => {
  const result = await formatter.format(
    '.control{padding:8px;padding-left:0;color:var(--frame-text)}',
    'control.css'
  );
  expect(result).toContain(
    '  padding: 8px;\n  padding-left: 0;\n  color: var(--frame-text);'
  );
  expect(await formatter.format(result, 'control.css')).toBe(result);
});

test('HTML formatting preserves significant inline whitespace', async () => {
  const result = await formatter.format(
    '<p><span>first</span> <span>second</span></p>',
    'example.html'
  );
  expect(result).toContain('</span> <span>');
  expect(await formatter.format(result, 'example.html')).toBe(result);
});

test('Markdown examples are not silently reformatted by a different embedded style', async () => {
  const code = 'class Example {\n\n  value = 1;\n\n  run(a, b) {}\n}';
  const result = await formatter.format(
    '# Example\n\n```ts\n' + code + '\n```\n',
    'example.md'
  );
  expect(result).toContain(code);
  expect(await formatter.format(result, 'example.md')).toBe(result);
});

test('member spacing preserves comments belonging to preceding fields', async () => {
  const source =
    'class Example {\n first=1; // first note\n /** Second field. */\n second=2; /* second note */\n third=3;\n}';
  const result = await formatter.format(source, 'comments.ts');
  expect(result).toContain(
    'first = 1; // first note\n\n  /** Second field. */'
  );
  expect(result).toContain('second = 2; /* second note */\n\n  third = 3;');
  expect(await formatter.format(result, 'comments.ts')).toBe(result);
});

test('Vue TSX scripts retain JSX while applying class member conventions', async () => {
  const source =
    '<script setup lang="tsx">\nconst content = <span>text</span>;\nclass State{first=1;second=2}\n</script>\n<template><div /></template>';
  const result = await formatter.format(source, 'JsxControl.vue');
  expect(result).toContain('<span>text</span>');
  expect(result).toContain('class State {\n\n  first = 1;\n\n  second = 2;');
  expect(await formatter.format(result, 'JsxControl.vue')).toBe(result);
});
