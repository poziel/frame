# Resize Handles

The shared separator for custom resize interactions.

## Features

### Basic usage

ResizeHandle reports values; the host decides how to apply them. It supports pointer capture, keyboard arrows, Escape cancellation, and reset. Grip dots are opt-in and reserved for outer shell regions.

<!-- frame:example id="resize-handle.basic" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { ResizeHandle } from '@frame/core';
const demoValue = 24;
const demoMin = 0;
const demoMax = 300;
</script>
<template>
<ResizeHandle :label="&quot;Example control&quot;" :axis="&quot;x&quot;" :value="demoValue" :min="demoMin" :max="demoMax" />
</template>
```

### Visual variants

Set axis explicitly to override its default. The interactive demo exposes every public property.

<!-- frame:example id="resize-handle.configured" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { ResizeHandle } from '@frame/core';
const demoValue = 24;
const demoMin = 0;
const demoMax = 300;
</script>
<template>
<ResizeHandle :label="&quot;Example control&quot;" :axis="&quot;y&quot;" :value="demoValue" :min="demoMin" :max="demoMax" />
</template>
```

## APIs

<!-- frame:generated api="resize-handle" -->

### ResizeHandle

Source: `packages/core/src/components/layout/ResizeHandle.vue`

#### Properties

| Name      | Type                   | Default  | Description                                                                 |
| --------- | ---------------------- | -------- | --------------------------------------------------------------------------- |
| `label`   | `string`               | Required | Accessible name for this component and its built-in control or region.      |
| `axis`    | `"x" \| "y"`           | Required | Resize axis: x changes width and y changes height.                          |
| `value`   | `number`               | Required | Current resize value reported through the separator accessibility state.    |
| `min`     | `number`               | Required | Minimum allowed resize value.                                               |
| `max`     | `number`               | Required | Maximum allowed resize value.                                               |
| `reverse` | `boolean \| undefined` | false    | Reverses pointer and keyboard resize direction.                             |
| `scale`   | `number \| undefined`  | 1        | Multiplier converting pointer movement into resize values; defaults to one. |
| `step`    | `number \| undefined`  | 10       | Keyboard arrow increment in resize units; defaults to 10.                   |
| `grip`    | `boolean \| undefined` | false    | Whether the resize separator displays its grip decoration.                  |

#### Events

| Name     | Parameters      | Return type | Description                                                                   |
| -------- | --------------- | ----------- | ----------------------------------------------------------------------------- |
| `reset`  | `None`          | `void`      | Requests restoration of the default size after Home or double-click.          |
| `change` | `value: number` | `void`      | Emitted with the clamped resize value during pointer or keyboard interaction. |

#### Slots

No declared entries.

#### Exposed API

No declared entries.

<!-- /frame:generated -->

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="resize-handle" -->

