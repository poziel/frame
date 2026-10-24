# Frame theme tokens

Frame owns the `--frame-*` namespace. Every Frame CSS variable is also a **token**, available in JSON, JSONC, JSON5, YAML, TOML and INI theme files. These are tokens, regardless of their serialization format. Applications can use `--app-*` (or a product prefix) for additional variables. Shared default values live in `packages/core/src/themes/default.css`, exported as `@frame/core/tokens.css` and included in Core's normal stylesheet. Component defaults remain in their contextual CSS fallbacks. Tailwind is optional; the same variables work in ordinary CSS.

See [theme file formats](theme-files.md) for equivalent examples in all six formats, nested/dotted paths, and browser file imports.

## Apply a theme

Load `@frame/core/style.css` once. Define themes through Core and pass one when creating Frame, or select one later:

```ts
import { createFrame, defineTheme, parseTheme } from '@frame/core';

const theme = defineTheme({
  version: 1,
  id: 'my-application',
  name: 'My application',
  appearance: 'dark',
  tokens: {
    '--frame-accent': '#409cff',
    '--frame-spacing-unit': '5px',
    '--frame-font-body': '"Application Sans", system-ui, sans-serif',
  },
});
const frame = createFrame({ theme });
frame.theme.set(theme);
// Your import handler supplies the text; parsing never applies or stores it.
function importTheme(jsonText: string) {
  frame.theme.set(parseTheme(jsonText));
}
frame.theme.reset(); // Inherit document CSS tokens again.
```

`frame.theme.current.value` is the readonly reactive selection, or `null` when inheriting document CSS. Definitions are validated defensive immutable copies. `FrameShell` automatically applies the selected theme to its root and external overlay host. Different Frame instances can use different themes, including their menus and Reka popups. Explicit partial themes fill missing shared keys from Frame defaults. Omitted component tokens retain their existing CSS fallback/inheritance. Replacing a theme discards all previous overrides.

For application-owned surfaces, including standalone controls, attach a scope explicitly:

```ts
const detach = frame.theme.attach(applicationElement);
// When this surface is removed:
detach();
```

Each element has one owner; duplicate attachment throws. Detachment restores previous inline values and priorities, leaving unrelated host declarations intact. Subsequent host writes to managed properties are preserved on cleanup. A later theme selection reapplies its managed declarations. Frame disposal detaches all roots; `set` and `attach` then throw. Callers own their Vue watchers and application elements. Construction and parsing work during SSR without browser globals; attachment requires a real element.

Attached surfaces carry a managed `data-frame-theme-scope` marker, restored on detach. Core's reduced-transparency and unsupported-backdrop-filter fallbacks apply to these scopes too, taking priority over theme translucency values.

Existing CSS themes remain supported. Omit `theme` (or call `reset`) and load document overrides after Core defaults. Apply shared values at the document root so body portals inherit them:

```css
:root[data-theme='my-application'] {
  --frame-accent: #409cff;
  --frame-bg: #181818;
  --frame-text: #eeeeee;
}

.application-content {
  color: var(--frame-text);
  background: var(--frame-canvas);
}
```

Your host chooses the CSS theme, for example by setting `document.documentElement.dataset.theme = 'my-application'`. A document theme applies to every inheriting shell; an explicit instance theme takes precedence within that instance and its portal host. Font names require host-provided `@font-face` or system fonts; Core never downloads fonts. Import UI, persistence, and user preferences belong to the host.

## Import contract and validation

Theme files accept either a bare token tree or a version-1 envelope: `{ "version": 1, "id": "custom", "name": "Custom", "appearance": "dark", "tokens": { "frame.accent": "#409cff" } }`. Nested paths, dotted paths, mixed paths and existing CSS variable keys are equivalent. Appearance is `light` or `dark` and sets CSS `color-scheme`; it does not generate a palette. A light theme must supply its desired semantic colors. Empty tokens are valid. Existing envelope metadata and CSS keys remain supported.

Core exports `FrameTheme`, `FrameThemeDefinition`, `FrameTokenTree`, `FrameTokenPath`, `FrameThemeFormat`, `FrameThemeFile`, `ParseThemeOptions`, `FrameThemeTokens`, `FrameThemeTokenName`, `FrameThemeController`, `defineTheme`, `parseTheme`, `parseThemeFile`, `FrameThemeError`, `themeFormats`, and `themeTokens`. The catalog lists accepted CSS keys, their default `.value`, and `.kind`; it is the authoritative allowlist. A `.value` of `''` means a contextual component default or runtime value, never an empty root declaration. Each CSS key's token path removes `--` and replaces hyphens with dots. Files and normalized themes are limited to 128 KiB; id/name to 1–200 characters without control characters; each token value to 1–512 characters. Unknown fields, keys, versions, references, duplicate normalized paths, and cycles fail before the active selection changes. Errors expose `.path` and a readable message.

