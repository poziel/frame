import {shellThemeTokens} from './shellDefaults';
import {componentTokenNames} from '../generated/componentTokens';

/** Validation grammar selected for each token default. */
export type ThemeValueKind =
  | 'color'
  | 'length'
  | 'tracking'
  | 'family'
  | 'weight'
  | 'lineHeight'
  | 'shadow'
  | 'duration'
  | 'ease'
  | 'filter'
  | 'css';

/** Creates an immutable catalog entry with its default and validation kind. */
const token = (value: string, kind: ThemeValueKind) =>
  Object.freeze({value, kind});
/** Type scale expressed relative to the shared body font size. */
const textSizes = {
  xs: 5 / 6,
  sm: 11 / 12,
  base: 1,
  lg: 7 / 6,
  xl: 4 / 3,
  '2xl': 5 / 3,
  '3xl': 2,
  '4xl': 2.5,
  '5xl': 3,
  '6xl': 4,
  '7xl': 5,
  '8xl': 6,
  '9xl': 8,
} as const;

/** Named typography scale steps used to derive token-name types. */
type TextSize = keyof typeof textSizes;

/** Font-size and line-height defaults derived from the shared type scale. */
const typography = Object.fromEntries(
  Object.entries(textSizes).flatMap(([size, ratio]) => [
    [
      `--frame-font-size-${size}`,
      token(`calc(var(--frame-font-size-body) * ${ratio})`, 'length'),
    ],
    [
      `--frame-line-height-${size}`,
      token(
        size === 'xs' || size === 'sm'
          ? '1.5'
          : size === 'base'
            ? '1.5'
            : '1.25',
        'lineHeight'
      ),
    ],
  ])
) as Record<
  `--frame-font-size-${TextSize}` | `--frame-line-height-${TextSize}`,
  ReturnType<typeof token>
>;
/** Named font-weight steps exposed as theme tokens. */
const weights = {
  thin: 100,
  extralight: 200,
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
} as const;
/** Typed weight entries generated from the curated weight scale. */
const weightTokens = Object.fromEntries(
  Object.entries(weights).map(([name, weight]) => [
    `--frame-font-weight-${name}`,
    token(String(weight), 'weight'),
  ])
) as Record<
  `--frame-font-weight-${keyof typeof weights}`,
  ReturnType<typeof token>
>;
/** Letter-spacing scale expressed relative to the selected font. */
const tracking = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const;
/** Typed tracking entries whose values accept signed lengths. */
const trackingTokens = Object.fromEntries(
  Object.entries(tracking).map(([name, value]) => [
    `--frame-tracking-${name}`,
    token(value, 'tracking'),
  ])
) as Record<
  `--frame-tracking-${keyof typeof tracking}`,
  ReturnType<typeof token>
