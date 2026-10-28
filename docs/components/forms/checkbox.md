# FrameCheckbox

A labeled boolean checkbox for an independent choice. Use several independent checkboxes for choices that can be combined. This wrapper models `true` or `false`; it does not expose a tri-state model.

## Features

### Anatomy

Frame supplies the composition rather than asking callers to assemble Reka primitives:

```text
FrameCheckbox
└─ Label (.frame-checkbox; native label)
   ├─ CheckboxRoot (.frame-check-control; button with role="checkbox")
   │  └─ CheckboxIndicator (span; checked mark)
   └─ span containing the default slot or label prop, when provided
```

The indicator contains a fixed check mark and is present when checked. Reka may retain it during a presence animation before removal. The default Frame slot customizes label content, not the indicator. The visible root, indicator, and form helper are different elements; attributes passed to Frame target the root, not all three.

### Basic usage

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { FrameCheckbox } from '@frame/core';
import '@frame/core/style.css';

const includeArchived = ref(false);
</script>

<template>
  <FrameCheckbox v-model="includeArchived" label="Include archived projects" />
</template>
```

### Custom label content

The default slot replaces the `label` text:

```vue
<FrameCheckbox v-model="includeArchived">
  Include <strong>archived projects</strong>
</FrameCheckbox>
```

Keep slot content descriptive. Do not nest a label or unrelated interactive controls inside the built-in label wrapper. `disabled` disables the checkbox without clearing the model.

### Native forms and attributes

Attributes such as `id`, `name`, `value`, `required`, and ARIA attributes are forwarded to Reka CheckboxRoot, not the outer label. Within a native form, Reka creates its hidden checkbox input for a named control. For example:

```vue
<FrameCheckbox
  v-model="includeArchived"
  name="includeArchived"
  value="yes"
  label="Include archived projects"
/>
```

Native checkbox submission uses the named checked value, not a serialized boolean pair. Unchecked and disabled checkboxes do not contribute a value. These are forwarded attributes; Frame's declared props remain the three listed below. Do not assume all upstream model options are supported by this boolean wrapper.

### Behavior and accessibility

The control uses Reka CheckboxRoot with checkbox semantics and `aria-checked`. Tab focuses the enabled checkbox; Space toggles it. Enter is prevented from activating it. Clicking its label also activates the checkbox through the label association.

Provide `label`, meaningful slot text, or an explicit `aria-label`. Connect extra help with `aria-describedby`. Validation, persistence, and any application action after changing the value belong to the host.

Short follow-up examples reuse the Basic usage setup unless they include their own script. Styles load once per application; these controls need no Frame instance.

### Related group

Use [FrameCheckboxGroup](checkbox-group.md) for a controlled array of selected strings. It generates its own roots and indicators; it is not a slot container for manual FrameCheckbox children.

### A boolean choice

Activate the text or press Space on the checkbox. The model switches between true and false.

<!-- frame:example id="checkbox.boolean" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameCheckbox } from '@frame/core';
const demoModelValue = ref(false);
</script>
<template>
<FrameCheckbox v-model="demoModelValue" :label="&quot;Accept terms and conditions&quot;" />
</template>
```

### Custom label content

Use the default slot to supply the label while retaining the checkbox interaction.

<!-- frame:example id="checkbox.label-content" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameCheckbox } from '@frame/core';
const demoModelValue = ref(true);
</script>
<template>
<FrameCheckbox v-model="demoModelValue">
  <template #default><span v-text="&quot;Include release notes in this export&quot;" /></template>