Accepted syntax is deliberately smaller than arbitrary CSS:

| Category | Accepted values |
| --- | --- |
| Colors | Hex with 3/4/6/8 digits; common named colors; `transparent`, `currentColor`; literal `rgb`/`rgba`, `hsl`/`hsla`, `oklch`/`oklab`; `color-mix(in srgb, color [weight%], color [weight%])` |
| Lengths | Nonnegative CSS lengths or percentages, `0`, and nested `calc(length * nonnegative-number)` / `calc(length / positive-number)`; negative lengths are permitted for tracking and shadow offsets/spread; shadow/blur/tracking reject percentages |
| Fonts | Comma-separated unquoted family names or quoted names, including system families; assets are host-owned |
| Typography | Weight numbers 1–1000; positive line-height numbers or nonnegative lengths |
| Shadows | `none`, or comma-separated shadows: optional leading `inset`, 2–4 lengths, then a supported color |
| Motion | Nonnegative `ms`/`s`; standard easing keywords, `cubic-bezier` and `steps` |
| Filters | `none` or space-separated `blur(length)` / `saturate(percentage)` / `brightness(percentage)` |
| Component values (`css`) | Declaration values including shorthands, transforms and grid tracks; balanced parentheses/quotes and resource-free syntax are checked. Property-specific validity is determined by the browser. |

Known-token `var(--frame-token)` references are accepted within those grammars; fallback arguments are not. References to contextual tokens require an explicit value for that token. Validation checks the effective default-plus-override graph. Declarations, selectors, imports, URLs, arbitrary variables, comments and control characters are rejected. Shared typed tokens also reject CSS-wide keywords; component values can explicitly use `inherit` or `initial`. Accepted length units are px, rem, em, ch, ex, lh, rlh, vw/vh/vi/vb/vmin/vmax, dvw/dvh/svw/svh/lvw/lvh, cm/mm/in/pt/pc, and percent where permitted. Use hex or functional colors when a particular named color is unsupported. CSS stylesheet themes use the normal CSS import/cascade mechanism rather than the token-file parser.

## Foundation scales

`--frame-spacing-unit` defaults to 4px. Shared spacing derives from it: small = 1 unit, normal/control-x = 2.5, control-y = 1.25, gap = 1.5, and content padding = 3. Existing individual overrides still take precedence.

Body typography remains 12px with a 1.5 line height. Font-size tokens xs/sm/base/lg/xl/2xl/3xl/4xl/5xl/6xl/7xl/8xl/9xl multiply body size by 5/6, 11/12, 1, 7/6, 4/3, 5/3, 2, 2.5, 3, 4, 5, 6, and 8. Their paired line-height tokens are 1.5 through base and 1.25 above it. Sans/body, mono, and serif families, weights thin–black, tracking tighter–widest, named leading none–loose, radius xs–4xl, box shadows 2xs–2xl, and easing tokens are public catalog entries.

Tailwind's full entry uses these scales by default. `p-4` is four spacing units; `text-sm` is normally 11px; `rounded-md` uses the existing 4px medium radius. These intentionally differ from stock Tailwind typography and radius values. Breakpoints, container scales, animations and specialized effects such as drop/text/inset shadows retain Tailwind build-time behavior. Explicit numbers such as `duration-300` and arbitrary values remain deliberate overrides.

## Public tokens

