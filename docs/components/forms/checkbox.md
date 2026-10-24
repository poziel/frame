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

## APIs

The tables separate Reka types from the actual Frame contract. Declared APIs are typed by Frame; forwarded attributes reach only the named part; internal parts cannot be configured independently. Defaults labeled Reka belong to the underlying reference.

### Root

Frame supplies this part in its anatomy. Availability below refers to configuration through the Frame wrapper, not direct use of a Reka export.

#### Props

| Prop | Reka type | Frame type | Required/default | Availability | Description |
| --- | --- | --- | --- | --- | --- |
| `as` | `AsTag \| Component` | Same upstream type; undeclared in Frame | `button` (Reka) | Forwarded / limited | Changes Root composition, not individual children; can break Frame fixed anatomy. |
| `asChild` | `boolean` | Same upstream type; undeclared in Frame | Unset in upstream reference | Forwarded / limited | Changes Root composition, not individual children; can break Frame fixed anatomy. |
| `defaultValue` | `T \| "indeterminate"` | Same upstream type; undeclared in Frame | Unset in upstream reference | Forwarded / ineffective | Frame supplies the controlled model; this does not establish uncontrolled Frame state. |
| `disabled` | `boolean` | `boolean` | `false` | Declared | Prevent interaction. |
| `falseValue` | `T` | Same upstream type; undeclared in Frame | `false` (Reka) | Forwarded / unsupported | Custom values cannot preserve the Frame boolean model contract. |
| `id` | `string` | Same upstream type; undeclared in Frame | Unset in upstream reference | Forwarded | Element or form-control identity. |
| `modelValue` | `null \| T \| "indeterminate"` | `boolean` | `false` | Changed | Boolean only; updates use value === true. |
| `name` | `string` | Same upstream type; undeclared in Frame | Unset in upstream reference | Forwarded | Native submitted field name. |
| `required` | `boolean` | Same upstream type; undeclared in Frame | Unset in upstream reference | Forwarded | Native required-value constraint. |
| `trueValue` | `T` | Same upstream type; undeclared in Frame | `true` (Reka) | Forwarded / unsupported | Custom values cannot preserve the Frame boolean model contract. |
| `value` | `AcceptableValue` | Same upstream type; undeclared in Frame | `"on"` (Reka) | Forwarded | Option identity or submitted checked value. |

#### Emits

| Emit | Reka payload | Frame payload | Availability | Behavior |
| --- | --- | --- | --- | --- |
| `update:modelValue` | `[value: T \| "indeterminate"]` | boolean | Declared / changed | Controlled-model update using the conversion described on modelValue above. Not a cancellable event. |

#### Slots

| Upstream slot | Scoped field | Frame availability |
| --- | --- | --- |
| default | `modelValue: T \| "indeterminate"` | Internal; payload not forwarded to callers |
| default | `state: false \| true \| "indeterminate"` | Internal; payload not forwarded to callers |

#### Data attributes

| Attribute | Value/presence | Meaning |
| --- | --- | --- |
| data-state | checked / unchecked | Current checked/on state. |
| data-disabled | Present when disabled | Underlying disabled state. |

#### State notes

These attributes belong to the rendered Reka elements, not the outer label:

Reka itself also supports `'indeterminate'`; Frame's boolean contract cannot request that state. Root exposes `role="checkbox"`, boolean `aria-checked`, and required/disabled semantics. Do not style the outer label as if it carried Root's data attributes.

### Indicator

Frame supplies this part in its anatomy. Availability below refers to configuration through the Frame wrapper, not direct use of a Reka export.

#### Props

| Prop | Reka type | Frame type | Required/default | Availability | Description |
| --- | --- | --- | --- | --- | --- |
| `as` | `AsTag \| Component` | No independent Frame prop | `"span"` (Reka) | Internal | Rendered element/component. Not independently configurable through Frame. |
| `asChild` | `boolean` | No independent Frame prop | Unset in upstream reference | Internal | Merge behavior into the supplied child element. Not independently configurable through Frame. |
| `forceMount` | `boolean` | No independent Frame prop | Unset in upstream reference | Internal | Keep the part mounted for presence/animation control. Not independently configurable through Frame. |

