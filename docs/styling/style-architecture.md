# Core style architecture

Core owns shell presentation and reusable controls; optional modules own their
own presentation. Maintained styles use SCSS and runtime theme values remain
`--frame-*` CSS properties. Read the [CSS/SCSS standard](../contributing/coding-standards/css.md)
and [theme variables](theme-variables.md) before changing styles.

## Ownership and composition

Component-private rules live directly in the owning Vue component’s
`<style lang="scss">` blocks. Existing global blocks stay global; existing
scoped blocks retain their scope. A component may have both when its private
presentation and portal/integration rules need different scopes. There are no
adjacent component-private SCSS sheets. File length is not an extraction rule.

Separate SCSS sheets contain shared foundations, explicit reusable classes,
cross-component structural contracts, and Sass tools. Retained state, theme,
host-layout, and third-party selectors express actual relationships; they are
not substitutes for opting unrelated components into a shared appearance.

`packages/core/src/styles/index.scss` composes shell foundations and shared
integration rules in deliberate order. `FrameShell.vue` imports it. Inputs and
workspace-tab foundations precede generated theme defaults, shell resets/layout,
and later integration specializations. The explicit `@use` list is authoritative;
do not sort it. Repeated selector phases remain where cascade order matters.

The unexported legacy `WorkspaceCanvas.vue` keeps its private rules embedded.
FrameShell explicitly imports that Vue style block through Vite's style query
to retain the existing canvas classes in distributed CSS without mounting or
exporting another view. Keep its style-block index in sync when editing it.

Vite collects Core component and shell CSS into `dist/frame.css`, exported as
`@frame/core/style.css`. Hosts load this public stylesheet once, including for
standalone controls. Private SCSS now also travels with direct source-component
imports; source-only fixtures must use the same shared stylesheet contract when
comparing complete shell/control appearance. Built consumers need no Sass.

## Shared files and responsibilities

Locations below are relative to `packages/core/src`.

| Location                                                                                                                                   | Responsibility                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `styles/_foundations.scss`                                                                                                                 | Explicit shell box/control scopes, overlay hit testing, and nonselectable shell labels.                                               |
| `styles/_accessibility-and-responsive.scss`                                                                                                | Screen-reader helpers, skip link, and shared early responsive shell treatments.                                                       |
| `styles/_scroll-treatment.scss`                                                                                                            | Shared native-scrollbar treatment applied through a scroll-scope class.                                                               |
| `styles/_overlay-surfaces.scss`                                                                                                            | Explicit frosted-overlay class and reduced-transparency/backdrop-filter fallbacks for theme scopes.                                   |
| `styles/mixins/_surfaces.scss`                                                                                                             | Framed contour/fill and paired prefixed/standard backdrop-effect contracts; no top-level selectors.                                   |
| `components/forms/styles/input-surfaces.scss`                                                                                              | Shared input border/focus policy and per-control runtime token bindings.                                                              |
| `components/forms/styles/_input-surface-tools.scss`                                                                                        | Cohesive `text-surface-variables($prefix)` mixin; generated token names retain public CSS names.                                      |
| `components/forms/styles/{controls,advanced,dates,files}.scss`                                                                             | Explicit control/date typography/surface/focus classes and genuine shared composite input, calendar, color, and file contracts.       |
| `components/layout/styles/disclosure-and-layout.scss`                                                                                      | Shared disclosure surfaces, typography, focus and disabled presentation.                                                              |
| `components/navigation/styles/navigation.scss`                                                                                             | Explicit navigation typography/list/trigger/surface/focus classes and shared menu integration.                                        |
| `components/navigation/styles/_shell-menu*.scss`                                                                                           | Shell menu rows, highlight/alignment, portal positioning, and shared shell text scope.                                                |
| `components/overlays/styles/surfaces.scss`                                                                                                 | Explicit independent overlay surfaces and shared dialog/menu anatomy.                                                                 |
| `components/framework/styles/_workbench*.scss`                                                                                             | Shell grids, region composition, compact layout, and navigation docking.                                                              |
| `components/framework/styles/_workspace*.scss`                                                                                             | Shared canvas/pane workspace contract, banners, pane-host composition, and workspace/modal integration.                               |
| `components/framework/styles/_view*.scss`, `_sidebars.scss`, `_sashes-and-sections.scss`                                                   | View/collection hosts, contours, shared section structure, resize coordinates, and placement.                                         |
| `components/framework/styles/_status-bar.scss`, `_titlebar-controls.scss`, `_tooltips-and-panels.scss`, `_menubar-and-layout-options.scss` | Shared status/title/menu/panel/tooltip integration and retained host-facing layout classes. Private presentation stays in components. |
| `components/framework/styles/_settings.scss`, `_modals.scss`                                                                               | Shared modal control resets and settings/shell integration; ordinary controls remain independently owned.                             |
| `components/framework/styles/{bar-items,docks,panel-docking,panel-view-bar,shell-sidebars,view-bars,workspace-tabs}.scss`                  | Shared family and host layout contracts loaded by their owners; workspace tabs also participate in central composition.               |
| `modules/chat/styles/`                                                                                                                     | Composition plus shared transcript/event surfaces and a cohesive event-heading layout mixin.                                          |
| `modules/terminal/styles/`                                                                                                                 | Composition plus shared terminal host/content integration and control-row presentation.                                               |
| `modules/viewer/styles/`                                                                                                                   | Composition plus shared viewer controls/media and structural integration.                                                             |