| Variable | Default | Purpose / Tailwind utility example |
| --- | --- | --- |
| `--frame-bg` | `#181818` | Application background; `bg-frame-bg` |
| `--frame-canvas` | `#101112` | Workspace background; `bg-frame-canvas` |
| `--frame-surface` | `#181818` | Raised surface; `bg-frame-surface` |
| `--frame-line` | `#2b2b2b` | Border; `border-frame-line` |
| `--frame-text` | `#cccccc` | Foreground; `text-frame-text` |
| `--frame-muted` | `#8e9496` | Secondary foreground; `text-frame-muted` |
| `--frame-accent` | `#0078d4` | Accent and focus; `bg-frame-accent` |
| `--frame-overlay-surface` | `#1f1f1f` | Shared overlay base color |
| `--frame-overlay-background` | `color-mix(in srgb, var(--frame-overlay-surface) 83%, transparent)` | Shared translucent surface for menus, selects, dialogs, quick panels, tooltips, and notifications |
| `--frame-overlay-backdrop-filter` | `blur(10px) saturate(110%)` | Frosted backdrop behind floating surfaces |
| `--frame-menu-background` | `var(--frame-overlay-background)` | `bg-frame-menu-background` |
| `--frame-menu-border` | `#303030` | `border-frame-menu-border` |
| `--frame-menu-hover` | `#303336` | `bg-frame-menu-hover` |
| `--frame-menu-disabled` | `#656565` | `text-frame-menu-disabled` |
| `--frame-menu-shortcut` | `#929292` | `text-frame-menu-shortcut` |
| `--frame-quick-background` | `var(--frame-overlay-background)` | `bg-frame-quick-background` |
| `--frame-quick-selection` | `var(--frame-accent)` | Quick-action hover/selection, including Customize Layout; `bg-frame-quick-selection` |
| `--frame-control-background` | `#1d1d1d` | Input background; `bg-frame-control-background` |
| `--frame-control-border` | `#3c4246` | Input border; `border-frame-control-border` |
| `--frame-control-text` | `#d4d4d4` | Input foreground; `text-frame-control-text` |
| `--frame-accent-foreground` | `#ffffff` | Text on accent controls |
| `--frame-danger` | `#f48771` | Form validation errors |
| `--frame-font-body` | `"Segoe UI", sans-serif` | Body family; `font-frame-body` |
| `--frame-font-mono` | `Consolas, monospace` | Code family; `font-frame-mono` |
| `--frame-font-size-body` | `12px` | Base size; `text-frame-body` |
| `--frame-content-padding` | `12px` | Content spacing; `p-frame-content` |
| `--frame-control-padding-x` | `10px` | Control horizontal padding; `px-frame-control-x` |
| `--frame-control-padding-y` | `5px` | Control vertical padding; `py-frame-control-y` |
| `--frame-gap` | `6px` | Content gap; `gap-frame-gap` |
| `--frame-radius-small` | `2px` | Small elements and inset menu rows |
| `--frame-radius-medium` | `4px` | Inputs, selects, buttons and other controls |
| `--frame-radius-large` | `7px` | Panels, dialogs and menu containers |
| `--frame-control-radius` | `var(--frame-radius-medium)` | Control corners; `rounded-frame-control` |
| `--frame-panel-radius` | `var(--frame-radius-large)` | Panel corners; `rounded-frame-panel` |
| `--frame-overlay-shadow` | `0 14px 50px #0006` | Overlay elevation; `shadow-frame-overlay` |
| `--frame-duration` | `150ms` | Motion duration; `duration-[var(--frame-duration)]` |
| `--frame-ease` | `ease-out` | Timing function; `ease-frame` |

Color tokens work with Tailwind's corresponding color utilities, including backgrounds, borders, text, and outlines. Spacing mappings also support margins, gaps, and sizing. Numeric utilities such as `p-4` use `--frame-spacing-unit`; overriding only content padding does not change that scale.

## Accent and interaction colors

`--frame-accent` is the shared interaction color for input focus borders, dropdown focus outlines, and quick-action hover/selection. `--frame-quick-selection` defaults to this same color. `--frame-accent-foreground` supplies readable text on accent-filled controls and selected Customize Layout items. `--frame-control-border` remains the resting input border; `--frame-menu-hover` is the neutral background for ordinary menu rows.

Load overrides after Frame's stylesheet, on the document root so portalled menus receive them too:

```css
:root[data-theme='custom'] {
  --frame-accent: #9467db;
  --frame-accent-foreground: #ffffff;
}
```

This changes both quick-action selection and focus colors together without setting each component's styling variables. Existing themes that explicitly set `--frame-quick-selection` should remove that override (or set it to `var(--frame-accent)`) to keep them identical. Component-specific overrides remain available for deliberate exceptions.

## Theme precedence and replacement

1. Load Frame defaults once.
2. Load the selected theme's partial overrides after defaults, at the same cascade layer or an explicitly higher-priority layer.
3. Apply deliberate application overrides last.

