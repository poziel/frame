# @frame/themes

Optional Frame presets. Importing a preset validates immutable data; it never changes a theme or mounts UI. Core owns theme application, JSON parsing, and lifecycle. Tailwind reads the same runtime tokens without a theme-specific integration.

```ts
import { createFrame } from '@frame/core';
import { vscodeLight2026 } from '@frame/themes';

const frame = createFrame({ theme: vscodeLight2026 });
// Or change an existing instance:
frame.theme.set(vscodeLight2026);
frame.theme.reset(); // Restore document CSS inheritance.
```

Available presets are `frameMonokaiDark`, `frameMonokaiLight`, `frameDusk`, `vscodeLight2026`, `vscodeHighContrastBlack`, and `vscodeHighContrastWhite`. Each has a JSON subpath export.

## Frame Monokai Dark And Light

The coordinated pair follows Frame's approved Monokai Pro-inspired design: warm charcoal and cream text in Dark, soft ivory and warm gray chrome in Light, with golden primary actions. Light mode uses darker semantic accents to preserve readability. These are original Frame adaptations, not official Monokai Pro themes.

```ts
import { frameMonokaiDark, frameMonokaiLight } from '@frame/themes';

const frame = createFrame({ theme: frameMonokaiDark });
frame.theme.set(frameMonokaiLight);
```

JSON exports: `@frame/themes/frame-monokai-dark.json` and `@frame/themes/frame-monokai-light.json`. Both explicitly cover public color tokens for the shell, controls, selections, menus, notifications and portals. Syntax highlighting, Monaco themes and terminal ANSI palettes remain separate integrations. The docs theme picker offers both, and nested playgrounds start with Dark.

The [design references](provenance/frame-monokai.json) record [Monokai Pro](https://monokai.pro/vscode) and [VS Code's color roles](https://code.visualstudio.com/api/references/theme-color). No extension theme files or icon assets are bundled.

## Frame Dusk

Frame's original alternate dark palette uses blue-gray chrome, a dark slate workspace, soft off-white text, and a lavender accent. Import `frameDusk` and pass it as `createFrame({ theme: frameDusk })`. It overrides shared surfaces and interaction colors while retaining Core's dark defaults for other tokens; it does not change the global default theme.

The same definition is available at `@frame/themes/vscode-light-2026.json` for bundlers or user-import testing:

```ts
import { parseTheme } from '@frame/core';

function importUserTheme(jsonText: string) {
  frame.theme.set(parseTheme(jsonText));
}
```

Applications own file selection and persistence. Supply Core styles and, optionally, `@frame/tailwind/style.css` as usual. FrameShell handles its shell and portal scopes. Plain content uses the same theme through utilities such as `bg-surface text-foreground p-4 rounded-md` or ordinary CSS variables. Standalone surfaces can use `frame.theme.attach(element)`.

## VS Code Light 2026

The first preset adapts Microsoft's [Light 2026 source palette](https://github.com/microsoft/vscode/blob/ab8f31f0c0b1a4dd86d8dbee1248542f5806574d/extensions/theme-defaults/themes/2026-light.json): pale `#FAFAFD` chrome, white workspace, `#202020` text, `#606060` secondary text, and `#0069CC` accent. The screenshot supplied during development was the visual reference; palette values came from source rather than sampled pixels.

This is a shell-color adaptation, not an exact VS Code replica. Frame retains its own layout, spacing, typography, and interaction behavior. Shadows/backdrop filters are disabled to match the flat upstream surfaces. Syntax highlighting, terminal ANSI palettes, Monaco themes, optional Features content and application-owned CSS need their own adapters or tokens. No Microsoft or VS Code affiliation is implied.

The preset explicitly supplies every public color token, including shell hover/selection colors, so it does not inherit dark chrome colors. Existing component customization points were promoted into Core's validated token catalog with their original defaults. Border colors are separate from border widths/styles. The [provenance record](provenance/vscode-light-2026.json) records the exact upstream revision, source colors, and each token mapping; Microsoft's [MIT notice](licenses/vscode.txt) is included.

The Docs host exposes all presets under **Settings → Appearance → Theme**. It starts with Frame's existing default and does not persist the selection. The Accent palette example edits document-root values, so it affects inherited themes; an explicit preset takes precedence in its own scope.

## High Contrast Black and White

These adapt the pinned VS Code [Dark High Contrast](https://github.com/microsoft/vscode/blob/ab8f31f0c0b1a4dd86d8dbee1248542f5806574d/extensions/theme-defaults/themes/hc_black.json) and [Light High Contrast](https://github.com/microsoft/vscode/blob/ab8f31f0c0b1a4dd86d8dbee1248542f5806574d/extensions/theme-defaults/themes/hc_light.json) themes. The upstream JSON files contain few shell colors: most are inherited from VS Code's registered `hcDark`/`hcLight` defaults. Each preset's provenance record includes those pinned registry sources, resolved colors, and explicit adaptations for upstream `null` (inherit) values in Frame's isolated scopes.

Black uses a black canvas, white text, cyan boundaries, and orange focus/selection outlines. White uses a white canvas, `#292929` text, dark blue boundaries, and blue focus outlines. Primary buttons use their own upstream background/foreground/border roles, rather than treating a focus accent as a button fill. Both disable shadow, blur and primary-button brightness effects. They are application themes; selecting one does not enable the operating system's forced-colors mode.

Selection uses `--frame-list-selection-background`, `--frame-list-selection-foreground`, and `--frame-list-selection-border`, with `--frame-list-hover-background` for hover. Application-owned lists should use these together; hardcoded white text or translucent white fills cannot adapt to light themes. Tailwind exposes `bg-selection`, `text-selection-foreground`, and `outline-selection-border` for the same roles. Core's view/navigation bars use the selection-border token without suppressing keyboard focus. Selected quick-input descriptions inherit the selected foreground.

Production-browser checks measure selected text, primary buttons, and quick-input descriptions above 7:1, with visible focus/boundaries and matching portal scopes. These checks cover the supplied preview; applications still need to verify their own content, component states, and integrations.

## Build locally

All packages remain private. From the repository root, run `bun run build:library`, then `bun run build:themes`. Install `@frame/themes` as a workspace dependency or local package alongside compatible Core. The build externalizes Core and ships the JSON definition, declarations, provenance and license notice. Core and Tailwind do not depend on this package.

## Source conventions and ownership

`src/index.ts` exports documented, validated immutable presets; `src/presets/`
contains their portable JSON definitions. `provenance/` and `licenses/` retain
source and licensing records. Public preset names and JSON subpaths are stable.

This package owns data, not live state or subscriptions, so it deliberately
uses no artificial class wrapper. Core's theme classes own parsing, selection,
application, and cleanup; consumers select presets through their own Frame.
The shared TypeScript/TSDoc and formatting standards apply to handwritten code
and build configuration. Palette values, provenance, and JSON definitions are
preserved during architecture-only changes.
