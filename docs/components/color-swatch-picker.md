# FrameColorSwatchPicker

Select a color from a supplied palette. Frame builds a selectable item, swatch, and selection indicator for each color.

## Features

### Anatomy

- **ColorSwatchPickerRoot**: Owns palette selection and keyboard navigation.
- **ColorSwatchPickerItem**: Associates one selectable item with a color.
- **ColorSwatchPickerItemSwatch**: Displays the item color.
- **ColorSwatchPickerItemIndicator**: Marks the selected item.

- Keep selection in a bound color value.
- Move focus and select colors with the keyboard.
- Arrange the palette horizontally or vertically.

[Underlying Reka reference](https://reka-ui.com/docs/components/color-swatch-picker). Frame exposes the contract documented below.

### Controlled palette selection

Choose a swatch to update the bound color from a fixed palette.

<!-- frame:example id="color-swatch-picker.palette-selection" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameColorSwatchPicker } from '@frame/core';
const demoModelValue = ref("#0078d4");
const demoColors = [
  "#0078d4",
  "#16a34a",
  "#e05252",
  "#a855f7"
];
</script>
<template>
<FrameColorSwatchPicker v-model="demoModelValue" :colors="demoColors" />
</template>
```

### Vertical keyboard navigation

Arrange the same palette vertically for a narrow tool area. Use the arrow keys to move between colors.

<!-- frame:example id="color-swatch-picker.vertical-palette" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameColorSwatchPicker } from '@frame/core';
const demoModelValue = ref("#16a34a");
const demoColors = [
  "#0078d4",
  "#16a34a",
  "#e05252",
  "#a855f7"
];
</script>
<template>
<FrameColorSwatchPicker v-model="demoModelValue" :colors="demoColors" :orientation="&quot;vertical&quot;" />
</template>
```

## APIs

<!-- frame:generated api="color-swatch-picker" -->

### FrameColorSwatchPicker

Source: `packages/core/src/components/forms/colors/FrameColorSwatchPicker.vue`

#### Properties

| Name                | Type                                 | Default  | Description                                                                                                                                                                                          |
| ------------------- | ------------------------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `defaultValue`      | `string \| string[] \| undefined`    | Omitted  | The value of the listbox when initially rendered. Use when you do not need to control the state of the Listbox                                                                                       |
| `modelValue`        | `string \| string[] \| undefined`    | Omitted  | The controlled value of the listbox. Can be binded with `v-model`.                                                                                                                                   |
| `multiple`          | `boolean \| undefined`               | false    | Whether multiple options can be selected or not.                                                                                                                                                     |
| `disabled`          | `boolean \| undefined`               | false    | When `true`, prevents the user from interacting with listbox                                                                                                                                         |
| `name`              | `string \| undefined`                | Omitted  | The name of the field. Submitted with its owning form as part of a name/value pair.                                                                                                                  |
| `required`          | `boolean \| undefined`               | false    | When `true`, indicates that the user must set the value before the owning form can be submitted.                                                                                                     |
| `asChild`           | `boolean \| undefined`               | false    | Change the default rendered element for the one passed as a child, merging their props and behavior. Read our [Composition](https://www.reka-ui.com/docs/guides/composition) guide for more details. |
| `as`                | `Component \| AsTag \| undefined`    | "div"    | The element or component this component should render as. Can be overwritten by `asChild`. defaultValue: "div"                                                                                       |
| `dir`               | `Direction \| undefined`             | Omitted  | The reading direction of the listbox when applicable. <br> If omitted, inherits globally from `ConfigProvider` or assumes LTR (left-to-right) reading mode.                                          |
| `loop`              | `boolean \| undefined`               | false    | When `true`, keyboard navigation will loop from last item to first, and vice versa.                                                                                                                  |
| `highlightOnHover`  | `boolean \| undefined`               | false    | When `true`, hover over item will trigger highlight                                                                                                                                                  |
| `orientation`       | `DataOrientation \| undefined`       | Omitted  | The orientation of the listbox. <br>Mainly so arrow navigation is done accordingly (left & right vs. up & down)                                                                                      |
| `selectionBehavior` | `"replace" \| "toggle" \| undefined` | 'toggle' | How multiple selection should behave in the collection. defaultValue: 'toggle'                                                                                                                       |
| `colors`            | `readonly string[]`                  | Required | Ordered color strings rendered as selectable swatches.                                                                                                                                               |

#### Events

| Name                | Parameters                                                            | Return type | Description                                                             |
| ------------------- | --------------------------------------------------------------------- | ----------- | ----------------------------------------------------------------------- |
| `update:modelValue` | `value: AcceptableValue`                                              | `void`      | Event handler called when the value changes.                            |
| `entryFocus`        | `event: CustomEvent<any>`                                             | `void`      | Event handler called when container is being focused. Can be prevented. |
| `highlight`         | `payload: { ref: HTMLElement; value: AcceptableValue; } \| undefined` | `void`      | Event handler when highlighted element changes.                         |
| `leave`             | `event: Event`                                                        | `void`      | Event handler called when the mouse leave the container                 |

#### Slots

No declared entries.

#### Exposed API

No declared entries.

<!-- /frame:generated -->

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="color-swatch-picker" -->

| CSS variable             | Theme path             | Default expression                        | Purpose                                                                                                      | Context                                  |
| ------------------------ | ---------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------- |
| `--frame-line`           | `frame.line`           | No declared default; supplied by context. | Neutral divider color for content boundaries, tracks, and structural separators.                             | `.frame-color-swatch`                    |
| `--frame-control-radius` | `frame.control.radius` | No declared default; supplied by context. | Shared corner radius of buttons and ordinary controls; text-entry surfaces may use the input radius instead. | `.frame-color-swatch`                    |
| `--frame-accent`         | `frame.accent`         | No declared default; supplied by context. | Shared interaction color for keyboard focus, active actions, and accent-filled controls.                     | `.frame-advanced-focus:focus-visible`    |
| `--frame-gap`            | `frame.gap`            | No declared default; supplied by context. | Standard space between related content items and control children.                                           | `.frame-swatch-picker`                   |
| `--frame-control-radius` | `frame.control.radius` | No declared default; supplied by context. | Shared corner radius of buttons and ordinary controls; text-entry surfaces may use the input radius instead. | `.frame-swatch-item`                     |
| `--frame-accent`         | `frame.accent`         | No declared default; supplied by context. | Shared interaction color for keyboard focus, active actions, and accent-filled controls.                     | `.frame-swatch-item[data-state=checked]` |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->
