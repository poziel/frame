# FrameRadioGroup

Choose one string value from a visible set of options. Use [Checkbox group](checkbox-group.md) for multiple selections or [Select](select.md) when choices should live in a popup.

## Features

### Anatomy

```text
FrameRadioGroup
└─ RadioGroupRoot (.frame-choice-group; role="radiogroup")
   ├─ RadioGroupItem (.frame-choice-item; button with role="radio")
   │  ├─ RadioGroupIndicator (.frame-radio-indicator)
   │  ├─ option label
   │  └─ optional detail text
   ├─ additional items, or separator divs
   └─ hidden native form input, when named in a form
```

Frame creates items from `options`; callers do not supply Root/Item/Indicator slots. The indicator participates in Reka presence when selected. Root attributes do not configure individual items.

### Basic usage

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { FrameRadioGroup, SelectOption } from '@frame/core';
import '@frame/core/style.css';

const visibility = ref('private');
const options = [
  new SelectOption({ value: 'private', label: 'Private', detail: 'Only you' }),
  new SelectOption({ value: 'team', label: 'Team' }),
  new SelectOption({ value: 'public', label: 'Public', disabled: true }),
];
</script>

<template>
  <FrameRadioGroup v-model="visibility" :options="options" label="Project visibility" />
</template>
```

`label` is an accessible group name, not a visible heading. Add your own visible heading or use an enclosing fieldset/legend when needed.

### Options and initial state

Use distinct string `value`s and human-readable `label`s. `detail` is displayed, `disabled` disables one item, and `SelectSeparator(id)` inserts a separator. `description` is accepted by the shared option type but is not rendered by this wrapper. Plain structurally compatible option objects are also accepted.

Initialize `modelValue` explicitly. A string matching no option leaves all options unchecked; there is no placeholder or automatic first selection. Choosing a selected radio does not clear the selection. Updating the options does not automatically repair a now-unmatched host value.

### Keyboard and accessibility

Tab enters the enabled radio group through its roving focus target. Space selects the focused item; arrow keys move focus and selection, respecting orientation/direction and looping. Home/End move focus to the endpoints; they are focus navigation rather than a separate Frame selection command. Enter activation is prevented. Disabled items are skipped.

Root has `role="radiogroup"`; items have `role="radio"` and `aria-checked`. Keep the group and option labels meaningful. This component does not add validation messages or persist a preference.

Short follow-up examples reuse the Basic usage setup unless they include their own script. Styles load once per application; these controls need no Frame instance.

### Configuration examples

These examples reuse Basic usage state. The APIs tab explains which attributes are forwarded to Reka rather than declared as Frame props.

```vue
<FrameRadioGroup
  v-model="visibility" :options="options" label="Project visibility"
  name="visibility" required orientation="vertical" :loop="false"
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
| `defaultValue` | `AcceptableValue` | Same upstream type; undeclared in Frame | Unset in upstream reference | Forwarded / ineffective | Frame supplies the controlled model; this does not establish uncontrolled Frame state. |
| `dir` | `"ltr" \| "rtl"` | Same upstream type; undeclared in Frame | Unset in upstream reference | Forwarded | Reading/navigation direction. |
| `disabled` | `boolean` | `boolean` | `false` | Declared | Prevent interaction. |
| `loop` | `boolean` | Same upstream type; undeclared in Frame | `true` (Reka) | Forwarded | Wrap keyboard navigation at endpoints. |
| `modelValue` | `AcceptableValue` | `string` | `Required` | Changed | Required string selection. |
| `name` | `string` | Same upstream type; undeclared in Frame | Unset in upstream reference | Forwarded | Native submitted field name. |
| `orientation` | `"vertical" \| "horizontal"` | Same upstream type; undeclared in Frame | Unset in upstream reference | Forwarded | Keyboard navigation orientation; does not set Frame flex layout. |
| `required` | `boolean` | Same upstream type; undeclared in Frame | `false` (Reka) | Forwarded | Native required-value constraint. |

#### Emits