| CSS variable                                                   | Theme path                                                   | Default expression                                                                   | Purpose                                                                                                                                          | Context                                                                                            |
| -------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `--frame-resize-handle-outline`                                | `frame.resize.handle.outline`                                | `none`                                                                               | Outline for .resize-handle.                                                                                                                      | `.resize-handle`                                                                                   |
| `--frame-resize-handle-vertical-width`                         | `frame.resize.handle.vertical.width`                         | `6px`                                                                                | Width for .resize-handle.vertical.                                                                                                               | `.resize-handle.vertical`                                                                          |
| `--frame-resize-handle-horizontal-height`                      | `frame.resize.handle.horizontal.height`                      | `6px`                                                                                | Height for .resize-handle.horizontal.                                                                                                            | `.resize-handle.horizontal`                                                                        |
| `--frame-resize-handle-after-border-radius`                    | `frame.resize.handle.after.border.radius`                    | `var(     --frame-radius-small   )`                                                  | Corner radius for .resize-handle::after.                                                                                                         | `.resize-handle::after`                                                                            |
| `--frame-resize-handle-after-background`                       | `frame.resize.handle.after.background`                       | `transparent`                                                                        | Background for .resize-handle::after.                                                                                                            | `.resize-handle::after`                                                                            |
| `--frame-radius-small`                                         | `frame.radius.small`                                         | `2px`                                                                                | Small shared corner radius used by inset rows and compact elements.                                                                              | `.resize-handle::after`                                                                            |
| `--frame-accent`                                               | `frame.accent`                                               | `#0078d4`                                                                            | Shared interaction color for keyboard focus, active actions, and accent-filled controls.                                                         | `.resize-handle:hover::after, .resize-handle:focus-visible::after, .resize-handle.dragging::after` |
| `--frame-canvas-centering-resize-handle-width`                 | `frame.canvas.centering.resize.handle.width`                 | `4px`                                                                                | Width for .canvas-centering > .resize-handle.                                                                                                    | `.canvas-centering > .resize-handle`                                                               |
| `--frame-Sashes-live-in-the-gutter-width`                      | `frame.Sashes.live.in.the.gutter.width`                      | `12px`                                                                               | Width for .resize-handle.vertical.                                                                                                               | `.resize-handle.vertical`                                                                          |
| `--frame-resize-handle-horizontal-height-2`                    | `frame.resize.handle.horizontal.height.2`                    | `12px`                                                                               | Height for .resize-handle.horizontal.                                                                                                            | `.resize-handle.horizontal`                                                                        |
| `--frame-resize-handle-after-transition`                       | `frame.resize.handle.after.transition`                       | `background 120ms`                                                                   | Transition treatment for .resize-handle::after.                                                                                                  | `.resize-handle::after`                                                                            |
| `--frame-resize-handle-before-width`                           | `frame.resize.handle.before.width`                           | `2px`                                                                                | Width for .resize-handle::before.                                                                                                                | `.resize-handle::before`                                                                           |
| `--frame-resize-handle-before-height`                          | `frame.resize.handle.before.height`                          | `2px`                                                                                | Height for .resize-handle::before.                                                                                                               | `.resize-handle::before`                                                                           |
| `--frame-resize-handle-before-border-radius`                   | `frame.resize.handle.before.border.radius`                   | `50%`                                                                                | Corner radius for .resize-handle::before.                                                                                                        | `.resize-handle::before`                                                                           |
| `--frame-resize-handle-before-opacity`                         | `frame.resize.handle.before.opacity`                         | `0.55`                                                                               | Opacity for .resize-handle::before.                                                                                                              | `.resize-handle::before`                                                                           |
| `--frame-muted`                                                | `frame.muted`                                                | `#8e9496`                                                                            | Secondary foreground for descriptions, hints, and visually subordinate content.                                                                  | `.resize-handle::before`                                                                           |
| `--frame-muted`                                                | `frame.muted`                                                | `#8e9496`                                                                            | Secondary foreground for descriptions, hints, and visually subordinate content.                                                                  | `.resize-handle.horizontal::before`                                                                |
| `--frame-panel-section-resize-handle-margin`                   | `frame.panel.section.resize.handle.margin`                   | `-6px 0`                                                                             | Outer spacing for .panel-section > .resize-handle.                                                                                               | `.panel-section > .resize-handle`                                                                  |
| `--frame-canvas-centering-resize-handle-width-2`               | `frame.canvas.centering.resize.handle.width.2`               | `12px`                                                                               | Width for .canvas-centering > .resize-handle.                                                                                                    | `.canvas-centering > .resize-handle`                                                               |
| `--frame-workspace-split-y-resize-handle-width`                | `frame.workspace.split.y.resize.handle.width`                | `100%`                                                                               | Width for .workspace-split.y > .resize-handle.                                                                                                   | `.workspace-split.y > .resize-handle`                                                              |
| `--frame-activity-sections-panel-section-resize-handle-width`  | `frame.activity.sections.panel.section.resize.handle.width`  | `100%`                                                                               | Width for .view-sections > .panel-section > .resize-handle. Used when --frame-view-sections-panel-section-resize-handle-width is unset.          | `.view-sections > .panel-section > .resize-handle`                                                 |
| `--frame-view-sections-panel-section-resize-handle-width`      | `frame.view.sections.panel.section.resize.handle.width`      | `var(     --frame-activity-sections-panel-section-resize-handle-width,     100%   )` | Width for .view-sections > .panel-section > .resize-handle.                                                                                      | `.view-sections > .panel-section > .resize-handle`                                                 |
| `--frame-activity-sections-panel-section-resize-handle-margin` | `frame.activity.sections.panel.section.resize.handle.margin` | `0`                                                                                  | Outer spacing for .view-sections > .panel-section > .resize-handle. Used when --frame-view-sections-panel-section-resize-handle-margin is unset. | `.view-sections > .panel-section > .resize-handle`                                                 |
| `--frame-view-sections-panel-section-resize-handle-margin`     | `frame.view.sections.panel.section.resize.handle.margin`     | `var(     --frame-activity-sections-panel-section-resize-handle-margin,     0   )`   | Outer spacing for .view-sections > .panel-section > .resize-handle.                                                                              | `.view-sections > .panel-section > .resize-handle`                                                 |
| `--frame-resizable-pane-y-resize-handle-width`                 | `frame.resizable.pane.y.resize.handle.width`                 | `100%`                                                                               | Width for .resizable-pane.y > .resize-handle.                                                                                                    | `.resizable-pane.y > .resize-handle`                                                               |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->
