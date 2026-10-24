# FrameCheckboxGroup

Select multiple string values from a list. It owns the composition of the group and each checkbox; use [FrameCheckbox](checkbox.md) for one independent boolean.

## Features

### Anatomy

```text
FrameCheckboxGroup
└─ CheckboxGroupRoot (.frame-choice-group; roving-focus container by default)
   ├─ Label (.frame-form-inline)
   │  ├─ CheckboxRoot (.frame-check-control; role="checkbox")
   │  │  └─ CheckboxIndicator (fixed check mark)
   │  └─ option label
   ├─ additional labels, or separator divs
   └─ aggregate native form helpers, when named in a form
```

This is not a slot-based container for manually placed FrameCheckbox children. Generated items and indicators cannot be replaced through public slots.

### Basic usage

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { FrameCheckboxGroup, SelectOption } from '@frame/core';
import '@frame/core/style.css';

const channels = ref<string[]>(['email']);
const options = [
  new SelectOption({ value: 'email', label: 'Email' }),
  new SelectOption({ value: 'desktop', label: 'Desktop' }),
  new SelectOption({ value: 'sms', label: 'SMS', disabled: true }),
];
</script>

<template>
  <FrameCheckboxGroup
    v-model="channels" :options="options"
    role="group" label="Notification channels"
  />
</template>
```

The explicit `role="group"` is forwarded to the container. The underlying Group Root does not supply a group role itself; `label` supplies `aria-label`, not a visible heading. An outer fieldset/legend is another way to provide semantic grouping.

### Options and selection

Each option needs a unique string `value` and a `label`. `disabled` prevents its interaction. Shared `detail` and `description` fields are not rendered here. `SelectSeparator(id)` inserts a separator div. Keep the host array consistent with available options; option changes do not automatically remove unknown selected values.

Choosing an item adds/removes its value in the array. This is array membership, not a boolean or indeterminate model. Generic object values and per-item true/false mappings are not part of the Frame contract.

### Native forms

With `name="channels"`, the installed Reka helper serializes selected strings under indexed field names such as `channels[0]` and `channels[1]`, rather than a comma-separated string. An empty required group uses a validation helper. There are no per-option form-name props in Frame.

In installed Reka `2.11.0`, this group's aggregate helper is not bound to the group's `disabled` value. Do not rely on disabling interaction to omit group values from FormData; the host submission policy must handle that distinction. Frame does not alter this upstream behavior or provide its own error messages.

### Keyboard and accessibility

With roving focus enabled, Tab enters the group and arrows move among its controls according to orientation/direction. Space toggles the focused checkbox; Enter does not toggle it. Navigation does not select a checkbox automatically. Disabled controls are skipped; maximum-limited choices stay discoverable through focus. Each checkbox exposes `role="checkbox"` and `aria-checked`.

Short follow-up examples reuse the Basic usage setup unless they include their own script. Styles load once per application; these controls need no Frame instance.

### Configuration examples

These examples reuse Basic usage state. The APIs tab explains which attributes are forwarded to Reka rather than declared as Frame props.

```vue
<FrameCheckboxGroup
  v-model="channels" :options="options" role="group"
  label="Choose up to two channels" :max="2" orientation="vertical"