#### Emits

No component-defined emits on this part. Native listeners are separate from component emits.

#### Slots

| Upstream slot | Scoped field | Frame availability |
| --- | --- | --- |
| default | No scoped fields listed | Frame supplies the internal composition; no public part slot |

#### Data attributes

| Attribute | Value/presence | Meaning |
| --- | --- | --- |
| data-state | checked / unchecked during presence | Reflects owner state while mounted, including presence transitions. |
| data-disabled | Present when disabled | Underlying disabled state. |

### Label

Frame supplies this part in its anatomy. Availability below refers to configuration through the Frame wrapper, not direct use of a Reka export.

#### Props

| Prop | Reka type | Frame type | Required/default | Availability | Description |
| --- | --- | --- | --- | --- | --- |
| `as` | `AsTag \| Component` | No independent Frame prop | `"label"` (Reka) | Internal | Rendered element/component. Not independently configurable through Frame. |
| `asChild` | `boolean` | No independent Frame prop | Unset in upstream reference | Internal | Merge behavior into the supplied child element. Not independently configurable through Frame. |
| `for` | `string` | No independent Frame prop | Unset in upstream reference | Internal | Associated control ID. Not independently configurable through Frame. |

#### Emits

No component-defined emits on this part. Native listeners are separate from component emits.

#### Slots

| Upstream slot | Scoped field | Frame availability |
| --- | --- | --- |
| default | No scoped fields listed | Frame supplies the internal composition; no public part slot |

#### Data attributes

| Attribute | Value/presence | Meaning |
| --- | --- | --- |
| — | None supplied by this part | Label/text/separator parts do not add checked/open state markers. |

### Frame additions

#### Props

| Prop | Type | Required/default | Description |
| --- | --- | --- | --- |
| `label` | `string` | `Unset` | Inline label text; replaced by the default slot. |

#### Slots

| Slot | Payload | Fallback | Placement |
| --- | --- | --- | --- |
| default | None | label prop | Beside the interactive Root, inside the outer Label; does not customize Indicator/Thumb. |

#### Emits

No additional Frame-only emits. The controlled model event is documented on Root.

#### Exposed methods

No Frame-defined methods or internal Reka refs are exposed.

### Sources and version

[FrameCheckbox.vue](../../../packages/core/src/components/FrameCheckbox.vue) composes Reka CheckboxRoot, CheckboxIndicator, and Label. Styles come from [controls.css](../../../packages/core/src/forms/controls.css) and [style.css](../../../packages/core/src/style.css).

Compared with the [Reka Checkbox reference](https://reka-ui.com/docs/components/checkbox.md) and installed Reka `2.11.0` source. See the [coverage review](../../reference/reka-coverage.md) for the audit scope and differences.

## Styling

### Parts and selectors

| Selector | Part | Placement/attribute target |
| --- | --- | --- |
| `.frame-checkbox` | Outer label | Outer label; caller class/style goes to the interactive child instead. |
| `.frame-check-control` | Checkbox button | Caller class/style targets this element. |

The visible checkbox is 18 by 18 pixels. Native-input legacy variables do not resize its Reka button.

### Variables

| Token key | Variable | Value kind | Default/fallback | Part/effect | Scope/limits | Description |
| --- | --- | --- | --- | --- | --- | --- |
| CSS only | `--frame-checkbox-gap` | length / CSS length expression | CSS fallback: `8px` | Outer label gap | Local to matching component rules. CSS only; not in JSON allowlist. | Checkbox gap. |
| CSS only | `--frame-checkbox-line-height` | lineHeight | CSS fallback: `18px` | Outer label line-height | Local to matching component rules. CSS only; not in JSON allowlist. | Checkbox line height. |

See [theme variables](../../styling/theme-variables.md) for theme authoring.
