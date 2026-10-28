# Context Menus

Application-owned right-click menus using the same menu renderer.

## Features

### Basic usage

Wrap any content with ContextMenu and provide menu items. The browser context menu stays suppressed inside Frame. Each host decides where custom menus are useful.

<!-- frame:example id="context-menu.basic" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { ContextMenu, FrameShell } from '@frame/core';
import { createFrame } from '@frame/core';
const frame = createFrame();
const demoItems = [
  {
    "id": "first",
    "label": "First choice"
  },
  {
    "id": "second",
    "label": "Second choice"
  }
];
onBeforeUnmount(() => { frame.dispose(); });
</script>
<template>
<FrameShell :frame="frame">
<ContextMenu :items="demoItems" :label="&quot;Example control&quot;">
  <template #default><span v-text="&quot;Example content&quot;" /></template>
</ContextMenu>
</FrameShell>
</template>
```

### Visual variants

Set itemAlignment explicitly to override its default. The interactive demo exposes every public property.

<!-- frame:example id="context-menu.configured" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { ContextMenu, FrameShell } from '@frame/core';
import { createFrame } from '@frame/core';
const frame = createFrame();
const demoItems = [
  {
    "id": "first",
    "label": "First choice"
  },
  {
    "id": "second",
    "label": "Second choice"
  }
];
onBeforeUnmount(() => { frame.dispose(); });
</script>
<template>
<FrameShell :frame="frame">
<ContextMenu :items="demoItems" :label="&quot;Example control&quot;" :item-alignment="&quot;right&quot;">
  <template #default><span v-text="&quot;Example content&quot;" /></template>
</ContextMenu>
</FrameShell>
</template>
```

## APIs

<!-- frame:generated api="context-menu" -->

### ContextMenu

Source: `packages/core/src/components/navigation/ContextMenu.vue`

#### Properties

| Name            | Type                                         | Default  | Description                                                            |
| --------------- | -------------------------------------------- | -------- | ---------------------------------------------------------------------- |
| `items`         | `readonly FrameMenuItem[]`                   | Required | Menu entries normalized and rendered by this menu presentation.        |
| `label`         | `string \| undefined`                        | Omitted  | Accessible name for this component and its built-in control or region. |
| `itemAlignment` | `"left" \| "right" \| "center" \| undefined` | Omitted  | Horizontal alignment of item content within menu rows.                 |

#### Events

| Name     | Parameters            | Return type | Description                                                          |
| -------- | --------------------- | ----------- | -------------------------------------------------------------------- |
| `select` | `item: FrameMenuItem` | `void`      | Emitted with the selected item and originating event when available. |

#### Slots

| Name      | Parameters | Return type  | Description                                                          |
| --------- | ---------- | ------------ | -------------------------------------------------------------------- |
| `default` | `None`     | `VNodeChild` | Application content receiving the context-menu trigger interactions. |

#### Exposed API

No declared entries.

<!-- /frame:generated -->

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="context-menu" -->

No declared entries.

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->
