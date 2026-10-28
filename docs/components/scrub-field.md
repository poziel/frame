# FrameScrubField

A compact numeric field with drag scrubbing and click-to-edit text entry, built from Reka number-field primitives and Frame text/icon controls.

## Features

### Anatomy

- **NumberFieldRoot**: Owns bounds and stepper state.
- **FrameTextField**: Direct text entry on click.
- **Scrub display**: Label, value, and bounded progress fill.

- Drag or scroll to adjust numeric tool settings.
- Click or press Enter to type; Escape cancels.
- Use bounds, fractional steps, and disabled state.

[Underlying Reka reference](https://reka-ui.com/docs/components/number-field). Frame exposes the contract documented below.

### Tool size

Drag to set size, or click to enter an exact value.

<!-- frame:example id="scrub-field.size" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameScrubField } from '@frame/core';
const demoModelValue = ref(12);
const demoMin = 1;
const demoMax = 256;
const demoStep = 1;
</script>
<template>
<FrameScrubField v-model="demoModelValue" :label="&quot;Size&quot;" :suffix="&quot; px&quot;" :min="demoMin" :max="demoMax" :step="demoStep" />
</template>
```

### Opacity

Wheel and arrow buttons change the percentage in single steps.

<!-- frame:example id="scrub-field.opacity" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameScrubField } from '@frame/core';
const demoModelValue = ref(80);
const demoMin = 0;
const demoMax = 100;
const demoStep = 1;
</script>
<template>
<FrameScrubField v-model="demoModelValue" :label="&quot;Opacity&quot;" :suffix="&quot;%&quot;" :min="demoMin" :max="demoMax" :step="demoStep" />
</template>
```

## APIs

<!-- frame:generated api="scrub-field" -->

### FrameScrubField

Source: `packages/core/src/components/forms/FrameScrubField.vue`

#### Properties

| Name            | Type                   | Default  | Description                                                                                                               |
| --------------- | ---------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------- |
| `modelValue`    | `number`               | Required | Controlled numeric value changed by dragging, typing, wheel, or keys.                                                     |
| `label`         | `string`               | Required | Visible field name and accessible name of the spinbutton.                                                                 |
| `id`            | `string \| undefined`  | Omitted  | Id applied to the active display button or editing input.                                                                 |
| `min`           | `number \| undefined`  | Omitted  | Smallest value accepted by the numeric control.                                                                           |
| `max`           | `number \| undefined`  | Omitted  | Largest value accepted by the numeric control.                                                                            |
| `step`          | `number \| undefined`  | 1        | Increment used for keyboard, pointer, and stepper changes.                                                                |
| `suffix`        | `string \| undefined`  | ""       | Text appended to the formatted numeric value.                                                                             |
| `disabled`      | `boolean \| undefined` | false    | Prevents user interaction with the control.                                                                               |
| `pixelsPerStep` | `number \| undefined`  | Omitted  | Drag distance per increment; when omitted bounded fields map position to their range and unbounded fields use six pixels. |

#### Events

| Name                | Parameters      | Return type | Description                                                 |
| ------------------- | --------------- | ----------- | ----------------------------------------------------------- |
| `update:modelValue` | `value: number` | `void`      | Requests the new application-owned value after interaction. |

#### Slots

No declared entries.

#### Exposed API

No declared entries.

<!-- /frame:generated -->

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="scrub-field" -->