Editor and notification-history presentation is entirely embedded in their
owning module components, so those modules do not need a shared style entry.
The main Core entry never imports optional modules or their styles. Monaco/PDF
assets remain lazy; importing styles does not activate engines or adapters.

Some inherited selectors have no current Core template owner (for example log
content and older pane-header classes). They remain in their existing shared
host-facing group to preserve consumers. Do not invent a component owner, remove
them, or copy private rules back into shared sheets merely to empty a file.

## Explicit classes and Sass tools

Use `.frame-overlay-surface` for the paired backdrop effect. Each surface keeps
its existing background, border and shadow tokens. Add the class in markup on
the actual portaled surface; adding a new overlay requires no selector list.
`frame-box-scope`, `frame-control-scope`, `frame-shell-text`, `frame-scroll-scope`,
`frame-shell-label` and `frame-overlay-interactive` similarly make shared shell
presentation explicit. Theme scopes continue using the managed runtime marker.

Reusable families provide responsibility classes such as `frame-input-surface`,
input focus-policy classes, `frame-control-surface`, `frame-layout-text`,
`frame-disclosure-trigger`, `frame-navigation-control`, `frame-date-text`, and
`frame-general-surface`. State still comes from native pseudo-classes and Reka
attributes. Child selectors remain where a composite control has real anatomy.

Use `surfaces.framed-surface($border, $radius, $background)` for a cohesive
contour/fill group while keeping component-specific padding separate. Input
token bindings and chat event headings have their own meaningful mixins.
Import tools with `@use` inside Vue style blocks. Tools emit no global rules
merely by being imported. No value function is needed by the current reuse;
add one only for a real reusable calculation, not to meet an abstraction quota.

## CSS exceptions and verification

`themes/generated/default.css` is generated from the theme catalog by
`packages/core/scripts/generate-theme-css.ts`. It stays CSS, exports as
`@frame/core/tokens.css`, and is composed using its explicit `.css` extension.
Edit catalog/generator sources and regenerate rather than editing that output.

Vite’s `dist/**/*.css`, third-party xterm/Monaco/PDF assets, DOM style values and
runtime-generated CSS also stay CSS. The library style attachment plugin keeps
output with its owning JavaScript chunk. Docs, Tailwind, Themes and application
styles outside Core retain their own source formats and package ownership.

Token scanning compiles Sass and Vue styles as well as reading runtime source
references, so interpolated mixins cannot silently lose token names. The shared
build-time `scripts/compile-style-source.ts` supports token inventories, theme
contract extraction and contract validation. Generated documentation reflects
compiled selectors and consuming source owners; regenerate rather than hand-edit.

Use `bun run format` and `bun run check`, Core `tokens:check`, `bun run
docs:contracts`, `bun run build:library`, `bun run check:consumer`, `bun run
check:modules`, `bun test`, and `bun run build` as appropriate. Build library
outputs before dist-consuming checks, and do not rebuild during those checks.

When relocating styles or changing semantic class adoption, compare rendered
geometry, surfaces, portals, runtime themes, focus/disabled states and responsive
layout. CSS emission order and direct-source loading can change even when
declarations are preserved. Keep unsupported visual-equivalence claims out of
verification reports.
