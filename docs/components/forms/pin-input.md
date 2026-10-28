# FramePinField

A sequence of one-character inputs for a short code. The model is a string array, not a combined string or a number. Joining and validating the code belong to the host.

## Features

### Anatomy

```text
FramePinField
└─ PinInputRoot (.frame-pin-input)
   ├─ PinInputInput (.frame-form-input), index 0
   ├─ more inputs up to length - 1
   └─ visually hidden input containing the joined code
```

Frame creates the cells and supplies labels such as “Verification code 1”. Root's default scoped slot is internal; there are no public cell/separator slots. Extra attributes target Root, not every input.

### Basic usage

```vue
<script setup lang="ts">
import { computed, ref } from 'vue';
import { FramePinField } from '@frame/core';
import '@frame/core/style.css';

const digits = ref<string[]>([]);
const code = computed(() => digits.value.join(''));
</script>

<template>
  <div>
    <p>Enter the six-character verification code.</p>
    <FramePinField v-model="digits" label="Verification code" :length="6" otp />
    <p>Entered {{ code.length }} of 6 characters.</p>
  </div>
</template>
```

`otp` requests one-time-code autocomplete; it does not verify a code, send requests, or enforce numeric-only input. The underlying default input type is text. Preserve leading zeroes by keeping the string-array model.

### Editing, keyboard, and forms

Typing and paste distribute characters through cells; ordinary entry advances focus. Arrow navigation and Home/End move among cells. Backspace/Delete edit values and may move focus according to Reka's cell rules. Composition input is handled by the primitive. Disabled cells are not editable.

In a native form, Root's helper submits the joined string when named; disabled inputs are omitted. `required` checks the helper's nonempty value, not your application's exact-length, expiry, or server verification rules. Use host validation for those rules. A label's `for` pointing at Root's `id` reaches the hidden helper, which redirects focus to the first cell; use meaningful per-cell labels and visible instructions too.

Short follow-up examples reuse the Basic usage setup unless they include their own script. Styles load once per application; these controls need no Frame instance.

### Paste a verification code

Focus the first cell and paste a six-character code. The input distributes it across the sequence.

<!-- frame:example id="pin-input.paste" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FramePinField } from '@frame/core';
const demoModelValue = ref([]);
const demoLength = 6;
const demoOtp = true;
</script>
<template>
<FramePinField v-model="demoModelValue" :length="demoLength" :otp="demoOtp" :label="&quot;Verification code&quot;" />
</template>
```

### A shorter code

Four cells match a shorter code format; existing characters can be edited individually.

<!-- frame:example id="pin-input.length" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FramePinField } from '@frame/core';
const demoModelValue = ref(["1","2"]);
const demoLength = 4;
</script>
<template>
<FramePinField v-model="demoModelValue" :length="demoLength" :label="&quot;Access code&quot;" />
</template>
```

### Mask entered characters

Characters remain in the model while their on-screen representation is masked.

