# FrameSelect

Select one string value from a fixed list. The trigger shows the selected option's label; the popup supports keyboard navigation, disabled options, separators, and descriptions. This is not a searchable text input or a multiple-selection control.

## Features

### Anatomy

```text
FrameSelect
├─ SelectRoot (state provider; no wrapper element)
│  ├─ SelectTrigger (button.frame-select; role="combobox")
│  │  ├─ span containing Frame's selected label or fixed fallback
│  │  └─ FrameIcon (chevron-down)
│  └─ SelectPortal (Frame overlay target)
│     ├─ SelectContent (asChild, position="popper")
│     │  └─ div.frame-select-content
│     │     ├─ SelectViewport (.frame-select-options)
│     │     │  ├─ SelectItem → SelectItemText + optional detail/default annotation
│     │     │  └─ SelectSeparator, when supplied in options
│     │     └─ shared description area, when descriptions exist
│     └─ Frame OverlayScrollbars, while open with a popup element
├─ hidden input for name/form submission, when name is supplied
└─ visually hidden validation input, when required
```

Frame does not use Reka SelectValue or SelectIcon; it renders its own text and icon. It does not compose SelectGroup, SelectLabel, SelectItemIndicator, SelectArrow, or SelectScrollUpButton/SelectScrollDownButton. Separators partition the list visually but do not create named groups. These are internal parts, not separately configurable Frame components or slots.

### Basic usage

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { FrameLabel, FrameSelect, SelectOption } from '@frame/core';
import '@frame/core/style.css';

const visibility = ref('private');
const options = [
  new SelectOption({ value: 'private', label: 'Private' }),
  new SelectOption({ value: 'team', label: 'Team' }),
];
</script>

<template>
  <div>
    <FrameLabel for="visibility">Visibility</FrameLabel>
    <FrameSelect
      id="visibility"
      v-model="visibility"
      :options="options"
      label="Visibility"
    />
  </div>
</template>
```

`label` sets the trigger's accessible name; it does not render a visible field label. Use [FrameLabel](label.md) or your own visible label as appropriate.

### Options and separators

`SelectOption` and `SelectSeparator` are public runtime classes. Options can also be structurally compatible objects. Use distinct string option values and stable separator IDs.

```ts
import { SelectOption, SelectSeparator } from '@frame/core';

const options = [
  new SelectOption({ value: '', label: 'No visibility selected' }),
  new SelectSeparator('visibility-divider'),
  new SelectOption({
    value: 'private', label: 'Private',
    description: 'Only you can access this project.',
    detail: 'Personal',
  }),
  new SelectOption({
    value: 'team', label: 'Team', disabled: true,
    description: 'Requires a team workspace.',
  }),
];
```

| Option field | Meaning |
| --- | --- |
| `value` | Required string stored in the model |
| `label` | Required trigger/option text and typeahead text |
| `description` | Optional text in the popup's shared description area |
| `detail` | Optional secondary text alongside the option |
| `disabled` | Prevent selection |

A separator accepts its `id` in the constructor and is not selectable. Descriptions update as options receive focus or pointer movement; opening starts with the selected description. A description area is reserved when any option has a description.

### Empty values and initial selection

Initialize the model yourself. An empty string can be a real option value. If the model matches no option, the trigger displays the fixed text `Select…`; there is no declared placeholder prop.

`defaultValue="private"` adds a `default` annotation to that option in the popup. It does **not** initialize the model, replace a missing value, or reset selection.

### Native form submission

```vue
<FrameSelect
  v-model="visibility"
  :options="options"
  name="visibility"
  label="Visibility"
  required
