# Quick Panel

A titled quick overlay for application-owned content and header actions.

## Features

### Review a workspace summary

Use a quick panel for application content that is not a searched list. The host owns the content and closes the panel in response to close.

<!-- frame:example id="quick-panel.workspace-summary" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameQuickPanel, FrameButton } from '@frame/core';
const quickOpen = ref(false);
</script>
<template>
<FrameButton @click="quickOpen = true">Open panel</FrameButton>
<FrameQuickPanel v-if="quickOpen" :title="&quot;Workspace summary&quot;" @close="quickOpen = false">  <template #default><span v-text="&quot;Design system workspace · 12 active projects · Last saved just now.&quot;" /></template></FrameQuickPanel>
</template>
```

### Add a panel header action

Place an explicit Done action in the header-actions slot while leaving the content body available for application-owned information.

<!-- frame:example id="quick-panel.header-action" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameQuickPanel, FrameButton } from '@frame/core';
const quickOpen = ref(false);
</script>
<template>
<FrameButton @click="quickOpen = true">Open panel</FrameButton>
<FrameQuickPanel v-if="quickOpen" :title="&quot;Review changes&quot;" @close="quickOpen = false"><template #default><span v-text="&quot;All source files are saved. Review the changes before continuing.&quot;" /></template>
<template #header-actions><FrameButton @click="quickOpen = false"><span v-text="&quot;Done&quot;" /></FrameButton></template></FrameQuickPanel>
</template>
```

### Center a focused information panel

Center custom content when the panel deserves the user’s attention without adding an unrelated search field or item model.

<!-- frame:example id="quick-panel.centered-summary" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameQuickPanel, FrameButton } from '@frame/core';
const quickOpen = ref(false);
</script>
<template>
<FrameButton @click="quickOpen = true">Open panel</FrameButton>
<FrameQuickPanel v-if="quickOpen" :title="&quot;Build summary&quot;" :position="&quot;center&quot;" @close="quickOpen = false"><template #default><span v-text="&quot;Build completed successfully. 24 modules checked, no errors.&quot;" /></template>
<template #header-actions><FrameButton @click="quickOpen = false"><span v-text="&quot;Close summary&quot;" /></FrameButton></template></FrameQuickPanel>
</template>
```

## APIs

<!-- frame:generated api="quick-panel" -->

### FrameQuickPanel

Source: `packages/core/src/components/framework/FrameQuickPanel.vue`

#### Properties

| Name       | Type                             | Default  | Description                                                               |
| ---------- | -------------------------------- | -------- | ------------------------------------------------------------------------- |
| `title`    | `string`                         | Required | Visible heading and accessible name for this presentation.                |
| `position` | `"top" \| "center" \| undefined` | Omitted  | Preferred quick-input placement at the top or center of the owning shell. |

#### Events

| Name    | Parameters | Return type | Description                                                                      |
| ------- | ---------- | ----------- | -------------------------------------------------------------------------------- |
| `close` | `None`     | `void`      | Requests dismissal of this presentation without disposing its owning controller. |

#### Slots

| Name             | Parameters | Return type  | Description                                         |
| ---------------- | ---------- | ------------ | --------------------------------------------------- |
| `default`        | `None`     | `VNodeChild` | Scrollable panel body.                              |
| `header-actions` | `None`     | `VNodeChild` | Additional header controls before the close button. |

#### Exposed API

No declared entries.

<!-- /frame:generated -->

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="quick-panel" -->

| CSS variable                                   | Theme path                                   | Default expression                                                            | Purpose                                                                                                                                                                                 | Context                                                                                           |
| ---------------------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `--frame-preference-where-workbench-font-size` | `frame.preference.where.workbench.font.size` | `11px`                                                                        | Text size for .preference :where(.workbench, .frame-menu, .palette-backdrop) strong.                                                                                                    | `.preference :where(.workbench, .frame-menu, .palette-backdrop) strong`                           |
| `--frame-font-body`                            | `frame.font.body`                            | No declared default; supplied by context.                                     | Primary font family inherited by shell content and ordinary controls.                                                                                                                   | `:where(.frame-shell-text)`                                                                       |
| `--frame-font-size-body`                       | `frame.font.size.body`                       | No declared default; supplied by context.                                     | Base text size inherited by shell content and ordinary controls.                                                                                                                        | `:where(.frame-shell-text)`                                                                       |
| `--frame-text`                                 | `frame.text`                                 | No declared default; supplied by context.                                     | Primary foreground for readable text and icons across shell and application content.                                                                                                    | `:where(.frame-shell-text)`                                                                       |
| `--frame-quick-background`                     | `frame.quick.background`                     | No declared default; supplied by context.                                     | Surface behind quick input and quick action overlays.                                                                                                                                   | `.palette`                                                                                        |
| `--frame-menu-border`                          | `frame.menu.border`                          | No declared default; supplied by context.                                     | Border color around floating menus, independently overridable from control borders.                                                                                                     | `.palette`                                                                                        |
| `--frame-quick-panel-header-padding`           | `frame.quick.panel.header.padding`           | `0 2px 5px 8px`                                                               | Internal spacing for .quick-panel-header.                                                                                                                                               | `.quick-panel-header`                                                                             |
| `--frame-quick-panel-header-min-height`        | `frame.quick.panel.header.min.height`        | `28px`                                                                        | Minimum height for .quick-panel-header.                                                                                                                                                 | `.quick-panel-header`                                                                             |
| `--frame-text`                                 | `frame.text`                                 | No declared default; supplied by context.                                     | Primary foreground for readable text and icons across shell and application content.                                                                                                    | `.quick-panel-header`                                                                             |
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

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->
