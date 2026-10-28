# FrameNumberField

A numeric value with decrement/increment buttons and a formatted editable input. Use it for quantities and bounded numeric settings. Unlike [FrameTextField](text-input.md) with `type="number"`, this control composes Reka's parsing, formatting, and step interactions.

## Features

### Anatomy

```text
FrameNumberField
└─ NumberFieldRoot (div.frame-number-field; role="group")
   ├─ NumberFieldDecrement (button.frame-control-button; “Decrease”)
   ├─ NumberFieldInput (input.frame-form-input; role="spinbutton")
   ├─ NumberFieldIncrement (button.frame-control-button; “Increase”)
   └─ hidden native form input, when named in a form
```

Frame fixes the button text and composition. Extra attributes fall through to Root; they do not configure the internal Input or individual buttons unless Root explicitly handles them.

### Basic usage

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { FrameLabel, FrameNumberField } from '@frame/core';
import '@frame/core/style.css';

const quantity = ref(1);
</script>

<template>
  <FrameLabel for="quantity">Quantity</FrameLabel>
  <FrameNumberField
    id="quantity" v-model="quantity" label="Quantity"
    :min="1" :max="20" :step="1"
  />
</template>
```

Root consumes `id` and associates it with the inner input. `label` supplies that input's accessible name, not visible text.

### Editing, empty values, and keyboard behavior

Typed text is kept as an editing buffer. Enter or blur commits parsing; stepping updates the numeric model directly. Clearing and committing an empty input can emit `NaN`, so use `Number.isFinite(quantity)` before calculations or submission. This is not a nullable-number model and does not emit `''` like FrameTextField.

By default Reka clamps/snaps committed values using the configured bounds and step. Arrow Up/Down step once; Page Up/Down step ten times; Home/End use configured min/max. Enter commits text. Buttons support pointer stepping, including held-button interactions. Focused wheel changes are enabled unless disabled through Root configuration. IME composition is excluded from step/commit keyboard handling.

Provide a visible label and an accessible name. Input exposes numeric range/value ARIA attributes. The button names are fixed English “Decrease” and “Increase”; there is no Frame prop to translate them independently.

Short follow-up examples reuse the Basic usage setup unless they include their own script. Styles load once per application; these controls need no Frame instance.

### Configuration examples

These examples reuse Basic usage state. The APIs tab explains which attributes are forwarded to Reka rather than declared as Frame props.

```vue
<FrameNumberField
  v-model="quantity" label="Quantity" name="quantity"
  :disable-wheel-change="true" locale="en-US"
/>
```

### Bound the value

Choose a value between 1 and 10. The controls stop at the supplied limits.

<!-- frame:example id="number-field.bounds" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameNumberField } from '@frame/core';
const demoModelValue = ref(5);
const demoMin = 1;
const demoMax = 10;
</script>
<template>
<FrameNumberField v-model="demoModelValue" :min="demoMin" :max="demoMax" :label="&quot;Quantity&quot;" />
</template>
```

### Compact attached controls

Keep icon buttons attached to one compact input border.

<!-- frame:example id="number-field.compact" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameNumberField } from '@frame/core';
const demoModelValue = ref(5);
const demoMin = 0;
const demoMax = 10;
</script>
<template>
<FrameNumberField v-model="demoModelValue" :min="demoMin" :max="demoMax" :label="&quot;Compact quantity&quot;" :size="&quot;compact&quot;" :controls="&quot;buttons&quot;" />
</template>
```

### Without steppers

Numeric entry and keyboard adjustment without visible buttons.

<!-- frame:example id="number-field.plain" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameNumberField } from '@frame/core';
const demoModelValue = ref(5);
const demoMin = 0;
const demoMax = 10;
</script>
<template>
<FrameNumberField v-model="demoModelValue" :min="demoMin" :max="demoMax" :label="&quot;Plain quantity&quot;" :controls="&quot;none&quot;" />
</template>
```

### Stacked arrow controls

Native number arrows, matching the settings number input without an extra button background.

<!-- frame:example id="number-field.stacked" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameNumberField } from '@frame/core';
const demoModelValue = ref(5);
const demoMin = 0;
const demoMax = 10;
</script>
<template>
<FrameNumberField v-model="demoModelValue" :min="demoMin" :max="demoMax" :label="&quot;Stacked quantity&quot;" :controls="&quot;stacked&quot;" :size="&quot;compact&quot;" />
</template>
```

### Fractional steps

Increase or decrease by 0.25 for a measurement requiring fractional precision.

<!-- frame:example id="number-field.fractional" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameNumberField } from '@frame/core';
const demoModelValue = ref(1.5);
const demoMin = 0;
const demoMax = 4;
const demoStep = 0.25;
</script>
<template>
<FrameNumberField v-model="demoModelValue" :min="demoMin" :max="demoMax" :step="demoStep" :label="&quot;Measurement&quot;" />
</template>
```

