# Quick Pick

A searched list for choosing a command or application item.

## Features

### Find and choose a command

Search command labels and details, then use the arrow keys and Enter to accept an enabled command. The host receives its stable ID.

<!-- frame:example id="quick-input.pick-command" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameQuickPick, FrameButton } from '@frame/core';
const demoItems = [
  {
    "id": "open",
    "label": "Open workspace",
    "detail": "Choose a workspace folder"
  },
  {
    "id": "save",
    "label": "Save all files",
    "shortcut": "Ctrl+Shift+S"
  },
  {
    "id": "unavailable",
    "label": "Connect remote",
    "disabled": true
  }
];
const quickOpen = ref(false);
const selected = ref("");
function acceptQuick(id: string) { selected.value = id; quickOpen.value = false; }
</script>
<template>
<FrameButton @click="quickOpen = true">Choose an item</FrameButton>
<FrameQuickPick v-if="quickOpen" :title="&quot;Choose a command&quot;" :placeholder="&quot;Find a command…&quot;" :items="demoItems" @close="quickOpen = false" @accept="acceptQuick"></FrameQuickPick>
<p role="status">{{ selected }}</p>
</template>
```

### Search a centered file picker

Center the same searched list when choosing a file is the main task. Matching details help distinguish files with similar names.

<!-- frame:example id="quick-input.choose-file" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameQuickPick, FrameButton } from '@frame/core';
const demoItems = [
  {
    "id": "src-app",
    "label": "App.vue",
    "detail": "src/App.vue"
  },
  {
    "id": "test-app",
    "label": "App.test.ts",
    "detail": "tests/App.test.ts"
  },
  {
    "id": "readme",
    "label": "README.md",
    "detail": "Project documentation"
  }
];
const quickOpen = ref(false);
const selected = ref("");
function acceptQuick(id: string) { selected.value = id; quickOpen.value = false; }
</script>
<template>
<FrameButton @click="quickOpen = true">Choose an item</FrameButton>
<FrameQuickPick v-if="quickOpen" :title="&quot;Open file&quot;" :position="&quot;center&quot;" :items="demoItems" @close="quickOpen = false" @accept="acceptQuick"></FrameQuickPick>
<p role="status">{{ selected }}</p>
</template>
```

### Present richer item content

The item slot receives each item and its active state. This example keeps the live label and detail while adding a consistent visual prefix.

