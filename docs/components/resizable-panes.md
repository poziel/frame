# Resizable Panes

Two connected panes with an accessible shared resize bar.

## Features

### Basic usage

Resize with the pointer or arrow keys. Home/double-click restores the default size. Temporary container shrinking preserves the preferred size. Change axis to stack the panes.

<!-- frame:example id="resizable-panes.basic" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { ResizablePane } from '@frame/core';
const demoModelValue = ref(40);
</script>
<template>
<ResizablePane v-model="demoModelValue" :label="&quot;Example control&quot;">
  <template #first><span v-text="&quot;first pane&quot;" /></template>
  <template #second><span v-text="&quot;second pane&quot;" /></template>
</ResizablePane>
</template>
```

### Visual variants

Set axis explicitly to override its default. The interactive demo exposes every public property.

<!-- frame:example id="resizable-panes.configured" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { ResizablePane } from '@frame/core';
const demoModelValue = ref(40);
</script>
<template>
<ResizablePane v-model="demoModelValue" :label="&quot;Example control&quot;" :axis="&quot;y&quot;">
  <template #first><span v-text="&quot;first pane&quot;" /></template>
  <template #second><span v-text="&quot;second pane&quot;" /></template>
</ResizablePane>
</template>
```

## APIs

<!-- frame:generated api="resizable-panes" -->

### ResizablePane

Source: `packages/core/src/components/layout/ResizablePane.vue`

#### Properties

| Name          | Type                      | Default        | Description                                                                           |
| ------------- | ------------------------- | -------------- | ------------------------------------------------------------------------------------- |
| `modelValue`  | `number \| undefined`     | Omitted        | Controlled value supplied by the parent; updates are emitted rather than mutating it. |
| `axis`        | `"x" \| "y" \| undefined` | "x"            | Resize axis: x changes width and y changes height.                                    |
| `min`         | `number \| undefined`     | 120            | Minimum allowed resize value.                                                         |
| `max`         | `number \| undefined`     | 500            | Maximum allowed resize value.                                                         |
| `minSecond`   | `number \| undefined`     | 160            | Minimum space reserved for the second pane in pixels; defaults to 160.                |
| `label`       | `string \| undefined`     | "Resize panes" | Accessible name for this component and its built-in control or region.                |
| `defaultSize` | `number \| undefined`     | 210            | Initial uncontrolled first-pane size in pixels; defaults to 210.                      |

#### Events

| Name                | Parameters      | Return type | Description                                                    |
| ------------------- | --------------- | ----------- | -------------------------------------------------------------- |
| `update:modelValue` | `value: number` | `void`      | Emitted when user interaction requests a new controlled value. |

#### Slots

| Name     | Parameters | Return type  | Description                                              |
| -------- | ---------- | ------------ | -------------------------------------------------------- |
| `first`  | `None`     | `VNodeChild` | Content of the first, explicitly sized pane.             |
| `second` | `None`     | `VNodeChild` | Content of the second pane, which fills remaining space. |

#### Exposed API

No declared entries.

<!-- /frame:generated -->

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="resizable-panes" -->

| CSS variable                                   | Theme path                                   | Default expression | Purpose                                                           | Context                                         |
| ---------------------------------------------- | -------------------------------------------- | ------------------ | ----------------------------------------------------------------- | ----------------------------------------------- |
| `--frame-resizable-pane-min-height`            | `frame.resizable.pane.min.height`            | `0`                | Minimum height for .resizable-pane.                               | `.resizable-pane`                               |
| `--frame-resizable-pane-min-width`             | `frame.resizable.pane.min.width`             | `0`                | Minimum width for .resizable-pane.                                | `.resizable-pane`                               |
| `--frame-resizable-pane-width`                 | `frame.resizable.pane.width`                 | `100%`             | Width for .resizable-pane.                                        | `.resizable-pane`                               |
| `--frame-resizable-pane-height`                | `frame.resizable.pane.height`                | `100%`             | Height for .resizable-pane.                                       | `.resizable-pane`                               |
| `--frame-resizable-pane-first-min-height`      | `frame.resizable.pane.first.min.height`      | `0`                | Minimum height for .resizable-pane-first, .resizable-pane-second. | `.resizable-pane-first, .resizable-pane-second` |
| `--frame-resizable-pane-first-min-width`       | `frame.resizable.pane.first.min.width`       | `0`                | Minimum width for .resizable-pane-first, .resizable-pane-second.  | `.resizable-pane-first, .resizable-pane-second` |
| `--frame-resizable-pane-y-resize-handle-width` | `frame.resizable.pane.y.resize.handle.width` | `100%`             | Width for .resizable-pane.y > .resize-handle.                     | `.resizable-pane.y > .resize-handle`            |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->