/>
```

`name` creates a hidden input containing the raw string model. `form` can associate the helper inputs with a named native form. `required` adds a visually hidden validation input; an empty model remains invalid even when it matches an empty-string option. Invalid validation redirects focus to the trigger. Disabled helper inputs do not participate in submission/validation. These helpers do not add application error messages or validate domain permissions.

### Keyboard and popup behavior

Tab reaches the trigger. Space, Enter, and Arrow Up/Down open the list. Arrow keys navigate options, Home/End reach the ends, and typing searches by option label. Enter or Space selects; Escape dismisses and restores focus. Disabled options and separators cannot be selected.

The popup is teleported. In a Frame shell it uses that shell's overlay target and bounds; standalone use falls back to viewport placement. A boundary change closes an open popup. Rendering the control does not require a Frame instance.

While the popup is open, Reka keeps focus within its selection interaction and prevents Tab from navigating through its options. Use selection or Escape to finish. Typeahead is label matching, not an editable search field; Space during an active typeahead search participates in that search rather than necessarily selecting.

Short follow-up examples reuse the Basic usage setup unless they include their own script. Styles load once per application; these controls need no Frame instance.

## APIs

The tables separate Reka types from the actual Frame contract. Declared APIs are typed by Frame; forwarded attributes reach only the named part; internal parts cannot be configured independently. Defaults labeled Reka belong to the underlying reference.

### Root

Frame supplies this part in its anatomy. Availability below refers to configuration through the Frame wrapper, not direct use of a Reka export.

#### Props

| Prop | Reka type | Frame type | Required/default | Availability | Description |
| --- | --- | --- | --- | --- | --- |
| `autocomplete` | `string` | No independent Frame prop | Unset in upstream reference | Internal / absent | Not routed to Root; caller attributes target Trigger. Popup state is internal; generic/multiple model options are unsupported. |
| `by` | `string \| ((a: T, b: T) => boolean)` | No independent Frame prop | Unset in upstream reference | Internal / absent | Not routed to Root; caller attributes target Trigger. Popup state is internal; generic/multiple model options are unsupported. |
| `defaultOpen` | `boolean` | No independent Frame prop | Unset in upstream reference | Internal / absent | Not routed to Root; caller attributes target Trigger. Popup state is internal; generic/multiple model options are unsupported. |
| `defaultValue` | `T \| T[]` | `string` | `Unset` | Changed | Marks an option as default; does not initialize/reset selection. |
| `dir` | `"ltr" \| "rtl"` | No independent Frame prop | Unset in upstream reference | Internal / absent | Not routed to Root; caller attributes target Trigger. Popup state is internal; generic/multiple model options are unsupported. |
| `disabled` | `boolean` | `boolean` | `false` | Declared | Prevent interaction. |
| `modelValue` | `T \| T[]` | `string` | `Required` | Changed | Required single string; internal values are encoded. |
| `multiple` | `boolean` | No independent Frame prop | Unset in upstream reference | Internal / absent | Not routed to Root; caller attributes target Trigger. Popup state is internal; generic/multiple model options are unsupported. |
| `name` | `string` | `string` | `Unset` | Changed | Frame supplies a raw-value hidden input; Reka Root uses an empty name. |
| `nullableValue` | `string` | No independent Frame prop | `""` (Reka) | Internal / absent | Not routed to Root; caller attributes target Trigger. Popup state is internal; generic/multiple model options are unsupported. |
| `open` | `boolean` | No independent Frame prop | Unset in upstream reference | Internal / absent | Not routed to Root; caller attributes target Trigger. Popup state is internal; generic/multiple model options are unsupported. |
| `required` | `boolean` | `boolean` | `false` | Declared | Native required-value constraint. |

#### Emits

| Emit | Reka payload | Frame payload | Availability | Behavior |
| --- | --- | --- | --- | --- |
| `update:modelValue` | `[value: T]` | string | Declared / changed | Controlled-model update using the conversion described on modelValue above. Not a cancellable event. |
| `update:open` | `[value: boolean]` | Not exposed | Internal | Not emitted by the Frame wrapper and not routed from this internal part. |

#### Slots

| Upstream slot | Scoped field | Frame availability |
| --- | --- | --- |
| default | `modelValue: T \| T[] \| undefined` | Internal; payload not forwarded to callers |
| default | `open: boolean` | Internal; payload not forwarded to callers |

#### Data attributes

| Attribute | Value/presence | Meaning |
| --- | --- | --- |
| — | No DOM wrapper | State provider; attributes live on rendered parts. |

#### Wrapper boundaries

This accounts for every Root prop/event/slot field in the fetched Reka reference. Passing upstream Root options through `v-bind` does not configure the internal Root.

Reka Trigger's `as`, `asChild`, and `reference` can be reached through untyped trigger attribute forwarding, but are not declared Frame props. Replacing its composition can interfere with Frame's built-in text/icon. Trigger `disabled` is driven by Frame's Root state.

Reka's Content positioning, collision, presence, scroll-lock, and dismissal options are internally composed, not caller props. Frame sets `position="popper"`, uses its overlay target as collision boundary, and sets collision padding to 8 pixels. `side`, `align`, `forceMount`, or `to` passed to FrameSelect do not configure Content or Portal. Reka Content's `closeAutoFocus`, `escapeKeyDown`, and `pointerDownOutside` events are not emitted by FrameSelect.

Per-option `value`, `disabled`, and typeahead text are derived from the option definition. Reka Item's cancellable `select` event and scoped `selected` payload are not exposed. ItemText composition is fixed. Value's `selectedLabel`/`modelValue` slot payloads and custom indicator/arrow/group slots are not part of this wrapper.

For the complete per-part upstream API inventory, including all Content options, see the [coverage review](../../reference/reka-coverage.md#select-parts-and-api-inventory). The linked Reka reference remains the source for upstream types/defaults; the table there records whether Frame exposes each surface.

#### State notes

Selection and highlight are different states. Item also exposes `role="option"`, `aria-selected`, and disabled semantics. Trigger exposes `aria-expanded` and an open-popup `aria-controls`; Content uses `role="listbox"`. Separators are hidden from the accessibility tree.

Reka Trigger normally supports `data-placeholder`, but Frame encodes every string as a nonempty internal value. That attribute does not reliably identify Frame's unmatched-value fallback text, including an empty-string model. Do not use it as Frame's empty-state styling hook.

### Trigger

Frame supplies this part in its anatomy. Availability below refers to configuration through the Frame wrapper, not direct use of a Reka export.

#### Props

| Prop | Reka type | Frame type | Required/default | Availability | Description |
| --- | --- | --- | --- | --- | --- |
| `as` | `AsTag \| Component` | Same upstream type; undeclared in Frame | `"button"` (Reka) | Forwarded / limited | Caller attributes target Trigger; composition/reference changes are not declared Frame props. |
| `asChild` | `boolean` | Same upstream type; undeclared in Frame | Unset in upstream reference | Forwarded / limited | Caller attributes target Trigger; composition/reference changes are not declared Frame props. |
| `disabled` | `boolean` | No independent Frame prop | Unset in upstream reference | Internal | Derived from Root disabled state. |
| `reference` | `ReferenceElement` | Same upstream type; undeclared in Frame | Unset in upstream reference | Forwarded / limited | Caller attributes target Trigger; composition/reference changes are not declared Frame props. |

#### Emits

No component-defined emits on this part. Native listeners are separate from component emits.

#### Slots

| Upstream slot | Scoped field | Frame availability |
| --- | --- | --- |
| default | No scoped fields listed | Frame supplies the internal composition; no public part slot |

#### Data attributes

| Attribute | Value/presence | Meaning |
| --- | --- | --- |
| data-state | open / closed | Popup visibility. |
| data-disabled | Present when disabled | Trigger availability. |
| data-placeholder | Not a reliable Frame empty-state hook | Frame encodes empty strings as nonempty internal values; unmatched fallback text is separate. |

### Portal

Frame supplies this part in its anatomy. Availability below refers to configuration through the Frame wrapper, not direct use of a Reka export.

#### Props

| Prop | Reka type | Frame type | Required/default | Availability | Description |
| --- | --- | --- | --- | --- | --- |
| `defer` | `boolean` | No independent Frame prop | Unset in upstream reference | Internal | Defer teleport target resolution. Not independently configurable through Frame. |
| `disabled` | `boolean` | No independent Frame prop | Unset in upstream reference | Internal | Prevent interaction. Not independently configurable through Frame. |
| `forceMount` | `boolean` | No independent Frame prop | Unset in upstream reference | Internal | Keep the part mounted for presence/animation control. Not independently configurable through Frame. |
| `to` | `string \| HTMLElement` | No independent Frame prop | Unset in upstream reference | Internal | Derived from Frame overlay target. |

#### Emits

No component-defined emits on this part. Native listeners are separate from component emits.

#### Slots

| Upstream slot | Scoped field | Frame availability |
| --- | --- | --- |
| default | No scoped fields listed | Frame supplies the internal composition; no public part slot |

#### Data attributes

| Attribute | Value/presence | Meaning |
| --- | --- | --- |
| — | No DOM wrapper | Teleport boundary, not a stateful element. |

### Content

Frame supplies this part in its anatomy. Availability below refers to configuration through the Frame wrapper, not direct use of a Reka export.

#### Props

| Prop | Reka type | Frame type | Required/default | Availability | Description |
| --- | --- | --- | --- | --- | --- |
| `align` | `"start" \| "center" \| "end"` | No independent Frame prop | Unset in upstream reference | Internal | Preferred popup alignment. Not independently configurable through Frame. |
| `alignFlip` | `boolean` | No independent Frame prop | Unset in upstream reference | Internal | Allow alignment flipping on collision. Not independently configurable through Frame. |
| `alignOffset` | `number` | No independent Frame prop | Unset in upstream reference | Internal | Alignment offset in pixels. Not independently configurable through Frame. |
| `arrowPadding` | `number` | No independent Frame prop | Unset in upstream reference | Internal | Arrow inset. Not independently configurable through Frame. |
| `as` | `AsTag \| Component` | No independent Frame prop | `"div"` (Reka) | Internal | Rendered element/component. Not independently configurable through Frame. |
| `asChild` | `boolean` | No independent Frame prop | `true` (Frame internal composition) | Internal | Enabled around Frame popup div. |
| `avoidCollisions` | `boolean` | No independent Frame prop | Unset in upstream reference | Internal | Avoid boundary collisions. Not independently configurable through Frame. |
| `bodyLock` | `boolean` | No independent Frame prop | Unset in upstream reference | Internal | Lock body scrolling while open. Not independently configurable through Frame. |
| `collisionBoundary` | `Element \| (Element \| null)[] \| null` | No independent Frame prop | Unset in upstream reference | Internal | Derived from Frame overlay target. |
| `collisionPadding` | `number \| Partial<Record<"top" \| "right" \| "bottom" \| "left", number>>` | No independent Frame prop | Unset in upstream reference | Internal | Fixed at 8 pixels. |
| `dir` | `"ltr" \| "rtl"` | No independent Frame prop | Unset in upstream reference | Internal | Reading/navigation direction. Not independently configurable through Frame. |
| `disableOutsidePointerEvents` | `boolean` | No independent Frame prop | Unset in upstream reference | Internal | Block pointer interaction outside the open layer. Not independently configurable through Frame. |
| `disableUpdateOnLayoutShift` | `boolean` | No independent Frame prop | Unset in upstream reference | Internal | Skip layout-shift position updates. Not independently configurable through Frame. |
| `forceMount` | `boolean` | No independent Frame prop | Unset in upstream reference | Internal | Keep the part mounted for presence/animation control. Not independently configurable through Frame. |
| `hideShiftedArrow` | `boolean` | No independent Frame prop | Unset in upstream reference | Internal | Hide an off-center arrow. Not independently configurable through Frame. |
| `hideWhenDetached` | `boolean` | No independent Frame prop | Unset in upstream reference | Internal | Hide when reference is occluded. Not independently configurable through Frame. |
| `loop` | `boolean` | No independent Frame prop | Unset in upstream reference | Internal | Wrap keyboard navigation at endpoints. Not independently configurable through Frame. |
| `memoDependencies` | `unknown[]` | No independent Frame prop | Unset in upstream reference | Internal | Dependencies for content memoization. Not independently configurable through Frame. |
| `position` | `"popper" \| "item-aligned"` | No independent Frame prop | Unset in upstream reference | Internal | Fixed to popper mode. |
| `positionStrategy` | `"fixed" \| "absolute"` | No independent Frame prop | Unset in upstream reference | Internal | Fixed/absolute positioning strategy. Not independently configurable through Frame. |
| `prioritizePosition` | `boolean` | No independent Frame prop | Unset in upstream reference | Internal | Prioritize positioning even if it overlaps the reference. Not independently configurable through Frame. |
| `reference` | `ReferenceElement` | No independent Frame prop | Unset in upstream reference | Internal | Positioning reference element. Not independently configurable through Frame. |
| `side` | `"top" \| "right" \| "bottom" \| "left"` | No independent Frame prop | Unset in upstream reference | Internal | Preferred popup side. Not independently configurable through Frame. |
| `sideFlip` | `boolean` | No independent Frame prop | Unset in upstream reference | Internal | Allow opposite-side placement. Not independently configurable through Frame. |
| `sideOffset` | `number` | No independent Frame prop | Unset in upstream reference | Internal | Distance from reference. Not independently configurable through Frame. |
| `sticky` | `"partial" \| "always"` | No independent Frame prop | Unset in upstream reference | Internal | Alignment-axis stickiness. Not independently configurable through Frame. |
| `updatePositionStrategy` | `"always" \| "optimized"` | No independent Frame prop | Unset in upstream reference | Internal | Position update frequency. Not independently configurable through Frame. |

#### Emits

| Emit | Reka payload | Frame payload | Availability | Behavior |
| --- | --- | --- | --- | --- |
| `closeAutoFocus` | `[event: Event]` | Not exposed | Internal | Not emitted by the Frame wrapper and not routed from this internal part. |
| `escapeKeyDown` | `[event: KeyboardEvent]` | Not exposed | Internal | Not emitted by the Frame wrapper and not routed from this internal part. |
| `pointerDownOutside` | `[event: PointerDownOutsideEvent]` | Not exposed | Internal | Not emitted by the Frame wrapper and not routed from this internal part. |

#### Slots

| Upstream slot | Scoped field | Frame availability |
| --- | --- | --- |
| default | No scoped fields listed | Frame supplies the internal composition; no public part slot |

#### Data attributes

| Attribute | Value/presence | Meaning |
| --- | --- | --- |
| data-state | open / closed during presence | Popup lifecycle. |
| data-side | top / right / bottom / left | Resolved placement. |
| data-align | start / center / end | Resolved alignment. |

Runtime geometry variables are `--reka-select-trigger-width`, `--reka-select-trigger-height`, `--reka-select-content-available-width`, `--reka-select-content-available-height`, and `--reka-select-content-transform-origin`. They are positioning outputs, not Frame JSON settings.

### Viewport

Frame supplies this part in its anatomy. Availability below refers to configuration through the Frame wrapper, not direct use of a Reka export.

#### Props

| Prop | Reka type | Frame type | Required/default | Availability | Description |
| --- | --- | --- | --- | --- | --- |
| `as` | `AsTag \| Component` | No independent Frame prop | `"div"` (Reka) | Internal | Rendered element/component. Not independently configurable through Frame. |
| `asChild` | `boolean` | No independent Frame prop | Unset in upstream reference | Internal | Merge behavior into the supplied child element. Not independently configurable through Frame. |
| `nonce` | `string` | No independent Frame prop | Unset in upstream reference | Internal | Nonce for the viewport style element. Not independently configurable through Frame. |

#### Emits

No component-defined emits on this part. Native listeners are separate from component emits.

#### Slots

| Upstream slot | Scoped field | Frame availability |
| --- | --- | --- |
| default | No scoped fields listed | Frame supplies the internal composition; no public part slot |

#### Data attributes

| Attribute | Value/presence | Meaning |
| --- | --- | --- |
| data-reka-select-viewport | Present | Scroll viewport marker. |

### Item

Frame supplies this part in its anatomy. Availability below refers to configuration through the Frame wrapper, not direct use of a Reka export.

#### Props

| Prop | Reka type | Frame type | Required/default | Availability | Description |
| --- | --- | --- | --- | --- | --- |
| `as` | `AsTag \| Component` | No independent Frame prop | `"div"` (Reka) | Internal | Rendered element/component. Not independently configurable through Frame. |
| `asChild` | `boolean` | No independent Frame prop | Unset in upstream reference | Internal | Merge behavior into the supplied child element. Not independently configurable through Frame. |
| `disabled` | `boolean` | No independent Frame prop | Unset in upstream reference | Internal | Derived from group/option disabled state. |
| `textValue` | `string` | No independent Frame prop | Unset in upstream reference | Internal | Derived from option.label. |
| `value` | `AcceptableValue` | No independent Frame prop | `Required upstream` (Reka) | Internal | Derived from option.value. |

#### Emits

| Emit | Reka payload | Frame payload | Availability | Behavior |
| --- | --- | --- | --- | --- |
| `select` | `[event: SelectEvent<T>]` | Not exposed | Internal | Not emitted by the Frame wrapper and not routed from this internal part. |

#### Slots

| Upstream slot | Scoped field | Frame availability |
| --- | --- | --- |
| default | `selected: boolean` | Internal; payload not forwarded to callers |

#### Data attributes

| Attribute | Value/presence | Meaning |
| --- | --- | --- |
| data-state | checked / unchecked | Model selection. |
| data-highlighted | Present when highlighted | Focus/highlight; distinct from selection. |
| data-disabled | Present when disabled | Option availability. |

### ItemText

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
| — | None supplied by this part | Label/text/separator parts do not add checked/open state markers. |

### Separator

Frame supplies this part in its anatomy. Availability below refers to configuration through the Frame wrapper, not direct use of a Reka export.

#### Props

| Prop | Reka type | Frame type | Required/default | Availability | Description |
| --- | --- | --- | --- | --- | --- |
| `as` | `AsTag \| Component` | No independent Frame prop | `"div"` (Reka) | Internal | Rendered element/component. Not independently configurable through Frame. |
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
| — | None supplied by this part | Label/text/separator parts do not add checked/open state markers. |

### Omitted parts

Frame replaces SelectValue with its own label span and SelectIcon with FrameIcon. SelectGroup, SelectLabel, SelectItemIndicator, SelectArrow, and SelectScrollUpButton/SelectScrollDownButton are not composed. Their composition props, scoped slots, and presence options are not Frame APIs. Separators do not create named groups. See the [upstream comparison](../../reference/reka-coverage.md#select-parts-and-api-inventory).

### Frame additions

#### Props

| Prop | Type | Required/default | Description |
| --- | --- | --- | --- |
| `options` | `readonly SelectItem[]` | `Required` | Option/separator data; see Features for all option fields. |
| `label` | `string` | `Select an option` | Trigger accessible name. |
| `form` | `string` | `Unset` | Form ID for Frame submission/validation helper inputs. |

#### Slots

No additional public Frame slots.

#### Emits

No additional Frame-only emits. The controlled model event is documented on Root.

#### Exposed methods

No Frame-defined methods or internal Reka refs are exposed.

### Sources and version

[FrameSelect.vue](../../../packages/core/src/components/FrameSelect.vue) composes Reka Select primitives. [Choice encoding](../../../packages/core/src/forms/controls.ts) preserves empty-string values. Styling lives in [controls.css](../../../packages/core/src/forms/controls.css) and [style.css](../../../packages/core/src/style.css).

Compared with the [Reka Select reference](https://reka-ui.com/docs/components/select.md) and installed Reka `2.11.0` source. See the [coverage review](../../reference/reka-coverage.md).

## Styling

### Parts and selectors

| Selector | Part | Placement/attribute target |
| --- | --- | --- |
| `.frame-select` | Trigger | Caller class/style targets this element. Popup parts are teleported separately. |
| `.frame-select-popup` | Popup surface | Internal part; caller attributes do not target it independently. |
| `.frame-select-content` | Content | Internal part; caller attributes do not target it independently. |
| `.frame-select-options` | Viewport | Internal part; caller attributes do not target it independently. |
| `.frame-reka-select-item` | Option | Internal part; caller attributes do not target it independently. |
| `.frame-select-description` | Description area | Internal part; caller attributes do not target it independently. |
| `.frame-select-separator` | Separator | Internal part; caller attributes do not target it independently. |

Popup styles target the teleported Content subtree, not a descendant of the trigger. Trigger width and available bounds constrain popup geometry.

### Variables

| Token key | Variable | Value kind | Default/fallback | Part/effect | Scope/limits | Description |
| --- | --- | --- | --- | --- | --- | --- |
| `--frame-accent` | `--frame-accent` | color | Catalog: `#0078d4` | Content, Viewport, Option background | Shared across controls using this variable. State rules: [data-highlighted], [data-disabled]. | Accent. |
| `--frame-accent-foreground` | `--frame-accent-foreground` | color | Catalog: `#ffffff` | Content, Viewport, Option color | Shared across controls using this variable. State rules: [data-highlighted], [data-disabled]. | Accent foreground. |
| CSS only | `--frame-button-frame-select-background` | color | CSS fallback: `var(--frame-control-background)` | Trigger background | Local to matching component rules. CSS only; not in JSON allowlist. | Button frame select background. |
| CSS only | `--frame-button-frame-select-border` | border shorthand | CSS fallback: `1px solid var(--frame-control-border)` | Trigger border | Local to matching component rules. CSS only; not in JSON allowlist. | Button frame select border. |
| CSS only | `--frame-button-frame-select-border-radius` | length / CSS length expression | CSS fallback: `var(--frame-input-radius)` | Trigger border-radius | Local to matching component rules. CSS only; not in JSON allowlist. | Button frame select border radius. |
| CSS only | `--frame-button-frame-select-color` | color | CSS fallback: `var(--frame-control-text)` | Trigger color | Local to matching component rules. CSS only; not in JSON allowlist. | Button frame select color. |
| CSS only | `--frame-button-frame-select-gap` | length / CSS length expression | CSS fallback: `8px` | Trigger gap | Local to matching component rules. CSS only; not in JSON allowlist. | Button frame select gap. |
| CSS only | `--frame-button-frame-select-min-height` | length / CSS length expression | CSS fallback: `28px` | Trigger min-height | Local to matching component rules. CSS only; not in JSON allowlist. | Button frame select min height. |
| CSS only | `--frame-button-frame-select-padding` | CSS spacing | CSS fallback: `5px 8px` | Trigger padding | Local to matching component rules. CSS only; not in JSON allowlist. | Button frame select padding. |
| CSS only | `--frame-button-frame-select-width` | length / CSS length expression | CSS fallback: `min(100%, 340px)` | Trigger width | Local to matching component rules. CSS only; not in JSON allowlist. | Button frame select width. |
| `--frame-control-background` | `--frame-control-background` | color | Catalog: `#1d1d1d` | Trigger background | Shared across controls using this variable. | Control background. |
| `--frame-control-border` | `--frame-control-border` | color | Catalog: `var(--frame-border-color)` | Trigger border | Shared across controls using this variable. | Control border. |
| `--frame-control-text` | `--frame-control-text` | color | Catalog: `#d4d4d4` | Trigger color | Shared across controls using this variable. | Control text. |
| `--frame-gap` | `--frame-gap` | length | Catalog: `calc(var(--frame-spacing-unit) * 1.5)`; CSS fallback: `6px` | Viewport, Option gap | Shared across controls using this variable. | Gap. |
| `--frame-input-radius` | `--frame-input-radius` | length | Catalog: `var(--frame-menu-border-radius)` | Trigger border-radius | Shared across controls using this variable. | Input radius. |
| `--frame-line` | `--frame-line` | color | Catalog: `#2b2b2b`; CSS fallback: `#3c4246`; `#454545` | Viewport, Separator background; Separator background | Shared across controls using this variable. | Line. |
| `--frame-menu-background` | `--frame-menu-background` | color | Catalog: `var(--frame-overlay-background)` | Popup surface, Content background | Shared across controls using this variable. | Menu background. |
| `--frame-menu-border` | `--frame-menu-border` | color | Catalog: `var(--frame-border-color)` | Popup surface, Content border; Content, Description area border-color | Shared across controls using this variable. | Menu border. |
| `--frame-menu-border-radius` | `--frame-menu-border-radius` | length | Catalog: `var(--frame-radius-large)`; CSS fallback: `var(--frame-radius-large)` | Popup surface, Content border-radius | Shared across controls using this variable. | Menu border radius. |
| `--frame-menu-box-shadow` | `--frame-menu-box-shadow` | shadow | Catalog: `0 6px 22px #0005`; CSS fallback: `0 6px 22px #0005` | Popup surface, Content box-shadow | Shared across controls using this variable. | Menu box shadow. |
| CSS only | `--frame-menu-padding` | CSS spacing | CSS fallback: `var(--frame-spacing-small,4px)` | Content, Viewport padding | Shared across controls using this variable. CSS only; not in JSON allowlist. | Menu padding. |
| CSS only | `--frame-menu-row-button-border-radius` | length / CSS length expression | CSS fallback: `var(--frame-radius-medium)` | Content, Viewport, Option border-radius | Shared across controls using this variable. CSS only; not in JSON allowlist. | Menu row button border radius. |
| CSS only | `--frame-menu-row-button-font-size` | length / CSS length expression | CSS fallback: `12px` | Content, Viewport, Option font-size | Shared across controls using this variable. CSS only; not in JSON allowlist. | Menu row button font size. |
| CSS only | `--frame-menu-row-button-min-height` | length / CSS length expression | CSS fallback: `25px` | Content, Viewport, Option min-height | Shared across controls using this variable. CSS only; not in JSON allowlist. | Menu row button min height. |
| CSS only | `--frame-menu-row-button-padding` | CSS spacing | CSS fallback: `3px 6px` | Content, Viewport, Option padding | Shared across controls using this variable. CSS only; not in JSON allowlist. | Menu row button padding. |
| `--frame-overlay-backdrop-filter` | `--frame-overlay-backdrop-filter` | filter | Catalog: `blur(10px) saturate(110%)` | Popup surface backdrop-filter; Popup surface -webkit-backdrop-filter | Shared across controls using this variable. | Overlay backdrop filter. |
| `--frame-quick-selection` | `--frame-quick-selection` | color | Catalog: `var(--frame-accent)`; CSS fallback: `var(--frame-accent)` | Content, Viewport, Option background | Shared across controls using this variable. State rules: [data-highlighted], [data-disabled]. | Quick selection. |
| `--frame-radius-large` | `--frame-radius-large` | length | Catalog: `7px` | Popup surface, Content border-radius | Shared across controls using this variable. | Radius large. |
| `--frame-radius-medium` | `--frame-radius-medium` | length | Catalog: `4px` | Content, Viewport, Option border-radius | Shared across controls using this variable. | Radius medium. |
| `--frame-select-border-color` | `--frame-select-border-color` | color | Catalog: `#454545`; CSS fallback: `#454545` | Description area border-top | Local to matching component rules. | Select border color. |
| CSS only | `--frame-select-description-border-top` | border shorthand | CSS fallback: `1px solid var(--frame-select-border-color, #454545)` | Description area border-top | Local to matching component rules. CSS only; not in JSON allowlist. | Select description border top. |
| CSS only | `--frame-select-description-line-height` | lineHeight | CSS fallback: `1.5` | Description area line-height | Local to matching component rules. CSS only; not in JSON allowlist. | Select description line height. |
| CSS only | `--frame-select-description-margin` | length / CSS length expression | CSS fallback: `0` | Description area margin | Local to matching component rules. CSS only; not in JSON allowlist. | Select description margin. |
| CSS only | `--frame-select-description-padding` | CSS spacing | CSS fallback: `7px 8px` | Description area padding | Local to matching component rules. CSS only; not in JSON allowlist. | Select description padding. |
| CSS only | `--frame-select-disabled-opacity` | opacity number | CSS fallback: `.45` | Trigger opacity | Local to matching component rules. CSS only; not in JSON allowlist. State rules: :disabled. | Select disabled opacity. |
| CSS only | `--frame-select-item-font-size` | length / CSS length expression | CSS fallback: `var(--frame-menu-row-button-font-size,12px)` | Content, Viewport, Option font-size | Local to matching component rules. CSS only; not in JSON allowlist. | Select item font size. |
| CSS only | `--frame-select-item-highlight-background` | color | CSS fallback: `var(--frame-quick-selection,var(--frame-accent))` | Content, Viewport, Option background | Local to matching component rules. CSS only; not in JSON allowlist. State rules: [data-highlighted], [data-disabled]. | Select item highlight background. |
| CSS only | `--frame-select-item-highlight-color` | color | CSS fallback: `var(--frame-accent-foreground)` | Content, Viewport, Option color | Local to matching component rules. CSS only; not in JSON allowlist. State rules: [data-highlighted], [data-disabled]. | Select item highlight color. |
| CSS only | `--frame-select-item-min-height` | length / CSS length expression | CSS fallback: `var(--frame-menu-row-button-min-height,25px)` | Content, Viewport, Option min-height | Local to matching component rules. CSS only; not in JSON allowlist. | Select item min height. |
| CSS only | `--frame-select-item-padding` | CSS spacing | CSS fallback: `var(--frame-menu-row-button-padding,3px 6px)` | Content, Viewport, Option padding | Local to matching component rules. CSS only; not in JSON allowlist. | Select item padding. |
| CSS only | `--frame-select-item-radius` | length / CSS length expression | CSS fallback: `var(--frame-menu-row-button-border-radius,var(--frame-radius-medium))` | Content, Viewport, Option border-radius | Local to matching component rules. CSS only; not in JSON allowlist. | Select item radius. |
| CSS only | `--frame-select-options-frame-select-separator-height` | length / CSS length expression | CSS fallback: `1px` | Viewport, Separator height | Local to matching component rules. CSS only; not in JSON allowlist. | Select options frame select separator height. |
| CSS only | `--frame-select-options-frame-select-separator-margin` | length / CSS length expression | CSS fallback: `5px 0` | Viewport, Separator margin | Local to matching component rules. CSS only; not in JSON allowlist. | Select options frame select separator margin. |
| CSS only | `--frame-select-options-frame-select-separator-min-height` | length / CSS length expression | CSS fallback: `1px` | Viewport, Separator min-height | Local to matching component rules. CSS only; not in JSON allowlist. | Select options frame select separator min height. |
| CSS only | `--frame-select-options-frame-select-separator-padding` | CSS spacing | CSS fallback: `0` | Viewport, Separator padding | Local to matching component rules. CSS only; not in JSON allowlist. | Select options frame select separator padding. |
| CSS only | `--frame-select-options-min-height` | length / CSS length expression | CSS fallback: `0` | Viewport min-height | Local to matching component rules. CSS only; not in JSON allowlist. | Select options min height. |
| CSS only | `--frame-select-options-padding` | CSS spacing | CSS fallback: `var(--frame-menu-padding,var(--frame-spacing-small,4px))` | Content, Viewport padding | Local to matching component rules. CSS only; not in JSON allowlist. | Select options padding. |
| `--frame-select-options-small-color` | `--frame-select-options-small-color` | color | Catalog: `#999`; CSS fallback: `#999` | Viewport color | Local to matching component rules. | Select options small color. |
| CSS only | `--frame-select-options-small-font-size` | length / CSS length expression | CSS fallback: `11px` | Viewport font-size | Local to matching component rules. CSS only; not in JSON allowlist. | Select options small font size. |
| CSS only | `--frame-select-popup-backdrop-filter` | filter | CSS fallback: `blur(18px) saturate(110%)` | Popup surface, Content backdrop-filter | Local to matching component rules. CSS only; not in JSON allowlist. | Select popup backdrop filter. |
| CSS only | `--frame-select-popup-background` | color | CSS fallback: `var(--frame-menu-background)` | Popup surface, Content background | Local to matching component rules. CSS only; not in JSON allowlist. | Select popup background. |
| CSS only | `--frame-select-popup-border` | border shorthand | CSS fallback: `1px solid var(--frame-menu-border)` | Popup surface, Content border | Local to matching component rules. CSS only; not in JSON allowlist. | Select popup border. |
| CSS only | `--frame-select-popup-border-radius` | length / CSS length expression | CSS fallback: `var(--frame-menu-border-radius,var(--frame-radius-large))` | Popup surface, Content border-radius | Local to matching component rules. CSS only; not in JSON allowlist. | Select popup border radius. |
| CSS only | `--frame-select-popup-box-shadow` | shadow | CSS fallback: `var(--frame-menu-box-shadow,0 6px 22px #0005)` | Popup surface, Content box-shadow | Local to matching component rules. CSS only; not in JSON allowlist. | Select popup box shadow. |
| CSS only | `--frame-select-popup-solid-background` | color | CSS fallback: `var(--frame-surface)` | Popup surface, Content background | Local to matching component rules. CSS only; not in JSON allowlist. | Select popup solid background. |
| `--frame-spacing-small` | `--frame-spacing-small` | length | Catalog: `var(--frame-spacing-unit)`; CSS fallback: `4px` | Content, Viewport padding | Shared across controls using this variable. | Spacing small. |
| `--frame-surface` | `--frame-surface` | color | Catalog: `#181818` | Popup surface, Content background | Shared across controls using this variable. | Surface. |
| `--frame-text` | `--frame-text` | color | Catalog: `#cccccc`; CSS fallback: `#ccc` | Popup surface color | Shared across controls using this variable. | Text. |

See [theme variables](../../styling/theme-variables.md) for theme authoring.