| CSS variable                          | Theme path                          | Default expression                                                                       | Purpose                                                                                  | Context                                                                  |
| ------------------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `--frame-input-border`                | `frame.input.border`                | `1px solid     var(--frame-control-border)`                                              | Fallback for: Resting border of the text input.                                          | `.frame-number-field`                                                    |
| `--frame-number-field-border`         | `frame.number.field.border`         | `var(     --frame-input-border,     1px solid     var(--frame-control-border)   )`       | Resting border of the number-field text surface.                                         | `.frame-number-field`                                                    |
| `--frame-control-border`              | `frame.control.border`              | No declared default; supplied by context.                                                | Resting border color of form controls, independently overridable from menu borders.      | `.frame-number-field`                                                    |
| `--frame-number-field-border-radius`  | `frame.number.field.border.radius`  | `var(     --frame-input-radius   )`                                                      | Corner radius of the number-field text surface.                                          | `.frame-number-field`                                                    |
| `--frame-input-radius`                | `frame.input.radius`                | No declared default; supplied by context.                                                | Shared corner radius for text fields, text areas, selects, and composed input surfaces.  | `.frame-number-field`                                                    |
| `--frame-input-hover-border`          | `frame.input.hover.border`          | `1px solid     var(--frame-control-border)`                                              | Fallback for: Border while the pointer hovers over the text input.                       | `.frame-number-field`                                                    |
| `--frame-number-field-hover-border`   | `frame.number.field.hover.border`   | `var(     --frame-input-hover-border,     1px solid     var(--frame-control-border)   )` | Border while the pointer hovers of the number-field text surface.                        | `.frame-number-field`                                                    |
| `--frame-input-hover-outline`         | `frame.input.hover.outline`         | `none`                                                                                   | Fallback for: Outline while the pointer hovers over the text input.                      | `.frame-number-field`                                                    |
| `--frame-number-field-hover-outline`  | `frame.number.field.hover.outline`  | `var(     --frame-input-hover-outline,     none   )`                                     | Outline while the pointer hovers of the number-field text surface.                       | `.frame-number-field`                                                    |
| `--frame-input-focus-border`          | `frame.input.focus.border`          | `1px solid var(--frame-accent)`                                                          | Fallback for: Border while focus is within the text input.                               | `.frame-number-field`                                                    |
| `--frame-number-field-focus-border`   | `frame.number.field.focus.border`   | `var(     --frame-input-focus-border,     1px solid var(--frame-accent)   )`             | Border while focus is within the input of the number-field text surface.                 | `.frame-number-field`                                                    |
| `--frame-accent`                      | `frame.accent`                      | No declared default; supplied by context.                                                | Shared interaction color for keyboard focus, active actions, and accent-filled controls. | `.frame-number-field`                                                    |
| `--frame-input-focus-outline`         | `frame.input.focus.outline`         | `1px solid var(--frame-accent)`                                                          | Fallback for: Focus outline of the text input.                                           | `.frame-number-field`                                                    |
| `--frame-number-field-focus-outline`  | `frame.number.field.focus.outline`  | `var(     --frame-input-focus-outline,     1px solid var(--frame-accent)   )`            | Outline while focus is within the input of the number-field text surface.                | `.frame-number-field`                                                    |
| `--frame-input-outline-offset`        | `frame.input.outline.offset`        | `0px`                                                                                    | Fallback for: Offset between the outline and the text input.                             | `.frame-number-field`                                                    |
| `--frame-number-field-outline-offset` | `frame.number.field.outline.offset` | `var(     --frame-input-outline-offset,     0px   )`                                     | Offset between the outline and input of the number-field text surface.                   | `.frame-number-field`                                                    |
| `--frame-input-border`                | `frame.input.border`                | `1px solid     var(--frame-control-border)`                                              | Fallback for: Resting border of the text input.                                          | `.frame-form-input`                                                      |
| `--frame-form-input-border`           | `frame.form.input.border`           | `var(     --frame-input-border,     1px solid     var(--frame-control-border)   )`       | Resting border of the form-input text surface.                                           | `.frame-form-input`                                                      |
| `--frame-control-border`              | `frame.control.border`              | No declared default; supplied by context.                                                | Resting border color of form controls, independently overridable from menu borders.      | `.frame-form-input`                                                      |
| `--frame-form-input-border-radius`    | `frame.form.input.border.radius`    | `var(     --frame-input-radius   )`                                                      | Corner radius of the form-input text surface.                                            | `.frame-form-input`                                                      |
| `--frame-input-radius`                | `frame.input.radius`                | No declared default; supplied by context.                                                | Shared corner radius for text fields, text areas, selects, and composed input surfaces.  | `.frame-form-input`                                                      |
| `--frame-input-hover-border`          | `frame.input.hover.border`          | `1px solid     var(--frame-control-border)`                                              | Fallback for: Border while the pointer hovers over the text input.                       | `.frame-form-input`                                                      |
| `--frame-form-input-hover-border`     | `frame.form.input.hover.border`     | `var(     --frame-input-hover-border,     1px solid     var(--frame-control-border)   )` | Border while the pointer hovers of the form-input text surface.                          | `.frame-form-input`                                                      |
| `--frame-input-hover-outline`         | `frame.input.hover.outline`         | `none`                                                                                   | Fallback for: Outline while the pointer hovers over the text input.                      | `.frame-form-input`                                                      |
| `--frame-form-input-hover-outline`    | `frame.form.input.hover.outline`    | `var(     --frame-input-hover-outline,     none   )`                                     | Outline while the pointer hovers of the form-input text surface.                         | `.frame-form-input`                                                      |
| `--frame-input-focus-border`          | `frame.input.focus.border`          | `1px solid var(--frame-accent)`                                                          | Fallback for: Border while focus is within the text input.                               | `.frame-form-input`                                                      |
| `--frame-form-input-focus-border`     | `frame.form.input.focus.border`     | `var(     --frame-input-focus-border,     1px solid var(--frame-accent)   )`             | Border while focus is within the input of the form-input text surface.                   | `.frame-form-input`                                                      |
| `--frame-accent`                      | `frame.accent`                      | No declared default; supplied by context.                                                | Shared interaction color for keyboard focus, active actions, and accent-filled controls. | `.frame-form-input`                                                      |
| `--frame-input-focus-outline`         | `frame.input.focus.outline`         | `1px solid var(--frame-accent)`                                                          | Fallback for: Focus outline of the text input.                                           | `.frame-form-input`                                                      |
| `--frame-form-input-focus-outline`    | `frame.form.input.focus.outline`    | `var(     --frame-input-focus-outline,     1px solid var(--frame-accent)   )`            | Outline while focus is within the input of the form-input text surface.                  | `.frame-form-input`                                                      |
| `--frame-input-outline-offset`        | `frame.input.outline.offset`        | `0px`                                                                                    | Fallback for: Offset between the outline and the text input.                             | `.frame-form-input`                                                      |
| `--frame-form-input-outline-offset`   | `frame.form.input.outline.offset`   | `var(     --frame-input-outline-offset,     0px   )`                                     | Offset between the outline and input of the form-input text surface.                     | `.frame-form-input`                                                      |
| `--frame-gap`                         | `frame.gap`                         | `6px`                                                                                    | Space between children for .frame-form-inline-layout.                                    | `.frame-form-inline-layout`                                              |
| `--frame-text`                        | `frame.text`                        | `#ccc`                                                                                   | Foreground for .frame-control-surface.                                                   | `.frame-control-surface`                                                 |
| `--frame-surface`                     | `frame.surface`                     | `#242424`                                                                                | Background for .frame-control-surface.                                                   | `.frame-control-surface`                                                 |
| `--frame-line`                        | `frame.line`                        | `#454545`                                                                                | Border for .frame-control-surface.                                                       | `.frame-control-surface`                                                 |
| `--frame-control-radius`              | `frame.control.radius`              | `var(--frame-radius-medium)`                                                             | Corner radius for .frame-control-surface.                                                | `.frame-control-surface`                                                 |
| `--frame-control-padding-y`           | `frame.control.padding.y`           | `5px`                                                                                    | Internal spacing for .frame-control-surface.                                             | `.frame-control-surface`                                                 |
| `--frame-control-padding-x`           | `frame.control.padding.x`           | `10px`                                                                                   | Internal spacing for .frame-control-surface.                                             | `.frame-control-surface`                                                 |
| `--frame-radius-medium`               | `frame.radius.medium`               | No declared default; supplied by context.                                                | Medium shared corner radius used by ordinary controls.                                   | `.frame-control-surface`                                                 |
| `--frame-form-input-radius`           | `frame.form.input.radius`           | `var(--frame-input-radius)`                                                              | Corner radius of the legacy form input surface.                                          | `.frame-form-input`                                                      |
| `--frame-control-text`                | `frame.control.text`                | `#d4d4d4`                                                                                | Foreground for .frame-form-input.                                                        | `.frame-form-input`                                                      |
| `--frame-control-background`          | `frame.control.background`          | `#1d1d1d`                                                                                | Background for .frame-form-input.                                                        | `.frame-form-input`                                                      |
| `--frame-control-border`              | `frame.control.border`              | `#3c4246`                                                                                | Border color for .frame-form-input.                                                      | `.frame-form-input`                                                      |
| `--frame-accent`                      | `frame.accent`                      | `#0078d4`                                                                                | Elevation shadow for .frame-control-focus:focus-visible.                                 | `.frame-control-focus:focus-visible`                                     |
| `--frame-control-border`              | `frame.control.border`              | `var(--frame-line)`                                                                      | Border for .frame-number-field.                                                          | `.frame-number-field`                                                    |
| `--frame-control-background`          | `frame.control.background`          | `var(--frame-surface)`                                                                   | Background for .frame-number-field.                                                      | `.frame-number-field`                                                    |
| `--frame-control-text`                | `frame.control.text`                | `var(--frame-text)`                                                                      | Foreground for .frame-number-field.                                                      | `.frame-number-field`                                                    |
| `--frame-line`                        | `frame.line`                        | No declared default; supplied by context.                                                | Neutral divider color for content boundaries, tracks, and structural separators.         | `.frame-number-field`                                                    |
| `--frame-surface`                     | `frame.surface`                     | No declared default; supplied by context.                                                | Neutral raised surface behind grouped content and control compositions.                  | `.frame-number-field`                                                    |
| `--frame-text`                        | `frame.text`                        | No declared default; supplied by context.                                                | Primary foreground for readable text and icons across shell and application content.     | `.frame-number-field`                                                    |
| `--frame-control-border`              | `frame.control.border`              | `var(--frame-line)`                                                                      | Border for .frame-number-field > .frame-control-button:first-child.                      | `.frame-number-field > .frame-control-button:first-child`                |
| `--frame-line`                        | `frame.line`                        | No declared default; supplied by context.                                                | Neutral divider color for content boundaries, tracks, and structural separators.         | `.frame-number-field > .frame-control-button:first-child`                |
| `--frame-control-border`              | `frame.control.border`              | `var(--frame-line)`                                                                      | Border for .frame-number-field > .frame-control-button:last-child.                       | `.frame-number-field > .frame-control-button:last-child`                 |
| `--frame-line`                        | `frame.line`                        | No declared default; supplied by context.                                                | Neutral divider color for content boundaries, tracks, and structural separators.         | `.frame-number-field > .frame-control-button:last-child`                 |
| `--frame-menu-hover`                  | `frame.menu.hover`                  | `var(--frame-line)`                                                                      | Background for .frame-number-field .frame-control-button:hover:not([data-disabled]).     | `.frame-number-field .frame-control-button:hover:not([data-disabled])`   |
| `--frame-line`                        | `frame.line`                        | No declared default; supplied by context.                                                | Neutral divider color for content boundaries, tracks, and structural separators.         | `.frame-number-field .frame-control-button:hover:not([data-disabled])`   |
| `--frame-accent`                      | `frame.accent`                      | No declared default; supplied by context.                                                | Shared interaction color for keyboard focus, active actions, and accent-filled controls. | `.frame-number-field .frame-control-button:focus-visible`                |
| `--frame-control-border`              | `frame.control.border`              | `var(--frame-line)`                                                                      | Border for .frame-number-steppers > .frame-control-button + .frame-control-button.       | `.frame-number-steppers > .frame-control-button + .frame-control-button` |
| `--frame-line`                        | `frame.line`                        | No declared default; supplied by context.                                                | Neutral divider color for content boundaries, tracks, and structural separators.         | `.frame-number-steppers > .frame-control-button + .frame-control-button` |
| `--frame-scrub-field-width`           | `frame.scrub.field.width`           | `100%`                                                                                   | Preferred width of the drag-adjustable numeric field.                                    | `.frame-scrub-field`                                                     |
| `--frame-scrub-field-height`          | `frame.scrub.field.height`          | `28px`                                                                                   | Height of the drag-adjustable numeric field.                                             | `.frame-scrub-field`                                                     |
| `--frame-scrub-field-fill`            | `frame.scrub.field.fill`            | `var(--frame-line)`                                                                      | Surface of the numeric value fill behind scrub field text.                               | `.frame-scrub-fill`                                                      |
| `--frame-line`                        | `frame.line`                        | No declared default; supplied by context.                                                | Neutral divider color for content boundaries, tracks, and structural separators.         | `.frame-scrub-fill`                                                      |
| `--frame-control-border`              | `frame.control.border`              | No declared default; supplied by context.                                                | Resting border color of form controls, independently overridable from menu borders.      | `.frame-scrub-steppers`                                                  |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->
