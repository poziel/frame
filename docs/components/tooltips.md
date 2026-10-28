# Tooltips

Shared hover and keyboard tooltips that fit within the window.

## Features

### Basic usage

Tooltips appear after a hover delay or on keyboard focus. They disappear on pointer-down, Escape, scroll, or resize. Choose any side; placement falls back when space is limited.

<!-- frame:example id="tooltips.basic" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameTooltip, FrameShell } from '@frame/core';
import { createFrame } from '@frame/core';
const frame = createFrame();
onBeforeUnmount(() => { frame.dispose(); });
</script>
<template>
<FrameShell :frame="frame">
<FrameTooltip >
  <template #default><span v-text="&quot;Example content&quot;" /></template>
</FrameTooltip>
</FrameShell>
</template>
```

### Disabled state

Set disabled explicitly to override its default. The interactive demo exposes every public property.

<!-- frame:example id="tooltips.configured" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameTooltip, FrameShell } from '@frame/core';
import { createFrame } from '@frame/core';
const frame = createFrame();
const demoDisabled = true;
onBeforeUnmount(() => { frame.dispose(); });
</script>
<template>
<FrameShell :frame="frame">
<FrameTooltip :disabled="demoDisabled">
  <template #default><span v-text="&quot;Example content&quot;" /></template>
</FrameTooltip>
</FrameShell>
</template>
```

## APIs

<!-- frame:generated api="tooltips" -->

### FrameTooltip

Source: `packages/core/src/components/overlays/FrameTooltip.vue`

#### Properties

| Name                      | Type                                                  | Default  | Description                                                                                                                                |
| ------------------------- | ----------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `delayDuration`           | `number \| undefined`                                 | 400      | Hover delay before opening this Frame tooltip. defaultValue: 400                                                                           |
| `ignoreNonKeyboardFocus`  | `boolean \| undefined`                                | true     | Ignores focus that did not originate from keyboard navigation. defaultValue: true                                                          |
| `text`                    | `string \| undefined`                                 | ""       | Tooltip text used when no content slot is supplied; empty content suppresses opening.                                                      |
| `asChild`                 | `boolean \| undefined`                                | false    | Uses the supplied trigger element without adding the normal trigger wrapper.                                                               |
| `shortcut`                | `string \| undefined`                                 | Omitted  | Keyboard shortcut hint displayed beside tooltip content.                                                                                   |
| `placement`               | `"top" \| "bottom" \| "left" \| "right" \| undefined` | "bottom" | Preferred physical side for the overlay, subject to available space.                                                                       |
| `defaultOpen`             | `boolean \| undefined`                                | false    | The open state of the tooltip when it is initially rendered. Use when you do not need to control its open state.                           |
| `open`                    | `boolean \| undefined`                                | Omitted  | The controlled open state of the tooltip.                                                                                                  |
| `disableHoverableContent` | `boolean \| undefined`                                | false    | Prevents Tooltip.Content from remaining open when hovering. Disabling this has accessibility consequences. Inherits from Tooltip.Provider. |
| `disableClosingTrigger`   | `boolean \| undefined`                                | false    | When `true`, clicking on trigger will not close the content. defaultValue: false                                                           |
| `disabled`                | `boolean \| undefined`                                | false    | When `true`, disable tooltip defaultValue: false                                                                                           |

#### Events

| Name          | Parameters       | Return type | Description                                                      |
| ------------- | ---------------- | ----------- | ---------------------------------------------------------------- |
| `update:open` | `value: boolean` | `void`      | Event handler called when the open state of the tooltip changes. |

#### Slots

| Name      | Parameters                              | Return type  | Description                                                                 |
| --------- | --------------------------------------- | ------------ | --------------------------------------------------------------------------- |
| `default` | `{ describedby: string \| undefined; }` | `VNodeChild` | Trigger content; bind describedby to connect it to visible tooltip content. |
| `content` | `None`                                  | `VNodeChild` | Replaces the text portion of the tooltip.                                   |