>;
/** Hand-maintained foundation and shell defaults applied to explicit themes. */
const defaultTokens = Object.freeze({
  ...shellThemeTokens,
  '--frame-spacing-unit': token('4px', 'length'),
  '--frame-bg': token('#181818', 'color'),
  '--frame-canvas': token('#101112', 'color'),
  '--frame-surface': token('#181818', 'color'),
  '--frame-line': token('#2b2b2b', 'color'),
  '--frame-muted': token('#8e9496', 'color'),
  '--frame-accent': token('#0078d4', 'color'),
  '--frame-list-selection-background': token('#ffffff0d', 'color'),
  '--frame-list-selection-foreground': token('#ffffff', 'color'),
  '--frame-list-selection-border': token('transparent', 'color'),
  '--frame-list-hover-background': token('#ffffff08', 'color'),
  '--frame-button-primary-background': token('var(--frame-accent)', 'color'),
  '--frame-button-primary-border': token('transparent', 'color'),
  '--frame-button-primary-hover-filter': token('brightness(112%)', 'filter'),
  '--frame-button-frame-button-primary-color': token(
    'var(--frame-accent-foreground)',
    'color'
  ),
  '--frame-text': token('#cccccc', 'color'),
  '--frame-overlay-surface': token('#1f1f1f', 'color'),
  '--frame-overlay-background': token(
    'color-mix(in srgb, var(--frame-overlay-surface) 83%, transparent)',
    'color'
  ),
  '--frame-overlay-backdrop-filter': token(
    'blur(10px) saturate(110%)',
    'filter'
  ),
  '--frame-menu-background': token('var(--frame-overlay-background)', 'color'),
  '--frame-border-color': token('#303030', 'color'),
  '--frame-menu-border': token('var(--frame-border-color)', 'color'),
  '--frame-menu-hover': token('#303336', 'color'),
  '--frame-menu-disabled': token('#656565', 'color'),
  '--frame-menu-shortcut': token('#929292', 'color'),
  '--frame-quick-background': token('var(--frame-overlay-background)', 'color'),
  '--frame-quick-selection': token('var(--frame-accent)', 'color'),
  '--frame-font-body': token('"Segoe UI", sans-serif', 'family'),
  '--frame-font-mono': token('Consolas, monospace', 'family'),
  '--frame-font-serif': token('Georgia, serif', 'family'),
  '--frame-font-size-body': token('12px', 'length'),
  ...typography,
  ...weightTokens,
  ...trackingTokens,
  '--frame-line-height-body': token('1.5', 'lineHeight'),
  '--frame-leading-none': token('1', 'lineHeight'),
  '--frame-leading-tight': token('1.25', 'lineHeight'),
  '--frame-leading-snug': token('1.375', 'lineHeight'),
  '--frame-leading-normal': token('1.5', 'lineHeight'),
  '--frame-leading-relaxed': token('1.625', 'lineHeight'),
  '--frame-leading-loose': token('2', 'lineHeight'),
  '--frame-content-padding': token(
    'calc(var(--frame-spacing-unit) * 3)',
    'length'
  ),
  '--frame-control-padding-x': token(
    'calc(var(--frame-spacing-unit) * 2.5)',
    'length'
  ),
  '--frame-control-padding-y': token(
    'calc(var(--frame-spacing-unit) * 1.25)',
    'length'
  ),
  '--frame-gap': token('calc(var(--frame-spacing-unit) * 1.5)', 'length'),
  '--frame-spacing-small': token('var(--frame-spacing-unit)', 'length'),
  '--frame-spacing-normal': token(
    'calc(var(--frame-spacing-unit) * 2.5)',
    'length'
  ),
  '--frame-radius-xs': token('1px', 'length'),
  '--frame-radius-small': token('2px', 'length'),
  '--frame-radius-medium': token('4px', 'length'),
  '--frame-radius-large': token('7px', 'length'),
  '--frame-radius-xl': token('10px', 'length'),
  '--frame-radius-2xl': token('14px', 'length'),
  '--frame-radius-3xl': token('18px', 'length'),
  '--frame-radius-4xl': token('24px', 'length'),
  '--frame-control-radius': token('var(--frame-radius-medium)', 'length'),
  '--frame-panel-radius': token('var(--frame-radius-large)', 'length'),
  '--frame-menu-border-radius': token('var(--frame-radius-large)', 'length'),
  '--frame-shadow-2xs': token('0 1px 1px #0002', 'shadow'),
  '--frame-shadow-xs': token('0 1px 2px #0003', 'shadow'),
  '--frame-shadow-sm': token('0 2px 4px #0003', 'shadow'),
  '--frame-shadow-md': token('0 4px 8px #0003', 'shadow'),
  '--frame-shadow-lg': token('0 8px 16px #0004', 'shadow'),
  '--frame-shadow-xl': token('0 12px 24px #0005', 'shadow'),
  '--frame-shadow-2xl': token('0 20px 40px #0006', 'shadow'),
  '--frame-overlay-shadow': token('0 14px 50px #0006', 'shadow'),
  '--frame-menu-box-shadow': token('0 6px 22px #0005', 'shadow'),
  '--frame-tooltip-box-shadow': token('0 3px 12px #0005', 'shadow'),
  '--frame-palette-box-shadow': token('0 9px 28px #0006', 'shadow'),
  '--frame-general-shadow': token('0 8px 24px #0004', 'shadow'),
  '--frame-control-background': token('#1d1d1d', 'color'),
  '--frame-control-border': token('var(--frame-border-color)', 'color'),
  '--frame-input-radius': token('var(--frame-menu-border-radius)', 'length'),
  '--frame-control-text': token('#d4d4d4', 'color'),
  '--frame-accent-foreground': token('#ffffff', 'color'),
  '--frame-danger': token('#f48771', 'color'),
  '--frame-duration': token('150ms', 'duration'),
  '--frame-ease': token('ease-out', 'ease'),
  '--frame-ease-in': token('ease-in', 'ease'),
  '--frame-ease-in-out': token('ease-in-out', 'ease'),
});
/**
 * Component-only names retain empty defaults so root writes cannot mask their
 * contextual CSS fallbacks or runtime layout measurements.
 */
const componentTokens = Object.fromEntries(
  componentTokenNames.map((name) => [name, token('', 'css')])
) as Record<(typeof componentTokenNames)[number], ReturnType<typeof token>>;
/** Complete catalog; component-only tokens keep an empty contextual default. */
export const themeTokens = Object.freeze({
  ...defaultTokens,
  ...Object.fromEntries(
    Object.entries(componentTokens).filter(
      ([name]) => !Object.prototype.hasOwnProperty.call(defaultTokens, name)
    )
  ),
}) as typeof defaultTokens & typeof componentTokens;

/** Canonical CSS variable names accepted by theme definitions. */
export type FrameThemeTokenName = keyof typeof themeTokens;

/** Dotted equivalents of canonical CSS variable names. */
export type FrameTokenPath = FrameThemeTokenName extends infer Name
  ? Name extends string
    ? TokenPath<Name>
    : never
  : never;

/** Recursively converts a CSS variable name into its dotted token path. */
type TokenPath<Name extends string> = Name extends `--${infer Rest}`
  ? TokenPath<Rest>
  : Name extends `${infer Head}-${infer Tail}`
    ? `${Head}.${TokenPath<Tail>}`
    : Name;

/** String values indexed by every supported theme token name. */
export type FrameThemeTokens = {readonly [Name in FrameThemeTokenName]: string};

/** Stable catalog order shared by application and generated CSS. */
export const themeTokenNames = Object.freeze(
  Object.keys(themeTokens) as FrameThemeTokenName[]
);
/** Renders shared defaults without overriding contextual component fallbacks. */
export function renderThemeCSS(): string {
  return (
    '/* Generated by packages/core/scripts/generate-theme-css.ts. Edit themes/tokens/tokenCatalog.ts. */\n:root {\n' +
    themeTokenNames
      .filter((name) => themeTokens[name].value !== '')
      .map((name) => `  ${name}: ${themeTokens[name].value};`)
      .join('\n') +
    '\n}\n'
  );
}

/** Narrows an arbitrary string to a known catalog token name. */
export const hasThemeToken = (name: string): name is FrameThemeTokenName =>
  Object.prototype.hasOwnProperty.call(themeTokens, name);
