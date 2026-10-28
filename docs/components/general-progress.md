# Progress

A themed progress powered by Reka UI.

## Features

### Report upload completion

A known total gives assistive technology a meaningful completion value while the host performs the upload.

<!-- frame:example id="general-progress.task-0" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameProgress } from '@frame/core';
const demoModelValue = ref(65);
const demoMax = 100;
</script>
<template>
<FrameProgress v-model="demoModelValue" :max="demoMax" />
</template>
```

### Wait for an unknown duration

An indeterminate progress indicator communicates activity when the host cannot estimate how much work remains.

<!-- frame:example id="general-progress.task-1" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameProgress } from '@frame/core';
const demoModelValue = ref(null);
const demoMax = 100;
</script>
<template>
<FrameProgress v-model="demoModelValue" :max="demoMax" />
</template>
```

## APIs

<!-- frame:generated api="general-progress" -->

### FrameProgress

Source: `packages/core/src/components/feedback/FrameProgress.vue`

#### Properties

| Name            | Type                                                                                      | Default | Description                                                                                                                                                                                          |
| --------------- | ----------------------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `modelValue`    | `number \| null \| undefined`                                                             | Omitted | The progress value. Can be bind as `v-model`.                                                                                                                                                        |
| `max`           | `number \| undefined`                                                                     | Omitted | The maximum progress value.                                                                                                                                                                          |
| `getValueLabel` | `((value: number \| null \| undefined, max: number) => string \| undefined) \| undefined` | Omitted | A function to get the accessible label text in a human-readable format. If not provided, the value label will be read as the numeric value as a percentage of the max value.                         |
| `getValueText`  | `((value: number \| null \| undefined, max: number) => string \| undefined) \| undefined` | Omitted | A function to get the accessible value text representing the current value in a human-readable format.                                                                                               |
| `asChild`       | `boolean \| undefined`                                                                    | false   | Change the default rendered element for the one passed as a child, merging their props and behavior. Read our [Composition](https://www.reka-ui.com/docs/guides/composition) guide for more details. |
| `as`            | `Component \| AsTag \| undefined`                                                         | "div"   | The element or component this component should render as. Can be overwritten by `asChild`. defaultValue: "div"                                                                                       |

#### Events

| Name                | Parameters                     | Return type | Description                                          |
| ------------------- | ------------------------------ | ----------- | ---------------------------------------------------- |
| `update:modelValue` | `value: string[] \| undefined` | `void`      | Event handler called when the progress value changes |
| `update:max`        | `value: number`                | `void`      | Event handler called when the max value changes      |

#### Slots

| Name      | Parameters                                                                 | Return type  | Description                                                                     |
| --------- | -------------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------- |
| `default` | `{ value: number \| null \| undefined; percentage: number \| undefined; }` | `VNodeChild` | Content inside the progress indicator, with raw and normalized progress values. |

#### Exposed API

No declared entries.

<!-- /frame:generated -->

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="general-progress" -->

| CSS variable              | Theme path              | Default expression           | Purpose                                                                                                      | Context                     |
| ------------------------- | ----------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------- |
| `--frame-progress-height` | `frame.progress.height` | `6px`                        | Thickness of the progress track.                                                                             | `.frame-progress`           |
| `--frame-progress-track`  | `frame.progress.track`  | `var(--frame-line)`          | Surface of the unfilled progress track.                                                                      | `.frame-progress`           |
| `--frame-control-radius`  | `frame.control.radius`  | `var(--frame-radius-medium)` | Shared corner radius of buttons and ordinary controls; text-entry surfaces may use the input radius instead. | `.frame-progress`           |
| `--frame-line`            | `frame.line`            | `#2b2b2b`                    | Neutral divider color for content boundaries, tracks, and structural separators.                             | `.frame-progress`           |
| `--frame-progress-color`  | `frame.progress.color`  | `var(--frame-accent)`        | Fill of the progress indicator.                                                                              | `.frame-progress-indicator` |
| `--frame-accent`          | `frame.accent`          | `#0078d4`                    | Shared interaction color for keyboard focus, active actions, and accent-filled controls.                     | `.frame-progress-indicator` |
| `--frame-duration`        | `frame.duration`        | `150ms`                      | Shared duration for control and shell presentation transitions.                                              | `.frame-progress-indicator` |
| `--frame-ease`            | `frame.ease`            | `ease-out`                   | Shared timing curve for control and shell presentation transitions.                                          | `.frame-progress-indicator` |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->
