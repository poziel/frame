# Separator

A themed separator powered by Reka UI.

## Features

### Separate related sections

A semantic separator marks a boundary between groups without adding another heading.

<!-- frame:example id="general-separator.task-0" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameSeparator } from '@frame/core';
const demoDecorative = false;
</script>
<template>
<FrameSeparator :decorative="demoDecorative" :orientation="&quot;horizontal&quot;" />
</template>
```

### Divide a toolbar vertically

A vertical separator distinguishes adjacent groups of actions in a horizontal toolbar.

<!-- frame:example id="general-separator.task-1" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameSeparator } from '@frame/core';
const demoDecorative = false;
</script>
<template>
<FrameSeparator :decorative="demoDecorative" :orientation="&quot;vertical&quot;" />
</template>
```

## APIs

<!-- frame:generated api="general-separator" -->

### FrameSeparator

Source: `packages/core/src/components/layout/FrameSeparator.vue`

#### Properties

| Name          | Type                              | Default | Description                                                                                                                                                                                          |
| ------------- | --------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `orientation` | `DataOrientation \| undefined`    | Omitted | Orientation of the component. Either `vertical` or `horizontal`. Defaults to `horizontal`.                                                                                                           |
| `decorative`  | `boolean \| undefined`            | false   | Whether or not the component is purely decorative. <br>When `true`, accessibility-related attributes are updated so that that the rendered element is removed from the accessibility tree.           |
| `asChild`     | `boolean \| undefined`            | false   | Change the default rendered element for the one passed as a child, merging their props and behavior. Read our [Composition](https://www.reka-ui.com/docs/guides/composition) guide for more details. |
| `as`          | `Component \| AsTag \| undefined` | "div"   | The element or component this component should render as. Can be overwritten by `asChild`. defaultValue: "div"                                                                                       |

#### Events

No declared entries.

#### Slots

| Name      | Parameters | Return type  | Description                                      |
| --------- | ---------- | ------------ | ------------------------------------------------ |
| `default` | `None`     | `VNodeChild` | Optional content inside the separator primitive. |

#### Exposed API

No declared entries.

<!-- /frame:generated -->

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="general-separator" -->

| CSS variable              | Theme path              | Default expression                        | Purpose                                                                          | Context            |
| ------------------------- | ----------------------- | ----------------------------------------- | -------------------------------------------------------------------------------- | ------------------ |
| `--frame-separator-color` | `frame.separator.color` | `var(--frame-line)`                       | Color of the horizontal or vertical separator.                                   | `.frame-separator` |
| `--frame-line`            | `frame.line`            | No declared default; supplied by context. | Neutral divider color for content boundaries, tracks, and structural separators. | `.frame-separator` |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->