### Coarse increments

A step of 25 moves quickly through the allowed range.

<!-- frame:example id="number-field.coarse" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameNumberField } from '@frame/core';
const demoModelValue = ref(100);
const demoMin = 50;
const demoMax = 200;
const demoStep = 25;
</script>
<template>
<FrameNumberField v-model="demoModelValue" :min="demoMin" :max="demoMax" :step="demoStep" :label="&quot;Zoom percent&quot;" />
</template>
```

## APIs

<!-- frame:generated api="number-field" -->

### FrameNumberField

Source: `packages/core/src/components/forms/FrameNumberField.vue`

#### Properties

| Name               | Type                                                  | Default   | Description                                                                        |
| ------------------ | ----------------------------------------------------- | --------- | ---------------------------------------------------------------------------------- |
| `tooltip`          | `string \| false \| undefined`                        | Omitted   | Tooltip text; false disables it. When omitted, the native title attribute is used. |
| `tooltipPlacement` | `"top" \| "bottom" \| "left" \| "right" \| undefined` | Omitted   | Preferred tooltip side; positioning falls back when space is limited.              |
| `modelValue`       | `number`                                              | Required  | Controlled numeric value of the input.                                             |
| `id`               | `string \| undefined`                                 | Omitted   | Id applied to the editable input.                                                  |
| `min`              | `number \| undefined`                                 | Omitted   | Smallest value accepted by the numeric control.                                    |
| `max`              | `number \| undefined`                                 | Omitted   | Largest value accepted by the numeric control.                                     |
| `step`             | `number \| undefined`                                 | Omitted   | Increment used for keyboard, pointer, and stepper changes.                         |
| `disabled`         | `boolean \| undefined`                                | false     | Prevents user interaction with the control.                                        |
| `label`            | `string \| undefined`                                 | Omitted   | Accessible name of the control.                                                    |
| `controls`         | `"none" \| "buttons" \| "stacked" \| undefined`       | "buttons" | Chooses button steppers, a native input without buttons, or stacked steppers.      |
| `size`             | `"default" \| "compact" \| undefined`                 | "default" | Selects the default or compact number-field presentation.                          |

#### Events

| Name                | Parameters      | Return type | Description                                                 |
| ------------------- | --------------- | ----------- | ----------------------------------------------------------- |
| `update:modelValue` | `value: number` | `void`      | Requests the new application-owned value after interaction. |

#### Slots

| Name      | Parameters | Return type  | Description                                   |
| --------- | ---------- | ------------ | --------------------------------------------- |
| `tooltip` | `None`     | `VNodeChild` | Custom tooltip content for the numeric input. |

#### Exposed API

No declared entries.

<!-- /frame:generated -->

### Composition and upstream reference

The tables separate Reka types from the actual Frame contract. Declared APIs are typed by Frame; forwarded attributes reach only the named part; internal parts cannot be configured independently. Defaults labeled Reka belong to the underlying reference.

#### Root

Frame supplies this part in its anatomy. Availability below refers to configuration through the Frame wrapper, not direct use of a Reka export.

#### Props

| Prop                 | Reka type                  | Frame type                              | Required/default            | Availability            | Description                                                                            |
| -------------------- | -------------------------- | --------------------------------------- | --------------------------- | ----------------------- | -------------------------------------------------------------------------------------- |
| `allowInvalid`       | `boolean`                  | Same upstream type; undeclared in Frame | Unset in upstream reference | Forwarded               | Allow committed out-of-range/off-grid typed numbers without automatic error UI.        |
| `as`                 | `AsTag \| Component`       | Same upstream type; undeclared in Frame | `"div"` (Reka)              | Forwarded / limited     | Changes Root composition, not individual children; can break Frame fixed anatomy.      |
| `asChild`            | `boolean`                  | Same upstream type; undeclared in Frame | Unset in upstream reference | Forwarded / limited     | Changes Root composition, not individual children; can break Frame fixed anatomy.      |
| `defaultValue`       | `number`                   | Same upstream type; undeclared in Frame | Unset in upstream reference | Forwarded / ineffective | Frame supplies the controlled model; this does not establish uncontrolled Frame state. |
| `disabled`           | `boolean`                  | `boolean`                               | `false`                     | Declared                | Prevent interaction.                                                                   |
| `disableWheelChange` | `boolean`                  | Same upstream type; undeclared in Frame | Unset in upstream reference | Forwarded               | Disable focused wheel stepping.                                                        |
| `focusOnChange`      | `boolean`                  | Same upstream type; undeclared in Frame | `true` (Reka)               | Forwarded               | Focus numeric input after stepping.                                                    |
| `formatOptions`      | `Intl.NumberFormatOptions` | Same upstream type; undeclared in Frame | Unset in upstream reference | Forwarded               | Intl numeric formatting/parsing options.                                               |
| `id`                 | `string`                   | Same upstream type; undeclared in Frame | Unset in upstream reference | Forwarded               | Element or form-control identity.                                                      |
| `invertWheelChange`  | `boolean`                  | Same upstream type; undeclared in Frame | Unset in upstream reference | Forwarded               | Invert wheel step direction.                                                           |
| `locale`             | `string`                   | Same upstream type; undeclared in Frame | Unset in upstream reference | Forwarded               | Numeric locale.                                                                        |
| `max`                | `number`                   | `number`                                | `Unset`                     | Declared                | Upper numeric bound or collection selection/count limit.                               |
| `min`                | `number`                   | `number`                                | `Unset`                     | Declared                | Lower numeric bound.                                                                   |
| `modelValue`         | `number \| null`           | `number`                                | `Required`                  | Changed                 | Required number; nullish updates become NaN.                                           |
| `name`               | `string`                   | Same upstream type; undeclared in Frame | Unset in upstream reference | Forwarded               | Native submitted field name.                                                           |
| `readonly`           | `boolean`                  | Same upstream type; undeclared in Frame | Unset in upstream reference | Forwarded               | Read-only numeric state.                                                               |
| `required`           | `boolean`                  | Same upstream type; undeclared in Frame | Unset in upstream reference | Forwarded               | Native required-value constraint.                                                      |
| `startingValue`      | `number`                   | Same upstream type; undeclared in Frame | Unset in upstream reference | Forwarded               | First stepped value from an empty field; defaults to min or zero.                      |
| `step`               | `number`                   | `number`                                | `1 (Reka)`                  | Declared                | Ordinary increment/decrement amount.                                                   |
| `stepSnapping`       | `boolean`                  | Same upstream type; undeclared in Frame | `true` (Reka)               | Forwarded               | Snap numeric steps to their grid.                                                      |

#### Emits

| Emit                | Reka payload    | Frame payload | Availability       | Behavior                                                                                             |
| ------------------- | --------------- | ------------- | ------------------ | ---------------------------------------------------------------------------------------------------- |
| `update:modelValue` | `[val: number]` | number        | Declared / changed | Controlled-model update using the conversion described on modelValue above. Not a cancellable event. |

#### Slots

| Upstream slot | Scoped field                      | Frame availability                         |
| ------------- | --------------------------------- | ------------------------------------------ |
| default       | `modelValue: number \| undefined` | Internal; payload not forwarded to callers |
| default       | `textValue: string`               | Internal; payload not forwarded to callers |
| default       | `readonly: boolean`               | Internal; payload not forwarded to callers |

#### Data attributes

| Attribute     | Value/presence         | Meaning          |
| ------------- | ---------------------- | ---------------- |
| data-disabled | Present when disabled  | Disabled state.  |
| data-readonly | Present when read-only | Read-only state. |

#### Configuration notes

Forwarded entries in Root’s Props table reach Reka through attribute fallthrough; they are not declared Frame props.

`placeholder` or `maxlength` on FrameNumberField does not target its inner input. Input's `as`/`asChild` and each step button's `as`/`asChild`/`disabled` are not independently configurable. Step button availability is derived from Root. Native form submission uses Root's helper input; disabled values are omitted by that helper.

#### State notes

There is no checked/open `data-state` or automatic `data-invalid` for `allowInvalid`. Host validation and error messages remain application-owned.

#### Input

Frame supplies this part in its anatomy. Availability below refers to configuration through the Frame wrapper, not direct use of a Reka export.

#### Props

| Prop      | Reka type            | Frame type                | Required/default            | Availability | Description                                                                                   |
| --------- | -------------------- | ------------------------- | --------------------------- | ------------ | --------------------------------------------------------------------------------------------- |
| `as`      | `AsTag \| Component` | No independent Frame prop | `"input"` (Reka)            | Internal     | Rendered element/component. Not independently configurable through Frame.                     |
| `asChild` | `boolean`            | No independent Frame prop | Unset in upstream reference | Internal     | Merge behavior into the supplied child element. Not independently configurable through Frame. |

#### Emits

No component-defined emits on this part. Native listeners are separate from component emits.

#### Slots

| Upstream slot | Scoped field            | Frame availability                                           |
| ------------- | ----------------------- | ------------------------------------------------------------ |
| default       | No scoped fields listed | Frame supplies the internal composition; no public part slot |

#### Data attributes

| Attribute     | Value/presence         | Meaning          |
| ------------- | ---------------------- | ---------------- |
| data-disabled | Present when disabled  | Disabled state.  |
| data-readonly | Present when read-only | Read-only state. |

#### Decrement

Frame supplies this part in its anatomy. Availability below refers to configuration through the Frame wrapper, not direct use of a Reka export.

#### Props

| Prop       | Reka type            | Frame type                | Required/default            | Availability | Description                                                                                   |
| ---------- | -------------------- | ------------------------- | --------------------------- | ------------ | --------------------------------------------------------------------------------------------- |
| `as`       | `AsTag \| Component` | No independent Frame prop | `"button"` (Reka)           | Internal     | Rendered element/component. Not independently configurable through Frame.                     |
| `asChild`  | `boolean`            | No independent Frame prop | Unset in upstream reference | Internal     | Merge behavior into the supplied child element. Not independently configurable through Frame. |
| `disabled` | `boolean`            | No independent Frame prop | Unset in upstream reference | Internal     | Prevent interaction. Not independently configurable through Frame.                            |

#### Emits

No component-defined emits on this part. Native listeners are separate from component emits.

#### Slots

| Upstream slot | Scoped field            | Frame availability                                           |
| ------------- | ----------------------- | ------------------------------------------------------------ |
| default       | No scoped fields listed | Frame supplies the internal composition; no public part slot |

#### Data attributes

| Attribute     | Value/presence                       | Meaning                                         |
| ------------- | ------------------------------------ | ----------------------------------------------- |
| data-disabled | Present when stepping is unavailable | Includes bounds, disabled, and read-only state. |
| data-pressed  | true while pressed                   | Pressed/hold interaction.                       |

#### Increment

Frame supplies this part in its anatomy. Availability below refers to configuration through the Frame wrapper, not direct use of a Reka export.

#### Props

| Prop       | Reka type            | Frame type                | Required/default            | Availability | Description                                                                                   |
| ---------- | -------------------- | ------------------------- | --------------------------- | ------------ | --------------------------------------------------------------------------------------------- |
| `as`       | `AsTag \| Component` | No independent Frame prop | `"button"` (Reka)           | Internal     | Rendered element/component. Not independently configurable through Frame.                     |
| `asChild`  | `boolean`            | No independent Frame prop | Unset in upstream reference | Internal     | Merge behavior into the supplied child element. Not independently configurable through Frame. |
| `disabled` | `boolean`            | No independent Frame prop | Unset in upstream reference | Internal     | Prevent interaction. Not independently configurable through Frame.                            |

#### Emits

No component-defined emits on this part. Native listeners are separate from component emits.

#### Slots

| Upstream slot | Scoped field            | Frame availability                                           |
| ------------- | ----------------------- | ------------------------------------------------------------ |
| default       | No scoped fields listed | Frame supplies the internal composition; no public part slot |

#### Data attributes

| Attribute     | Value/presence                       | Meaning                                         |
| ------------- | ------------------------------------ | ----------------------------------------------- |
| data-disabled | Present when stepping is unavailable | Includes bounds, disabled, and read-only state. |
| data-pressed  | true while pressed                   | Pressed/hold interaction.                       |

#### Frame additions

#### Props

| Prop    | Type     | Required/default | Description                                                       |
| ------- | -------- | ---------------- | ----------------------------------------------------------------- |
| `label` | `string` | `Unset`          | Accessible name passed to the inner spinbutton; not visible text. |

#### Slots

No additional public Frame slots.

#### Emits

No additional Frame-only emits. The controlled model event is documented on Root.

#### Exposed methods

No Frame-defined methods or internal Reka refs are exposed.

#### Sources and version

[FrameNumberField.vue](../../../packages/core/src/components/forms/FrameNumberField.vue) and [controls.css](../../../packages/core/src/components/forms/shared/controls.css) define Frame behavior. Compared with the official [Reka Number Field reference](https://reka-ui.com/docs/components/number-field.md) and installed Reka `2.11.0`.

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="number-field" -->

| CSS variable                          | Theme path                          | Default expression                                                                       | Purpose                                                                                                                                                                 | Context                                                                                                                                                                    |
| ------------------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--frame-input-border`                | `frame.input.border`                | `1px solid     var(--frame-control-border)`                                              | Fallback for: Resting border of the number field.                                                                                                                       | `.frame-number-field`                                                                                                                                                      |
| `--frame-number-field-border`         | `frame.number.field.border`         | `var(     --frame-input-border,     1px solid     var(--frame-control-border)   )`       | Resting border of the number field.                                                                                                                                     | `.frame-number-field`                                                                                                                                                      |
| `--frame-number-field-border-radius`  | `frame.number.field.border.radius`  | `var(--frame-input-radius)`                                                              | Corner radius of the number field.                                                                                                                                      | `.frame-number-field`                                                                                                                                                      |
| `--frame-input-hover-border`          | `frame.input.hover.border`          | `1px solid     var(--frame-control-border)`                                              | Fallback for: Border while the pointer hovers over the number field.                                                                                                    | `.frame-number-field`                                                                                                                                                      |
| `--frame-number-field-hover-border`   | `frame.number.field.hover.border`   | `var(     --frame-input-hover-border,     1px solid     var(--frame-control-border)   )` | Border while the pointer hovers over the number field.                                                                                                                  | `.frame-number-field`                                                                                                                                                      |
| `--frame-input-hover-outline`         | `frame.input.hover.outline`         | `none`                                                                                   | Fallback for: Outline while the pointer hovers over the number field.                                                                                                   | `.frame-number-field`                                                                                                                                                      |
| `--frame-number-field-hover-outline`  | `frame.number.field.hover.outline`  | `var(     --frame-input-hover-outline,     none   )`                                     | Outline while the pointer hovers over the number field.                                                                                                                 | `.frame-number-field`                                                                                                                                                      |
| `--frame-input-focus-border`          | `frame.input.focus.border`          | `1px solid var(--frame-accent)`                                                          | Fallback for: Border while focus is within the number field.                                                                                                            | `.frame-number-field`                                                                                                                                                      |
| `--frame-number-field-focus-border`   | `frame.number.field.focus.border`   | `var(     --frame-input-focus-border,     1px solid var(--frame-accent)   )`             | Border while focus is within the number field.                                                                                                                          | `.frame-number-field`                                                                                                                                                      |
| `--frame-input-focus-outline`         | `frame.input.focus.outline`         | `1px solid var(--frame-accent)`                                                          | Fallback for: Focus outline of the number field.                                                                                                                        | `.frame-number-field`                                                                                                                                                      |
| `--frame-number-field-focus-outline`  | `frame.number.field.focus.outline`  | `var(     --frame-input-focus-outline,     1px solid var(--frame-accent)   )`            | Focus outline of the number field.                                                                                                                                      | `.frame-number-field`                                                                                                                                                      |
| `--frame-input-outline-offset`        | `frame.input.outline.offset`        | `0px`                                                                                    | Fallback for: Offset between the outline and the number field.                                                                                                          | `.frame-number-field`                                                                                                                                                      |
| `--frame-number-field-outline-offset` | `frame.number.field.outline.offset` | `var(     --frame-input-outline-offset,     0px   )`                                     | Offset between the outline and the number field.                                                                                                                        | `.frame-number-field`                                                                                                                                                      |
| `--frame-control-border`              | `frame.control.border`              | `var(--frame-border-color)`                                                              | Resting border color of form controls, independently overridable from menu borders.                                                                                     | `.frame-number-field`                                                                                                                                                      |
| `--frame-input-radius`                | `frame.input.radius`                | `var(--frame-menu-border-radius)`                                                        | Shared corner radius for text fields, text areas, selects, and composed input surfaces.                                                                                 | `.frame-number-field`                                                                                                                                                      |
| `--frame-accent`                      | `frame.accent`                      | `#0078d4`                                                                                | Shared interaction color for keyboard focus, active actions, and accent-filled controls.                                                                                | `.frame-number-field`                                                                                                                                                      |
| `--frame-input-border`                | `frame.input.border`                | `1px solid     var(--frame-control-border)`                                              | Fallback for: Resting border of the form input.                                                                                                                         | `.frame-form-input`                                                                                                                                                        |
| `--frame-form-input-border`           | `frame.form.input.border`           | `var(     --frame-input-border,     1px solid     var(--frame-control-border)   )`       | Resting border of the form input.                                                                                                                                       | `.frame-form-input`                                                                                                                                                        |
| `--frame-form-input-border-radius`    | `frame.form.input.border.radius`    | `var(--frame-input-radius)`                                                              | Corner radius of the form input.                                                                                                                                        | `.frame-form-input`                                                                                                                                                        |
| `--frame-input-hover-border`          | `frame.input.hover.border`          | `1px solid     var(--frame-control-border)`                                              | Fallback for: Border while the pointer hovers over the form input.                                                                                                      | `.frame-form-input`                                                                                                                                                        |
| `--frame-form-input-hover-border`     | `frame.form.input.hover.border`     | `var(     --frame-input-hover-border,     1px solid     var(--frame-control-border)   )` | Border while the pointer hovers over the form input.                                                                                                                    | `.frame-form-input`                                                                                                                                                        |
| `--frame-input-hover-outline`         | `frame.input.hover.outline`         | `none`                                                                                   | Fallback for: Outline while the pointer hovers over the form input.                                                                                                     | `.frame-form-input`                                                                                                                                                        |
| `--frame-form-input-hover-outline`    | `frame.form.input.hover.outline`    | `var(     --frame-input-hover-outline,     none   )`                                     | Outline while the pointer hovers over the form input.                                                                                                                   | `.frame-form-input`                                                                                                                                                        |
| `--frame-input-focus-border`          | `frame.input.focus.border`          | `1px solid var(--frame-accent)`                                                          | Fallback for: Border while focus is within the form input.                                                                                                              | `.frame-form-input`                                                                                                                                                        |
| `--frame-form-input-focus-border`     | `frame.form.input.focus.border`     | `var(     --frame-input-focus-border,     1px solid var(--frame-accent)   )`             | Border while focus is within the form input.                                                                                                                            | `.frame-form-input`                                                                                                                                                        |
| `--frame-input-focus-outline`         | `frame.input.focus.outline`         | `1px solid var(--frame-accent)`                                                          | Fallback for: Focus outline of the form input.                                                                                                                          | `.frame-form-input`                                                                                                                                                        |
| `--frame-form-input-focus-outline`    | `frame.form.input.focus.outline`    | `var(     --frame-input-focus-outline,     1px solid var(--frame-accent)   )`            | Focus outline of the form input.                                                                                                                                        | `.frame-form-input`                                                                                                                                                        |
| `--frame-input-outline-offset`        | `frame.input.outline.offset`        | `0px`                                                                                    | Fallback for: Offset between the outline and the form input.                                                                                                            | `.frame-form-input`                                                                                                                                                        |
| `--frame-form-input-outline-offset`   | `frame.form.input.outline.offset`   | `var(     --frame-input-outline-offset,     0px   )`                                     | Offset between the outline and the form input.                                                                                                                          | `.frame-form-input`                                                                                                                                                        |
| `--frame-control-border`              | `frame.control.border`              | `var(--frame-border-color)`                                                              | Resting border color of form controls, independently overridable from menu borders.                                                                                     | `.frame-form-input`                                                                                                                                                        |
| `--frame-input-radius`                | `frame.input.radius`                | `var(--frame-menu-border-radius)`                                                        | Shared corner radius for text fields, text areas, selects, and composed input surfaces.                                                                                 | `.frame-form-input`                                                                                                                                                        |
| `--frame-accent`                      | `frame.accent`                      | `#0078d4`                                                                                | Shared interaction color for keyboard focus, active actions, and accent-filled controls.                                                                                | `.frame-form-input`                                                                                                                                                        |
| `--frame-gap`                         | `frame.gap`                         | `6px`                                                                                    | Space between children for .frame-form-inline, .frame-number-field, .frame-pin-input, .frame-tags-input, .frame-combobox-anchor.                                        | `.frame-form-inline, .frame-number-field, .frame-pin-input, .frame-tags-input, .frame-combobox-anchor`                                                                     |
| `--frame-text`                        | `frame.text`                        | `#ccc`                                                                                   | Foreground for .frame-form-input, .frame-control-button, .frame-toggle, .frame-choice-item, .frame-check-control.                                                       | `.frame-form-input, .frame-control-button, .frame-toggle, .frame-choice-item, .frame-check-control`                                                                        |
| `--frame-surface`                     | `frame.surface`                     | `#242424`                                                                                | Background for .frame-form-input, .frame-control-button, .frame-toggle, .frame-choice-item, .frame-check-control.                                                       | `.frame-form-input, .frame-control-button, .frame-toggle, .frame-choice-item, .frame-check-control`                                                                        |
| `--frame-line`                        | `frame.line`                        | `#454545`                                                                                | Border for .frame-form-input, .frame-control-button, .frame-toggle, .frame-choice-item, .frame-check-control.                                                           | `.frame-form-input, .frame-control-button, .frame-toggle, .frame-choice-item, .frame-check-control`                                                                        |
| `--frame-control-radius`              | `frame.control.radius`              | `var(--frame-radius-medium)`                                                             | Corner radius for .frame-form-input, .frame-control-button, .frame-toggle, .frame-choice-item, .frame-check-control.                                                    | `.frame-form-input, .frame-control-button, .frame-toggle, .frame-choice-item, .frame-check-control`                                                                        |
| `--frame-control-padding-y`           | `frame.control.padding.y`           | `5px`                                                                                    | Internal spacing for .frame-form-input, .frame-control-button, .frame-toggle, .frame-choice-item, .frame-check-control.                                                 | `.frame-form-input, .frame-control-button, .frame-toggle, .frame-choice-item, .frame-check-control`                                                                        |
| `--frame-control-padding-x`           | `frame.control.padding.x`           | `10px`                                                                                   | Internal spacing for .frame-form-input, .frame-control-button, .frame-toggle, .frame-choice-item, .frame-check-control.                                                 | `.frame-form-input, .frame-control-button, .frame-toggle, .frame-choice-item, .frame-check-control`                                                                        |
| `--frame-radius-medium`               | `frame.radius.medium`               | `4px`                                                                                    | Medium shared corner radius used by ordinary controls.                                                                                                                  | `.frame-form-input, .frame-control-button, .frame-toggle, .frame-choice-item, .frame-check-control`                                                                        |
| `--frame-form-input-radius`           | `frame.form.input.radius`           | `var(--frame-input-radius)`                                                              | Corner radius of the legacy form input surface.                                                                                                                         | `.frame-form-input`                                                                                                                                                        |
| `--frame-control-text`                | `frame.control.text`                | `#d4d4d4`                                                                                | Foreground for .frame-form-input.                                                                                                                                       | `.frame-form-input`                                                                                                                                                        |
| `--frame-control-background`          | `frame.control.background`          | `#1d1d1d`                                                                                | Background for .frame-form-input.                                                                                                                                       | `.frame-form-input`                                                                                                                                                        |
| `--frame-control-border`              | `frame.control.border`              | `#3c4246`                                                                                | Border color for .frame-form-input.                                                                                                                                     | `.frame-form-input`                                                                                                                                                        |
| `--frame-accent`                      | `frame.accent`                      | `#0078d4`                                                                                | Outline for :is( .frame-form-input, .frame-control-button, .frame-toggle, .frame-choice-item, .frame-check-control, .frame-switch, .frame-slider-thumb ):focus-visible. | `:is(   .frame-form-input,   .frame-control-button,   .frame-toggle,   .frame-choice-item,   .frame-check-control,   .frame-switch,   .frame-slider-thumb ):focus-visible` |
| `--frame-control-border`              | `frame.control.border`              | `var(--frame-line)`                                                                      | Border for .frame-number-field.                                                                                                                                         | `.frame-number-field`                                                                                                                                                      |
| `--frame-control-background`          | `frame.control.background`          | `var(--frame-surface)`                                                                   | Background for .frame-number-field.                                                                                                                                     | `.frame-number-field`                                                                                                                                                      |
| `--frame-control-text`                | `frame.control.text`                | `var(--frame-text)`                                                                      | Foreground for .frame-number-field.                                                                                                                                     | `.frame-number-field`                                                                                                                                                      |
| `--frame-line`                        | `frame.line`                        | `#2b2b2b`                                                                                | Neutral divider color for content boundaries, tracks, and structural separators.                                                                                        | `.frame-number-field`                                                                                                                                                      |
| `--frame-surface`                     | `frame.surface`                     | `#181818`                                                                                | Neutral raised surface behind grouped content and control compositions.                                                                                                 | `.frame-number-field`                                                                                                                                                      |
| `--frame-text`                        | `frame.text`                        | `#cccccc`                                                                                | Primary foreground for readable text and icons across shell and application content.                                                                                    | `.frame-number-field`                                                                                                                                                      |
| `--frame-control-border`              | `frame.control.border`              | `var(--frame-line)`                                                                      | Right border for .frame-number-field > .frame-control-button:first-child.                                                                                               | `.frame-number-field > .frame-control-button:first-child`                                                                                                                  |
| `--frame-line`                        | `frame.line`                        | `#2b2b2b`                                                                                | Neutral divider color for content boundaries, tracks, and structural separators.                                                                                        | `.frame-number-field > .frame-control-button:first-child`                                                                                                                  |
| `--frame-control-border`              | `frame.control.border`              | `var(--frame-line)`                                                                      | Left border for .frame-number-field > .frame-control-button:last-child.                                                                                                 | `.frame-number-field > .frame-control-button:last-child`                                                                                                                   |
| `--frame-line`                        | `frame.line`                        | `#2b2b2b`                                                                                | Neutral divider color for content boundaries, tracks, and structural separators.                                                                                        | `.frame-number-field > .frame-control-button:last-child`                                                                                                                   |
| `--frame-menu-hover`                  | `frame.menu.hover`                  | `var(--frame-line)`                                                                      | Background for .frame-number-field .frame-control-button:hover:not([data-disabled]).                                                                                    | `.frame-number-field .frame-control-button:hover:not([data-disabled])`                                                                                                     |
| `--frame-line`                        | `frame.line`                        | `#2b2b2b`                                                                                | Neutral divider color for content boundaries, tracks, and structural separators.                                                                                        | `.frame-number-field .frame-control-button:hover:not([data-disabled])`                                                                                                     |
| `--frame-accent`                      | `frame.accent`                      | `#0078d4`                                                                                | Shared interaction color for keyboard focus, active actions, and accent-filled controls.                                                                                | `.frame-number-field .frame-control-button:focus-visible`                                                                                                                  |
| `--frame-control-border`              | `frame.control.border`              | `var(--frame-line)`                                                                      | Top border for .frame-number-steppers > .frame-control-button + .frame-control-button.                                                                                  | `.frame-number-steppers > .frame-control-button + .frame-control-button`                                                                                                   |
| `--frame-line`                        | `frame.line`                        | `#2b2b2b`                                                                                | Neutral divider color for content boundaries, tracks, and structural separators.                                                                                        | `.frame-number-steppers > .frame-control-button + .frame-control-button`                                                                                                   |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->