For CSS themes, use an active root selector such as `:root[data-theme='custom']`. When switching, change the root attribute or replace the active theme stylesheet. Instance themes apply the shared default graph plus selected overrides on each owned root; unselected component tokens retain their CSS fallback/inheritance. `set` replaces the previous graph, and `reset` restores inheritance and prior inline declarations. Instance theme declarations take precedence over ordinary stylesheet declarations; deliberate `!important` host rules can override them.

Use document-root variables so teleported overlays inherit the same values. Shell-only scoping will not automatically theme body portals. Custom fonts require supplied assets and `@font-face` declarations (or a font-loading adapter); a font-family name alone does not load a font.

## Extension and limits

Themes can override color, length, font, shadow, duration, and easing values. Applications can introduce any CSS custom property and consume it directly; named Tailwind utility extensions must be declared at application build time. Runtime theme uploads cannot generate new Tailwind classes or alter compiled media-query breakpoints.

Core provides Confbox parsing for JSON, JSONC, JSON5, YAML, TOML and INI, token normalization, file reading and runtime application; hosts provide importing/selection UI and storage. The optional [`@frame/themes`](../../packages/themes/README.md) package supplies `vscodeLight2026`, `vscodeHighContrastBlack`, `vscodeHighContrastWhite`, and their JSON definitions. Core's catalog includes all existing Frame CSS variables in Core and Features, including component-specific fallbacks. Presets can override these without loading a separate stylesheet. Third-party editor palettes use their own APIs.

Application-owned list selections should pair `--frame-list-selection-background` with `--frame-list-selection-foreground`, plus `--frame-list-selection-border` for high-contrast outlines. `--frame-list-hover-background` supplies hover. Tailwind maps these to `bg-selection`, `text-selection-foreground`, and `outline-selection-border`; geometry/outline width is still explicit. Primary buttons use `--frame-button-primary-background`, `--frame-button-frame-button-primary-color`, and `--frame-button-primary-border`. Their defaults follow the accent, but high-contrast themes can keep a different button fill from the focus accent. `--frame-button-primary-hover-filter` defaults to `brightness(112%)` and can be `none` to preserve high-contrast values on hover.

## Current component coverage

Shared semantic tokens style the shell and application content. Individual components also consume component-specific variables with CSS fallback values. Changing a shared spacing or font token does not imply that every structural dimension changes with it; shell geometry also depends on layout state and measured content. Check the component's consumed variables when a specific element needs an override.

See [optional Tailwind setup](../../packages/tailwind/README.md) for consumer imports and Vite configuration.

## Component-specific styling

Component styles expose presentation values through `--frame-<element>-<state>-<property>` variables with CSS fallbacks. Existing shared semantic variables remain supported. The interactive documentation's component Theming tabs list consumed variables, element selectors, and fallback values. Override the variables you need on the document root; omitted values keep the default appearance. Structural layout rules and geometry calculated from props or shell state remain outside this token surface.

Third-party Monaco and syntax-highlighting colors continue to use their supported theme APIs. Component variables style Frame's surrounding surfaces rather than pretending to override all third-party internals.

## Live accent preview

The documentation application includes an **Accent palette** primary-sidebar view with 20 presets, a custom color picker, and Reset accent. Choices apply to document-root variables for the current session, including portals and the title-bar SVG logo. They are not saved or applied to native packaged icons. Button foreground is chosen by measured contrast between the candidate and white or charcoal.

The title-bar logo uses `--frame-logo-accent` (defaults to `--frame-accent`) and `--frame-logo-highlight` (defaults to an accent/white mix). Override these only to give the logo its own colors.

## Shared corner radii

Override `--frame-radius-small`, `--frame-radius-medium`, and `--frame-radius-large` on the document root to change the shared corner scale. Existing control, panel, and component-specific radius overrides remain supported. Square joined edges and circular controls retain their geometry.

## Shared spacing

`--frame-spacing-small` defaults to `4px`; `--frame-spacing-normal` defaults to `10px`. Menus and view bars use small spacing through their own padding overrides. View item padding uses `--frame-activity-item-padding`. Section headers have no imposed minimum height and default to small vertical padding, normal horizontal padding, and a normal gap. View bar cross-axis dimensions follow their contents and are measured into the shell layout.

View bars use 28px icons and 14px labels by default; compact mode uses 18px icons and 11px labels. Override `--frame-view-icon-size`, `--frame-activity-font-size`, and their `--frame-view-compact-*` equivalents independently. Compact item padding defaults to 75% of the small spacing (a 25% reduction), while rail padding stays at the full small spacing; `--frame-view-compact-item-padding` and `--frame-view-compact-rail-padding` override them. Side content defaults to small vertical and normal horizontal padding through `--frame-side-content-padding`.

