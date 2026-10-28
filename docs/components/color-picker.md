# Color Pickers

A standalone color input using hexadecimal colors.

## Features

### Open a project color editor

Bind a #RRGGBB string and provide an accessible label. The platform picker lets users choose the color.

<!-- frame:example id="color-picker.original-playground" -->

```vue
<FrameColorPicker v-model="color" aria-label="Project color" />
```

### Choose a project accent

Open the compact swatch to adjust a host-owned hex color through the area, hue slider and text field.

<!-- frame:example id="color-picker.project-accent" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameColorPicker } from '@frame/core';
const demoModelValue = ref("#0078d4");
</script>
<template>
<FrameColorPicker v-model="demoModelValue" />
</template>
```

### Review a saved project color

The trigger displays the stored color before the user opens the editor to change it.

<!-- frame:example id="color-picker.stored-color" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameColorPicker } from '@frame/core';
const demoModelValue = ref("#16a34a");
</script>
<template>
<FrameColorPicker v-model="demoModelValue" />
</template>
```

## APIs

<!-- frame:generated api="color-picker" -->

### FrameColorPicker

Source: `packages/core/src/components/forms/colors/FrameColorPicker.vue`

#### Properties

| Name         | Type                   | Default  | Description                                                             |
| ------------ | ---------------------- | -------- | ----------------------------------------------------------------------- |
| `modelValue` | `string`               | Required | Controlled color text; interactive color changes emit hexadecimal text. |
| `disabled`   | `boolean \| undefined` | false    | Prevents user interaction with the control.                             |
| `name`       | `string \| undefined`  | Omitted  | Name of the hidden input included in native form submission.            |
| `required`   | `boolean \| undefined` | false    | Requires a value when the associated form is validated.                 |
| `form`       | `string \| undefined`  | Omitted  | Identifier of the native form associated with the submitted input.      |

#### Events

| Name                | Parameters      | Return type | Description                                                 |
| ------------------- | --------------- | ----------- | ----------------------------------------------------------- |
| `update:modelValue` | `value: string` | `void`      | Requests the new application-owned value after interaction. |

#### Slots

No declared entries.

#### Exposed API

No declared entries.

<!-- /frame:generated -->

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="color-picker" -->

| CSS variable                         | Theme path                         | Default expression                        | Purpose                                                                                                      | Context                                   |
| ------------------------------------ | ---------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------- |
| `--frame-overlay-backdrop-filter`    | `frame.overlay.backdrop.filter`    | No declared default; supplied by context. | Blur and saturation treatment behind shared translucent floating surfaces.                                   | `.frame-overlay-surface`                  |
| `--frame-line`                       | `frame.line`                       | No declared default; supplied by context. | Neutral divider color for content boundaries, tracks, and structural separators.                             | `.frame-color-picker.frame-color-trigger` |
| `--frame-control-radius`             | `frame.control.radius`             | No declared default; supplied by context. | Shared corner radius of buttons and ordinary controls; text-entry surfaces may use the input radius instead. | `.frame-color-picker.frame-color-trigger` |
| `--frame-canvas`                     | `frame.canvas`                     | No declared default; supplied by context. | Content canvas background used by workspace panes and recessed content.                                      | `.frame-color-picker.frame-color-trigger` |
| `--frame-accent`                     | `frame.accent`                     | No declared default; supplied by context. | Shared interaction color for keyboard focus, active actions, and accent-filled controls.                     | `.frame-color-trigger:focus-visible`      |
| `--frame-control-radius`             | `frame.control.radius`             | No declared default; supplied by context. | Shared corner radius of buttons and ordinary controls; text-entry surfaces may use the input radius instead. | `.frame-color-trigger-swatch`             |
| `--frame-gap`                        | `frame.gap`                        | No declared default; supplied by context. | Standard space between related content items and control children.                                           | `.frame-color-picker-popover`             |
| `--frame-content-padding`            | `frame.content.padding`            | No declared default; supplied by context. | Standard inset around content in panels, disclosures, and application surfaces.                              | `.frame-color-picker-popover`             |
| `--frame-overlay-background`         | `frame.overlay.background`         | No declared default; supplied by context. | Shared translucent fill for floating surfaces over the application canvas.                                   | `.frame-color-picker-popover`             |
| `--frame-text`                       | `frame.text`                       | No declared default; supplied by context. | Primary foreground for readable text and icons across shell and application content.                         | `.frame-color-picker-popover`             |
| `--frame-line`                       | `frame.line`                       | No declared default; supplied by context. | Neutral divider color for content boundaries, tracks, and structural separators.                             | `.frame-color-picker-popover`             |
| `--frame-panel-radius`               | `frame.panel.radius`               | No declared default; supplied by context. | Shared corner radius of panel containers and larger floating surfaces.                                       | `.frame-color-picker-popover`             |
| `--frame-overlay-shadow`             | `frame.overlay.shadow`             | No declared default; supplied by context. | Elevation shadow separating floating overlays from underlying content.                                       | `.frame-color-picker-popover`             |
| `--frame-font-body`                  | `frame.font.body`                  | No declared default; supplied by context. | Primary font family inherited by shell content and ordinary controls.                                        | `.frame-color-picker-popover`             |
| `--frame-font-size-body`             | `frame.font.size.body`             | No declared default; supplied by context. | Base text size inherited by shell content and ordinary controls.                                             | `.frame-color-picker-popover`             |
| `--frame-color-picker-width`         | `frame.color.picker.width`         | `70px`                                    | Width for .frame-color-picker.                                                                               | `.frame-color-picker`                     |
| `--frame-color-picker-height`        | `frame.color.picker.height`        | `36px`                                    | Height for .frame-color-picker.                                                                              | `.frame-color-picker`                     |
| `--frame-color-picker-padding`       | `frame.color.picker.padding`       | `3px`                                     | Internal spacing for .frame-color-picker.                                                                    | `.frame-color-picker`                     |
| `--frame-color-picker-border`        | `frame.color.picker.border`        | `1px solid #3c4246`                       | Border for .frame-color-picker.                                                                              | `.frame-color-picker`                     |
| `--frame-color-picker-border-radius` | `frame.color.picker.border.radius` | `var(     --frame-radius-medium   )`      | Corner radius for .frame-color-picker.                                                                       | `.frame-color-picker`                     |
| `--frame-color-picker-background`    | `frame.color.picker.background`    | `#1b1d1e`                                 | Background for .frame-color-picker.                                                                          | `.frame-color-picker`                     |
| `--frame-radius-medium`              | `frame.radius.medium`              | No declared default; supplied by context. | Medium shared corner radius used by ordinary controls.                                                       | `.frame-color-picker`                     |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->