### Additional styling guidance

#### Parts and selectors

| Selector                | Part               | Placement/attribute target                                       |
| ----------------------- | ------------------ | ---------------------------------------------------------------- |
| `.frame-number-field`   | Root               | Caller class/style targets this element.                         |
| `.frame-form-input`     | Input cell/textbox | Internal part; caller attributes do not target it independently. |
| `.frame-control-button` | Action button      | Internal part; caller attributes do not target it independently. |

Input width is 7em. Root classes are not automatically input classes.

#### Variables

| Token key                    | Variable                     | Value kind                     | Default/fallback                                                                  | Part/effect                               | Scope/limits                                                                 | Description         |
| ---------------------------- | ---------------------------- | ------------------------------ | --------------------------------------------------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------- | ------------------- |
| `--frame-accent`             | `--frame-accent`             | color                          | Catalog: `#0078d4`; CSS fallback: `#0078d4`                                       | Input cell/textbox, Action button outline | Shared across controls using this variable. State rules: :focus-visible.     | Accent.             |
| `--frame-control-background` | `--frame-control-background` | color                          | Catalog: `#1d1d1d`; CSS fallback: `#1d1d1d`                                       | Input cell/textbox background             | Shared across controls using this variable.                                  | Control background. |
| `--frame-control-border`     | `--frame-control-border`     | color                          | Catalog: `var(--frame-border-color)`; CSS fallback: `#3c4246`                     | Input cell/textbox border-color           | Shared across controls using this variable.                                  | Control border.     |
| `--frame-control-padding-x`  | `--frame-control-padding-x`  | length                         | Catalog: `calc(var(--frame-spacing-unit) * 2.5)`; CSS fallback: `10px`            | Input cell/textbox, Action button padding | Shared across controls using this variable.                                  | Control padding x.  |
| `--frame-control-padding-y`  | `--frame-control-padding-y`  | length                         | Catalog: `calc(var(--frame-spacing-unit) * 1.25)`; CSS fallback: `5px`            | Input cell/textbox, Action button padding | Shared across controls using this variable.                                  | Control padding y.  |
| `--frame-control-radius`     | `--frame-control-radius`     | length                         | Catalog: `var(--frame-radius-medium)`; CSS fallback: `var(--frame-radius-medium)` | Action button border-radius               | Shared across controls using this variable.                                  | Control radius.     |
| `--frame-control-text`       | `--frame-control-text`       | color                          | Catalog: `#d4d4d4`; CSS fallback: `#d4d4d4`                                       | Input cell/textbox color                  | Shared across controls using this variable.                                  | Control text.       |
| CSS only                     | `--frame-form-input-radius`  | length / CSS length expression | CSS fallback: `var(--frame-input-radius)`                                         | Input cell/textbox border-radius          | Shared across controls using this variable. CSS only; not in JSON allowlist. | Form input radius.  |
| `--frame-gap`                | `--frame-gap`                | length                         | Catalog: `calc(var(--frame-spacing-unit) * 1.5)`; CSS fallback: `6px`             | Root gap                                  | Shared across controls using this variable.                                  | Gap.                |
| `--frame-input-radius`       | `--frame-input-radius`       | length                         | Catalog: `var(--frame-menu-border-radius)`                                        | Input cell/textbox border-radius          | Shared across controls using this variable.                                  | Input radius.       |
| `--frame-line`               | `--frame-line`               | color                          | Catalog: `#2b2b2b`; CSS fallback: `#454545`                                       | Action button border                      | Shared across controls using this variable.                                  | Line.               |
| `--frame-radius-medium`      | `--frame-radius-medium`      | length                         | Catalog: `4px`                                                                    | Action button border-radius               | Shared across controls using this variable.                                  | Radius medium.      |
| `--frame-surface`            | `--frame-surface`            | color                          | Catalog: `#181818`; CSS fallback: `#242424`                                       | Action button background                  | Shared across controls using this variable.                                  | Surface.            |
| `--frame-text`               | `--frame-text`               | color                          | Catalog: `#cccccc`; CSS fallback: `#ccc`                                          | Action button color                       | Shared across controls using this variable.                                  | Text.               |

See [theme variables](../../styling/theme-variables.md) for theme authoring.