/>
```

## APIs

The tables separate Reka types from the actual Frame contract. Declared APIs are typed by Frame; forwarded attributes reach only the named part; internal parts cannot be configured independently. Defaults labeled Reka belong to the underlying reference.

### Root

Frame supplies this part in its anatomy. Availability below refers to configuration through the Frame wrapper, not direct use of a Reka export.

#### Props

| Prop | Reka type | Frame type | Required/default | Availability | Description |
| --- | --- | --- | --- | --- | --- |
| `as` | `AsTag \| Component` | Same upstream type; undeclared in Frame | `"div"` (Reka) | Forwarded / limited | Changes Root composition, not individual children; can break Frame fixed anatomy. |
| `asChild` | `boolean` | Same upstream type; undeclared in Frame | Unset in upstream reference | Forwarded / limited | Changes Root composition, not individual children; can break Frame fixed anatomy. |
| `defaultValue` | `T[]` | Same upstream type; undeclared in Frame | Unset in upstream reference | Forwarded / ineffective | Frame supplies the controlled model; this does not establish uncontrolled Frame state. |
| `dir` | `"ltr" \| "rtl"` | Same upstream type; undeclared in Frame | Unset in upstream reference | Forwarded | Reading/navigation direction. |
| `disabled` | `boolean` | `boolean` | `false` | Declared | Prevent interaction. |
| `loop` | `boolean` | Same upstream type; undeclared in Frame | Unset in upstream reference | Forwarded | Wrap keyboard navigation at endpoints. |
| `max` | `number \| null` | Same upstream type; undeclared in Frame | Unset in upstream reference | Forwarded | Maximum user selection count. Unchecked max-limited choices remain focusable; host arrays are not sanitized. |
| `modelValue` | `T[]` | `string[]` | `Required` | Changed | Required string array; updates normalize every value with String. |
| `name` | `string` | Same upstream type; undeclared in Frame | Unset in upstream reference | Forwarded | Native submitted field name. |
| `orientation` | `"vertical" \| "horizontal"` | Same upstream type; undeclared in Frame | Unset in upstream reference | Forwarded | Keyboard navigation orientation; does not set Frame flex layout. |
| `required` | `boolean` | Same upstream type; undeclared in Frame | Unset in upstream reference | Forwarded | Native required-value constraint. |
| `rovingFocus` | `boolean` | Same upstream type; undeclared in Frame | `true` (Reka) | Forwarded | Coordinate keyboard focus across the group. |

#### Emits

| Emit | Reka payload | Frame payload | Availability | Behavior |
| --- | --- | --- | --- | --- |
| `update:modelValue` | `[value: T[]]` | string[] | Declared / changed | Controlled-model update using the conversion described on modelValue above. Not a cancellable event. |

#### Slots

| Upstream slot | Scoped field | Frame availability |
| --- | --- | --- |
| default | No scoped fields listed | Frame supplies the internal composition; no public part slot |

#### Data attributes

| Attribute | Value/presence | Meaning |
| --- | --- | --- |
| data-orientation | horizontal / vertical when configured | Roving-focus container only; Group Root adds no checked data-state or group data-disabled. |

#### Configuration notes

At `max`, unchecked choices become `aria-disabled="true"` but remain focusable. Their Root `data-disabled` is reserved for native disabled state. The limit does not sanitize arrays assigned by the host. Explain the limit in visible text as well as enforcing it.

Orientation affects keyboard navigation, not the flex layout's visual direction. `rovingFocus: false` removes arrow-key group navigation; the individual controls remain keyboard operable.

#### State notes

Group Root itself does not add a checked `data-state` or a group `data-disabled` marker. For state styling, target the actual checkbox. Indicator remains an internal span with a fixed check mark; `forceMount`, alternate tags, and root scoped-slot payloads are not exposed per option.

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

### Checkbox Root

Frame supplies this part in its anatomy. Availability below refers to configuration through the Frame wrapper, not direct use of a Reka export.

#### Props

| Prop | Reka type | Frame type | Required/default | Availability | Description |
| --- | --- | --- | --- | --- | --- |
| `as` | `AsTag \| Component` | No independent Frame prop | `"button"` (Reka) | Internal | Rendered element/component. Not independently configurable through Frame. |
| `asChild` | `boolean` | No independent Frame prop | Unset in upstream reference | Internal | Merge behavior into the supplied child element. Not independently configurable through Frame. |
| `defaultValue` | `T \| "indeterminate"` | No independent Frame prop | Unset in upstream reference | Internal | Uncontrolled initial state upstream; Frame supplies its own controlled value. Not independently configurable through Frame. |
| `disabled` | `boolean` | No independent Frame prop | Unset in upstream reference | Internal | Derived from option data and group state. |
| `falseValue` | `T` | No independent Frame prop | `false` (Reka) | Internal | Value representing unchecked/off. Not independently configurable through Frame. |
| `id` | `string` | No independent Frame prop | Unset in upstream reference | Internal | Element or form-control identity. Not independently configurable through Frame. |
| `modelValue` | `null \| T \| "indeterminate"` | No independent Frame prop | Unset in upstream reference | Internal | Controlled state/value. Not independently configurable through Frame. |
| `name` | `string` | No independent Frame prop | Unset in upstream reference | Internal | Native submitted field name. Not independently configurable through Frame. |
| `required` | `boolean` | No independent Frame prop | Unset in upstream reference | Internal | Native required-value constraint. Not independently configurable through Frame. |
| `trueValue` | `T` | No independent Frame prop | `true` (Reka) | Internal | Value representing checked/on. Not independently configurable through Frame. |
| `value` | `AcceptableValue` | No independent Frame prop | `"on"` (Reka) | Internal | Derived from option data and group state. |

#### Emits

| Emit | Reka payload | Frame payload | Availability | Behavior |
| --- | --- | --- | --- | --- |
| `update:modelValue` | `[value: T \| "indeterminate"]` | Not exposed | Internal | Not emitted by the Frame wrapper and not routed from this internal part. |

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
| data-orientation | When roving focus is configured | Roving item orientation. |
| aria-disabled | true for disabled or max-limited choices | ARIA attribute, not data-*; maximum-limited unchecked choices remain focusable. |

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

### Frame additions

#### Props

| Prop | Type | Required/default | Description |
| --- | --- | --- | --- |
| `options` | `readonly SelectItem[]` | `Required` | Generated checkbox choices and separators; detail/description are not rendered. |
| `label` | `string` | `Unset` | Container accessible name; use group semantics or a fieldset as appropriate. |

#### Slots

No additional public Frame slots.

#### Emits

No additional Frame-only emits. The controlled model event is documented on Root.

#### Exposed methods

No Frame-defined methods or internal Reka refs are exposed.

### Sources and version

[FrameCheckboxGroup.vue](../../../packages/core/src/components/FrameCheckboxGroup.vue) and [controls.css](../../../packages/core/src/forms/controls.css) define the wrapper. Compared with [Reka Checkbox](https://reka-ui.com/docs/components/checkbox.md), especially Group Root, and installed Reka `2.11.0`.

## Styling

### Parts and selectors

| Selector | Part | Placement/attribute target |
| --- | --- | --- |
| `.frame-choice-group` | Group container | Caller class/style targets this element. |
| `.frame-form-inline` | Label/container | Internal part; caller attributes do not target it independently. |
| `.frame-check-control` | Checkbox button | Internal part; caller attributes do not target it independently. |
| `.frame-select-separator` | Separator | Internal part; caller attributes do not target it independently. |

Checkboxes are 18 by 18 pixels. Use aria-disabled for maximum-limited choices; data-disabled represents native disabled state.

### Variables

| Token key | Variable | Value kind | Default/fallback | Part/effect | Scope/limits | Description |
| --- | --- | --- | --- | --- | --- | --- |
| `--frame-accent` | `--frame-accent` | color | Catalog: `#0078d4`; CSS fallback: `#0078d4` | Checkbox button outline | Shared across controls using this variable. State rules: :focus-visible. | Accent. |
| `--frame-control-padding-x` | `--frame-control-padding-x` | length | Catalog: `calc(var(--frame-spacing-unit) * 2.5)`; CSS fallback: `10px` | Checkbox button padding | Shared across controls using this variable. | Control padding x. |
| `--frame-control-padding-y` | `--frame-control-padding-y` | length | Catalog: `calc(var(--frame-spacing-unit) * 1.25)`; CSS fallback: `5px` | Checkbox button padding | Shared across controls using this variable. | Control padding y. |
| `--frame-control-radius` | `--frame-control-radius` | length | Catalog: `var(--frame-radius-medium)`; CSS fallback: `var(--frame-radius-medium)` | Checkbox button border-radius | Shared across controls using this variable. | Control radius. |
| `--frame-gap` | `--frame-gap` | length | Catalog: `calc(var(--frame-spacing-unit) * 1.5)`; CSS fallback: `6px` | Label/container gap; Group container gap | Shared across controls using this variable. | Gap. |
| `--frame-line` | `--frame-line` | color | Catalog: `#2b2b2b`; CSS fallback: `#3c4246`; `#454545` | Separator background; Checkbox button border | Shared across controls using this variable. | Line. |
| `--frame-radius-medium` | `--frame-radius-medium` | length | Catalog: `4px` | Checkbox button border-radius | Shared across controls using this variable. | Radius medium. |
| CSS only | `--frame-select-options-frame-select-separator-height` | length / CSS length expression | CSS fallback: `1px` | Separator height | Local to matching component rules. CSS only; not in JSON allowlist. | Select options frame select separator height. |
| CSS only | `--frame-select-options-frame-select-separator-margin` | length / CSS length expression | CSS fallback: `5px 0` | Separator margin | Local to matching component rules. CSS only; not in JSON allowlist. | Select options frame select separator margin. |
| CSS only | `--frame-select-options-frame-select-separator-min-height` | length / CSS length expression | CSS fallback: `1px` | Separator min-height | Local to matching component rules. CSS only; not in JSON allowlist. | Select options frame select separator min height. |
| CSS only | `--frame-select-options-frame-select-separator-padding` | CSS spacing | CSS fallback: `0` | Separator padding | Local to matching component rules. CSS only; not in JSON allowlist. | Select options frame select separator padding. |
| `--frame-surface` | `--frame-surface` | color | Catalog: `#181818`; CSS fallback: `#242424` | Checkbox button background | Shared across controls using this variable. | Surface. |
| `--frame-text` | `--frame-text` | color | Catalog: `#cccccc`; CSS fallback: `#ccc` | Checkbox button color | Shared across controls using this variable. | Text. |

See [theme variables](../../styling/theme-variables.md) for theme authoring.