<!-- frame:example id="quick-input.custom-item" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameQuickPick, FrameButton } from '@frame/core';
const demoItems = [
  {
    "id": "design",
    "label": "Design system",
    "detail": "Shared interface components"
  },
  {
    "id": "app",
    "label": "Application",
    "detail": "Product workspace"
  }
];
const quickOpen = ref(false);
const selected = ref("");
function acceptQuick(id: string) { selected.value = id; quickOpen.value = false; }
</script>
<template>
<FrameButton @click="quickOpen = true">Choose an item</FrameButton>
<FrameQuickPick v-if="quickOpen" :title="&quot;Choose a workspace&quot;" :items="demoItems" @close="quickOpen = false" @accept="acceptQuick"><template #item="{ item }"><div><span v-text="&quot;→ &quot;" /><strong>{{ item.label }}</strong><small>{{ item.detail }}</small></div></template></FrameQuickPick>
<p role="status">{{ selected }}</p>
</template>
```

## APIs

<!-- frame:generated api="quick-input" -->

### FrameQuickPick

Source: `packages/core/src/components/framework/FrameQuickPick.vue`

#### Properties

| Name                | Type                                              | Default           | Description                                                                             |
| ------------------- | ------------------------------------------------- | ----------------- | --------------------------------------------------------------------------------------- |
| `items`             | `readonly QuickPickItem[]`                        | Required          | Available quick-pick entries; disabled, heading, and separator rows cannot be accepted. |
| `title`             | `string`                                          | Required          | Visible heading and accessible name for this presentation.                              |
| `placeholder`       | `string \| undefined`                             | "Type to search…" | Prompt shown when the input is empty.                                                   |
| `position`          | `"top" \| "center" \| undefined`                  | Omitted           | Preferred quick-input placement at the top or center of the owning shell.               |
| `mode`              | `"frame" \| "application" \| "pick" \| undefined` | Omitted           | Quick-pick mode used to select the command operator and category behavior.              |
| `category`          | `string \| undefined`                             | Omitted           | Explicit active command-prefix category, overriding the mode-derived operator.          |
| `searchable`        | `boolean \| undefined`                            | false             | Enables filtering by the typed query unless explicitly false.                           |
| `initialQuery`      | `string \| undefined`                             | Omitted           | Initial input query for this picker presentation.                                       |
| `initialSelectedId` | `string \| undefined`                             | Omitted           | Initial highlighted entry ID, repaired when unavailable in the filtered results.        |
| `categories`        | `readonly CommandPrefix[] \| undefined`           | Omitted           | Available command-prefix categories; defaults to the Frame commands category.           |

#### Events

| Name     | Parameters                                      | Return type | Description                                                                      |
| -------- | ----------------------------------------------- | ----------- | -------------------------------------------------------------------------------- |
| `accept` | `id: string`                                    | `void`      | Reports acceptance of an available quick-pick entry ID.                          |
| `close`  | `None`                                          | `void`      | Requests dismissal of this presentation without disposing its owning controller. |
| `state`  | `state: { query: string; selectedId: string; }` | `void`      | Reports the current query and highlighted entry for host restoration.            |
| `mode`   | `mode: string`                                  | `void`      | Reports a command-prefix category change requested by input.                     |

#### Slots

| Name   | Parameters                                  | Return type  | Description                                                                                    |
| ------ | ------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------- |
| `item` | `{ item: QuickPickItem; active: boolean; }` | `VNodeChild` | Replaces one result row's content while retaining picker selection and accessibility behavior. |

#### Exposed API

| Name      | Parameters | Return type                     | Description                                                                                       |
| --------- | ---------- | ------------------------------- | ------------------------------------------------------------------------------------------------- |
| `element` | `None`     | `HTMLInputElement \| undefined` | Search input element, when mounted, for host focus integration.                                   |
| `focus`   | `None`     | `void \| undefined`             | Focuses the active input or terminal surface without creating or disposing its owning controller. |

### frame.showQuickPick

Source: `packages/core/src/components/framework/quickPick.ts`

#### Properties

| Name                | Type                                                   | Default | Description                                              |
| ------------------- | ------------------------------------------------------ | ------- | -------------------------------------------------------- |
| `searchable`        | `boolean`                                              | Omitted | Controls text filtering; defaults to true.               |
| `initialQuery`      | `string`                                               | Omitted | Restores navigation state when returning to a submenu.   |
| `initialSelectedId` | `string`                                               | Omitted | Restores keyboard highlight when returning to a submenu. |
| `onStateChange`     | `(state: {query: string; selectedId: string}) => void` | Omitted | Reports state to the owning navigation controller.       |
| `title`             | `string`                                               | Omitted | Heading displayed by the owning presentation.            |
| `placeholder`       | `string`                                               | Omitted | Hint displayed when the input or search field is empty.  |

#### Events

No declared entries.

#### Slots

No declared entries.

#### Exposed API

| Name                  | Parameters                                        | Return type               | Description                                                          |
| --------------------- | ------------------------------------------------- | ------------------------- | -------------------------------------------------------------------- |
| `frame.showQuickPick` | `items: readonly T[], options?: QuickPickOptions` | `Promise<T \| undefined>` | Opens explicit typed choices and resolves selection or cancellation. |

<!-- /frame:generated -->

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="quick-input" -->

| CSS variable                                   | Theme path                                   | Default expression                                                            | Purpose                                                                                                                                                                                 | Context                                                                                           |
| ---------------------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `--frame-preference-where-workbench-font-size` | `frame.preference.where.workbench.font.size` | `11px`                                                                        | Text size for .preference :where(.workbench, .frame-menu, .palette-backdrop) strong.                                                                                                    | `.preference :where(.workbench, .frame-menu, .palette-backdrop) strong`                           |
| `--frame-font-body`                            | `frame.font.body`                            | No declared default; supplied by context.                                     | Primary font family inherited by shell content and ordinary controls.                                                                                                                   | `:where(.frame-shell-text)`                                                                       |
| `--frame-font-size-body`                       | `frame.font.size.body`                       | No declared default; supplied by context.                                     | Base text size inherited by shell content and ordinary controls.                                                                                                                        | `:where(.frame-shell-text)`                                                                       |
| `--frame-text`                                 | `frame.text`                                 | No declared default; supplied by context.                                     | Primary foreground for readable text and icons across shell and application content.                                                                                                    | `:where(.frame-shell-text)`                                                                       |
| `--frame-quick-background`                     | `frame.quick.background`                     | No declared default; supplied by context.                                     | Surface behind quick input and quick action overlays.                                                                                                                                   | `.palette`                                                                                        |
| `--frame-menu-border`                          | `frame.menu.border`                          | No declared default; supplied by context.                                     | Border color around floating menus, independently overridable from control borders.                                                                                                     | `.palette`                                                                                        |
| `--frame-quick-selection`                      | `frame.quick.selection`                      | No declared default; supplied by context.                                     | Background highlighting the active quick input or quick action result.                                                                                                                  | `.command-result.active`                                                                          |
| `--frame-menu-disabled`                        | `frame.menu.disabled`                        | No declared default; supplied by context.                                     | Foreground of unavailable or disabled menu actions.                                                                                                                                     | `.command-result.disabled`                                                                        |
| `--frame-where-workbench-border`               | `frame.where.workbench.border`               | `0`                                                                           | Border for :where(.workbench, .frame-menu, .palette-backdrop) button.                                                                                                                   | `:where(.frame-control-scope) button`                                                             |
| `--frame-where-workbench-background`           | `frame.where.workbench.background`           | `none`                                                                        | Background for :where(.workbench, .frame-menu, .palette-backdrop) button.                                                                                                               | `:where(.frame-control-scope) button`                                                             |
| `--frame-where-workbench-outline-offset`       | `frame.where.workbench.outline.offset`       | `-2px`                                                                        | Outline offset for :where(.workbench, .frame-menu, .palette-backdrop) :is(button, a, input):focus-visible.                                                                              | `:where(.frame-control-scope) :is(button, a, input):focus-visible`                                |
| `--frame-accent`                               | `frame.accent`                               | No declared default; supplied by context.                                     | Shared interaction color for keyboard focus, active actions, and accent-filled controls.                                                                                                | `:where(.frame-control-scope) :is(button, a, input):focus-visible`                                |
| `--frame-where-workbench-color`                | `frame.where.workbench.color`                | `#eee`                                                                        | Foreground for :where(.workbench, .frame-menu, .palette-backdrop) button:hover:not(:disabled).                                                                                          | `:where(.frame-control-scope) button:hover:not(:disabled)`                                        |
| `--frame-where-workbench-margin`               | `frame.where.workbench.margin`               | `0`                                                                           | Outer spacing for :where(.workbench, .frame-menu, .palette-backdrop) :is(h1, h2, p).                                                                                                    | `:where(.frame-control-scope) :is(h1, h2, p)`                                                     |
| `--frame-where-workbench-font-weight`          | `frame.where.workbench.font.weight`          | `500`                                                                         | Text weight for :where(.workbench, .frame-menu, .palette-backdrop) strong.                                                                                                              | `:where(.frame-control-scope) strong`                                                             |
| `--frame-where-workbench-font-size`            | `frame.where.workbench.font.size`            | `10px`                                                                        | Text size for :where(.workbench, .frame-menu, .palette-backdrop, .frame-tooltip) kbd.                                                                                                   | `:where(.frame-box-scope) kbd`                                                                    |
| `--frame-where-workbench-line-height`          | `frame.where.workbench.line.height`          | `15px`                                                                        | Text line height for :where(.workbench, .frame-menu, .palette-backdrop, .frame-tooltip) kbd.                                                                                            | `:where(.frame-box-scope) kbd`                                                                    |
| `--frame-where-workbench-color-2`              | `frame.where.workbench.color.2`              | `#b8bdc0`                                                                     | Foreground for :where(.workbench, .frame-menu, .palette-backdrop, .frame-tooltip) kbd.                                                                                                  | `:where(.frame-box-scope) kbd`                                                                    |
| `--frame-shortcut-border-color`                | `frame.shortcut.border.color`                | `#35393b`                                                                     | Border for :where(.workbench, .frame-menu, .palette-backdrop, .frame-tooltip) kbd. Used when --frame-where-workbench-border-2 is unset.                                                 | `:where(.frame-box-scope) kbd`                                                                    |
| `--frame-where-workbench-border-2`             | `frame.where.workbench.border.2`             | `1px solid     var(       --frame-shortcut-border-color,       #35393b     )` | Border for :where(.workbench, .frame-menu, .palette-backdrop, .frame-tooltip) kbd.                                                                                                      | `:where(.frame-box-scope) kbd`                                                                    |
| `--frame-where-workbench-border-radius`        | `frame.where.workbench.border.radius`        | `var(     --frame-radius-medium   )`                                          | Corner radius for :where(.workbench, .frame-menu, .palette-backdrop, .frame-tooltip) kbd.                                                                                               | `:where(.frame-box-scope) kbd`                                                                    |
| `--frame-where-workbench-background-2`         | `frame.where.workbench.background.2`         | `#242729`                                                                     | Background for :where(.workbench, .frame-menu, .palette-backdrop, .frame-tooltip) kbd.                                                                                                  | `:where(.frame-box-scope) kbd`                                                                    |
| `--frame-where-workbench-padding`              | `frame.where.workbench.padding`              | `0 4px`                                                                       | Internal spacing for :where(.workbench, .frame-menu, .palette-backdrop, .frame-tooltip) kbd.                                                                                            | `:where(.frame-box-scope) kbd`                                                                    |
| `--frame-radius-medium`                        | `frame.radius.medium`                        | No declared default; supplied by context.                                     | Medium shared corner radius used by ordinary controls.                                                                                                                                  | `:where(.frame-box-scope) kbd`                                                                    |
| `--frame-overlay-backdrop-filter`              | `frame.overlay.backdrop.filter`              | No declared default; supplied by context.                                     | Blur and saturation treatment behind shared translucent floating surfaces.                                                                                                              | `.frame-overlay-surface`                                                                          |
| `--frame-where-workbench-width`                | `frame.where.workbench.width`                | `0`                                                                           | Width for :where( .workbench, .frame-menu, .palette-backdrop, .frame-modal )::-webkit-scrollbar, :where(.workbench, .frame-menu, .palette-backdrop, .frame-modal) ::-webkit-scrollbar.  | `:where(.frame-scroll-scope)::-webkit-scrollbar, :where(.frame-scroll-scope) ::-webkit-scrollbar` |
| `--frame-where-workbench-height`               | `frame.where.workbench.height`               | `0`                                                                           | Height for :where( .workbench, .frame-menu, .palette-backdrop, .frame-modal )::-webkit-scrollbar, :where(.workbench, .frame-menu, .palette-backdrop, .frame-modal) ::-webkit-scrollbar. | `:where(.frame-scroll-scope)::-webkit-scrollbar, :where(.frame-scroll-scope) ::-webkit-scrollbar` |
| `--frame-One-quick-input-surface-padding`      | `frame.One.quick.input.surface.padding`      | `6px 8px`                                                                     | Internal spacing for .palette-backdrop.                                                                                                                                                 | `.palette-backdrop`                                                                               |
| `--frame-palette-width`                        | `frame.palette.width`                        | `600px`                                                                       | Width for .palette.                                                                                                                                                                     | `.palette`                                                                                        |
| `--frame-palette-max-width`                    | `frame.palette.max.width`                    | `100%`                                                                        | Maximum width for .palette.                                                                                                                                                             | `.palette`                                                                                        |
| `--frame-palette-max-height`                   | `frame.palette.max.height`                   | `min(     420px,     calc(100dvh - 12px)   )`                                 | Maximum height for .palette.                                                                                                                                                            | `.palette`                                                                                        |
| `--frame-palette-background`                   | `frame.palette.background`                   | `#202325`                                                                     | Background for .palette.                                                                                                                                                                | `.palette`                                                                                        |
| `--frame-quick-border-color`                   | `frame.quick.border.color`                   | `#32383b`                                                                     | Border for .palette.                                                                                                                                                                    | `.palette`                                                                                        |
| `--frame-palette-border`                       | `frame.palette.border`                       | `1px solid     var(       --frame-quick-border-color,       #32383b     )`    | Border for .palette.                                                                                                                                                                    | `.palette`                                                                                        |
| `--frame-palette-border-radius`                | `frame.palette.border.radius`                | `var(--frame-radius-large)`                                                   | Corner radius for .palette.                                                                                                                                                             | `.palette`                                                                                        |
| `--frame-palette-padding`                      | `frame.palette.padding`                      | `6px`                                                                         | Internal spacing for .palette.                                                                                                                                                          | `.palette`                                                                                        |
| `--frame-palette-box-shadow`                   | `frame.palette.box.shadow`                   | `0 9px 28px #0006`                                                            | Elevation shadow for .palette.                                                                                                                                                          | `.palette`                                                                                        |
| `--frame-radius-large`                         | `frame.radius.large`                         | No declared default; supplied by context.                                     | Large shared corner radius used by panel and menu containers.                                                                                                                           | `.palette`                                                                                        |
| `--frame-border`                               | `frame.border`                               | No declared default; supplied by context.                                     | border used by border in .picker-heading.                                                                                                                                               | `.picker-heading`                                                                                 |
| `--frame-text-muted`                           | `frame.text.muted`                           | No declared default; supplied by context.                                     | text muted used by padding in .picker-heading.                                                                                                                                          | `.picker-heading`                                                                                 |
| `--frame-spacing-unit`                         | `frame.spacing.unit`                         | `4px`                                                                         | Space between children for .palette-input.                                                                                                                                              | `.palette-input`                                                                                  |
| `--frame-input-bg`                             | `frame.input.bg`                             | `var(--frame-overlay-background)`                                             | Background for .quick-input-operator.                                                                                                                                                   | `.quick-input-operator`                                                                           |
| `--frame-radius-small`                         | `frame.radius.small`                         | `3px`                                                                         | Corner radius for .quick-input-operator.                                                                                                                                                | `.quick-input-operator`                                                                           |
| `--frame-text`                                 | `frame.text`                                 | No declared default; supplied by context.                                     | Primary foreground for readable text and icons across shell and application content.                                                                                                    | `.quick-input-operator`                                                                           |
| `--frame-overlay-background`                   | `frame.overlay.background`                   | `color-mix(in srgb, var(--frame-overlay-surface) 83%, transparent)`           | Shared translucent fill for floating surfaces over the application canvas.                                                                                                              | `.quick-input-operator`                                                                           |
| `--frame-font-mono`                            | `frame.font.mono`                            | No declared default; supplied by context.                                     | Monospace font family for code, terminal text, and fixed-width content.                                                                                                                 | `.quick-input-operator`                                                                           |
| `--frame-palette-input-padding-bottom`         | `frame.palette.input.padding.bottom`         | `5px`                                                                         | Bottom internal spacing for .palette-input.                                                                                                                                             | `.palette-input`                                                                                  |
| `--frame-palette-results-min-height`           | `frame.palette.results.min.height`           | `0`                                                                           | Minimum height for .palette-results.                                                                                                                                                    | `.palette-results`                                                                                |
| `--frame-command-result-gap`                   | `frame.command.result.gap`                   | `10px`                                                                        | Space between children for .command-result.                                                                                                                                             | `.command-result`                                                                                 |
| `--frame-command-result-min-height`            | `frame.command.result.min.height`            | `23px`                                                                        | Minimum height for .command-result.                                                                                                                                                     | `.command-result`                                                                                 |
| `--frame-command-result-padding`               | `frame.command.result.padding`               | `2px 7px`                                                                     | Internal spacing for .command-result.                                                                                                                                                   | `.command-result`                                                                                 |
| `--frame-command-result-border-radius`         | `frame.command.result.border.radius`         | `var(     --frame-radius-medium   )`                                          | Corner radius for .command-result.                                                                                                                                                      | `.command-result`                                                                                 |
| `--frame-command-result-font-size`             | `frame.command.result.font.size`             | `12px`                                                                        | Text size for .command-result.                                                                                                                                                          | `.command-result`                                                                                 |
| `--frame-radius-medium`                        | `frame.radius.medium`                        | No declared default; supplied by context.                                     | Medium shared corner radius used by ordinary controls.                                                                                                                                  | `.command-result`                                                                                 |
| `--frame-command-result-active-background`     | `frame.command.result.active.background`     | `#344b57`                                                                     | Background for .command-result.active.                                                                                                                                                  | `.command-result.active`                                                                          |
| `--frame-command-result-active-color`          | `frame.command.result.active.color`          | `#f0f4f6`                                                                     | Foreground for .command-result.active.                                                                                                                                                  | `.command-result.active`                                                                          |
| `--frame-command-result-small-min-width`       | `frame.command.result.small.min.width`       | `0`                                                                           | Minimum width for .command-result small.                                                                                                                                                | `.command-result small`                                                                           |
| `--frame-command-result-small-font-size`       | `frame.command.result.small.font.size`       | `10px`                                                                        | Text size for .command-result small.                                                                                                                                                    | `.command-result small`                                                                           |
| `--frame-command-result-small-color`           | `frame.command.result.small.color`           | `#8f9ba1`                                                                     | Foreground for .command-result small.                                                                                                                                                   | `.command-result small`                                                                           |
| `--frame-command-result-kbd-font-size`         | `frame.command.result.kbd.font.size`         | `9px`                                                                         | Text size for .command-result kbd.                                                                                                                                                      | `.command-result kbd`                                                                             |
| `--frame-command-result-kbd-line-height`       | `frame.command.result.kbd.line.height`       | `14px`                                                                        | Text line height for .command-result kbd.                                                                                                                                               | `.command-result kbd`                                                                             |
| `--frame-command-result-kbd-background`        | `frame.command.result.kbd.background`        | `#ffffff08`                                                                   | Background for .command-result kbd.                                                                                                                                                     | `.command-result kbd`                                                                             |
| `--frame-command-result-kbd-border-color`      | `frame.command.result.kbd.border.color`      | `#ffffff10`                                                                   | Border color for .command-result kbd.                                                                                                                                                   | `.command-result kbd`                                                                             |
| `--frame-command-result-disabled-color`        | `frame.command.result.disabled.color`        | `#68747a`                                                                     | Foreground for .command-result.disabled.                                                                                                                                                | `.command-result.disabled`                                                                        |
| `--frame-no-results-color`                     | `frame.no.results.color`                     | `#99a6ad`                                                                     | Foreground for .no-results.                                                                                                                                                             | `.no-results`                                                                                     |
| `--frame-no-results-font-size`                 | `frame.no.results.font.size`                 | `12px`                                                                        | Text size for .no-results.                                                                                                                                                              | `.no-results`                                                                                     |
| `--frame-no-results-padding`                   | `frame.no.results.padding`                   | `10px 7px`                                                                    | Internal spacing for .no-results.                                                                                                                                                       | `.no-results`                                                                                     |
| `--frame-command-result-font-size-2`           | `frame.command.result.font.size.2`           | `11px`                                                                        | Text size for .command-result.                                                                                                                                                          | `@media (max-width: 540px) { .command-result }`                                                   |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->