| Emit | Reka payload | Frame payload | Availability | Behavior |
| --- | --- | --- | --- | --- |
| `update:modelValue` | `[payload: AcceptableValue]` | string | Declared / changed | Controlled-model update using the conversion described on modelValue above. Not a cancellable event. |

#### Slots

| Upstream slot | Scoped field | Frame availability |
| --- | --- | --- |
| default | `modelValue: null \| string \| number \| bigint \| Record<string, any>` | Internal; payload not forwarded to callers |

#### Data attributes

| Attribute | Value/presence | Meaning |
| --- | --- | --- |
| data-disabled | Present when disabled | Group state. |
| data-orientation | horizontal / vertical when configured | Roving-focus direction. |

#### Configuration notes

Orientation controls keyboard semantics; it does not change `.frame-choice-group`'s wrapping flex layout to a column. Set layout with CSS if you want a vertical visual list. Root's native helper submits the selected string; disabled groups are omitted. Item-specific `id`, `name`, `required`, `as`, and `asChild` are not available per option. Indicator `as`, `asChild`, and `forceMount` are fixed internally.

#### State notes

Use `aria-checked` or Item's `data-state` for selection. The default `.frame-choice-item[data-state='checked']` style highlights selected items. There is no popup/open state.

### Item

Frame supplies this part in its anatomy. Availability below refers to configuration through the Frame wrapper, not direct use of a Reka export.

#### Props

| Prop | Reka type | Frame type | Required/default | Availability | Description |
| --- | --- | --- | --- | --- | --- |
| `as` | `AsTag \| Component` | No independent Frame prop | `"button"` (Reka) | Internal | Rendered element/component. Not independently configurable through Frame. |
| `asChild` | `boolean` | No independent Frame prop | Unset in upstream reference | Internal | Merge behavior into the supplied child element. Not independently configurable through Frame. |
| `disabled` | `boolean` | No independent Frame prop | `false` (Reka) | Internal | Derived from group/option disabled state. |
| `id` | `string` | No independent Frame prop | Unset in upstream reference | Internal | Element or form-control identity. Not independently configurable through Frame. |
| `name` | `string` | No independent Frame prop | Unset in upstream reference | Internal | Native submitted field name. Not independently configurable through Frame. |
| `required` | `boolean` | No independent Frame prop | Unset in upstream reference | Internal | Native required-value constraint. Not independently configurable through Frame. |
| `value` | `AcceptableValue` | No independent Frame prop | Unset in upstream reference | Internal | Derived from option.value. |

#### Emits

| Emit | Reka payload | Frame payload | Availability | Behavior |
| --- | --- | --- | --- | --- |
| `select` | `[event: SelectEvent]` | Not exposed | Internal | Not emitted by the Frame wrapper and not routed from this internal part. |

#### Slots

| Upstream slot | Scoped field | Frame availability |
| --- | --- | --- |
| default | `checked: boolean` | Internal; payload not forwarded to callers |
| default | `required: boolean` | Internal; payload not forwarded to callers |
| default | `disabled: boolean` | Internal; payload not forwarded to callers |

#### Data attributes

| Attribute | Value/presence | Meaning |
| --- | --- | --- |
| data-state | checked / unchecked | Current checked/on state. |
| data-disabled | Present when disabled | Underlying disabled state. |
| data-orientation | When configured | Roving item orientation. |

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
| `options` | `readonly SelectItem[]` | `Required` | Generated radio choices and separators; labels/detail are rendered, descriptions are not. |
| `label` | `string` | `Unset` | Accessible group name, not a visible heading. |

#### Slots

No additional public Frame slots.

#### Emits

No additional Frame-only emits. The controlled model event is documented on Root.

#### Exposed methods

No Frame-defined methods or internal Reka refs are exposed.

### Sources and version

