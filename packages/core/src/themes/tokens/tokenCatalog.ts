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
  /** Base shell background behind its registered regions and content. */
  '--frame-bg': token('#181818', 'color'),
  /** Content canvas background used by workspace panes and recessed content. */
  '--frame-canvas': token('#101112', 'color'),
  /** Neutral raised surface behind grouped content and control compositions. */
  '--frame-surface': token('#181818', 'color'),
  /** Neutral divider color for content boundaries, tracks, and structural separators. */
  '--frame-line': token('#2b2b2b', 'color'),
  /** Secondary foreground for descriptions, hints, and visually subordinate content. */
  '--frame-muted': token('#8e9496', 'color'),
  /** Shared interaction color for keyboard focus, active actions, and accent-filled controls. */
  '--frame-accent': token('#0078d4', 'color'),
  /** Background of a selected application list row. */
  '--frame-list-selection-background': token('#ffffff0d', 'color'),
  '--frame-list-selection-foreground': token('#ffffff', 'color'),
  /** Outline or border color distinguishing selected list rows in contrast-sensitive themes. */
  '--frame-list-selection-border': token('transparent', 'color'),
  /** Background behind an application list row while the pointer hovers over it. */
  '--frame-list-hover-background': token('#ffffff08', 'color'),
  '--frame-button-primary-background': token('var(--frame-accent)', 'color'),
  '--frame-button-primary-border': token('transparent', 'color'),
  '--frame-button-primary-hover-filter': token('brightness(112%)', 'filter'),
  '--frame-button-frame-button-primary-color': token(
    'var(--frame-accent-foreground)',
    'color'
  ),
  /** Primary foreground for readable text and icons across shell and application content. */
  '--frame-text': token('#cccccc', 'color'),
  '--frame-overlay-surface': token('#1f1f1f', 'color'),
  /** Shared translucent fill for floating surfaces over the application canvas. */
  '--frame-overlay-background': token(
    'color-mix(in srgb, var(--frame-overlay-surface) 83%, transparent)',
    'color'
  ),
  /** Blur and saturation treatment behind shared translucent floating surfaces. */
  '--frame-overlay-backdrop-filter': token(
    'blur(10px) saturate(110%)',
    'filter'
  ),
  /** Surface behind floating menu containers, following the shared overlay background. */
  '--frame-menu-background': token('var(--frame-overlay-background)', 'color'),
  /** Shared resting border color inherited by menus and form controls. */
  '--frame-border-color': token('#303030', 'color'),
  /** Border color around floating menus, independently overridable from control borders. */
  '--frame-menu-border': token('var(--frame-border-color)', 'color'),
  /** Neutral hover and highlight fill for ordinary menu rows. */
  '--frame-menu-hover': token('#303336', 'color'),
  /** Foreground of unavailable or disabled menu actions. */
  '--frame-menu-disabled': token('#656565', 'color'),
  /** Muted foreground for keyboard shortcuts displayed beside menu actions. */
  '--frame-menu-shortcut': token('#929292', 'color'),
  /** Surface behind quick input and quick action overlays. */
  '--frame-quick-background': token('var(--frame-overlay-background)', 'color'),
  /** Background highlighting the active quick input or quick action result. */
  '--frame-quick-selection': token('var(--frame-accent)', 'color'),
  /** Primary font family inherited by shell content and ordinary controls. */
  '--frame-font-body': token('"Segoe UI", sans-serif', 'family'),
  /** Monospace font family for code, terminal text, and fixed-width content. */
  '--frame-font-mono': token('Consolas, monospace', 'family'),
  '--frame-font-serif': token('Georgia, serif', 'family'),
  /** Base text size inherited by shell content and ordinary controls. */
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
  /** Standard inset around content in panels, disclosures, and application surfaces. */
  '--frame-content-padding': token(
    'calc(var(--frame-spacing-unit) * 3)',
    'length'
  ),
  /** Horizontal inset inside ordinary controls and text-entry surfaces. */
  '--frame-control-padding-x': token(
    'calc(var(--frame-spacing-unit) * 2.5)',
    'length'
  ),
  /** Vertical inset inside ordinary controls and text-entry surfaces. */
  '--frame-control-padding-y': token(
    'calc(var(--frame-spacing-unit) * 1.25)',
    'length'
  ),
  /** Standard space between related content items and control children. */
  '--frame-gap': token('calc(var(--frame-spacing-unit) * 1.5)', 'length'),
  /** Compact shared spacing step used by menu insets, view rails, and dense content groups. */
  '--frame-spacing-small': token('var(--frame-spacing-unit)', 'length'),
  /** Normal shared spacing step used for content insets and separation. */
  '--frame-spacing-normal': token(
    'calc(var(--frame-spacing-unit) * 2.5)',
    'length'
  ),
  '--frame-radius-xs': token('1px', 'length'),
  /** Small shared corner radius used by inset rows and compact elements. */
  '--frame-radius-small': token('2px', 'length'),
  /** Medium shared corner radius used by ordinary controls. */
  '--frame-radius-medium': token('4px', 'length'),
  /** Large shared corner radius used by panel and menu containers. */
  '--frame-radius-large': token('7px', 'length'),
  '--frame-radius-xl': token('10px', 'length'),
  '--frame-radius-2xl': token('14px', 'length'),
  '--frame-radius-3xl': token('18px', 'length'),
  '--frame-radius-4xl': token('24px', 'length'),
  /** Shared corner radius of buttons and ordinary controls; text-entry surfaces may use the input radius instead. */
  '--frame-control-radius': token('var(--frame-radius-medium)', 'length'),
  /** Shared corner radius of panel containers and larger floating surfaces. */
  '--frame-panel-radius': token('var(--frame-radius-large)', 'length'),
  '--frame-menu-border-radius': token('var(--frame-radius-large)', 'length'),
  '--frame-shadow-2xs': token('0 1px 1px #0002', 'shadow'),
  '--frame-shadow-xs': token('0 1px 2px #0003', 'shadow'),
  '--frame-shadow-sm': token('0 2px 4px #0003', 'shadow'),
  '--frame-shadow-md': token('0 4px 8px #0003', 'shadow'),
  '--frame-shadow-lg': token('0 8px 16px #0004', 'shadow'),
  '--frame-shadow-xl': token('0 12px 24px #0005', 'shadow'),
  '--frame-shadow-2xl': token('0 20px 40px #0006', 'shadow'),
  /** Elevation shadow separating floating overlays from underlying content. */
  '--frame-overlay-shadow': token('0 14px 50px #0006', 'shadow'),
  '--frame-menu-box-shadow': token('0 6px 22px #0005', 'shadow'),
  '--frame-tooltip-box-shadow': token('0 3px 12px #0005', 'shadow'),
  '--frame-palette-box-shadow': token('0 9px 28px #0006', 'shadow'),
  '--frame-general-shadow': token('0 8px 24px #0004', 'shadow'),
  /** Resting fill of text-entry controls and other control surfaces. */
  '--frame-control-background': token('#1d1d1d', 'color'),
  /** Resting border color of form controls, independently overridable from menu borders. */
  '--frame-control-border': token('var(--frame-border-color)', 'color'),
  /** Shared corner radius for text fields, text areas, selects, and composed input surfaces. */
  '--frame-input-radius': token('var(--frame-menu-border-radius)', 'length'),
  /** Foreground for text and icons on resting control surfaces. */
  '--frame-control-text': token('#d4d4d4', 'color'),
  /** Readable text and icon foreground on accent-filled surfaces. */
  '--frame-accent-foreground': token('#ffffff', 'color'),
  /** Error and destructive-action color used for validation messages and invalid field borders. */
  '--frame-danger': token('#f48771', 'color'),
  /** Shared duration for control and shell presentation transitions. */
  '--frame-duration': token('150ms', 'duration'),
  /** Shared timing curve for control and shell presentation transitions. */
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
