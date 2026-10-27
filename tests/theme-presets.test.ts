import {expect, test} from 'bun:test';
import {existsSync, readFileSync} from 'node:fs';
import {parseTheme} from '../packages/core/src/themes/theme';
import {themeTokens} from '../packages/core/src/themes/tokens/tokenCatalog';

const presetPath = 'packages/themes/src/presets/vscode-light-2026.json';
test('Light 2026 is an importable preset with the upstream palette and no dark color fallbacks', () => {
  expect(existsSync(presetPath)).toBe(true);
  const theme = parseTheme(readFileSync(presetPath, 'utf8'));
  expect(theme.appearance).toBe('light');
  expect(theme.tokens['--frame-bg']).toBe('#FAFAFD');
  expect(theme.tokens['--frame-canvas']).toBe('#FFFFFF');
  expect(theme.tokens['--frame-text']).toBe('#202020');
  expect(theme.tokens['--frame-accent']).toBe('#0069CC');
  for (const [name, definition] of Object.entries(themeTokens)) {
    if (definition.kind === 'color')
      expect(theme.tokens[name as keyof typeof theme.tokens]).toBeDefined();
  }
});
test('preset provenance ties mapped colors to a pinned upstream revision', () => {
  const provenance = JSON.parse(
    readFileSync('packages/themes/provenance/vscode-light-2026.json', 'utf8')
  );
  const theme = parseTheme(readFileSync(presetPath, 'utf8'));
  expect(provenance.revision).toMatch(/^[a-f0-9]{40}$/);
  for (const [token, source] of Object.entries(provenance.mapping)) {
    expect(theme.tokens[token as keyof typeof theme.tokens]).toBe(
      provenance.colors[source as string]
    );
  }
});

function contrast(first: string, second: string) {
  const luminance = (hex: string) => {
    const rgb = [1, 3, 5]
      .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return rgb[0]! * 0.2126 + rgb[1]! * 0.7152 + rgb[2]! * 0.0722;
  };
  const a = luminance(first),
    b = luminance(second);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
test('Frame Dusk validates as a dark preset with readable surfaces and accent text', () => {
  const theme = parseTheme(
    readFileSync('packages/themes/src/presets/frame-dusk.json', 'utf8')
  );
  expect(theme.id).toBe('frame-dusk');
  expect(theme.appearance).toBe('dark');
  for (const surface of [
    '--frame-bg',
    '--frame-surface',
    '--frame-canvas',
  ] as const) {
    expect(
      contrast(theme.tokens['--frame-text']!, theme.tokens[surface]!)
    ).toBeGreaterThan(7);
    expect(
      contrast(theme.tokens['--frame-muted']!, theme.tokens[surface]!)
    ).toBeGreaterThan(4.5);
  }
  expect(
    contrast(
      theme.tokens['--frame-accent']!,
      theme.tokens['--frame-accent-foreground']!
    )
  ).toBeGreaterThan(7);
  expect(
    contrast(
      theme.tokens['--frame-list-selection-background']!,
      theme.tokens['--frame-list-selection-foreground']!
    )
  ).toBeGreaterThan(4.5);
});
for (const mode of ['dark', 'light'] as const) {
  test(`Frame Monokai ${mode} covers all color tokens and readable interaction states`, () => {
    const theme = parseTheme(
      readFileSync(
        `packages/themes/src/presets/frame-monokai-${mode}.json`,
        'utf8'
      )
    );
    expect(theme.id).toBe(`frame-monokai-${mode}`);
    expect(theme.appearance).toBe(mode);
    for (const [name, definition] of Object.entries(themeTokens)) {
      if (definition.kind === 'color')
        expect(theme.tokens[name as keyof typeof theme.tokens]).toBeDefined();
    }
    for (const surface of [
      '--frame-bg',
      '--frame-surface',
      '--frame-canvas',
      '--frame-menu-background',
      '--frame-control-background',
    ] as const) {
      expect(
        contrast(theme.tokens['--frame-text']!, theme.tokens[surface]!)
      ).toBeGreaterThan(7);
      expect(
        contrast(theme.tokens['--frame-muted']!, theme.tokens[surface]!)
      ).toBeGreaterThan(4.5);
    }
    for (const [background, foreground] of [
      [
        '--frame-button-primary-background',
        '--frame-button-frame-button-primary-color',
      ],
      [
        '--frame-list-selection-background',
        '--frame-list-selection-foreground',
      ],
      [
        '--frame-command-result-active-background',
        '--frame-command-result-active-color',
      ],
      ['--frame-switch-on-background', '--frame-switch-on-span-background'],
    ] as const)
      expect(
        contrast(theme.tokens[background]!, theme.tokens[foreground]!)
      ).toBeGreaterThan(4.5);
    const exports = JSON.parse(
      readFileSync('packages/themes/package.json', 'utf8')
    ).exports;
    expect(exports[`./frame-monokai-${mode}.json`]).toBe(
      `./src/presets/frame-monokai-${mode}.json`
    );
  });
}
for (const [id, bg, text] of [
  ['vscode-high-contrast-black', '#000000', '#FFFFFF'],
  ['vscode-high-contrast-white', '#FFFFFF', '#292929'],
] as const) {
  test(`${id} is complete, importable, and has contrasting text, buttons and boundaries`, () => {
    const theme = parseTheme(
      readFileSync(`packages/themes/src/presets/${id}.json`, 'utf8')
    );
    expect(theme.tokens['--frame-bg']).toBe(bg);
    expect(theme.tokens['--frame-text']).toBe(text);
    for (const [name, definition] of Object.entries(themeTokens))
      if (definition.kind === 'color')
        expect(theme.tokens[name as keyof typeof theme.tokens]).toBeDefined();
    expect(contrast(text, bg)).toBeGreaterThan(7);
    expect(
      contrast(
        theme.tokens['--frame-button-primary-background']!,
        theme.tokens['--frame-button-frame-button-primary-color']!
      )
    ).toBeGreaterThan(7);
    expect(contrast(theme.tokens['--frame-border-color']!, bg)).toBeGreaterThan(
      3
    );
    const provenance = JSON.parse(
      readFileSync(`packages/themes/provenance/${id}.json`, 'utf8')
    );
    for (const [token, source] of Object.entries(provenance.mapping))
      expect(theme.tokens[token as keyof typeof theme.tokens]).toBe(
        provenance.colors[source as string]
      );
    expect(provenance.registrySources.length).toBeGreaterThan(0);
  });
}