#### Exposed API

No declared entries.

<!-- /frame:generated -->

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="tooltips" -->

| CSS variable                            | Theme path                            | Default expression                                                            | Purpose                                                                                                                                 | Context                        |
| --------------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| `--frame-tooltip-trigger-min-width`     | `frame.tooltip.trigger.min.width`     | `0`                                                                           | Minimum width for .tooltip-trigger.                                                                                                     | `.tooltip-trigger`             |
| `--frame-tooltip-gap`                   | `frame.tooltip.gap`                   | `12px`                                                                        | Space between children for .frame-tooltip.                                                                                              | `.frame-tooltip`               |
| `--frame-tooltip-max-width`             | `frame.tooltip.max.width`             | `calc(100vw - 12px)`                                                          | Maximum width for .frame-tooltip.                                                                                                       | `.frame-tooltip`               |
| `--frame-tooltip-padding`               | `frame.tooltip.padding`               | `5px 8px`                                                                     | Internal spacing for .frame-tooltip.                                                                                                    | `.frame-tooltip`               |
| `--frame-tooltip-border`                | `frame.tooltip.border`                | `1px solid var(--frame-line)`                                                 | Border for .frame-tooltip.                                                                                                              | `.frame-tooltip`               |
| `--frame-tooltip-border-radius`         | `frame.tooltip.border.radius`         | `var(     --frame-control-radius   )`                                         | Corner radius for .frame-tooltip.                                                                                                       | `.frame-tooltip`               |
| `--frame-tooltip-background`            | `frame.tooltip.background`            | `var(     --frame-overlay-background   )`                                     | Background for .frame-tooltip.                                                                                                          | `.frame-tooltip`               |
| `--frame-tooltip-color`                 | `frame.tooltip.color`                 | `var(--frame-control-text)`                                                   | Foreground for .frame-tooltip.                                                                                                          | `.frame-tooltip`               |
| `--frame-tooltip-box-shadow`            | `frame.tooltip.box.shadow`            | `0 3px 12px #0005`                                                            | Elevation shadow for .frame-tooltip.                                                                                                    | `.frame-tooltip`               |
| `--frame-tooltip-font-size`             | `frame.tooltip.font.size`             | `11px`                                                                        | Text size for .frame-tooltip.                                                                                                           | `.frame-tooltip`               |
| `--frame-tooltip-line-height`           | `frame.tooltip.line.height`           | `18px`                                                                        | Text line height for .frame-tooltip.                                                                                                    | `.frame-tooltip`               |
| `--frame-line`                          | `frame.line`                          | No declared default; supplied by context.                                     | Neutral divider color for content boundaries, tracks, and structural separators.                                                        | `.frame-tooltip`               |
| `--frame-control-radius`                | `frame.control.radius`                | No declared default; supplied by context.                                     | Shared corner radius of buttons and ordinary controls; text-entry surfaces may use the input radius instead.                            | `.frame-tooltip`               |
| `--frame-overlay-background`            | `frame.overlay.background`            | No declared default; supplied by context.                                     | Shared translucent fill for floating surfaces over the application canvas.                                                              | `.frame-tooltip`               |
| `--frame-control-text`                  | `frame.control.text`                  | No declared default; supplied by context.                                     | Foreground for text and icons on resting control surfaces.                                                                              | `.frame-tooltip`               |
| `--frame-tooltip-kbd-font-size`         | `frame.tooltip.kbd.font.size`         | `10px`                                                                        | Text size for .frame-tooltip kbd.                                                                                                       | `.frame-tooltip kbd`           |
| `--frame-tooltip-kbd-color`             | `frame.tooltip.kbd.color`             | `#a2adb2`                                                                     | Foreground for .frame-tooltip kbd.                                                                                                      | `.frame-tooltip kbd`           |
| `--frame-tooltip-kbd-border`            | `frame.tooltip.kbd.border`            | `0`                                                                           | Border for .frame-tooltip kbd.                                                                                                          | `.frame-tooltip kbd`           |
| `--frame-tooltip-kbd-background`        | `frame.tooltip.kbd.background`        | `none`                                                                        | Background for .frame-tooltip kbd.                                                                                                      | `.frame-tooltip kbd`           |
| `--frame-tooltip-kbd-padding`           | `frame.tooltip.kbd.padding`           | `0`                                                                           | Internal spacing for .frame-tooltip kbd.                                                                                                | `.frame-tooltip kbd`           |
| `--frame-font-body`                     | `frame.font.body`                     | No declared default; supplied by context.                                     | Primary font family inherited by shell content and ordinary controls.                                                                   | `:where(.frame-shell-text)`    |
| `--frame-font-size-body`                | `frame.font.size.body`                | No declared default; supplied by context.                                     | Base text size inherited by shell content and ordinary controls.                                                                        | `:where(.frame-shell-text)`    |
| `--frame-text`                          | `frame.text`                          | No declared default; supplied by context.                                     | Primary foreground for readable text and icons across shell and application content.                                                    | `:where(.frame-shell-text)`    |
| `--frame-where-workbench-font-size`     | `frame.where.workbench.font.size`     | `10px`                                                                        | Text size for :where(.workbench, .frame-menu, .palette-backdrop, .frame-tooltip) kbd.                                                   | `:where(.frame-box-scope) kbd` |
| `--frame-where-workbench-line-height`   | `frame.where.workbench.line.height`   | `15px`                                                                        | Text line height for :where(.workbench, .frame-menu, .palette-backdrop, .frame-tooltip) kbd.                                            | `:where(.frame-box-scope) kbd` |
| `--frame-where-workbench-color-2`       | `frame.where.workbench.color.2`       | `#b8bdc0`                                                                     | Foreground for :where(.workbench, .frame-menu, .palette-backdrop, .frame-tooltip) kbd.                                                  | `:where(.frame-box-scope) kbd` |
| `--frame-shortcut-border-color`         | `frame.shortcut.border.color`         | `#35393b`                                                                     | Border for :where(.workbench, .frame-menu, .palette-backdrop, .frame-tooltip) kbd. Used when --frame-where-workbench-border-2 is unset. | `:where(.frame-box-scope) kbd` |
| `--frame-where-workbench-border-2`      | `frame.where.workbench.border.2`      | `1px solid     var(       --frame-shortcut-border-color,       #35393b     )` | Border for :where(.workbench, .frame-menu, .palette-backdrop, .frame-tooltip) kbd.                                                      | `:where(.frame-box-scope) kbd` |
| `--frame-where-workbench-border-radius` | `frame.where.workbench.border.radius` | `var(     --frame-radius-medium   )`                                          | Corner radius for :where(.workbench, .frame-menu, .palette-backdrop, .frame-tooltip) kbd.                                               | `:where(.frame-box-scope) kbd` |
| `--frame-where-workbench-background-2`  | `frame.where.workbench.background.2`  | `#242729`                                                                     | Background for :where(.workbench, .frame-menu, .palette-backdrop, .frame-tooltip) kbd.                                                  | `:where(.frame-box-scope) kbd` |
| `--frame-where-workbench-padding`       | `frame.where.workbench.padding`       | `0 4px`                                                                       | Internal spacing for :where(.workbench, .frame-menu, .palette-backdrop, .frame-tooltip) kbd.                                            | `:where(.frame-box-scope) kbd` |
| `--frame-radius-medium`                 | `frame.radius.medium`                 | No declared default; supplied by context.                                     | Medium shared corner radius used by ordinary controls.                                                                                  | `:where(.frame-box-scope) kbd` |
| `--frame-overlay-backdrop-filter`       | `frame.overlay.backdrop.filter`       | No declared default; supplied by context.                                     | Blur and saturation treatment behind shared translucent floating surfaces.                                                              | `.frame-overlay-surface`       |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->
