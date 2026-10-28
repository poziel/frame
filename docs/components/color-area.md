# FrameColorArea

Choose a color by moving across two channels at once. The gradient and thumb reflect the current color and selected color space.

## Features

### Anatomy

- **ColorAreaRoot**: Holds color state and computes the gradient.
- **ColorAreaArea**: Receives position changes on the color plane.
- **ColorAreaThumb**: Marks the selected channel coordinates.

- Edit with a pointer, touch, or arrow keys.
- Choose the color space and the channel assigned to each axis.
- Bind the resulting color to other application controls.

[Underlying Reka reference](https://reka-ui.com/docs/components/color-area). Frame exposes the contract documented below.

### Saturation and brightness

Keep hue fixed while horizontal movement adjusts saturation and vertical movement adjusts brightness.

<!-- frame:example id="color-area.hsb-plane" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameColorArea } from '@frame/core';
const demoModelValue = ref("#0078d4");
</script>
<template>
<FrameColorArea v-model="demoModelValue" :color-space="&quot;hsb&quot;" :x-channel="&quot;saturation&quot;" :y-channel="&quot;brightness&quot;" />
</template>
```

### Saturation and lightness

Change to HSL to explore darker and lighter colors with the same two-dimensional interaction.

<!-- frame:example id="color-area.hsl-plane" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameColorArea } from '@frame/core';
const demoModelValue = ref("#16a34a");
</script>
<template>
<FrameColorArea v-model="demoModelValue" :color-space="&quot;hsl&quot;" :x-channel="&quot;saturation&quot;" :y-channel="&quot;lightness&quot;" />
</template>
```

### Independent RGB channels

Assign red and green to the axes. Moving the thumb preserves the blue channel.

<!-- frame:example id="color-area.rgb-plane" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameColorArea } from '@frame/core';
const demoModelValue = ref("#8078d4");
</script>
<template>
<FrameColorArea v-model="demoModelValue" :color-space="&quot;rgb&quot;" :x-channel="&quot;red&quot;" :y-channel="&quot;green&quot;" />
</template>
```

## APIs

<!-- frame:generated api="color-area" -->

### FrameColorArea

Source: `packages/core/src/components/forms/colors/FrameColorArea.vue`

#### Properties

| Name           | Type                                              | Default | Description                                                                                                                                                                                          |
| -------------- | ------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `modelValue`   | `string \| Color \| undefined`                    | Omitted | The color value (controlled). Can be a hex string or Color object.                                                                                                                                   |
| `defaultValue` | `string \| Color \| undefined`                    | Omitted | The default color value (uncontrolled).                                                                                                                                                              |
| `colorSpace`   | `ColorSpace \| undefined`                         | Omitted | The color space to operate in.                                                                                                                                                                       |
| `xChannel`     | `ColorChannel \| undefined`                       | Omitted | Color channel for the horizontal (x) axis.                                                                                                                                                           |
| `yChannel`     | `ColorChannel \| undefined`                       | Omitted | Color channel for the vertical (y) axis.                                                                                                                                                             |
| `disabled`     | `boolean \| undefined`                            | false   | When `true`, prevents the user from interacting with the area.                                                                                                                                       |
| `xName`        | `string \| undefined`                             | Omitted | The name of the x channel input element for form submission.                                                                                                                                         |
| `yName`        | `string \| undefined`                             | Omitted | The name of the y channel input element for form submission.                                                                                                                                         |
| `asChild`      | `boolean \| undefined`                            | false   | Change the default rendered element for the one passed as a child, merging their props and behavior. Read our [Composition](https://www.reka-ui.com/docs/guides/composition) guide for more details. |
| `as`           | `Component \| AsTag \| undefined`                 | "div"   | The element or component this component should render as. Can be overwritten by `asChild`. defaultValue: "div"                                                                                       |
| `name`         | `string \| undefined`                             | Omitted | The name of the field. Submitted with its owning form as part of a name/value pair.                                                                                                                  |
| `required`     | `boolean \| undefined`                            | false   | When `true`, indicates that the user must set the value before the owning form can be submitted.                                                                                                     |
| `variant`      | `"circle" \| "rectangle" \| "wheel" \| undefined` | Omitted | Selects the rectangle, wheel, or circle color-area composition.                                                                                                                                      |

#### Events

| Name                | Parameters      | Return type | Description                                                          |
| ------------------- | --------------- | ----------- | -------------------------------------------------------------------- |
| `update:modelValue` | `value: string` | `void`      | Requests updated color text during interaction.                      |
| `change`            | `value: string` | `void`      | Publishes color text while the pointer or keyboard changes the area. |
| `update:color`      | `value: Color`  | `void`      | Publishes the structured color after a channel change.               |
| `changeEnd`         | `value: string` | `void`      | Publishes the committed color text when interaction ends.            |

#### Slots

No declared entries.

#### Exposed API

No declared entries.

<!-- /frame:generated -->

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="color-area" -->

| CSS variable             | Theme path             | Default expression           | Purpose                                                                                                      | Context                                                                                                                                             |
| ------------------------ | ---------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--frame-control-radius` | `frame.control.radius` | `var(--frame-radius-medium)` | Shared corner radius of buttons and ordinary controls; text-entry surfaces may use the input radius instead. | `.frame-color-plane`                                                                                                                                |
| `--frame-accent`         | `frame.accent`         | `#0078d4`                    | Shared interaction color for keyboard focus, active actions, and accent-filled controls.                     | `:is(   .frame-advanced-input,   .frame-rating-step,   .frame-tag,   .frame-tag-delete,   .frame-color-thumb,   .frame-swatch-item ):focus-visible` |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->