[FrameRadioGroup.vue](../../../packages/core/src/components/forms/FrameRadioGroup.vue) and [controls.css](../../../packages/core/src/components/forms/shared/controls.css) define the wrapper. Compared with the official [Reka Radio Group reference](https://reka-ui.com/docs/components/radio-group.md) and installed Reka `2.11.0`.

## Styling

### Parts and selectors

| Selector | Part | Placement/attribute target |
| --- | --- | --- |
| `.frame-choice-group` | Group container | Caller class/style targets this element. |
| `.frame-choice-item` | Radio item | Internal part; caller attributes do not target it independently. |
| `.frame-radio-indicator` | Indicator | Internal part; caller attributes do not target it independently. |
| `.frame-select-separator` | Separator | Internal part; caller attributes do not target it independently. |

The group wraps with flex layout. Keyboard orientation does not impose a CSS column. The indicator has no dedicated size tokens.

### Variables

| Token key | Variable | Value kind | Default/fallback | Part/effect | Scope/limits | Description |
| --- | --- | --- | --- | --- | --- | --- |
| `--frame-accent` | `--frame-accent` | color | Catalog: `#0078d4`; CSS fallback: `#0078d4` | Radio item outline; Radio item background | Shared across controls using this variable. State rules: :focus-visible, [data-state=on], [data-state=checked], [data-highlighted]. | Accent. |
| `--frame-control-padding-x` | `--frame-control-padding-x` | length | Catalog: `calc(var(--frame-spacing-unit) * 2.5)`; CSS fallback: `10px` | Radio item padding | Shared across controls using this variable. | Control padding x. |
| `--frame-control-padding-y` | `--frame-control-padding-y` | length | Catalog: `calc(var(--frame-spacing-unit) * 1.25)`; CSS fallback: `5px` | Radio item padding | Shared across controls using this variable. | Control padding y. |
| `--frame-control-radius` | `--frame-control-radius` | length | Catalog: `var(--frame-radius-medium)`; CSS fallback: `var(--frame-radius-medium)` | Radio item border-radius | Shared across controls using this variable. | Control radius. |
| `--frame-gap` | `--frame-gap` | length | Catalog: `calc(var(--frame-spacing-unit) * 1.5)`; CSS fallback: `6px` | Group container gap; Radio item gap | Shared across controls using this variable. | Gap. |
| `--frame-line` | `--frame-line` | color | Catalog: `#2b2b2b`; CSS fallback: `#3c4246`; `#454545` | Separator background; Radio item border | Shared across controls using this variable. | Line. |
| `--frame-muted` | `--frame-muted` | color | Catalog: `#8e9496`; CSS fallback: `#999` | Radio item color | Shared across controls using this variable. | Muted. |
| `--frame-radius-medium` | `--frame-radius-medium` | length | Catalog: `4px` | Radio item border-radius | Shared across controls using this variable. | Radius medium. |
| CSS only | `--frame-select-options-frame-select-separator-height` | length / CSS length expression | CSS fallback: `1px` | Separator height | Local to matching component rules. CSS only; not in JSON allowlist. | Select options frame select separator height. |
| CSS only | `--frame-select-options-frame-select-separator-margin` | length / CSS length expression | CSS fallback: `5px 0` | Separator margin | Local to matching component rules. CSS only; not in JSON allowlist. | Select options frame select separator margin. |
| CSS only | `--frame-select-options-frame-select-separator-min-height` | length / CSS length expression | CSS fallback: `1px` | Separator min-height | Local to matching component rules. CSS only; not in JSON allowlist. | Select options frame select separator min height. |
| CSS only | `--frame-select-options-frame-select-separator-padding` | CSS spacing | CSS fallback: `0` | Separator padding | Local to matching component rules. CSS only; not in JSON allowlist. | Select options frame select separator padding. |
| `--frame-surface` | `--frame-surface` | color | Catalog: `#181818`; CSS fallback: `#242424` | Radio item background | Shared across controls using this variable. | Surface. |
| `--frame-text` | `--frame-text` | color | Catalog: `#cccccc`; CSS fallback: `#ccc` | Radio item color | Shared across controls using this variable. | Text. |

See [theme variables](../../styling/theme-variables.md) for theme authoring.
