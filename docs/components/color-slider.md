# FrameColorSlider

Adjust a single color channel on a gradient track. The thumb position and gradient update with the current color.

## Features

### Anatomy

- **ColorSliderRoot**: Coordinates the selected color channel.
- **ColorSliderTrack**: Shows the gradient for that channel.
- **ColorSliderThumb**: Provides pointer and keyboard adjustment.

- Adjust hue, alpha, or a channel in RGB, HSL, or HSB.
- Use horizontal or vertical tracks.
- Control increment precision with step.

[Underlying Reka reference](https://reka-ui.com/docs/components/color-slider). Frame exposes the contract documented below.

### Hue spectrum

Move along the hue track while preserving the other channels.

<!-- frame:example id="color-slider.hue-track" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameColorSlider } from '@frame/core';
const demoModelValue = ref("#0078d4");
</script>
<template>
<FrameColorSlider v-model="demoModelValue" :channel="&quot;hue&quot;" :color-space="&quot;hsb&quot;" />
</template>
```

### Transparency control

Adjust alpha in small increments without changing the underlying color.

<!-- frame:example id="color-slider.alpha-track" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameColorSlider } from '@frame/core';
const demoModelValue = ref("rgba(0, 120, 212, 0.6)");
const demoStep = 0.05;
</script>
<template>
<FrameColorSlider v-model="demoModelValue" :channel="&quot;alpha&quot;" :step="demoStep" />
</template>
```

### Vertical lightness track

Use a vertical HSL lightness control; its gradient follows the vertical axis.

<!-- frame:example id="color-slider.vertical-track" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameColorSlider } from '@frame/core';
const demoModelValue = ref("#16a34a");
</script>
<template>
<FrameColorSlider v-model="demoModelValue" :color-space="&quot;hsl&quot;" :channel="&quot;lightness&quot;" :orientation="&quot;vertical&quot;" />
</template>
```

## APIs

<!-- frame:generated api="color-slider" -->

### FrameColorSlider

Source: `packages/core/src/components/forms/colors/FrameColorSlider.vue`

#### Properties

| Name           | Type                              | Default  | Description                                                                                                                                                                                          |
| -------------- | --------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `modelValue`   | `string \| Color \| undefined`    | Omitted  | The color value (controlled). Can be a hex string or Color object.                                                                                                                                   |
| `defaultValue` | `string \| Color \| undefined`    | Omitted  | The default color value (uncontrolled).                                                                                                                                                              |
| `colorSpace`   | `ColorSpace \| undefined`         | Omitted  | The color space to operate in.                                                                                                                                                                       |
| `channel`      | `ColorChannel`                    | Required | The color channel that this slider manipulates.                                                                                                                                                      |
| `orientation`  | `DataOrientation \| undefined`    | Omitted  | The orientation of the slider.                                                                                                                                                                       |
| `dir`          | `Direction \| undefined`          | Omitted  | The reading direction of the slider.                                                                                                                                                                 |
| `inverted`     | `boolean \| undefined`            | false    | Whether the slider is visually inverted.                                                                                                                                                             |
| `disabled`     | `boolean \| undefined`            | false    | When `true`, prevents the user from interacting with the slider.                                                                                                                                     |
| `step`         | `number \| undefined`             | Omitted  | Custom step value for increment/decrement. Defaults to the channel's natural step.                                                                                                                   |
| `asChild`      | `boolean \| undefined`            | false    | Change the default rendered element for the one passed as a child, merging their props and behavior. Read our [Composition](https://www.reka-ui.com/docs/guides/composition) guide for more details. |
| `as`           | `Component \| AsTag \| undefined` | "div"    | The element or component this component should render as. Can be overwritten by `asChild`. defaultValue: "div"                                                                                       |
| `name`         | `string \| undefined`             | Omitted  | The name of the field. Submitted with its owning form as part of a name/value pair.                                                                                                                  |
| `required`     | `boolean \| undefined`            | false    | When `true`, indicates that the user must set the value before the owning form can be submitted.                                                                                                     |

#### Events

| Name                | Parameters               | Return type | Description                                                      |
| ------------------- | ------------------------ | ----------- | ---------------------------------------------------------------- |
| `update:modelValue` | `value: string \| Color` | `void`      | Requests color text after the selected channel changes.          |
| `change`            | `value: string`          | `void`      | Publishes color text during slider interaction.                  |
| `update:color`      | `value: Color`           | `void`      | Publishes the structured color with its changed channel.         |
| `changeEnd`         | `value: string`          | `void`      | Publishes the committed color text when slider interaction ends. |

#### Slots

No declared entries.

#### Exposed API

No declared entries.

<!-- /frame:generated -->

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="color-slider" -->

| CSS variable             | Theme path             | Default expression                        | Purpose                                                                                                      | Context                                                                             |
| ------------------------ | ---------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| `--frame-control-radius` | `frame.control.radius` | No declared default; supplied by context. | Shared corner radius of buttons and ordinary controls; text-entry surfaces may use the input radius instead. | `.frame-hsv-area .frame-color-slider[data-orientation=vertical] .frame-color-track` |
| `--frame-accent`         | `frame.accent`         | No declared default; supplied by context. | Shared interaction color for keyboard focus, active actions, and accent-filled controls.                     | `.frame-advanced-focus:focus-visible`                                               |
| `--frame-control-radius` | `frame.control.radius` | No declared default; supplied by context. | Shared corner radius of buttons and ordinary controls; text-entry surfaces may use the input radius instead. | `.frame-color-track`                                                                |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->
