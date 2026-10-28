import {expect, test} from 'bun:test';
import {readFileSync, readdirSync} from 'node:fs';
import {
  defineTheme,
  parseTheme,
  parseThemeFile,
} from '../packages/core/src/themes/theme';
import {themeTokens} from '../packages/core/src/themes/tokens/tokenCatalog';
import {compileStyleSource} from '../packages/core/scripts/compile-style-source';

const metadata = {
  version: 1 as const,
  id: 'formats',
  name: 'Formats',
  appearance: 'dark' as const,
};
test('nested, dotted, mixed and CSS token keys normalize identically', () => {
  for (const tokens of [
    {frame: {text: {input: {padding: '24px'}}}},
    {'frame.text': {'input.padding': '24px'}},
    {'frame.text.input.padding': '24px'},
    {'--frame-text-input-padding': '24px'},
  ]) {
    const theme = defineTheme({...metadata, tokens});
    expect(theme.tokens).toEqual({'--frame-text-input-padding': '24px'});
    expect(Object.isFrozen(theme.tokens)).toBe(true);
  }
});

test('all six Confbox formats produce the same tokens from bare documents', () => {
  for (const [format, text] of [
    ['json', '{"frame":{"text":{"input":{"padding":"24px"}}}}'],
    ['jsonc', '{/* theme */ "frame.text.input.padding": "24px",}'],
    ['json5', "{ 'frame.text.input.padding': '24px', }"],
    ['yaml', 'frame:\n  text:\n    input:\n      padding: 24px\n'],
    ['toml', '[frame.text.input]\npadding = "24px"\n'],
    ['ini', '[frame.text.input]\npadding = 24px\n'],
  ] as const) {
    const theme = parseTheme(text, {format, ...metadata});
    expect(theme.tokens).toEqual({'--frame-text-input-padding': '24px'});
    expect(theme.id).toBe('formats');
  }
});

test('version-1 envelopes accept paths and keep their metadata', () => {
  const theme = parseTheme(
    JSON.stringify({...metadata, tokens: {'frame.accent': '#123456'}})
  );
  expect(theme.id).toBe('formats');
  expect(theme.tokens['--frame-accent']).toBe('#123456');
  expect(parseTheme('{"frame.accent":"#123456"}').id).toBe('custom');
});

test('INI envelopes normalize version metadata without coercing token leaves', () => {
  const theme = parseTheme(
    'version=1\nid=ini-theme\nname=INI theme\nappearance=dark\n[tokens.frame.text.input]\npadding=24px\n',
    {format: 'ini'}
  );
  expect(theme.id).toBe('ini-theme');
  expect(theme.tokens['--frame-text-input-padding']).toBe('24px');
  expect(
    parseTheme('frame.accent: "#123456"', {format: 'yml'}).tokens[
      '--frame-accent'
    ]
  ).toBe('#123456');
});

test('file imports infer supported extensions and allow an explicit format', async () => {
  for (const extension of ['yaml', 'yml', 'YAML']) {
    const file = new File(
      ['frame.text.input.padding: 24px'],
      `theme.${extension}`
    );
    expect(
      (await parseThemeFile(file)).tokens['--frame-text-input-padding']
    ).toBe('24px');
  }
  expect(
    (
      await parseThemeFile(
        new File(['{"frame.accent":"#123456"}'], 'theme.txt'),
        {format: 'json', id: 'uploaded'}
      )
    ).id
  ).toBe('uploaded');
  await expect(
    parseThemeFile(new File(['<frame/>'], 'theme.xml'))
  ).rejects.toThrow('format');
  await expect(
    parseThemeFile({
      name: 'huge.json',
      size: 131073,
      text() {
        throw Error('must not read');
      },
    })
  ).rejects.toThrow('128 KiB');
});