## Icon button geometry

FrameIconButton preserves source SVG viewBoxes inside a square CSS icon slot. Icon-only buttons are square; `showLabel` displays the accessible label alongside the icon and permits a wider button. `--frame-icon-button-label-end-padding` defaults to `2px`. View labels inherit it through `--frame-view-label-end-padding`; set either to `0px` to remove the optical adjustment. Standalone FrameIcon dimensions are unchanged. No JavaScript measurement of SVG artwork is used.

View bars use 28px/18px icon sizes, except horizontal icon-and-text bars at default size use 22px icons. The labeled-icon tokens remain available as explicit overrides. Item gaps remain at small spacing in both sizes; icon-to-label gaps also default to small spacing.

## Select popup

FrameSelect uses menu surface defaults and quick-action accent highlighting, with small spacing around the option list. Override `--frame-select-options-padding`, `--frame-select-item-padding`, `--frame-select-item-radius`, and `--frame-select-item-highlight-background` independently. Menu surface and row variables supply shared defaults. A description footer appears only when options supply descriptions and reserves enough space for the longest description at the current width, avoiding height changes during navigation.

## Input borders

`--frame-border-color` supplies the default menu and control border color. `--frame-menu-border` and `--frame-control-border` remain independent overrides. Text inputs, text areas, select triggers and composed form inputs use `--frame-input-radius`, which defaults to the menu outer radius (7px). Component-specific radius overrides remain available; ordinary buttons retain their medium radius. Accent focus styling remains separate from resting borders.

## View and navigation bars

The primary, secondary, and panel selectors are view bars. Shared canonical item variables use `--frame-view-*`, with the corresponding existing `--frame-activity-*` variables retained as fallback overrides. Common values include `--frame-view-icon-size`, `--frame-view-compact-icon-size`, `--frame-view-font-size` (14px), `--frame-view-compact-font-size` (11px), `--frame-view-item-padding`, `--frame-view-compact-item-padding`, `--frame-view-rail-padding`, and `--frame-view-rail-gap`.

The navigation bar uses these shared defaults and supports icon overrides through `--frame-navigation-icon-size` and `--frame-navigation-compact-icon-size`. Its four-sided border uses `--frame-line`, radius uses `--frame-panel-radius`, and outer inset uses `--frame-spacing-small`. Native links, actions, and dropdown triggers share presentation while retaining their own semantics.

Side-docked nav bars cap their cross-axis width with `--frame-navigation-max-width` (default `min(30vw, 320px)`). Longer labels truncate visually while retaining their full accessible names and titles.

## Workspace tabs

Workspace tab styles use the same canvas, text, muted, line, accent, and focus colors as the shell. Override these optional tokens without changing component contracts:

| Token | Default |
| --- | --- |
| `--frame-workspace-tab-strip` | Canvas mixed with 16% text color |
| `--frame-workspace-tab-active` | `--frame-canvas` |
| `--frame-workspace-tab-text` | `--frame-muted` |
| `--frame-workspace-tab-active-text` | `--frame-text` |
| `--frame-workspace-tab-border` | `--frame-line` |
| `--frame-workspace-tab-height` | `34px` |
| `--frame-workspace-tab-max-width` | `240px` |
| `--frame-workspace-tab-font-size` | `12px` |
| `--frame-workspace-tab-gap` | `6px` |
| `--frame-workspace-tab-padding` | `0 10px` |
| `--frame-workspace-tab-action-size` | `24px` |
| `--frame-workspace-tab-action-hover` | Text mixed at 12% over transparency |

The active tab matches its pane content by default; the strip is lighter. Overflowing tabs move into the More Tabs dropdown while trailing actions remain available. `--frame-workspace-tab-radius` and `--frame-workspace-pane-radius` default to the panel radius; `--frame-workspace-tab-drop-color` defaults to the accent color. The selected tab has no bottom separator.

## Theme choices in Frame commands

Register the themes your host offers with `const remove = frame.theme.register(theme)`.
`frame.theme.available` is a reactive list used by Frame commands (Ctrl+Shift+P).
Registration validates and copies the definition, rejects duplicate IDs, and returns cleanup.
It does not change the selected theme. An initial `createFrame({ theme })` theme is also available.
Removing a choice leaves the current selection intact; `frame.theme.reset()` restores inherited styling.
Disposal clears available choices and releases attached targets. Each Frame has its own registry.