</FrameCheckbox>
</template>
```

## APIs

<!-- frame:generated api="checkbox" -->

### FrameCheckbox

Source: `packages/core/src/components/forms/FrameCheckbox.vue`

#### Properties

| Name               | Type                                                  | Default | Description                                                                        |
| ------------------ | ----------------------------------------------------- | ------- | ---------------------------------------------------------------------------------- |
| `tooltip`          | `string \| false \| undefined`                        | Omitted | Tooltip text; false disables it. When omitted, the native title attribute is used. |
| `tooltipPlacement` | `"top" \| "bottom" \| "left" \| "right" \| undefined` | Omitted | Preferred tooltip side; positioning falls back when space is limited.              |
| `modelValue`       | `boolean \| undefined`                                | false   | Controlled checked state; indeterminate values are not exposed by this wrapper.    |
| `disabled`         | `boolean \| undefined`                                | false   | Prevents user interaction with the control.                                        |
| `label`            | `string \| undefined`                                 | Omitted | Label content displayed beside the checkbox when the default slot is absent.       |

#### Events

| Name                | Parameters       | Return type | Description                                                 |
| ------------------- | ---------------- | ----------- | ----------------------------------------------------------- |
| `update:modelValue` | `value: boolean` | `void`      | Requests the new application-owned value after interaction. |

#### Slots

| Name      | Parameters | Return type  | Description                                           |
| --------- | ---------- | ------------ | ----------------------------------------------------- |
| `default` | `None`     | `VNodeChild` | Label content beside the checkbox; defaults to label. |
| `tooltip` | `None`     | `VNodeChild` | Custom tooltip content; replaces the tooltip text.    |

#### Exposed API

No declared entries.

<!-- /frame:generated -->

### Composition and upstream reference

The tables separate Reka types from the actual Frame contract. Declared APIs are typed by Frame; forwarded attributes reach only the named part; internal parts cannot be configured independently. Defaults labeled Reka belong to the underlying reference.

#### Root

Frame supplies this part in its anatomy. Availability below refers to configuration through the Frame wrapper, not direct use of a Reka export.

#### Props

| Prop           | Reka type                      | Frame type                              | Required/default            | Availability            | Description                                                                            |
| -------------- | ------------------------------ | --------------------------------------- | --------------------------- | ----------------------- | -------------------------------------------------------------------------------------- |
| `as`           | `AsTag \| Component`           | Same upstream type; undeclared in Frame | `button` (Reka)             | Forwarded / limited     | Changes Root composition, not individual children; can break Frame fixed anatomy.      |
| `asChild`      | `boolean`                      | Same upstream type; undeclared in Frame | Unset in upstream reference | Forwarded / limited     | Changes Root composition, not individual children; can break Frame fixed anatomy.      |
| `defaultValue` | `T \| "indeterminate"`         | Same upstream type; undeclared in Frame | Unset in upstream reference | Forwarded / ineffective | Frame supplies the controlled model; this does not establish uncontrolled Frame state. |
| `disabled`     | `boolean`                      | `boolean`                               | `false`                     | Declared                | Prevent interaction.                                                                   |
| `falseValue`   | `T`                            | Same upstream type; undeclared in Frame | `false` (Reka)              | Forwarded / unsupported | Custom values cannot preserve the Frame boolean model contract.                        |
| `id`           | `string`                       | Same upstream type; undeclared in Frame | Unset in upstream reference | Forwarded               | Element or form-control identity.                                                      |
| `modelValue`   | `null \| T \| "indeterminate"` | `boolean`                               | `false`                     | Changed                 | Boolean only; updates use value === true.                                              |
| `name`         | `string`                       | Same upstream type; undeclared in Frame | Unset in upstream reference | Forwarded               | Native submitted field name.                                                           |
| `required`     | `boolean`                      | Same upstream type; undeclared in Frame | Unset in upstream reference | Forwarded               | Native required-value constraint.                                                      |
| `trueValue`    | `T`                            | Same upstream type; undeclared in Frame | `true` (Reka)               | Forwarded / unsupported | Custom values cannot preserve the Frame boolean model contract.                        |
| `value`        | `AcceptableValue`              | Same upstream type; undeclared in Frame | `"on"` (Reka)               | Forwarded               | Option identity or submitted checked value.                                            |

#### Emits

| Emit                | Reka payload                    | Frame payload | Availability       | Behavior                                                                                             |
| ------------------- | ------------------------------- | ------------- | ------------------ | ---------------------------------------------------------------------------------------------------- |
| `update:modelValue` | `[value: T \| "indeterminate"]` | boolean       | Declared / changed | Controlled-model update using the conversion described on modelValue above. Not a cancellable event. |

#### Slots

| Upstream slot | Scoped field                              | Frame availability                         |
| ------------- | ----------------------------------------- | ------------------------------------------ |
| default       | `modelValue: T \| "indeterminate"`        | Internal; payload not forwarded to callers |
| default       | `state: false \| true \| "indeterminate"` | Internal; payload not forwarded to callers |

#### Data attributes

| Attribute     | Value/presence        | Meaning                    |
| ------------- | --------------------- | -------------------------- |
| data-state    | checked / unchecked   | Current checked/on state.  |
| data-disabled | Present when disabled | Underlying disabled state. |

#### State notes

These attributes belong to the rendered Reka elements, not the outer label:

Reka itself also supports `'indeterminate'`; Frame's boolean contract cannot request that state. Root exposes `role="checkbox"`, boolean `aria-checked`, and required/disabled semantics. Do not style the outer label as if it carried Root's data attributes.

#### Indicator

Frame supplies this part in its anatomy. Availability below refers to configuration through the Frame wrapper, not direct use of a Reka export.

#### Props

| Prop         | Reka type            | Frame type                | Required/default            | Availability | Description                                                                                         |
| ------------ | -------------------- | ------------------------- | --------------------------- | ------------ | --------------------------------------------------------------------------------------------------- |
| `as`         | `AsTag \| Component` | No independent Frame prop | `"span"` (Reka)             | Internal     | Rendered element/component. Not independently configurable through Frame.                           |
| `asChild`    | `boolean`            | No independent Frame prop | Unset in upstream reference | Internal     | Merge behavior into the supplied child element. Not independently configurable through Frame.       |
| `forceMount` | `boolean`            | No independent Frame prop | Unset in upstream reference | Internal     | Keep the part mounted for presence/animation control. Not independently configurable through Frame. |

#### Emits

No component-defined emits on this part. Native listeners are separate from component emits.

#### Slots

| Upstream slot | Scoped field            | Frame availability                                           |
| ------------- | ----------------------- | ------------------------------------------------------------ |
| default       | No scoped fields listed | Frame supplies the internal composition; no public part slot |

#### Data attributes

| Attribute     | Value/presence                      | Meaning                                                             |
| ------------- | ----------------------------------- | ------------------------------------------------------------------- |
| data-state    | checked / unchecked during presence | Reflects owner state while mounted, including presence transitions. |
| data-disabled | Present when disabled               | Underlying disabled state.                                          |

#### Label

Frame supplies this part in its anatomy. Availability below refers to configuration through the Frame wrapper, not direct use of a Reka export.

#### Props

| Prop      | Reka type            | Frame type                | Required/default            | Availability | Description                                                                                   |
| --------- | -------------------- | ------------------------- | --------------------------- | ------------ | --------------------------------------------------------------------------------------------- |
| `as`      | `AsTag \| Component` | No independent Frame prop | `"label"` (Reka)            | Internal     | Rendered element/component. Not independently configurable through Frame.                     |
| `asChild` | `boolean`            | No independent Frame prop | Unset in upstream reference | Internal     | Merge behavior into the supplied child element. Not independently configurable through Frame. |
| `for`     | `string`             | No independent Frame prop | Unset in upstream reference | Internal     | Associated control ID. Not independently configurable through Frame.                          |

#### Emits

No component-defined emits on this part. Native listeners are separate from component emits.

#### Slots

| Upstream slot | Scoped field            | Frame availability                                           |
| ------------- | ----------------------- | ------------------------------------------------------------ |
| default       | No scoped fields listed | Frame supplies the internal composition; no public part slot |

#### Data attributes

| Attribute | Value/presence             | Meaning                                                           |
| --------- | -------------------------- | ----------------------------------------------------------------- |
| —         | None supplied by this part | Label/text/separator parts do not add checked/open state markers. |

#### Frame additions

#### Props

| Prop    | Type     | Required/default | Description                                      |
| ------- | -------- | ---------------- | ------------------------------------------------ |
| `label` | `string` | `Unset`          | Inline label text; replaced by the default slot. |

#### Slots

| Slot    | Payload | Fallback   | Placement                                                                                |
| ------- | ------- | ---------- | ---------------------------------------------------------------------------------------- |
| default | None    | label prop | Beside the interactive Root, inside the outer Label; does not customize Indicator/Thumb. |

#### Emits

No additional Frame-only emits. The controlled model event is documented on Root.

#### Exposed methods

No Frame-defined methods or internal Reka refs are exposed.

#### Sources and version

[FrameCheckbox.vue](../../../packages/core/src/components/forms/FrameCheckbox.vue) composes Reka CheckboxRoot, CheckboxIndicator, and Label. Styles come from [controls.scss](../../../packages/core/src/components/forms/styles/controls.scss) and [styles/index.scss](../../../packages/core/src/styles/index.scss).

Compared with the [Reka Checkbox reference](https://reka-ui.com/docs/components/checkbox.md) and installed Reka `2.11.0` source. See the [coverage review](../../reference/reka-coverage.md) for the audit scope and differences.

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="checkbox" -->

| CSS variable                                        | Theme path                                        | Default expression                        | Purpose                                                                                  | Context                                                                 |
| --------------------------------------------------- | ------------------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `--frame-text`                                      | `frame.text`                                      | `#ccc`                                    | Foreground for .frame-control-surface.                                                   | `.frame-control-surface`                                                |
| `--frame-surface`                                   | `frame.surface`                                   | `#242424`                                 | Background for .frame-control-surface.                                                   | `.frame-control-surface`                                                |
| `--frame-line`                                      | `frame.line`                                      | `#454545`                                 | Border for .frame-control-surface.                                                       | `.frame-control-surface`                                                |
| `--frame-control-radius`                            | `frame.control.radius`                            | `var(--frame-radius-medium)`              | Corner radius for .frame-control-surface.                                                | `.frame-control-surface`                                                |
| `--frame-control-padding-y`                         | `frame.control.padding.y`                         | `5px`                                     | Internal spacing for .frame-control-surface.                                             | `.frame-control-surface`                                                |
| `--frame-control-padding-x`                         | `frame.control.padding.x`                         | `10px`                                    | Internal spacing for .frame-control-surface.                                             | `.frame-control-surface`                                                |
| `--frame-radius-medium`                             | `frame.radius.medium`                             | No declared default; supplied by context. | Medium shared corner radius used by ordinary controls.                                   | `.frame-control-surface`                                                |
| `--frame-accent`                                    | `frame.accent`                                    | `#0078d4`                                 | Elevation shadow for .frame-control-focus:focus-visible.                                 | `.frame-control-focus:focus-visible`                                    |
| `--frame-accent`                                    | `frame.accent`                                    | `#0078d4`                                 | Elevation shadow for .frame-check-control[data-state='checked'].                         | `.frame-check-control[data-state=checked]`                              |
| `--frame-accent-foreground`                         | `frame.accent.foreground`                         | `#fff`                                    | Foreground for .frame-check-control[data-state='checked'].                               | `.frame-check-control[data-state=checked]`                              |
| `--frame-control-background`                        | `frame.control.background`                        | `var(--frame-surface)`                    | Background for .settings-field-row :deep(.frame-check-control).                          | `.settings-field-row :deep(.frame-check-control)`                       |
| `--frame-control-border`                            | `frame.control.border`                            | No declared default; supplied by context. | Resting border color of form controls, independently overridable from menu borders.      | `.settings-field-row :deep(.frame-check-control)`                       |
| `--frame-surface`                                   | `frame.surface`                                   | `#181818`                                 | Neutral raised surface behind grouped content and control compositions.                  | `.settings-field-row :deep(.frame-check-control)`                       |
| `--frame-accent`                                    | `frame.accent`                                    | No declared default; supplied by context. | Shared interaction color for keyboard focus, active actions, and accent-filled controls. | `.settings-field-row :deep(.frame-check-control[data-state='checked'])` |
| `--frame-accent-foreground`                         | `frame.accent.foreground`                         | No declared default; supplied by context. | Readable text and icon foreground on accent-filled surfaces.                             | `.settings-field-row :deep(.frame-check-control[data-state='checked'])` |
| `--frame-checkbox-gap`                              | `frame.checkbox.gap`                              | `8px`                                     | Space between children for .frame-checkbox.                                              | `.frame-checkbox`                                                       |
| `--frame-checkbox-line-height`                      | `frame.checkbox.line.height`                      | `18px`                                    | Text line height for .frame-checkbox.                                                    | `.frame-checkbox`                                                       |
| `--frame-checkbox-input-width`                      | `frame.checkbox.input.width`                      | `18px`                                    | Width for .frame-checkbox input[type='checkbox'].                                        | `.frame-checkbox input[type=checkbox]`                                  |
| `--frame-checkbox-input-height`                     | `frame.checkbox.input.height`                     | `18px`                                    | Height for .frame-checkbox input[type='checkbox'].                                       | `.frame-checkbox input[type=checkbox]`                                  |
| `--frame-checkbox-input-margin`                     | `frame.checkbox.input.margin`                     | `0`                                       | Outer spacing for .frame-checkbox input[type='checkbox'].                                | `.frame-checkbox input[type=checkbox]`                                  |
| `--frame-checkbox-input-border`                     | `frame.checkbox.input.border`                     | `1px solid #6b6b6b`                       | Border for .frame-checkbox input[type='checkbox'].                                       | `.frame-checkbox input[type=checkbox]`                                  |
| `--frame-checkbox-input-border-radius`              | `frame.checkbox.input.border.radius`              | `var(     --frame-radius-medium   )`      | Corner radius for .frame-checkbox input[type='checkbox'].                                | `.frame-checkbox input[type=checkbox]`                                  |
| `--frame-checkbox-input-background`                 | `frame.checkbox.input.background`                 | `#242424`                                 | Background for .frame-checkbox input[type='checkbox'].                                   | `.frame-checkbox input[type=checkbox]`                                  |
| `--frame-radius-medium`                             | `frame.radius.medium`                             | No declared default; supplied by context. | Medium shared corner radius used by ordinary controls.                                   | `.frame-checkbox input[type=checkbox]`                                  |
| `--frame-checkbox-input-checked-after-width`        | `frame.checkbox.input.checked.after.width`        | `5px`                                     | Width for .frame-checkbox input:checked::after.                                          | `.frame-checkbox input:checked::after`                                  |
| `--frame-checkbox-input-checked-after-height`       | `frame.checkbox.input.checked.after.height`       | `10px`                                    | Height for .frame-checkbox input:checked::after.                                         | `.frame-checkbox input:checked::after`                                  |
| `--frame-checkbox-input-checked-after-border`       | `frame.checkbox.input.checked.after.border`       | `solid #d4d4d4`                           | Border for .frame-checkbox input:checked::after.                                         | `.frame-checkbox input:checked::after`                                  |
| `--frame-checkbox-input-checked-after-border-width` | `frame.checkbox.input.checked.after.border.width` | `0 1.5px     1.5px 0`                     | Border width for .frame-checkbox input:checked::after.                                   | `.frame-checkbox input:checked::after`                                  |
| `--frame-checkbox-has-input-disabled-opacity`       | `frame.checkbox.has.input.disabled.opacity`       | `0.45`                                    | Opacity for .frame-checkbox:has(input:disabled).                                         | `.frame-checkbox:has(input:disabled)`                                   |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->

### Additional styling guidance

#### Parts and selectors

| Selector               | Part            | Placement/attribute target                                             |
| ---------------------- | --------------- | ---------------------------------------------------------------------- |
| `.frame-checkbox`      | Outer label     | Outer label; caller class/style goes to the interactive child instead. |
| `.frame-check-control` | Checkbox button | Caller class/style targets this element.                               |

The visible checkbox is 18 by 18 pixels. Native-input legacy variables do not resize its Reka button.

#### Variables

| Token key | Variable                       | Value kind                     | Default/fallback     | Part/effect             | Scope/limits                                                        | Description           |
| --------- | ------------------------------ | ------------------------------ | -------------------- | ----------------------- | ------------------------------------------------------------------- | --------------------- |
| CSS only  | `--frame-checkbox-gap`         | length / CSS length expression | CSS fallback: `8px`  | Outer label gap         | Local to matching component rules. CSS only; not in JSON allowlist. | Checkbox gap.         |
| CSS only  | `--frame-checkbox-line-height` | lineHeight                     | CSS fallback: `18px` | Outer label line-height | Local to matching component rules. CSS only; not in JSON allowlist. | Checkbox line height. |

See [theme variables](../../styling/theme-variables.md) for theme authoring.