test('YAML cycles, excessive nesting, resources, and oversized files fail', () => {
  expect(() =>
    parseTheme('frame: &cycle\n  text: *cycle', {format: 'yaml'})
  ).toThrow('cyclic');
  let tokens: any = {padding: '24px'};
  for (let i = 0; i < 50; i++) tokens = {frame: tokens};
  expect(() => defineTheme({...metadata, tokens})).toThrow('48');
  expect(() => parseTheme(' '.repeat(131073), {format: 'toml'})).toThrow(
    '128 KiB'
  );
  expect(() =>
    parseTheme('{"frame.text.input.padding":"url(https://example.com)"}')
  ).toThrow('unsupported CSS');
});

test('every catalog token also accepts its dotted spelling', () => {
  const tokens = Object.fromEntries(
    Object.entries(themeTokens).map(([name, entry]) => [
      name.slice(2).replaceAll('-', '.'),
      entry.value || 'inherit',
    ])
  );
  const result = defineTheme({...metadata, tokens});
  expect(Object.keys(result.tokens).length).toBe(
    Object.keys(themeTokens).length
  );
  expect(result.tokens['--frame-text-input-padding']).toBe('inherit');
});

test('ambiguous, unsupported and non-object trees fail with useful paths', () => {
  for (const tokens of [
    {'frame.accent': '#fff', frame: {accent: '#000'}},
    {'frame.accent': '#fff', '--frame-accent': '#fff'},
    {'frame..accent': '#fff'},
    {'frame.unknown': '#fff'},
    {frame: ['#fff']},
    {frame: null},
    {'frame.accent': 12},
    JSON.parse('{"__proto__":{"polluted":"yes"}}'),
  ])
    expect(() => defineTheme({...metadata, tokens} as any)).toThrow();
  const cycle: any = {};
  cycle.frame = cycle;
  expect(() => defineTheme({...metadata, tokens: cycle})).toThrow();
  expect(() => parseTheme('frame: [', {format: 'yaml'})).toThrow('yaml');
  expect(() => parseTheme('{}', {format: 'xml' as any})).toThrow('format');
});

test('component tokens validate syntax and support references without loading resources', () => {
  expect(
    defineTheme({
      ...metadata,
      tokens: {
        'frame.text.input.padding': 'calc(var(--frame-spacing-unit) * 3) 8px',
      },
    }).tokens['--frame-text-input-padding']
  ).toContain('calc(');
  for (const value of [
    'url(https://example.com)',
    '1px; color:red',
    'var(--does-not-exist)',
    'calc(2px',
    'var(--frame-text-input-padding)',
  ]) {
    expect(() =>
      defineTheme({...metadata, tokens: {'frame.text.input.padding': value}})
    ).toThrow();
  }
});

test('component image functions cannot load external resources through quoted candidates', () => {
  for (const value of [
    'image-set("https://example.com/track.png" 1x)',
    '-webkit-image-set("https://example.com/track.png" 1x)',
    'image("https://example.com/track.png")',
    'src("https://example.com/track.png")',
  ])
    expect(() =>
      defineTheme({...metadata, tokens: {'frame.workspace.tab.strip': value}})
    ).toThrow('unsupported CSS');
});

test('every authored or emitted Frame CSS variable in Core has a token', () => {
  const missing = new Set<string>();
  for (const root of ['packages/core/src']) {
    for (const file of readdirSync(root, {recursive: true})
      .map(String)
      .filter((f) => /\.(s?css|vue|ts)$/.test(f) && !f.startsWith('themes'))) {
      const source = readFileSync(`${root}/${file}`, 'utf8');
      const css = /\.(scss|vue)$/.test(file)
        ? compileStyleSource(`${root}/${file}`)
        : '';
      for (const match of (source + '\n' + css).matchAll(/--frame-[\w-]+/g)) {
        if (!Object.hasOwn(themeTokens, match[0])) missing.add(match[0]);
      }
    }
  }
  expect([...missing].sort()).toEqual([]);
});
