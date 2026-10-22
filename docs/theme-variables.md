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
| `--frame-menu-background` | `rgb(31 31 31 / 94%)` | `bg-frame-menu-background` |
| `--frame-menu-border` | `#303030` | `border-frame-menu-border` |
| `--frame-menu-hover` | `#303336` | `bg-frame-menu-hover` |
| `--frame-menu-disabled` | `#656565` | `text-frame-menu-disabled` |
| `--frame-menu-shortcut` | `#929292` | `text-frame-menu-shortcut` |
| `--frame-quick-background` | `#202020` | `bg-frame-quick-background` |
| `--frame-quick-selection` | `#267b9b` | `bg-frame-quick-selection` |
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
| `--frame-control-radius` | `3px` | Control corners; `rounded-frame-control` |
| `--frame-panel-radius` | `7px` | Panel corners; `rounded-frame-panel` |
| `--frame-overlay-shadow` | `0 14px 50px #0006` | Overlay elevation; `shadow-frame-overlay` |
| `--frame-duration` | `150ms` | Motion duration; `duration-[var(--frame-duration)]` |
| `--frame-ease` | `ease-out` | Timing function; `ease-frame` |

Color tokens work with Tailwind's corresponding color utilities, including backgrounds, borders, text, and outlines. Spacing mappings also support margins, gaps, and sizing; choose the utility appropriate to the token's meaning. Numeric utilities such as `p-4` retain Tailwind's standard scale; changing Frame content padding does not change every numeric spacing utility.

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
