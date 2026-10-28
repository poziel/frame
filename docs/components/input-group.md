# FrameFieldGroup

Compose a labeled input with decorations or actions while retaining one shared input surface.

## Features

### Anatomy

- **FrameFieldGroup**: Owns the shared border and focus ring.
- **prefix / suffix**: Decorations before or after the input.

- Use currency and unit labels inside the border.
- Reuse text, number, date, or select controls.
- Override the group surface through component theme variables.

[Underlying Reka reference](https://reka-ui.com/docs/utilities/primitive). Frame exposes the contract documented below.

### Currency input

A dollar prefix and USD suffix surround the actual Frame text input.

<!-- frame:example id="input-group.currency" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameFieldGroup } from '@frame/core';

</script>
<template>
<FrameFieldGroup >
  <template #prefix><span v-text="&quot;$&quot;" /></template>
  <template #suffix><span v-text="&quot;USD&quot;" /></template>
</FrameFieldGroup>
</template>
```

### Unit suffix

Keep a unit next to the input value inside the same surface.

<!-- frame:example id="input-group.unit" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameFieldGroup } from '@frame/core';

</script>
<template>
<FrameFieldGroup >
  <template #suffix><span v-text="&quot;kg&quot;" /></template>
</FrameFieldGroup>
</template>
```

## APIs

<!-- frame:generated api="input-group" -->

### FrameFieldGroup

Source: `packages/core/src/components/forms/FrameFieldGroup.vue`

#### Properties

| Name       | Type                   | Default | Description                                 |
| ---------- | ---------------------- | ------- | ------------------------------------------- |
| `disabled` | `boolean \| undefined` | false   | Prevents user interaction with the control. |

#### Events

No declared entries.

#### Slots

| Name      | Parameters | Return type  | Description                                          |
| --------- | ---------- | ------------ | ---------------------------------------------------- |
| `default` | `None`     | `VNodeChild` | Input control displayed between the optional addons. |
| `prefix`  | `None`     | `VNodeChild` | Addon displayed before the input control.            |
| `suffix`  | `None`     | `VNodeChild` | Addon displayed after the input control.             |

#### Exposed API

No declared entries.

<!-- /frame:generated -->

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="input-group" -->

| CSS variable                         | Theme path                         | Default expression                                                                       | Purpose                                                                                  | Context              |
| ------------------------------------ | ---------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | -------------------- |
| `--frame-input-border`               | `frame.input.border`               | `1px solid     var(--frame-control-border)`                                              | Fallback for: Resting border of the grouped input surface.                               | `.frame-input-group` |
| `--frame-input-group-border`         | `frame.input.group.border`         | `var(     --frame-input-border,     1px solid     var(--frame-control-border)   )`       | Resting border of the grouped input surface.                                             | `.frame-input-group` |
| `--frame-input-group-border-radius`  | `frame.input.group.border.radius`  | `var(--frame-input-radius)`                                                              | Corner radius of the grouped input surface.                                              | `.frame-input-group` |
| `--frame-input-hover-border`         | `frame.input.hover.border`         | `1px solid     var(--frame-control-border)`                                              | Fallback for: Border while the pointer hovers over the grouped input surface.            | `.frame-input-group` |
| `--frame-input-group-hover-border`   | `frame.input.group.hover.border`   | `var(     --frame-input-hover-border,     1px solid     var(--frame-control-border)   )` | Border while the pointer hovers over the grouped input surface.                          | `.frame-input-group` |
| `--frame-input-hover-outline`        | `frame.input.hover.outline`        | `none`                                                                                   | Fallback for: Outline while the pointer hovers over the grouped input surface.           | `.frame-input-group` |
| `--frame-input-group-hover-outline`  | `frame.input.group.hover.outline`  | `var(     --frame-input-hover-outline,     none   )`                                     | Outline while the pointer hovers over the grouped input surface.                         | `.frame-input-group` |
| `--frame-input-focus-border`         | `frame.input.focus.border`         | `1px solid var(--frame-accent)`                                                          | Fallback for: Border while focus is within the grouped input surface.                    | `.frame-input-group` |
| `--frame-input-group-focus-border`   | `frame.input.group.focus.border`   | `var(     --frame-input-focus-border,     1px solid var(--frame-accent)   )`             | Border while focus is within the grouped input surface.                                  | `.frame-input-group` |
| `--frame-input-focus-outline`        | `frame.input.focus.outline`        | `1px solid var(--frame-accent)`                                                          | Fallback for: Focus outline of the grouped input surface.                                | `.frame-input-group` |
| `--frame-input-group-focus-outline`  | `frame.input.group.focus.outline`  | `var(     --frame-input-focus-outline,     1px solid var(--frame-accent)   )`            | Focus outline of the grouped input surface.                                              | `.frame-input-group` |
| `--frame-input-outline-offset`       | `frame.input.outline.offset`       | `0px`                                                                                    | Fallback for: Offset between the outline and the grouped input surface.                  | `.frame-input-group` |
| `--frame-input-group-outline-offset` | `frame.input.group.outline.offset` | `var(     --frame-input-outline-offset,     0px   )`                                     | Offset between the outline and the grouped input surface.                                | `.frame-input-group` |
| `--frame-control-border`             | `frame.control.border`             | `var(--frame-border-color)`                                                              | Resting border color of form controls, independently overridable from menu borders.      | `.frame-input-group` |
| `--frame-input-radius`               | `frame.input.radius`               | `var(--frame-menu-border-radius)`                                                        | Shared corner radius for text fields, text areas, selects, and composed input surfaces.  | `.frame-input-group` |
| `--frame-accent`                     | `frame.accent`                     | `#0078d4`                                                                                | Shared interaction color for keyboard focus, active actions, and accent-filled controls. | `.frame-input-group` |
| `--frame-input-group-width`          | `frame.input.group.width`          | `min(100%, 340px)`                                                                       | Preferred width of the grouped input surface.                                            | `.frame-input-group` |
| `--frame-input-group-background`     | `frame.input.group.background`     | `var(--frame-control-background)`                                                        | Surface behind the grouped input and its addons.                                         | `.frame-input-group` |
| `--frame-control-background`         | `frame.control.background`         | `#1d1d1d`                                                                                | Resting fill of text-entry controls and other control surfaces.                          | `.frame-input-group` |
| `--frame-control-text`               | `frame.control.text`               | `#d4d4d4`                                                                                | Foreground for text and icons on resting control surfaces.                               | `.frame-input-group` |
| `--frame-spacing-small`              | `frame.spacing.small`              | `4px`                                                                                    | Fallback for: Internal spacing of an input prefix or suffix addon.                       | `.frame-input-addon` |
| `--frame-input-group-addon-padding`  | `frame.input.group.addon.padding`  | `0     var(--frame-spacing-small, 4px)`                                                  | Internal spacing of an input prefix or suffix addon.                                     | `.frame-input-addon` |
| `--frame-input-group-addon-color`    | `frame.input.group.addon.color`    | `var(--frame-muted)`                                                                     | Foreground of an input prefix or suffix addon.                                           | `.frame-input-addon` |
| `--frame-muted`                      | `frame.muted`                      | `#8e9496`                                                                                | Secondary foreground for descriptions, hints, and visually subordinate content.          | `.frame-input-addon` |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->
