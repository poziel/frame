# FrameColorField

Enter a complete color as text, or edit one channel numerically. Channel editing retains the other parts of the color.

## Features

### Anatomy

- **ColorFieldRoot**: Parses color values and coordinates channel updates.
- **ColorFieldInput**: Displays the editable color or channel value.

- Accept a hex value or select a channel to edit.
- Use arrow keys for small changes and Page Up/Down for larger changes.
- Configure the color space and increment size.

[Underlying Reka reference](https://reka-ui.com/docs/components/color-field). Frame exposes the contract documented below.

### Hexadecimal input

Edit the complete hex value, then commit the entry to update the bound color.

<!-- frame:example id="color-field.hex-input" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameColorField } from '@frame/core';
const demoModelValue = ref("#0078d4");
</script>
<template>
<FrameColorField v-model="demoModelValue" />
</template>
```

### Numeric hue editing

Select the hue channel and step by five units. Saturation and brightness stay attached to the color.

<!-- frame:example id="color-field.hue-input" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameColorField } from '@frame/core';
const demoModelValue = ref("#0078d4");
const demoStep = 5;
</script>
<template>
<FrameColorField v-model="demoModelValue" :color-space="&quot;hsb&quot;" :channel="&quot;hue&quot;" :step="demoStep" />
</template>
```

### RGB channel editing

Edit red as a number without replacing the green and blue channels.

