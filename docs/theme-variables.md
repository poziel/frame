# Frame theme variables

Frame owns the `--frame-*` namespace. Applications can use `--app-*` (or a product prefix) for additional variables. Default values live in `packages/core/src/themes/default.css`, exported as `@frame/core/tokens.css` and included in Core's normal stylesheet. Tailwind is optional; the same variables work in ordinary CSS.

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

Color tokens work with Tailwind's corresponding color utilities, including backgrounds, borders, text, and outlines. Spacing mappings also support margins, gaps, and sizing; choose the utility appropriate to the token's meaning. Numeric utilities such as `p-4` retain Tailwind's standard scale; changing Frame content padding does not change every numeric spacing utility.

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

For CSS themes, use an active root selector such as `:root[data-theme='custom']`. When switching, change the root attribute or replace the active theme stylesheet. Do not accumulate previous themes' inline properties: missing keys must resolve to defaults. If a future loader applies inline variables, it must remove all previous theme-owned overrides before applying the new set.

Use document-root variables so teleported overlays inherit the same values. Shell-only scoping will not automatically theme body portals. Custom fonts require supplied assets and `@font-face` declarations (or a font-loading adapter); a font-family name alone does not load a font.

## Extension and limits

Themes can override color, length, font, shadow, duration, and easing values. Applications can introduce any CSS custom property and consume it directly; named Tailwind utility extensions must be declared at application build time. Runtime theme uploads cannot generate new Tailwind classes or alter compiled media-query breakpoints.

The current implementation exposes defaults and the Tailwind mapping, not an uploaded-theme loader. A future versioned theme format should validate values by token type, support partial overrides, and carry font asset references separately. The former colors-only JSON sketch in `library-and-themes.md` is superseded by this broader direction.

## Current component coverage

Existing color tokens retain their current consumers. Shell and overlay base typography use the body font and size; the panel log uses the mono family. FrameButton uses control padding and radius. FrameModal uses panel radius and overlay shadow. Other existing hard-coded sizes, colors, font overrides, and corners are not all migrated yet. New content spacing, gap, and motion tokens are available to application components but do not globally rescale the shell. The Reka form, color, and date compositions use these tokens; native text inputs and text areas now use control background/border/text tokens. Full shell component token adoption is separate work; this document does not claim all existing components are completely themeable.

See [optional Tailwind setup](../packages/tailwind/README.md) for consumer imports and Vite configuration.

## Component-specific styling

Component styles now expose configurable literal presentation values through `--frame-<element>-<state>-<property>` variables with their original values as CSS fallbacks. Existing shared semantic variables remain supported. The Theming tab on each Duck component page lists the actual consumed variables, element selectors, and fallback values. Override the variables you need on the document root; omitted values keep the original appearance. Structural layout rules and geometry calculated from props or shell state remain outside this token surface.

Third-party Monaco and syntax-highlighting colors continue to use their supported theme APIs. Component variables style Frame's surrounding surfaces rather than pretending to override all third-party internals.

## Live accent preview

The documentation application includes an **Accent palette** primary-sidebar view with 20 presets, a custom color picker, and Reset accent. Choices apply to document-root variables for the current session, including portals and the title-bar SVG logo. They are not saved or applied to native packaged icons. Button foreground is chosen by measured contrast between the candidate and white or charcoal.

The title-bar logo uses `--frame-logo-accent` (defaults to `--frame-accent`) and `--frame-logo-highlight` (defaults to an accent/white mix). Override these only to give the logo its own colors.

## Shared corner radii

Override `--frame-radius-small`, `--frame-radius-medium`, and `--frame-radius-large` on the document root to change the shared corner scale. Existing control, panel, and component-specific radius overrides remain supported. Square joined edges and circular controls retain their geometry.

## Shared spacing

`--frame-spacing-small` defaults to `4px`; `--frame-spacing-normal` defaults to `10px`. Menus and activity rails use small spacing through their own padding overrides. Activity item padding uses `--frame-activity-item-padding`. Section headers have no imposed minimum height and default to small vertical padding, normal horizontal padding, and a normal gap. Activity bar cross-axis dimensions follow their contents and are measured into the shell layout.

Activity bars use 28px icons and 14px labels by default; compact mode uses 18px icons and 11px labels. Override `--frame-activity-icon-size`, `--frame-activity-font-size`, and their `--frame-activity-compact-*` equivalents independently. Compact item padding defaults to 75% of the small spacing (a 25% reduction), while rail padding stays at the full small spacing; `--frame-activity-compact-item-padding` and `--frame-activity-compact-rail-padding` override them. Side content defaults to small vertical and normal horizontal padding through `--frame-side-content-padding`.

## Icon button geometry

FrameIconButton preserves source SVG viewBoxes inside a square CSS icon slot. Icon-only buttons are square; `showLabel` displays the accessible label alongside the icon and permits a wider button. `--frame-icon-button-label-end-padding` defaults to `2px`. Activity labels inherit it through `--frame-activity-label-end-padding`; set either to `0px` to remove the optical adjustment. Standalone FrameIcon dimensions are unchanged. No JavaScript measurement of SVG artwork is used.

Activity bars use 28px/18px icon sizes, except horizontal icon-and-text bars at default size use 22px icons. The labeled-icon tokens remain available as explicit overrides. Item gaps remain at small spacing in both sizes; icon-to-label gaps also default to small spacing.

## Select popup

FrameSelect uses menu surface defaults and quick-action accent highlighting, with small spacing around the option list. Override `--frame-select-options-padding`, `--frame-select-item-padding`, `--frame-select-item-radius`, and `--frame-select-item-highlight-background` independently. Menu surface and row variables supply shared defaults. A description footer appears only when options supply descriptions and reserves enough space for the longest description at the current width, avoiding height changes during navigation.

## Input borders

`--frame-border-color` supplies the default menu and control border color. `--frame-menu-border` and `--frame-control-border` remain independent overrides. Text inputs, text areas, select triggers and composed form inputs use `--frame-input-radius`, which defaults to the menu outer radius (7px). Component-specific radius overrides remain available; ordinary buttons retain their medium radius. Accent focus styling remains separate from resting borders.
