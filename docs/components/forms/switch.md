# FrameSwitch

A labeled on/off control for a boolean setting. Use it when the UI should present an enabled/disabled state. Whether a change applies immediately or waits for Save is a host decision.

## Features

### Anatomy

```text
FrameSwitch
└─ Label (.frame-form-inline; native label)
   ├─ SwitchRoot (.frame-switch; button with role="switch")
   │  └─ SwitchThumb (.frame-switch-thumb; span)
   └─ default slot or label prop
```

Frame creates the thumb and changes its presentation through checked state. The public default slot appears next to the control; it does not replace the thumb. There are no named root/thumb slots.

### Basic usage

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { FrameSwitch } from '@frame/core';
import '@frame/core/style.css';

const autosave = ref(true);
</script>

<template>
  <FrameSwitch v-model="autosave" label="Autosave" />
</template>
```

### Custom text and disabled state

The default slot replaces `label`. It does not receive the model; read your own ref:

```vue
<FrameSwitch v-model="autosave" :disabled="true">
  Autosave is managed by your administrator
</FrameSwitch>
```

Disabling the switch preserves its value. The component does not save a preference or call a backend; use the model/update event in your application.

### Behavior and accessibility

The interactive element has switch semantics and `aria-checked`. Tab focuses it; Space and Enter toggle it. Label activation toggles it too. Give it a meaningful `label` or slot text; if no visible label is used, provide an accessible name through `aria-label`.

The thumb position reflects checked state. The control does not use a text input or provide a third state. For an ordinary independent selection rather than an on/off presentation, see [FrameCheckbox](checkbox.md).

Short follow-up examples reuse the Basic usage setup unless they include their own script. Styles load once per application; these controls need no Frame instance.

## APIs

The tables separate Reka types from the actual Frame contract. Declared APIs are typed by Frame; forwarded attributes reach only the named part; internal parts cannot be configured independently. Defaults labeled Reka belong to the underlying reference.

### Root

Frame supplies this part in its anatomy. Availability below refers to configuration through the Frame wrapper, not direct use of a Reka export.

#### Props

| Prop | Reka type | Frame type | Required/default | Availability | Description |
| --- | --- | --- | --- | --- | --- |
| `as` | `AsTag \| Component` | Same upstream type; undeclared in Frame | `button` (Reka) | Forwarded / limited | Changes Root composition, not individual children; can break Frame fixed anatomy. |
| `asChild` | `boolean` | Same upstream type; undeclared in Frame | Unset in upstream reference | Forwarded / limited | Changes Root composition, not individual children; can break Frame fixed anatomy. |
| `defaultValue` | `T` | Same upstream type; undeclared in Frame | Unset in upstream reference | Forwarded / ineffective | Frame supplies the controlled model; this does not establish uncontrolled Frame state. |
| `disabled` | `boolean` | `boolean` | `false` | Declared | Prevent interaction. |
| `falseValue` | `T` | Same upstream type; undeclared in Frame | `false` (Reka) | Forwarded / unsupported | Custom values cannot preserve the Frame boolean model contract. |
| `id` | `string` | Same upstream type; undeclared in Frame | Unset in upstream reference | Forwarded | Element or form-control identity. |
| `modelValue` | `null \| T` | `boolean` | `false` | Changed | Boolean public type; custom forwarded values are not normalized. |
| `name` | `string` | Same upstream type; undeclared in Frame | Unset in upstream reference | Forwarded | Native submitted field name. |
| `required` | `boolean` | Same upstream type; undeclared in Frame | Unset in upstream reference | Forwarded | Native required-value constraint. |
| `trueValue` | `T` | Same upstream type; undeclared in Frame | `true` (Reka) | Forwarded / unsupported | Custom values cannot preserve the Frame boolean model contract. |
| `value` | `string` | Same upstream type; undeclared in Frame | `"on"` (Reka) | Forwarded | Option identity or submitted checked value. |

#### Emits

| Emit | Reka payload | Frame payload | Availability | Behavior |
| --- | --- | --- | --- | --- |
| `update:modelValue` | `[payload: T]` | boolean | Declared / changed | Controlled-model update using the conversion described on modelValue above. Not a cancellable event. |

#### Slots

| Upstream slot | Scoped field | Frame availability |
| --- | --- | --- |
| default | `modelValue: T` | Internal; payload not forwarded to callers |
| default | `checked: boolean` | Internal; payload not forwarded to callers |

#### Data attributes

| Attribute | Value/presence | Meaning |
| --- | --- | --- |
| data-state | checked / unchecked | Current checked/on state. |
| data-disabled | Present when disabled | Underlying disabled state. |

#### Configuration notes

Extra attributes and listeners go to Reka SwitchRoot, rather than the outer label. For example, pass `id`, `aria-describedby`, or a native form `name` and checked `value`. In a native form, Reka supplies a hidden checkbox input for a named switch. Checked values are submitted; unchecked or disabled controls are omitted. This form value is separate from the boolean Vue model.

##### Reka Root API mapping

This table covers all Root props in the fetched Reka reference. Root's scoped slot has `modelValue` and `checked`; Frame does not forward either as slot props. The public label slot and boolean update event are documented above.

Reka Thumb accepts `as` (default `'span'`) and `asChild`. Frame fixes its thumb composition and does not route caller attributes or slots into it. There are no thumb-specific events, props, or methods in Frame's wrapper API.

#### State notes

The outer label does not carry these attributes. Root has `role="switch"` and `aria-checked`; required state is exposed through the underlying control. Use state selectors on the appropriate part:

### Thumb

Frame supplies this part in its anatomy. Availability below refers to configuration through the Frame wrapper, not direct use of a Reka export.

#### Props

| Prop | Reka type | Frame type | Required/default | Availability | Description |
| --- | --- | --- | --- | --- | --- |
| `as` | `AsTag \| Component` | No independent Frame prop | `"span"` (Reka) | Internal | Rendered element/component. Not independently configurable through Frame. |
| `asChild` | `boolean` | No independent Frame prop | Unset in upstream reference | Internal | Merge behavior into the supplied child element. Not independently configurable through Frame. |

#### Emits

No component-defined emits on this part. Native listeners are separate from component emits.

#### Slots

| Upstream slot | Scoped field | Frame availability |
| --- | --- | --- |
| default | No scoped fields listed | Frame supplies the internal composition; no public part slot |

#### Data attributes

| Attribute | Value/presence | Meaning |
| --- | --- | --- |
| data-state | checked / unchecked | Current checked/on state. |
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

[FrameSwitch.vue](../../../packages/core/src/components/FrameSwitch.vue) composes Reka SwitchRoot, SwitchThumb, and Label. Styling lives in [controls.css](../../../packages/core/src/forms/controls.css).

Compared with the [Reka Switch reference](https://reka-ui.com/docs/components/switch.md) and installed Reka `2.11.0` source. See the [coverage review](../../reference/reka-coverage.md).

## Styling

### Parts and selectors

| Selector | Part | Placement/attribute target |
| --- | --- | --- |
| `.frame-form-inline` | Label/container | Outer label; caller class/style goes to the interactive child instead. |
| `.frame-switch` | Switch button | Caller class/style targets this element. |
| `.frame-switch-thumb` | Thumb | Internal part; caller attributes do not target it independently. |

Track/thumb dimensions are fixed in the shared rule. State belongs to the root/thumb, not the outer label.

### Variables

| Token key | Variable | Value kind | Default/fallback | Part/effect | Scope/limits | Description |
| --- | --- | --- | --- | --- | --- | --- |
| `--frame-accent` | `--frame-accent` | color | Catalog: `#0078d4`; CSS fallback: `#0078d4` | Switch button outline; Switch button background | Shared across controls using this variable. State rules: :focus-visible, [data-state=checked]. | Accent. |
| `--frame-duration` | `--frame-duration` | duration | Catalog: `150ms`; CSS fallback: `150ms` | Thumb transition | Shared across controls using this variable. | Duration. |
| `--frame-ease` | `--frame-ease` | ease | Catalog: `ease-out`; CSS fallback: `ease-out` | Thumb transition | Shared across controls using this variable. | Ease. |
| `--frame-gap` | `--frame-gap` | length | Catalog: `calc(var(--frame-spacing-unit) * 1.5)`; CSS fallback: `6px` | Label/container gap | Shared across controls using this variable. | Gap. |
| `--frame-line` | `--frame-line` | color | Catalog: `#2b2b2b`; CSS fallback: `#454545` | Switch button border | Shared across controls using this variable. | Line. |
| `--frame-surface` | `--frame-surface` | color | Catalog: `#181818`; CSS fallback: `#242424` | Switch button background | Shared across controls using this variable. | Surface. |
| `--frame-text` | `--frame-text` | color | Catalog: `#cccccc`; CSS fallback: `#ccc` | Thumb background | Shared across controls using this variable. | Text. |

See [theme variables](../../styling/theme-variables.md) for theme authoring.