<!-- frame:example id="color-field.red-input" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameColorField } from '@frame/core';
const demoModelValue = ref("#8078d4");
const demoStep = 1;
</script>
<template>
<FrameColorField v-model="demoModelValue" :color-space="&quot;rgb&quot;" :channel="&quot;red&quot;" :step="demoStep" />
</template>
```

## APIs

<!-- frame:generated api="color-field" -->

### FrameColorField

Source: `packages/core/src/components/forms/colors/FrameColorField.vue`

#### Properties

| Name                 | Type                              | Default | Description                                                                                                                                                                                          |
| -------------------- | --------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `modelValue`         | `string \| Color \| undefined`    | Omitted | The color value (controlled). Can be a hex string or Color object.                                                                                                                                   |
| `defaultValue`       | `string \| Color \| undefined`    | Omitted | The default color value (uncontrolled).                                                                                                                                                              |
| `colorSpace`         | `ColorSpace \| undefined`         | Omitted | The color space to operate in when displaying a channel.                                                                                                                                             |
| `channel`            | `ColorChannel \| undefined`       | Omitted | The color channel to display. If not provided, displays hex value.                                                                                                                                   |
| `placeholder`        | `string \| undefined`             | Omitted | Placeholder text when the field is empty.                                                                                                                                                            |
| `disabled`           | `boolean \| undefined`            | false   | When `true`, prevents the user from interacting with the field.                                                                                                                                      |
| `readonly`           | `boolean \| undefined`            | false   | When `true`, the field is read-only.                                                                                                                                                                 |
| `disableWheelChange` | `boolean \| undefined`            | false   | When `true`, prevents the value from changing on wheel scroll.                                                                                                                                       |
| `locale`             | `string \| undefined`             | Omitted | The locale to use for number formatting.                                                                                                                                                             |
| `step`               | `number \| undefined`             | Omitted | Custom step value for increment/decrement. Defaults to channel step or 1 for hex.                                                                                                                    |
| `asChild`            | `boolean \| undefined`            | false   | Change the default rendered element for the one passed as a child, merging their props and behavior. Read our [Composition](https://www.reka-ui.com/docs/guides/composition) guide for more details. |
| `as`                 | `Component \| AsTag \| undefined` | "div"   | The element or component this component should render as. Can be overwritten by `asChild`. defaultValue: "div"                                                                                       |
| `name`               | `string \| undefined`             | Omitted | The name of the field. Submitted with its owning form as part of a name/value pair.                                                                                                                  |
| `required`           | `boolean \| undefined`            | false   | When `true`, indicates that the user must set the value before the owning form can be submitted.                                                                                                     |

#### Events

| Name                | Parameters      | Return type | Description                                             |
| ------------------- | --------------- | ----------- | ------------------------------------------------------- |
| `update:modelValue` | `value: string` | `void`      | Requests the parsed color text after the field changes. |
| `update:color`      | `value: Color`  | `void`      | Publishes the structured color parsed from the input.   |

#### Slots

No declared entries.

#### Exposed API

No declared entries.

<!-- /frame:generated -->

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="color-field" -->

| CSS variable                               | Theme path                               | Default expression                                                                       | Purpose                                                                                  | Context                    |
| ------------------------------------------ | ---------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | -------------------------- |
| `--frame-input-border`                     | `frame.input.border`                     | `1px solid     var(--frame-control-border)`                                              | Fallback for: Resting border of the text input.                                          | `.frame-color-field-input` |
| `--frame-color-field-input-border`         | `frame.color.field.input.border`         | `var(     --frame-input-border,     1px solid     var(--frame-control-border)   )`       | Resting border of the color-field-input text surface.                                    | `.frame-color-field-input` |
| `--frame-control-border`                   | `frame.control.border`                   | No declared default; supplied by context.                                                | Resting border color of form controls, independently overridable from menu borders.      | `.frame-color-field-input` |
| `--frame-color-field-input-border-radius`  | `frame.color.field.input.border.radius`  | `var(     --frame-input-radius   )`                                                      | Corner radius of the color-field-input text surface.                                     | `.frame-color-field-input` |
| `--frame-input-radius`                     | `frame.input.radius`                     | No declared default; supplied by context.                                                | Shared corner radius for text fields, text areas, selects, and composed input surfaces.  | `.frame-color-field-input` |
| `--frame-input-hover-border`               | `frame.input.hover.border`               | `1px solid     var(--frame-control-border)`                                              | Fallback for: Border while the pointer hovers over the text input.                       | `.frame-color-field-input` |
| `--frame-color-field-input-hover-border`   | `frame.color.field.input.hover.border`   | `var(     --frame-input-hover-border,     1px solid     var(--frame-control-border)   )` | Border while the pointer hovers of the color-field-input text surface.                   | `.frame-color-field-input` |
| `--frame-input-hover-outline`              | `frame.input.hover.outline`              | `none`                                                                                   | Fallback for: Outline while the pointer hovers over the text input.                      | `.frame-color-field-input` |
| `--frame-color-field-input-hover-outline`  | `frame.color.field.input.hover.outline`  | `var(     --frame-input-hover-outline,     none   )`                                     | Outline while the pointer hovers of the color-field-input text surface.                  | `.frame-color-field-input` |
| `--frame-input-focus-border`               | `frame.input.focus.border`               | `1px solid var(--frame-accent)`                                                          | Fallback for: Border while focus is within the text input.                               | `.frame-color-field-input` |
| `--frame-color-field-input-focus-border`   | `frame.color.field.input.focus.border`   | `var(     --frame-input-focus-border,     1px solid var(--frame-accent)   )`             | Border while focus is within the input of the color-field-input text surface.            | `.frame-color-field-input` |
| `--frame-accent`                           | `frame.accent`                           | No declared default; supplied by context.                                                | Shared interaction color for keyboard focus, active actions, and accent-filled controls. | `.frame-color-field-input` |
| `--frame-input-focus-outline`              | `frame.input.focus.outline`              | `1px solid var(--frame-accent)`                                                          | Fallback for: Focus outline of the text input.                                           | `.frame-color-field-input` |
| `--frame-color-field-input-focus-outline`  | `frame.color.field.input.focus.outline`  | `var(     --frame-input-focus-outline,     1px solid var(--frame-accent)   )`            | Outline while focus is within the input of the color-field-input text surface.           | `.frame-color-field-input` |
| `--frame-input-outline-offset`             | `frame.input.outline.offset`             | `0px`                                                                                    | Fallback for: Offset between the outline and the text input.                             | `.frame-color-field-input` |
| `--frame-color-field-input-outline-offset` | `frame.color.field.input.outline.offset` | `var(     --frame-input-outline-offset,     0px   )`                                     | Offset between the outline and input of the color-field-input text surface.              | `.frame-color-field-input` |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->
