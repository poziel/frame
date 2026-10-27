import {expect, test} from 'bun:test';
import {ParameterFormatter} from '../scripts/parameterFormatter';

const formatter = new ParameterFormatter();

test('short definitions, constructors and signatures compact up to six parameters', () => {
  const source =
    'function f(\n a: number,\n b: string\n) {}\n' +
    'class C {\n  constructor(\n    a: number,\n    b: number\n  ) {}\n}\n' +
    'type F = (\n a: number,\n b: number\n) => void;';
  const result = formatter.format(source, 'example.ts');
  expect(result).toContain('function f(a: number, b: string) {}');
  expect(result).toContain('constructor(a: number, b: number) {}');
  expect(result).toContain('type F = (a: number, b: number) => void;');
  expect(formatter.format(result, 'example.ts')).toBe(result);
});

test('seven parameters wrap even when the complete signature would fit', () => {
  const source = 'function f(a, b, c, d, e, f, g) {}';
  expect(formatter.format(source, 'example.js')).toBe(
    'function f(\n  a,\n  b,\n  c,\n  d,\n  e,\n  f,\n  g\n) {}'
  );
});

test('six parameters remain inline but long signatures wrap earlier', () => {
  expect(
    formatter.format('function f(\na,\nb,\nc,\nd,\ne,\nf\n) {}', 'example.js')
  ).toBe('function f(a, b, c, d, e, f) {}');
  const source =
    'function configure(firstConfiguration: Configuration, secondConfiguration: Configuration) {}';
  expect(formatter.format(source, 'example.ts')).toContain(
    '(\n  firstConfiguration: Configuration,\n  secondConfiguration: Configuration\n)'
  );
});

test('comments and multiline literals retain their exact contents', () => {
  const source =
    'function f(\n a = `first\n  second`,\n // parameter note\n b = "https://example.com/a  b"\n) {}';
  const result = formatter.format(source, 'example.ts');
  expect(result).toContain('`first\n  second`');
  expect(result).toContain('// parameter note');
  expect(result).toContain('"https://example.com/a  b"');
  expect(formatter.format(result, 'example.ts')).toBe(result);
});

test('formatting preserves multiline default-function behavior and call arguments', () => {
  const source =
    'function f(\n callback = () => { return\n  3; }\n) {}\nf(\n one,\n two\n);';
  const result = formatter.format(source, 'example.ts');
  expect(result).toContain('return\n  3;');
  expect(result).toContain('f(\n one,\n two\n);');
});

test('nested function parameters settle without overlapping edits', () => {
  const source =
    'function f(\n callback: (\n a: number,\n b: number\n ) => void\n) {}';
  const result = formatter.format(source, 'example.ts');
  expect(result).toBe(
    'function f(callback: (a: number, b: number) => void) {}'
  );
  expect(formatter.format(result, 'example.ts')).toBe(result);
});

test('Vue formatting changes scripts without changing templates, styles or class spacing', () => {
  const source =
    '<script setup lang="ts">\nclass A {\n\n  /** Action docs. */\n  f(\n    a: number,\n    b: number\n  ) {}\n}\n</script>\n' +
    '<template><p>keep  this spacing</p></template>\n<style>p { color: red; }</style>';
  const result = formatter.format(source, 'Example.vue');
  expect(result).toContain(
    'class A {\n\n  /** Action docs. */\n  f(a: number, b: number) {}'
  );
  expect(result).toContain('<template><p>keep  this spacing</p></template>');
  expect(result).toContain('<style>p { color: red; }</style>');
});