<!-- frame:example id="pin-input.mask" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FramePinField } from '@frame/core';
const demoModelValue = ref([]);
const demoLength = 6;
const demoMask = true;
</script>
<template>
<FramePinField v-model="demoModelValue" :length="demoLength" :mask="demoMask" :label="&quot;Private code&quot;" />
</template>
```

## APIs

<!-- frame:generated api="pin-input" -->

### FramePinField

Source: `packages/core/src/components/forms/FramePinField.vue`

#### Properties

| Name         | Type                   | Default  | Description                                               |
| ------------ | ---------------------- | -------- | --------------------------------------------------------- |
| `modelValue` | `string[]`             | Required | Controlled character values in the individual PIN inputs. |
| `length`     | `number \| undefined`  | 6        | Number of individual character inputs rendered.           |
| `disabled`   | `boolean \| undefined` | false    | Prevents user interaction with the control.               |
| `label`      | `string \| undefined`  | Omitted  | Accessible name of the control.                           |
| `mask`       | `boolean \| undefined` | false    | Masks entered characters.                                 |
| `otp`        | `boolean \| undefined` | false    | Enables one-time-code autocomplete on the PIN input.      |

#### Events

| Name                | Parameters        | Return type | Description                                                 |
| ------------------- | ----------------- | ----------- | ----------------------------------------------------------- |
| `update:modelValue` | `value: string[]` | `void`      | Requests the new application-owned value after interaction. |

#### Slots

No declared entries.

#### Exposed API

No declared entries.

<!-- /frame:generated -->

### Composition and upstream reference

The tables separate Reka types from the actual Frame contract. Declared APIs are typed by Frame; forwarded attributes reach only the named part; internal parts cannot be configured independently. Defaults labeled Reka belong to the underlying reference.

#### Root

Frame supplies this part in its anatomy. Availability below refers to configuration through the Frame wrapper, not direct use of a Reka export.

#### Props

| Prop           | Reka type                     | Frame type                              | Required/default            | Availability            | Description                                                                            |
| -------------- | ----------------------------- | --------------------------------------- | --------------------------- | ----------------------- | -------------------------------------------------------------------------------------- |
| `as`           | `AsTag \| Component`          | Same upstream type; undeclared in Frame | `"div"` (Reka)              | Forwarded / limited     | Changes Root composition, not individual children; can break Frame fixed anatomy.      |
| `asChild`      | `boolean`                     | Same upstream type; undeclared in Frame | Unset in upstream reference | Forwarded / limited     | Changes Root composition, not individual children; can break Frame fixed anatomy.      |
| `defaultValue` | `PinInputValue<Type>`         | Same upstream type; undeclared in Frame | Unset in upstream reference | Forwarded / ineffective | Frame supplies the controlled model; this does not establish uncontrolled Frame state. |
| `dir`          | `"ltr" \| "rtl"`              | Same upstream type; undeclared in Frame | Unset in upstream reference | Forwarded               | Reading/navigation direction.                                                          |
| `disabled`     | `boolean`                     | `boolean`                               | `false`                     | Declared                | Prevent interaction.                                                                   |
| `id`           | `string`                      | Same upstream type; undeclared in Frame | Unset in upstream reference | Forwarded               | Identity for the hidden aggregate input, not a visible cell.                           |
| `mask`         | `boolean`                     | `boolean`                               | `false`                     | Declared                | Use masked password presentation.                                                      |
| `modelValue`   | `PinInputValue<Type> \| null` | `string[]`                              | `Required`                  | Changed                 | Required string array; nullish updates become []; entries normalize with String.       |
| `name`         | `string`                      | Same upstream type; undeclared in Frame | Unset in upstream reference | Forwarded               | Native submitted field name.                                                           |
| `otp`          | `boolean`                     | `boolean`                               | `false`                     | Declared                | Request one-time-code autocomplete; not code verification.                             |
| `placeholder`  | `string`                      | Same upstream type; undeclared in Frame | `""` (Reka)                 | Forwarded               | Empty-value presentation.                                                              |
| `required`     | `boolean`                     | Same upstream type; undeclared in Frame | Unset in upstream reference | Forwarded               | Native required-value constraint.                                                      |
| `type`         | `Type`                        | Same upstream type; undeclared in Frame | `"text" as any` (Reka)      | Forwarded               | Text or numeric PIN filtering.                                                         |

#### Emits

| Emit                | Reka payload                   | Frame payload         | Availability       | Behavior                                                                                                 |
| ------------------- | ------------------------------ | --------------------- | ------------------ | -------------------------------------------------------------------------------------------------------- |
| `complete`          | `[value: PinInputValue<Type>]` | Underlying Root value | Forwarded listener | Undeclared Root listener for filled cells, not code verification; payload is before Frame normalization. |
| `update:modelValue` | `[value: PinInputValue<Type>]` | string[]              | Declared / changed | Controlled-model update using the conversion described on modelValue above. Not a cancellable event.     |

#### Slots

| Upstream slot | Scoped field      | Frame availability                         |
| ------------- | ----------------- | ------------------------------------------ |
| default       | `modelValue: \`\` | Internal; payload not forwarded to callers |

#### Data attributes

| Attribute     | Value/presence                    | Meaning                                             |
| ------------- | --------------------------------- | --------------------------------------------------- |
| data-complete | Present when all cells are filled | Group completion, not successful code verification. |
| data-disabled | Present when disabled             | Root or individual cell state.                      |

#### Configuration notes

Root `complete` means its rendered cells are filled, not that the code is valid. Numeric-mode completion payloads may contain numbers even though Frame's declared model update is strings. Validate host data before submission.

PinInputInput's `index` is generated by Frame; `disabled` follows Root. Cell `as`/`asChild` are fixed internally. Passing an input attribute to Frame does not automatically apply it to every cell.

#### State notes

There is no checked/open `data-state`. Completion does not imply successful verification. OTP mode uses `autocomplete="one-time-code"`; mask changes native input type to password. Individual visible cells carry accessible names.

#### Input

Frame supplies this part in its anatomy. Availability below refers to configuration through the Frame wrapper, not direct use of a Reka export.

#### Props

| Prop       | Reka type            | Frame type                | Required/default            | Availability | Description                                                                                   |
| ---------- | -------------------- | ------------------------- | --------------------------- | ------------ | --------------------------------------------------------------------------------------------- |
| `as`       | `AsTag \| Component` | No independent Frame prop | `"input"` (Reka)            | Internal     | Rendered element/component. Not independently configurable through Frame.                     |
| `asChild`  | `boolean`            | No independent Frame prop | Unset in upstream reference | Internal     | Merge behavior into the supplied child element. Not independently configurable through Frame. |
| `disabled` | `boolean`            | No independent Frame prop | Unset in upstream reference | Internal     | Prevent interaction. Not independently configurable through Frame.                            |
| `index`    | `number`             | No independent Frame prop | `Required upstream` (Reka)  | Internal     | Generated from zero-based cell position.                                                      |

#### Emits

No component-defined emits on this part. Native listeners are separate from component emits.

#### Slots

| Upstream slot | Scoped field            | Frame availability                                           |
| ------------- | ----------------------- | ------------------------------------------------------------ |
| default       | No scoped fields listed | Frame supplies the internal composition; no public part slot |

#### Data attributes

| Attribute     | Value/presence                    | Meaning                                             |
| ------------- | --------------------------------- | --------------------------------------------------- |
| data-complete | Present when all cells are filled | Group completion, not successful code verification. |
| data-disabled | Present when disabled             | Root or individual cell state.                      |

#### Frame additions

#### Props

| Prop     | Type     | Required/default | Description                                                                           |
| -------- | -------- | ---------------- | ------------------------------------------------------------------------------------- |
| `length` | `number` | `6`              | Rendered cell count; supply a positive integer. No wrapper validation/reconciliation. |
| `label`  | `string` | `Unset`          | Root name and cell-label prefix; cell prefix defaults to Code.                        |

#### Slots

No additional public Frame slots.

#### Emits

No additional Frame-only emits. The controlled model event is documented on Root.

#### Exposed methods

No Frame-defined methods or internal Reka refs are exposed.

#### Sources and version

[FramePinField.vue](../../../packages/core/src/components/forms/FramePinField.vue) and [controls.scss](../../../packages/core/src/components/forms/styles/controls.scss) define the wrapper. Compared with the official [Reka PIN Input reference](https://reka-ui.com/docs/components/pin-input.md) and installed Reka `2.11.0`.

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="pin-input" -->

| CSS variable                       | Theme path                       | Default expression                                                                       | Purpose                                                                                  | Context                     |
| ---------------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | --------------------------- |
| `--frame-input-border`             | `frame.input.border`             | `1px solid     var(--frame-control-border)`                                              | Fallback for: Resting border of the text input.                                          | `.frame-pin-entry`          |
| `--frame-pin-entry-border`         | `frame.pin.entry.border`         | `var(     --frame-input-border,     1px solid     var(--frame-control-border)   )`       | Resting border of the pin-entry text surface.                                            | `.frame-pin-entry`          |
| `--frame-control-border`           | `frame.control.border`           | No declared default; supplied by context.                                                | Resting border color of form controls, independently overridable from menu borders.      | `.frame-pin-entry`          |
| `--frame-pin-entry-border-radius`  | `frame.pin.entry.border.radius`  | `var(     --frame-input-radius   )`                                                      | Corner radius of the pin-entry text surface.                                             | `.frame-pin-entry`          |
| `--frame-input-radius`             | `frame.input.radius`             | No declared default; supplied by context.                                                | Shared corner radius for text fields, text areas, selects, and composed input surfaces.  | `.frame-pin-entry`          |
| `--frame-input-hover-border`       | `frame.input.hover.border`       | `1px solid     var(--frame-control-border)`                                              | Fallback for: Border while the pointer hovers over the text input.                       | `.frame-pin-entry`          |
| `--frame-pin-entry-hover-border`   | `frame.pin.entry.hover.border`   | `var(     --frame-input-hover-border,     1px solid     var(--frame-control-border)   )` | Border while the pointer hovers of the pin-entry text surface.                           | `.frame-pin-entry`          |
| `--frame-input-hover-outline`      | `frame.input.hover.outline`      | `none`                                                                                   | Fallback for: Outline while the pointer hovers over the text input.                      | `.frame-pin-entry`          |
| `--frame-pin-entry-hover-outline`  | `frame.pin.entry.hover.outline`  | `var(     --frame-input-hover-outline,     none   )`                                     | Outline while the pointer hovers of the pin-entry text surface.                          | `.frame-pin-entry`          |
| `--frame-input-focus-border`       | `frame.input.focus.border`       | `1px solid var(--frame-accent)`                                                          | Fallback for: Border while focus is within the text input.                               | `.frame-pin-entry`          |
| `--frame-pin-entry-focus-border`   | `frame.pin.entry.focus.border`   | `var(     --frame-input-focus-border,     1px solid var(--frame-accent)   )`             | Border while focus is within the input of the pin-entry text surface.                    | `.frame-pin-entry`          |
| `--frame-accent`                   | `frame.accent`                   | No declared default; supplied by context.                                                | Shared interaction color for keyboard focus, active actions, and accent-filled controls. | `.frame-pin-entry`          |
| `--frame-input-focus-outline`      | `frame.input.focus.outline`      | `1px solid var(--frame-accent)`                                                          | Fallback for: Focus outline of the text input.                                           | `.frame-pin-entry`          |
| `--frame-pin-entry-focus-outline`  | `frame.pin.entry.focus.outline`  | `var(     --frame-input-focus-outline,     1px solid var(--frame-accent)   )`            | Outline while focus is within the input of the pin-entry text surface.                   | `.frame-pin-entry`          |
| `--frame-input-outline-offset`     | `frame.input.outline.offset`     | `0px`                                                                                    | Fallback for: Offset between the outline and the text input.                             | `.frame-pin-entry`          |
| `--frame-pin-entry-outline-offset` | `frame.pin.entry.outline.offset` | `var(     --frame-input-outline-offset,     0px   )`                                     | Offset between the outline and input of the pin-entry text surface.                      | `.frame-pin-entry`          |
| `--frame-gap`                      | `frame.gap`                      | `6px`                                                                                    | Space between children for .frame-form-inline-layout.                                    | `.frame-form-inline-layout` |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->

### Additional styling guidance

#### Parts and selectors

| Selector            | Part               | Placement/attribute target                                       |
| ------------------- | ------------------ | ---------------------------------------------------------------- |
| `.frame-pin-input`  | Root               | Caller class/style targets this element.                         |
| `.frame-form-input` | Input cell/textbox | Internal part; caller attributes do not target it independently. |

Cells are 2.5em wide and centered. Root classes do not replace individual cell classes.

#### Variables

| Token key                    | Variable                     | Value kind                     | Default/fallback                                                       | Part/effect                      | Scope/limits                                                                 | Description         |
| ---------------------------- | ---------------------------- | ------------------------------ | ---------------------------------------------------------------------- | -------------------------------- | ---------------------------------------------------------------------------- | ------------------- |
| `--frame-accent`             | `--frame-accent`             | color                          | Catalog: `#0078d4`; CSS fallback: `#0078d4`                            | Input cell/textbox outline       | Shared across controls using this variable. State rules: :focus-visible.     | Accent.             |
| `--frame-control-background` | `--frame-control-background` | color                          | Catalog: `#1d1d1d`; CSS fallback: `#1d1d1d`                            | Input cell/textbox background    | Shared across controls using this variable.                                  | Control background. |
| `--frame-control-border`     | `--frame-control-border`     | color                          | Catalog: `var(--frame-border-color)`; CSS fallback: `#3c4246`          | Input cell/textbox border-color  | Shared across controls using this variable.                                  | Control border.     |
| `--frame-control-padding-x`  | `--frame-control-padding-x`  | length                         | Catalog: `calc(var(--frame-spacing-unit) * 2.5)`; CSS fallback: `10px` | Input cell/textbox padding       | Shared across controls using this variable.                                  | Control padding x.  |
| `--frame-control-padding-y`  | `--frame-control-padding-y`  | length                         | Catalog: `calc(var(--frame-spacing-unit) * 1.25)`; CSS fallback: `5px` | Input cell/textbox padding       | Shared across controls using this variable.                                  | Control padding y.  |
| `--frame-control-text`       | `--frame-control-text`       | color                          | Catalog: `#d4d4d4`; CSS fallback: `#d4d4d4`                            | Input cell/textbox color         | Shared across controls using this variable.                                  | Control text.       |
| CSS only                     | `--frame-form-input-radius`  | length / CSS length expression | CSS fallback: `var(--frame-input-radius)`                              | Input cell/textbox border-radius | Shared across controls using this variable. CSS only; not in JSON allowlist. | Form input radius.  |
| `--frame-gap`                | `--frame-gap`                | length                         | Catalog: `calc(var(--frame-spacing-unit) * 1.5)`; CSS fallback: `6px`  | Root gap                         | Shared across controls using this variable.                                  | Gap.                |
| `--frame-input-radius`       | `--frame-input-radius`       | length                         | Catalog: `var(--frame-menu-border-radius)`                             | Input cell/textbox border-radius | Shared across controls using this variable.                                  | Input radius.       |

See [theme variables](../../styling/theme-variables.md) for theme authoring.
