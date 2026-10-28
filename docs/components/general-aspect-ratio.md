# Aspect Ratio

A themed aspect ratio powered by Reka UI.

## Features

### Reserve a video preview

Keep a sixteen-to-nine canvas stable while the host loads preview content.

<!-- frame:example id="general-aspect-ratio.task-0" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameAspectRatio } from '@frame/core';
const demoRatio = 1.7777777777777777;
</script>
<template>
<FrameAspectRatio :ratio="demoRatio">
  <template #default><span v-text="&quot;Video preview — 16:9&quot;" /></template>
</FrameAspectRatio>
</template>
```

### Show square artwork

A square canvas fits cover art or a thumbnail without changing the surrounding layout.

<!-- frame:example id="general-aspect-ratio.task-1" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameAspectRatio } from '@frame/core';
const demoRatio = 1;
</script>
<template>
<FrameAspectRatio :ratio="demoRatio">
  <template #default><span v-text="&quot;Artwork preview — 1:1&quot;" /></template>
</FrameAspectRatio>
</template>
```

## APIs

<!-- frame:generated api="general-aspect-ratio" -->

### FrameAspectRatio

Source: `packages/core/src/components/layout/FrameAspectRatio.vue`

#### Properties

| Name      | Type                              | Default | Description                                                                                                                                                                                          |
| --------- | --------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ratio`   | `number \| undefined`             | 1       | The desired ratio. Eg: 16/9 defaultValue: 1                                                                                                                                                          |
| `asChild` | `boolean \| undefined`            | false   | Change the default rendered element for the one passed as a child, merging their props and behavior. Read our [Composition](https://www.reka-ui.com/docs/guides/composition) guide for more details. |
| `as`      | `Component \| AsTag \| undefined` | "div"   | The element or component this component should render as. Can be overwritten by `asChild`. defaultValue: "div"                                                                                       |

#### Events

No declared entries.

#### Slots

| Name      | Parameters | Return type  | Description                                    |
| --------- | ---------- | ------------ | ---------------------------------------------- |
| `default` | `None`     | `VNodeChild` | Content fitted to the configured aspect ratio. |

#### Exposed API

No declared entries.

<!-- /frame:generated -->

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="general-aspect-ratio" -->

| CSS variable                      | Theme path                      | Default expression                        | Purpose                                                                              | Context               |
| --------------------------------- | ------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------ | --------------------- |
| `--frame-aspect-ratio-background` | `frame.aspect.ratio.background` | `var(--frame-surface)`                    | Surface behind aspect-ratio content.                                                 | `.frame-aspect-ratio` |
| `--frame-surface`                 | `frame.surface`                 | No declared default; supplied by context. | Neutral raised surface behind grouped content and control compositions.              | `.frame-aspect-ratio` |
| `--frame-text`                    | `frame.text`                    | No declared default; supplied by context. | Primary foreground for readable text and icons across shell and application content. | `.frame-aspect-ratio` |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->
