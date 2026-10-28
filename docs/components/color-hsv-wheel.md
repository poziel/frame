# FrameHsvWheel

A circular hue ring around a saturation/value square.

## Features

### Anatomy

- **HSV Wheel**: A circular hue ring around a saturation/value square.

- Pointer and keyboard editing.
- Shared color model and preserved alpha.
- Scales the area and slider together.

[Underlying Reka reference](https://reka-ui.com/docs/components/color-area). Frame exposes the contract documented below.

### Compact picker

A 240px example that fits beside other controls.

<!-- frame:example id="color-hsv-wheel.compact" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameHsvWheel } from '@frame/core';
const demoModelValue = ref("#0078d4");
const demoSize = 240;
</script>
<template>
<FrameHsvWheel v-model="demoModelValue" :size="demoSize" />
</template>
```

### Larger picker

A 360px picker scales its slider and thumb with its area.

<!-- frame:example id="color-hsv-wheel.larger" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameHsvWheel } from '@frame/core';
const demoModelValue = ref("#0078d4");
const demoSize = 360;
</script>
<template>
<FrameHsvWheel v-model="demoModelValue" :size="demoSize" />
</template>
```

## APIs

<!-- frame:generated api="color-hsv-wheel" -->

### FrameHsvWheel

Source: `packages/core/src/components/forms/colors/FrameHsvWheel.vue`

#### Properties

| Name           | Type                            | Default | Description                                                             |
| -------------- | ------------------------------- | ------- | ----------------------------------------------------------------------- |
| `modelValue`   | `string \| Color \| undefined`  | Omitted | Controlled color forwarded to the hue wheel.                            |
| `defaultValue` | `string \| Color \| undefined`  | Omitted | Initial color used while modelValue is omitted.                         |
| `disabled`     | `boolean \| undefined`          | false   | Prevents user interaction with the control.                             |
| `size`         | `string \| number \| undefined` | Omitted | Area dimension; numeric values are pixels and strings retain CSS units. |

#### Events

| Name                | Parameters      | Return type | Description                                                 |
| ------------------- | --------------- | ----------- | ----------------------------------------------------------- |
| `update:modelValue` | `value: string` | `void`      | Requests the new application-owned value after interaction. |
| `change`            | `value: string` | `void`      | Color text changed during interaction.                      |
| `update:color`      | `value: Color`  | `void`      | Updated structured HSB color including alpha.               |
| `changeEnd`         | `value: string` | `void`      | Color interaction was committed.                            |

#### Slots

No declared entries.

#### Exposed API

No declared entries.

<!-- /frame:generated -->

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="color-hsv-wheel" -->

No declared entries.

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->
