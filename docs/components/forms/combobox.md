# FrameCombobox

A searchable single-choice control. The model is a string option value; the input displays the matching option label.

## Features

### Anatomy

```text
FrameCombobox
ComboboxRoot
├─ ComboboxAnchor
│  ├─ ComboboxInput (caller attributes)
│  └─ ComboboxTrigger (⌄)
└─ ComboboxPortal
   └─ ComboboxContent (popper)
      └─ ComboboxViewport
         ├─ ComboboxEmpty
         ├─ ComboboxItem × filtered options (label + optional detail)
         └─ ComboboxSeparator × separators
input[type=hidden] (optional name/form submission)
input.frame-control-validation (optional required constraint)
```

Automatic fallthrough is disabled. Every undeclared attribute/listener, including class/style, goes to Input, not Root or popup. A Root option such as open, multiple, or ignoreFilter passed this way does not configure the root. These Reka parts are internal composition, not separately exported Frame building blocks.

### Basic usage

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { FrameCombobox, type SelectItem } from '@frame/core';
import '@frame/core/style.css';

const value = ref('vue');
const options: SelectItem[] = [
  { value: 'vue', label: 'Vue', detail: 'Frontend' },
  { type: 'separator', id: 'other' },
  { value: 'rust', label: 'Rust' },
  { value: 'legacy', label: 'Unavailable', disabled: true },
];
</script>

<template>
  <FrameCombobox v-model="value" :options="options" label="Language" placeholder="Choose a language" />
</template>
```

Load the stylesheet once per application. This component works without a Frame instance.

### Options, filtering, and selection

`SelectItem` accepts value-bearing options (`value`, `label`, optional `detail`, `description`, `disabled`) and separators (`type: 'separator'`, `id`). Values must be unique strings. Frame renders `label` and `detail`; `description` is not rendered. Separators are not selectable and do not create named groups.

The search draft is separate from `modelValue`. Typing filters option labels by a case-insensitive substring match; choosing a row updates the raw string value. Reka also performs its internal filter. Free text does not become an arbitrary selected value. The selected label is resolved from the current options; an unknown selected value has no matching display label. Frame encodes values internally, including the empty string, and decodes model updates and its hidden submitted value.

### Keyboard and popup behavior

Arrow keys navigate/open, Enter chooses the highlighted enabled option, and Escape closes. Reka handles text composition and active-descendant focus. The trigger is named “Show options”; empty results display “No options found.” Content is portalled to the Frame overlay target when present and constrained by that boundary with an 8px inset. There is no caller popup slot or portal/position configuration prop.

### Forms and constraints

`name` creates a Frame hidden input with the raw string; `form` associates it with a form ID. Reka Root receives an empty name to avoid duplicate serialization. With `required`, Frame also renders a visually hidden text input holding the raw value. Its invalid handler redirects focus to the combobox input. An empty value fails this constraint; the wrapper does not validate membership in options. Disabled controls omit the submitted hidden value through native disabled semantics. Host models remain responsible for reset synchronization.

### Search and select

Open the list and type “blue”. Choose Blueberry to store blueberry while displaying its readable label.

<!-- frame:example id="combobox.search" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameCombobox } from '@frame/core';
const demoModelValue = ref("apple");
const demoOptions = [
  {
    "value": "apple",
    "label": "Apple"
  },
  {
    "value": "banana",
    "label": "Banana"
  },
  {
    "value": "blueberry",
    "label": "Blueberry"
  },
  {
    "value": "grapes",
    "label": "Grapes"
  }
];
</script>
<template>
<FrameCombobox v-model="demoModelValue" :options="demoOptions" :label="&quot;Fruit&quot;" :placeholder="&quot;Search fruit&quot;" />
</template>
```

### Explain an option

Details appear beside each label. An unavailable option stays visible but cannot replace the current selection.

<!-- frame:example id="combobox.details" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameCombobox } from '@frame/core';
const demoModelValue = ref("standard");
const demoOptions = [
  {
    "value": "standard",
    "label": "Standard",
    "detail": "Included"
  },
  {
    "value": "express",
    "label": "Express",
    "detail": "Next day"
  },
  {
    "value": "international",
    "label": "International",
    "detail": "Unavailable",
    "disabled": true
  }
];
</script>
<template>
<FrameCombobox v-model="demoModelValue" :options="demoOptions" :label="&quot;Delivery&quot;" />
</template>
```

### Divide related choices

A non-selectable separator visually separates fruits from berries in the popup.

<!-- frame:example id="combobox.sections" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameCombobox } from '@frame/core';
const demoModelValue = ref("apple");
const demoOptions = [
  {
    "value": "apple",
    "label": "Apple"
  },
  {
    "value": "banana",
    "label": "Banana"
  },
  {
    "type": "separator",
    "id": "berries"
  },
  {
    "value": "blueberry",
    "label": "Blueberry"
  }
];
</script>
<template>
<FrameCombobox v-model="demoModelValue" :options="demoOptions" :label="&quot;Fruit or berry&quot;" />
</template>
```

## APIs

<!-- frame:generated api="combobox" -->

### FrameCombobox

Source: `packages/core/src/components/forms/FrameCombobox.vue`

#### Properties

| Name          | Type                    | Default  | Description                                                                        |
| ------------- | ----------------------- | -------- | ---------------------------------------------------------------------------------- |
| `modelValue`  | `string`                | Required | Controlled selected option value; labels are used for input display and filtering. |
| `name`        | `string \| undefined`   | Omitted  | Name of the hidden input included in native form submission.                       |
| `form`        | `string \| undefined`   | Omitted  | Identifier of the native form associated with the submitted input.                 |
| `required`    | `boolean \| undefined`  | false    | Requires a value when the associated form is validated.                            |
| `options`     | `readonly SelectItem[]` | Required | Ordered selectable options and separators rendered by this control.                |
| `disabled`    | `boolean \| undefined`  | false    | Prevents user interaction with the control.                                        |
| `label`       | `string \| undefined`   | Omitted  | Accessible name of the control.                                                    |
| `placeholder` | `string \| undefined`   | Omitted  | Hint displayed while the editable value is empty.                                  |

#### Events

| Name                | Parameters      | Return type | Description                                                 |
| ------------------- | --------------- | ----------- | ----------------------------------------------------------- |
| `update:modelValue` | `value: string` | `void`      | Requests the new application-owned value after interaction. |

#### Slots

No declared entries.

#### Exposed API

No declared entries.

<!-- /frame:generated -->

### Composition and upstream reference

Defaults below are Reka reference defaults unless a Frame override is stated. Declared means a typed Frame prop/event; Forwarded means attribute/listener fallthrough to the named part; Internal means generated by Frame; Absent means not routed or composed. Generic upstream `T`/`AcceptableValue` describes Reka, not a promise of arbitrary option values in Frame.

#### Root

#### Props

| Prop                      | Reka type                             | Reka required/default | Availability | Frame behavior                                                                                                                                      |
| ------------------------- | ------------------------------------- | --------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `as`                      | `AsTag \| Component`                  | "div"                 | Absent       | Not routed to Root. Undeclared attributes target Input.                                                                                             |
| `asChild`                 | `boolean`                             | -                     | Absent       | Not routed to Root. Undeclared attributes target Input.                                                                                             |
| `by`                      | `string \| ((a: T, b: T) => boolean)` | -                     | Absent       | Not routed to Root. Undeclared attributes target Input.                                                                                             |
| `defaultOpen`             | `boolean`                             | -                     | Absent       | Not routed to Root. Undeclared attributes target Input.                                                                                             |
| `defaultValue`            | `T \| T[]`                            | -                     | Absent       | Not routed to Root. Undeclared attributes target Input.                                                                                             |
| `dir`                     | `"ltr" \| "rtl"`                      | -                     | Absent       | Not routed to Root. Undeclared attributes target Input.                                                                                             |
| `disabled`                | `boolean`                             | -                     | Declared     | Frame: `boolean`, false. Disable interaction for this part and its participating descendants.                                                       |
| `highlightOnHover`        | `boolean`                             | true                  | Absent       | Not routed to Root. Undeclared attributes target Input.                                                                                             |
| `ignoreFilter`            | `boolean`                             | -                     | Absent       | Not routed to Root. Undeclared attributes target Input.                                                                                             |
| `loop`                    | `boolean`                             | -                     | Absent       | Not routed to Root. Undeclared attributes target Input.                                                                                             |
| `modelValue`              | `T \| T[]`                            | -                     | Changed      | Frame: `string`, Required. Controlled value; updates require the host to retain the emitted value. Encoded internally; emitted strings are decoded. |
| `multiple`                | `boolean`                             | -                     | Absent       | Not routed to Root. Undeclared attributes target Input.                                                                                             |
| `name`                    | `string`                              | -                     | Changed      | Frame: `string`, Unset. Submitted/registered field identity. Frame serializes through a separate hidden input; Reka receives name="".               |
| `open`                    | `boolean`                             | -                     | Absent       | Not routed to Root. Undeclared attributes target Input.                                                                                             |
| `openOnClick`             | `boolean`                             | false                 | Absent       | Not routed to Root. Undeclared attributes target Input.                                                                                             |
| `openOnFocus`             | `boolean`                             | false                 | Absent       | Not routed to Root. Undeclared attributes target Input.                                                                                             |
| `required`                | `boolean`                             | -                     | Declared     | Frame: `boolean`, false. Participate in the owning form’s required-value constraint.                                                                |
| `resetModelValueOnClear`  | `boolean`                             | false                 | Absent       | Not routed to Root. Undeclared attributes target Input.                                                                                             |
| `resetSearchTermOnBlur`   | `boolean`                             | true                  | Absent       | Not routed to Root. Undeclared attributes target Input.                                                                                             |
| `resetSearchTermOnSelect` | `boolean`                             | true                  | Absent       | Not routed to Root. Undeclared attributes target Input.                                                                                             |
| `unmountOnHide`           | `boolean`                             | true                  | Absent       | Not routed to Root. Undeclared attributes target Input.                                                                                             |

#### Emits

| Event               | Payload                                      | Availability | Behavior                                                                                                                                                                         |
| ------------------- | -------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `highlight`         | `[payload: { ref: HTMLElement; value: T; }]` | Absent       | Active highlighted item changed; includes its element and value, or undefined when cleared. Not cancellable. Caller listeners target Input, so this Root event is not forwarded. |
| `update:modelValue` | `[value: string]`                            | Declared     | Value changed; retain it in host state. Not cancellable. Payload shown is Frame’s public payload.                                                                                |
| `update:open`       | `[value: boolean]`                           | Absent       | Popup visibility changed. Not cancellable. Caller listeners target Input, so this Root event is not forwarded.                                                                   |

#### Slots

| Default-slot field | Reka type  | Frame availability                             |
| ------------------ | ---------- | ---------------------------------------------- |
| `open`             | `boolean`  | Internal; not passed to the Frame caller slot. |
| `modelValue`       | `T \| T[]` | Internal; not passed to the Frame caller slot. |

#### Data attributes

| Attribute       | Values/presence         | Meaning                      |
| --------------- | ----------------------- | ---------------------------- |
| `data-disabled` | `Present when disabled` | Inherited ListboxRoot state. |

#### Exposed methods

Frame does not defineExpose or forward the internal Reka instance. Do not depend on internal Reka methods/refs through a Frame component ref.

#### Anchor

#### Props

| Prop        | Reka type            | Reka required/default | Availability | Frame behavior                                                                                                       |
| ----------- | -------------------- | --------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------- |
| `as`        | `AsTag \| Component` | "div"                 | Internal     | Element/component used to render this part. Not independently configurable through Frame.                            |
| `asChild`   | `boolean`            | -                     | Internal     | Merge the part behavior into one child instead of rendering a wrapper. Not independently configurable through Frame. |
| `reference` | `ReferenceElement`   | -                     | Internal     | Anchor element or virtual reference for positioning. Not independently configurable through Frame.                   |

#### Emits

No component emits on this part. Native bubbling listeners are not additional component emits.

#### Slots

Underlying default content has no documented scoped fields. Frame generates this part’s content; no caller slot targets it independently.

#### Data attributes

No component state data attributes are defined on this part. Inherited native/ARIA attributes are not data attributes.

#### Input

#### Props

| Prop           | Reka type                | Reka required/default | Availability | Frame behavior                                                                                                                                                                   |
| -------------- | ------------------------ | --------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `as`           | `AsTag \| Component`     | "input"               | Forwarded    | Element/component used to render this part.                                                                                                                                      |
| `asChild`      | `boolean`                | -                     | Forwarded    | Merge the part behavior into one child instead of rendering a wrapper.                                                                                                           |
| `autoFocus`    | `boolean`                | -                     | Forwarded    | Focus the input after mount.                                                                                                                                                     |
| `disabled`     | `boolean`                | -                     | Forwarded    | Disable interaction for this part and its participating descendants.                                                                                                             |
| `displayValue` | `((val: any) => string)` | -                     | Internal     | Frame resolves the selected label from its decoded option value.                                                                                                                 |
| `modelValue`   | `string`                 | -                     | Forwarded    | Controlled value; updates require the host to retain the emitted value. Input search is tracked internally; binding a second modelValue is not a separate Frame selection model. |

#### Emits

| Event               | Payload    | Availability | Behavior                                                                                          |
| ------------------- | ---------- | ------------ | ------------------------------------------------------------------------------------------------- |
| `update:modelValue` | `[string]` | Forwarded    | Value changed; retain it in host state. Not cancellable. Frame also tracks this draft internally. |

#### Slots

Underlying default content has no documented scoped fields. Frame generates this part’s content; no caller slot targets it independently.

#### Data attributes

| Attribute       | Values/presence         | Meaning                    |
| --------------- | ----------------------- | -------------------------- |
| `data-disabled` | `Present when disabled` | ListboxFilter input state. |

#### Trigger

#### Props

| Prop       | Reka type            | Reka required/default | Availability | Frame behavior                                                                                                       |
| ---------- | -------------------- | --------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------- |
| `as`       | `AsTag \| Component` | "button"              | Internal     | Element/component used to render this part. Not independently configurable through Frame.                            |
| `asChild`  | `boolean`            | -                     | Internal     | Merge the part behavior into one child instead of rendering a wrapper. Not independently configurable through Frame. |
| `disabled` | `boolean`            | -                     | Internal     | Disable interaction for this part and its participating descendants. Not independently configurable through Frame.   |

#### Emits

No component emits on this part. Native bubbling listeners are not additional component emits.

#### Slots

Underlying default content has no documented scoped fields. Frame generates this part’s content; no caller slot targets it independently.

#### Data attributes

| Attribute       | Values/presence         | Meaning                    |
| --------------- | ----------------------- | -------------------------- |
| `data-state`    | `open \| closed`        | Popup visibility.          |
| `data-disabled` | `Present when disabled` | Trigger interaction state. |

#### Portal

#### Props

| Prop         | Reka type               | Reka required/default | Availability | Frame behavior                                                                                                     |
| ------------ | ----------------------- | --------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------ |
| `defer`      | `boolean`               | -                     | Internal     | Resolve the teleport target after the current render. Not independently configurable through Frame.                |
| `disabled`   | `boolean`               | -                     | Internal     | Disable interaction for this part and its participating descendants. Not independently configurable through Frame. |
| `forceMount` | `boolean`               | -                     | Internal     | Retain a presence-controlled part for animation. Not independently configurable through Frame.                     |
| `to`         | `string \| HTMLElement` | -                     | Internal     | Frame overlay target, or standalone body destination. Not independently configurable through Frame.                |

#### Emits

No component emits on this part. Native bubbling listeners are not additional component emits.

#### Slots

Underlying default content has no documented scoped fields. Frame generates this part’s content; no caller slot targets it independently.

#### Data attributes

No component state data attributes are defined on this part. Inherited native/ARIA attributes are not data attributes.

#### Content

#### Props

| Prop                          | Reka type                                                                   | Reka required/default | Availability | Frame behavior                                                                                                             |
| ----------------------------- | --------------------------------------------------------------------------- | --------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `align`                       | `"start" \| "center" \| "end"`                                              | -                     | Internal     | Preferred anchor alignment; collision handling can adjust it. Not independently configurable through Frame.                |
| `alignFlip`                   | `boolean`                                                                   | -                     | Internal     | Allow alternate alignment when resolving collisions. Not independently configurable through Frame.                         |
| `alignOffset`                 | `number`                                                                    | -                     | Internal     | Pixel offset along the alignment axis. Not independently configurable through Frame.                                       |
| `arrowPadding`                | `number`                                                                    | -                     | Internal     | Minimum arrow inset from the content edges. Not independently configurable through Frame.                                  |
| `as`                          | `AsTag \| Component`                                                        | "div"                 | Internal     | Element/component used to render this part. Not independently configurable through Frame.                                  |
| `asChild`                     | `boolean`                                                                   | -                     | Internal     | Merge the part behavior into one child instead of rendering a wrapper. Not independently configurable through Frame.       |
| `avoidCollisions`             | `boolean`                                                                   | -                     | Internal     | Adjust placement to stay inside collision bounds. Not independently configurable through Frame.                            |
| `bodyLock`                    | `boolean`                                                                   | -                     | Internal     | Lock document-body scrolling while content is open. Not independently configurable through Frame.                          |
| `collisionBoundary`           | `Element \| (Element \| null)[] \| null`                                    | -                     | Internal     | Derived from the injected overlay target. Not independently configurable through Frame.                                    |
| `collisionPadding`            | `number \| Partial<Record<"top" \| "right" \| "bottom" \| "left", number>>` | -                     | Internal     | 8px. Not independently configurable through Frame.                                                                         |
| `dir`                         | `"ltr" \| "rtl"`                                                            | -                     | Internal     | Reading/navigation direction; inherits Reka configuration or LTR when unset. Not independently configurable through Frame. |
| `disableOutsidePointerEvents` | `boolean`                                                                   | -                     | Internal     | Block interaction outside the open dismissable layer. Not independently configurable through Frame.                        |
| `disableUpdateOnLayoutShift`  | `boolean`                                                                   | -                     | Internal     | Skip positioning updates triggered by layout movement. Not independently configurable through Frame.                       |
| `forceMount`                  | `boolean`                                                                   | -                     | Internal     | Retain a presence-controlled part for animation. Not independently configurable through Frame.                             |
| `hideShiftedArrow`            | `boolean`                                                                   | -                     | Internal     | Hide an arrow displaced from its centered position. Not independently configurable through Frame.                          |
| `hideWhenDetached`            | `boolean`                                                                   | -                     | Internal     | Hide content when its reference is occluded. Not independently configurable through Frame.                                 |
| `hideWhenEmpty`               | `boolean`                                                                   | -                     | Internal     | Hide popup content when the filtered result collection is empty. Not independently configurable through Frame.             |
| `memoDependencies`            | `unknown[]`                                                                 | -                     | Internal     | Additional values invalidating content memoization. Not independently configurable through Frame.                          |
| `position`                    | `"inline" \| "popper"`                                                      | -                     | Internal     | popper. Not independently configurable through Frame.                                                                      |
| `positionStrategy`            | `"fixed" \| "absolute"`                                                     | -                     | Internal     | CSS positioning strategy for floating content. Not independently configurable through Frame.                               |
| `prioritizePosition`          | `boolean`                                                                   | -                     | Internal     | Keep the popup within bounds even when that overlaps its reference. Not independently configurable through Frame.          |
| `reference`                   | `ReferenceElement`                                                          | -                     | Internal     | Anchor element or virtual reference for positioning. Not independently configurable through Frame.                         |
| `side`                        | `"top" \| "right" \| "bottom" \| "left"`                                    | -                     | Internal     | Preferred side relative to the reference. Not independently configurable through Frame.                                    |
| `sideFlip`                    | `boolean`                                                                   | -                     | Internal     | Permit placement on the opposite side after collision. Not independently configurable through Frame.                       |
| `sideOffset`                  | `number`                                                                    | -                     | Internal     | Pixel gap from the reference. Not independently configurable through Frame.                                                |
| `sticky`                      | `"partial" \| "always"`                                                     | -                     | Internal     | How strongly the popup stays inside the alignment boundary. Not independently configurable through Frame.                  |
| `updatePositionStrategy`      | `"always" \| "optimized"`                                                   | -                     | Internal     | Frequency of floating-position recalculation. Not independently configurable through Frame.                                |

#### Emits

| Event                | Payload                                                 | Availability | Behavior                                                                                                                                            |
| -------------------- | ------------------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `escapeKeyDown`      | `[event: KeyboardEvent]`                                | Internal     | Escape key in the dismissable layer; upstream supports preventDefault. Not forwarded as a Frame event; caller cannot cancel this internal emission. |
| `focusOutside`       | `[event: FocusOutsideEvent]`                            | Internal     | Focus moved outside the layer; upstream supports preventDefault. Not forwarded as a Frame event; caller cannot cancel this internal emission.       |
| `interactOutside`    | `[event: PointerDownOutsideEvent \| FocusOutsideEvent]` | Internal     | Outside focus/pointer interaction; upstream supports preventDefault. Not forwarded as a Frame event; caller cannot cancel this internal emission.   |
| `pointerDownOutside` | `[event: PointerDownOutsideEvent]`                      | Internal     | Pointer pressed outside the layer; upstream supports preventDefault. Not forwarded as a Frame event; caller cannot cancel this internal emission.   |

#### Slots

Underlying default content has no documented scoped fields. Frame generates this part’s content; no caller slot targets it independently.

#### Data attributes

| Attribute    | Values/presence                  | Meaning                    |
| ------------ | -------------------------------- | -------------------------- |
| `data-state` | `open \| closed`                 | Popup presence.            |
| `data-empty` | `Present when empty`             | No filtered items.         |
| `data-side`  | `top \| right \| bottom \| left` | Resolved popper placement. |
| `data-align` | `start \| center \| end`         | Resolved popper alignment. |

#### Viewport

#### Props

| Prop      | Reka type            | Reka required/default | Availability | Frame behavior                                                                                                       |
| --------- | -------------------- | --------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------- |
| `as`      | `AsTag \| Component` | "div"                 | Internal     | Element/component used to render this part. Not independently configurable through Frame.                            |
| `asChild` | `boolean`            | -                     | Internal     | Merge the part behavior into one child instead of rendering a wrapper. Not independently configurable through Frame. |
| `nonce`   | `string`             | -                     | Internal     | Nonce attached to the viewport helper stylesheet. Not independently configurable through Frame.                      |

#### Emits

No component emits on this part. Native bubbling listeners are not additional component emits.

#### Slots

Underlying default content has no documented scoped fields. Frame generates this part’s content; no caller slot targets it independently.

#### Data attributes

| Attribute                     | Values/presence | Meaning                                         |
| ----------------------------- | --------------- | ----------------------------------------------- |
| `data-reka-combobox-viewport` | `Present`       | Internal viewport marker; not a selected state. |

#### Item

#### Props

| Prop        | Reka type            | Reka required/default | Availability | Frame behavior                                                                                                       |
| ----------- | -------------------- | --------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------- |
| `as`        | `AsTag \| Component` | "div"                 | Internal     | Element/component used to render this part. Not independently configurable through Frame.                            |
| `asChild`   | `boolean`            | -                     | Internal     | Merge the part behavior into one child instead of rendering a wrapper. Not independently configurable through Frame. |
| `disabled`  | `boolean`            | -                     | Internal     | Derived from root/option disabled state. Not independently configurable through Frame.                               |
| `textValue` | `string`             | -                     | Internal     | option.label. Not independently configurable through Frame.                                                          |
| `value`     | `T`                  | Required upstream     | Internal     | Encoded option.value. Not independently configurable through Frame.                                                  |

#### Emits

| Event    | Payload                   | Availability | Behavior                                                                                                                                 |
| -------- | ------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `select` | `[event: SelectEvent<T>]` | Internal     | Item activation; upstream preventDefault cancels selection. Not forwarded as a Frame event; caller cannot cancel this internal emission. |

#### Slots

| Default-slot field | Reka type | Frame availability                             |
| ------------------ | --------- | ---------------------------------------------- |
| `selected`         | `boolean` | Internal; not passed to the Frame caller slot. |

#### Data attributes

| Attribute          | Values/presence            | Meaning                                  |
| ------------------ | -------------------------- | ---------------------------------------- |
| `data-state`       | `checked \| unchecked`     | Selected value, distinct from highlight. |
| `data-highlighted` | `Present when highlighted` | Active navigation item.                  |
| `data-disabled`    | `Present when disabled`    | Option interaction state.                |

#### Empty

#### Props

| Prop      | Reka type            | Reka required/default | Availability | Frame behavior                                                                                                       |
| --------- | -------------------- | --------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------- |
| `as`      | `AsTag \| Component` | "div"                 | Internal     | Element/component used to render this part. Not independently configurable through Frame.                            |
| `asChild` | `boolean`            | -                     | Internal     | Merge the part behavior into one child instead of rendering a wrapper. Not independently configurable through Frame. |

#### Emits

No component emits on this part. Native bubbling listeners are not additional component emits.

#### Slots

Underlying default content has no documented scoped fields. Frame generates this part’s content; no caller slot targets it independently.

#### Data attributes

No component state data attributes are defined on this part. Inherited native/ARIA attributes are not data attributes.

#### Separator

#### Props

| Prop      | Reka type            | Reka required/default | Availability | Frame behavior                                                                                                       |
| --------- | -------------------- | --------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------- |
| `as`      | `AsTag \| Component` | "div"                 | Internal     | Element/component used to render this part. Not independently configurable through Frame.                            |
| `asChild` | `boolean`            | -                     | Internal     | Merge the part behavior into one child instead of rendering a wrapper. Not independently configurable through Frame. |

#### Emits

No component emits on this part. Native bubbling listeners are not additional component emits.

#### Slots

Underlying default content has no documented scoped fields. Frame generates this part’s content; no caller slot targets it independently.

#### Data attributes

No component state data attributes are defined on this part. Inherited native/ARIA attributes are not data attributes.

#### Omitted parts

`Cancel`, `ItemIndicator`, `Group`, `Label`, `Arrow`, `Virtualizer` are not rendered by this wrapper. Their props, slots, presence controls, and composition APIs are not available through Frame. See the [Reka reference](https://reka-ui.com/docs/components/combobox).

#### Frame additions

#### Props

| Prop          | Type                    | Required/default | Description                                                         |
| ------------- | ----------------------- | ---------------- | ------------------------------------------------------------------- |
| `options`     | `readonly SelectItem[]` | Required         | Options and separators generated into Content.                      |
| `form`        | `string`                | Unset            | Form ID for Frame hidden submission and required-validation inputs. |
| `label`       | `string`                | Unset            | Accessible name on Input.                                           |
| `placeholder` | `string`                | Unset            | Hint on Input.                                                      |

#### Emits

No additional Frame-only events; see the part tables for declared or forwarded events.

#### Slots

No public content slots; all internal children are generated.

#### Sources and version

Checked against installed `reka-ui@2.11.0`, the [official Reka reference](https://reka-ui.com/docs/components/combobox), its [Markdown reference](https://reka-ui.com/docs/components/combobox.md), and [Frame implementation](../../../packages/core/src/components/forms/FrameCombobox.vue). Styling comes from [controls.css](../../../packages/core/src/components/forms/shared/controls.css) and [shared styles](../../../packages/core/src/style.css). JSON availability comes from the [token catalog](../../../packages/core/src/themes/tokens/tokenCatalog.ts).

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="combobox" -->

| CSS variable                                               | Theme path                                               | Default expression                                                                           | Purpose                                                                                                                                                                 | Context                                                                                                                                                                                                                                                                                                                                                  |
| ---------------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--frame-input-border`                                     | `frame.input.border`                                     | `1px solid     var(--frame-control-border)`                                                  | Fallback for: Resting border of the combobox.                                                                                                                           | `.frame-combobox-anchor`                                                                                                                                                                                                                                                                                                                                 |
| `--frame-combobox-border`                                  | `frame.combobox.border`                                  | `var(     --frame-input-border,     1px solid     var(--frame-control-border)   )`           | Resting border of the combobox.                                                                                                                                         | `.frame-combobox-anchor`                                                                                                                                                                                                                                                                                                                                 |
| `--frame-combobox-border-radius`                           | `frame.combobox.border.radius`                           | `var(--frame-input-radius)`                                                                  | Corner radius of the combobox.                                                                                                                                          | `.frame-combobox-anchor`                                                                                                                                                                                                                                                                                                                                 |
| `--frame-input-hover-border`                               | `frame.input.hover.border`                               | `1px solid     var(--frame-control-border)`                                                  | Fallback for: Border while the pointer hovers over the combobox.                                                                                                        | `.frame-combobox-anchor`                                                                                                                                                                                                                                                                                                                                 |
| `--frame-combobox-hover-border`                            | `frame.combobox.hover.border`                            | `var(     --frame-input-hover-border,     1px solid     var(--frame-control-border)   )`     | Border while the pointer hovers over the combobox.                                                                                                                      | `.frame-combobox-anchor`                                                                                                                                                                                                                                                                                                                                 |
| `--frame-input-hover-outline`                              | `frame.input.hover.outline`                              | `none`                                                                                       | Fallback for: Outline while the pointer hovers over the combobox.                                                                                                       | `.frame-combobox-anchor`                                                                                                                                                                                                                                                                                                                                 |
| `--frame-combobox-hover-outline`                           | `frame.combobox.hover.outline`                           | `var(     --frame-input-hover-outline,     none   )`                                         | Outline while the pointer hovers over the combobox.                                                                                                                     | `.frame-combobox-anchor`                                                                                                                                                                                                                                                                                                                                 |
| `--frame-input-focus-border`                               | `frame.input.focus.border`                               | `1px solid var(--frame-accent)`                                                              | Fallback for: Border while focus is within the combobox.                                                                                                                | `.frame-combobox-anchor`                                                                                                                                                                                                                                                                                                                                 |
| `--frame-combobox-focus-border`                            | `frame.combobox.focus.border`                            | `var(     --frame-input-focus-border,     1px solid var(--frame-accent)   )`                 | Border while focus is within the combobox.                                                                                                                              | `.frame-combobox-anchor`                                                                                                                                                                                                                                                                                                                                 |
| `--frame-input-focus-outline`                              | `frame.input.focus.outline`                              | `1px solid var(--frame-accent)`                                                              | Fallback for: Focus outline of the combobox.                                                                                                                            | `.frame-combobox-anchor`                                                                                                                                                                                                                                                                                                                                 |
| `--frame-combobox-focus-outline`                           | `frame.combobox.focus.outline`                           | `var(     --frame-input-focus-outline,     1px solid var(--frame-accent)   )`                | Focus outline of the combobox.                                                                                                                                          | `.frame-combobox-anchor`                                                                                                                                                                                                                                                                                                                                 |
| `--frame-input-outline-offset`                             | `frame.input.outline.offset`                             | `0px`                                                                                        | Fallback for: Offset between the outline and the combobox.                                                                                                              | `.frame-combobox-anchor`                                                                                                                                                                                                                                                                                                                                 |
| `--frame-combobox-outline-offset`                          | `frame.combobox.outline.offset`                          | `var(     --frame-input-outline-offset,     0px   )`                                         | Offset between the outline and the combobox.                                                                                                                            | `.frame-combobox-anchor`                                                                                                                                                                                                                                                                                                                                 |
| `--frame-control-border`                                   | `frame.control.border`                                   | `var(--frame-border-color)`                                                                  | Resting border color of form controls, independently overridable from menu borders.                                                                                     | `.frame-combobox-anchor`                                                                                                                                                                                                                                                                                                                                 |
| `--frame-input-radius`                                     | `frame.input.radius`                                     | `var(--frame-menu-border-radius)`                                                            | Shared corner radius for text fields, text areas, selects, and composed input surfaces.                                                                                 | `.frame-combobox-anchor`                                                                                                                                                                                                                                                                                                                                 |
| `--frame-accent`                                           | `frame.accent`                                           | `#0078d4`                                                                                    | Shared interaction color for keyboard focus, active actions, and accent-filled controls.                                                                                | `.frame-combobox-anchor`                                                                                                                                                                                                                                                                                                                                 |
| `--frame-select-popup-color`                               | `frame.select.popup.color`                               | `#d4d4d4`                                                                                    | Foreground for .frame-select-popup.                                                                                                                                     | `.frame-select-popup`                                                                                                                                                                                                                                                                                                                                    |
| `--frame-select-popup-background`                          | `frame.select.popup.background`                          | `var(     --frame-overlay-background   )`                                                    | Background for .frame-select-popup.                                                                                                                                     | `.frame-select-popup`                                                                                                                                                                                                                                                                                                                                    |
| `--frame-select-border-color`                              | `frame.select.border.color`                              | `#454545`                                                                                    | Border for .frame-select-popup. Used when --frame-select-popup-border is unset.                                                                                         | `.frame-select-popup`                                                                                                                                                                                                                                                                                                                                    |
| `--frame-select-popup-border`                              | `frame.select.popup.border`                              | `1px solid     var(       --frame-select-border-color,       #454545     )`                  | Border for .frame-select-popup.                                                                                                                                         | `.frame-select-popup`                                                                                                                                                                                                                                                                                                                                    |
| `--frame-select-popup-border-radius`                       | `frame.select.popup.border.radius`                       | `var(     --frame-radius-small   )`                                                          | Corner radius for .frame-select-popup.                                                                                                                                  | `.frame-select-popup`                                                                                                                                                                                                                                                                                                                                    |
| `--frame-select-popup-box-shadow`                          | `frame.select.popup.box.shadow`                          | `0 6px 18px #0005`                                                                           | Elevation shadow for .frame-select-popup.                                                                                                                               | `.frame-select-popup`                                                                                                                                                                                                                                                                                                                                    |
| `--frame-select-popup-font`                                | `frame.select.popup.font`                                | `12px system-ui, sans-serif`                                                                 | Value of font for .frame-select-popup.                                                                                                                                  | `.frame-select-popup`                                                                                                                                                                                                                                                                                                                                    |
| `--frame-overlay-background`                               | `frame.overlay.background`                               | `color-mix(in srgb, var(--frame-overlay-surface) 83%, transparent)`                          | Shared translucent fill for floating surfaces over the application canvas.                                                                                              | `.frame-select-popup`                                                                                                                                                                                                                                                                                                                                    |
| `--frame-radius-small`                                     | `frame.radius.small`                                     | `2px`                                                                                        | Small shared corner radius used by inset rows and compact elements.                                                                                                     | `.frame-select-popup`                                                                                                                                                                                                                                                                                                                                    |
| `--frame-select-options-min-height`                        | `frame.select.options.min.height`                        | `0`                                                                                          | Minimum height for .frame-select-options.                                                                                                                               | `.frame-select-options`                                                                                                                                                                                                                                                                                                                                  |
| `--frame-select-options-div-gap`                           | `frame.select.options.div.gap`                           | `8px`                                                                                        | Space between children for .frame-select-options > div.                                                                                                                 | `.frame-select-options > div`                                                                                                                                                                                                                                                                                                                            |
| `--frame-select-options-div-padding`                       | `frame.select.options.div.padding`                       | `4px 8px`                                                                                    | Internal spacing for .frame-select-options > div.                                                                                                                       | `.frame-select-options > div`                                                                                                                                                                                                                                                                                                                            |
| `--frame-select-options-div-min-height`                    | `frame.select.options.div.min.height`                    | `24px`                                                                                       | Minimum height for .frame-select-options > div.                                                                                                                         | `.frame-select-options > div`                                                                                                                                                                                                                                                                                                                            |
| `--frame-select-options-active-not-disabled-background`    | `frame.select.options.active.not.disabled.background`    | `#087caa`                                                                                    | Background for .frame-select-options .active:not(.disabled).                                                                                                            | `.frame-select-options .active:not(.disabled)`                                                                                                                                                                                                                                                                                                           |
| `--frame-select-options-active-not-disabled-color`         | `frame.select.options.active.not.disabled.color`         | `white`                                                                                      | Foreground for .frame-select-options .active:not(.disabled).                                                                                                            | `.frame-select-options .active:not(.disabled)`                                                                                                                                                                                                                                                                                                           |
| `--frame-select-options-disabled-opacity`                  | `frame.select.options.disabled.opacity`                  | `0.4`                                                                                        | Opacity for .frame-select-options .disabled.                                                                                                                            | `.frame-select-options .disabled`                                                                                                                                                                                                                                                                                                                        |
| `--frame-select-options-small-color`                       | `frame.select.options.small.color`                       | `#999`                                                                                       | Foreground for .frame-select-options small.                                                                                                                             | `.frame-select-options small`                                                                                                                                                                                                                                                                                                                            |
| `--frame-select-options-small-font-size`                   | `frame.select.options.small.font.size`                   | `11px`                                                                                       | Text size for .frame-select-options small.                                                                                                                              | `.frame-select-options small`                                                                                                                                                                                                                                                                                                                            |
| `--frame-select-options-frame-select-separator-padding`    | `frame.select.options.frame.select.separator.padding`    | `0`                                                                                          | Internal spacing for .frame-select-options > .frame-select-separator.                                                                                                   | `.frame-select-options > .frame-select-separator`                                                                                                                                                                                                                                                                                                        |
| `--frame-select-options-frame-select-separator-min-height` | `frame.select.options.frame.select.separator.min.height` | `1px`                                                                                        | Minimum height for .frame-select-options > .frame-select-separator.                                                                                                     | `.frame-select-options > .frame-select-separator`                                                                                                                                                                                                                                                                                                        |
| `--frame-select-options-frame-select-separator-height`     | `frame.select.options.frame.select.separator.height`     | `1px`                                                                                        | Height for .frame-select-options > .frame-select-separator.                                                                                                             | `.frame-select-options > .frame-select-separator`                                                                                                                                                                                                                                                                                                        |
| `--frame-select-options-frame-select-separator-margin`     | `frame.select.options.frame.select.separator.margin`     | `5px     0`                                                                                  | Outer spacing for .frame-select-options > .frame-select-separator.                                                                                                      | `.frame-select-options > .frame-select-separator`                                                                                                                                                                                                                                                                                                        |
| `--frame-line`                                             | `frame.line`                                             | `#3c4246`                                                                                    | Background for .frame-select-options > .frame-select-separator.                                                                                                         | `.frame-select-options > .frame-select-separator`                                                                                                                                                                                                                                                                                                        |
| `--frame-overlay-backdrop-filter`                          | `frame.overlay.backdrop.filter`                          | `blur(10px) saturate(110%)`                                                                  | Blur and saturation treatment behind shared translucent floating surfaces.                                                                                              | `:is(   .frame-menu,   .frame-select-popup,   .palette,   .frame-modal,   .frame-date-popover,   .frame-color-picker-popover,   .frame-advanced-popup,   .frame-general-dialog,   .frame-general-popup,   .frame-general-menu,   .frame-general-toast,   .frame-navigation-content,   .frame-menubar-content,   .frame-tooltip,   .frame-notification )` |
| `--frame-gap`                                              | `frame.gap`                                              | `6px`                                                                                        | Space between children for .frame-form-inline, .frame-number-field, .frame-pin-input, .frame-tags-input, .frame-combobox-anchor.                                        | `.frame-form-inline, .frame-number-field, .frame-pin-input, .frame-tags-input, .frame-combobox-anchor`                                                                                                                                                                                                                                                   |
| `--frame-text`                                             | `frame.text`                                             | `#ccc`                                                                                       | Foreground for .frame-form-input, .frame-control-button, .frame-toggle, .frame-choice-item, .frame-check-control.                                                       | `.frame-form-input, .frame-control-button, .frame-toggle, .frame-choice-item, .frame-check-control`                                                                                                                                                                                                                                                      |
| `--frame-surface`                                          | `frame.surface`                                          | `#242424`                                                                                    | Background for .frame-form-input, .frame-control-button, .frame-toggle, .frame-choice-item, .frame-check-control.                                                       | `.frame-form-input, .frame-control-button, .frame-toggle, .frame-choice-item, .frame-check-control`                                                                                                                                                                                                                                                      |
| `--frame-line`                                             | `frame.line`                                             | `#454545`                                                                                    | Border for .frame-form-input, .frame-control-button, .frame-toggle, .frame-choice-item, .frame-check-control.                                                           | `.frame-form-input, .frame-control-button, .frame-toggle, .frame-choice-item, .frame-check-control`                                                                                                                                                                                                                                                      |
| `--frame-control-radius`                                   | `frame.control.radius`                                   | `var(--frame-radius-medium)`                                                                 | Corner radius for .frame-form-input, .frame-control-button, .frame-toggle, .frame-choice-item, .frame-check-control.                                                    | `.frame-form-input, .frame-control-button, .frame-toggle, .frame-choice-item, .frame-check-control`                                                                                                                                                                                                                                                      |
| `--frame-control-padding-y`                                | `frame.control.padding.y`                                | `5px`                                                                                        | Internal spacing for .frame-form-input, .frame-control-button, .frame-toggle, .frame-choice-item, .frame-check-control.                                                 | `.frame-form-input, .frame-control-button, .frame-toggle, .frame-choice-item, .frame-check-control`                                                                                                                                                                                                                                                      |
| `--frame-control-padding-x`                                | `frame.control.padding.x`                                | `10px`                                                                                       | Internal spacing for .frame-form-input, .frame-control-button, .frame-toggle, .frame-choice-item, .frame-check-control.                                                 | `.frame-form-input, .frame-control-button, .frame-toggle, .frame-choice-item, .frame-check-control`                                                                                                                                                                                                                                                      |
| `--frame-radius-medium`                                    | `frame.radius.medium`                                    | `4px`                                                                                        | Medium shared corner radius used by ordinary controls.                                                                                                                  | `.frame-form-input, .frame-control-button, .frame-toggle, .frame-choice-item, .frame-check-control`                                                                                                                                                                                                                                                      |
| `--frame-accent`                                           | `frame.accent`                                           | `#0078d4`                                                                                    | Outline for :is( .frame-form-input, .frame-control-button, .frame-toggle, .frame-choice-item, .frame-check-control, .frame-switch, .frame-slider-thumb ):focus-visible. | `:is(   .frame-form-input,   .frame-control-button,   .frame-toggle,   .frame-choice-item,   .frame-check-control,   .frame-switch,   .frame-slider-thumb ):focus-visible`                                                                                                                                                                               |
| `--frame-text`                                             | `frame.text`                                             | `#ccc`                                                                                       | Foreground for .frame-select-popup.frame-reka-select-popup.                                                                                                             | `.frame-select-popup.frame-reka-select-popup`                                                                                                                                                                                                                                                                                                            |
| `--frame-line`                                             | `frame.line`                                             | `#454545`                                                                                    | Border color for .frame-select-popup.frame-reka-select-popup.                                                                                                           | `.frame-select-popup.frame-reka-select-popup`                                                                                                                                                                                                                                                                                                            |
| `--frame-control-radius`                                   | `frame.control.radius`                                   | `var(--frame-radius-medium)`                                                                 | Corner radius for .frame-select-popup.frame-reka-select-popup.                                                                                                          | `.frame-select-popup.frame-reka-select-popup`                                                                                                                                                                                                                                                                                                            |
| `--frame-overlay-shadow`                                   | `frame.overlay.shadow`                                   | `0 6px 18px #0005`                                                                           | Elevation shadow for .frame-select-popup.frame-reka-select-popup.                                                                                                       | `.frame-select-popup.frame-reka-select-popup`                                                                                                                                                                                                                                                                                                            |
| `--frame-overlay-background`                               | `frame.overlay.background`                               | `color-mix(in srgb, var(--frame-overlay-surface) 83%, transparent)`                          | Shared translucent fill for floating surfaces over the application canvas.                                                                                              | `.frame-select-popup.frame-reka-select-popup`                                                                                                                                                                                                                                                                                                            |
| `--frame-radius-medium`                                    | `frame.radius.medium`                                    | `4px`                                                                                        | Medium shared corner radius used by ordinary controls.                                                                                                                  | `.frame-select-popup.frame-reka-select-popup`                                                                                                                                                                                                                                                                                                            |
| `--frame-gap`                                              | `frame.gap`                                              | `6px`                                                                                        | Space between children for .frame-select-options .frame-reka-select-item.                                                                                               | `.frame-select-options .frame-reka-select-item`                                                                                                                                                                                                                                                                                                          |
| `--frame-accent`                                           | `frame.accent`                                           | `#0078d4`                                                                                    | Background for .frame-select-options .frame-reka-select-item[data-highlighted].                                                                                         | `.frame-select-options .frame-reka-select-item[data-highlighted]`                                                                                                                                                                                                                                                                                        |
| `--frame-text`                                             | `frame.text`                                             | `#fff`                                                                                       | Foreground for .frame-select-options .frame-reka-select-item[data-highlighted].                                                                                         | `.frame-select-options .frame-reka-select-item[data-highlighted]`                                                                                                                                                                                                                                                                                        |
| `--frame-line`                                             | `frame.line`                                             | `#454545`                                                                                    | Background for .frame-select-separator.                                                                                                                                 | `.frame-select-separator`                                                                                                                                                                                                                                                                                                                                |
| `--frame-select-popup-background`                          | `frame.select.popup.background`                          | `var(--frame-menu-background)`                                                               | Surface behind the select option list.                                                                                                                                  | `.frame-select-popup.frame-reka-select-popup.frame-select-content`                                                                                                                                                                                                                                                                                       |
| `--frame-select-popup-border`                              | `frame.select.popup.border`                              | `1px solid var(--frame-menu-border)`                                                         | Border around the select popup.                                                                                                                                         | `.frame-select-popup.frame-reka-select-popup.frame-select-content`                                                                                                                                                                                                                                                                                       |
| `--frame-menu-border-radius`                               | `frame.menu.border.radius`                               | `var(--frame-radius-large)`                                                                  | Fallback for: Corner radius of the select popup.                                                                                                                        | `.frame-select-popup.frame-reka-select-popup.frame-select-content`                                                                                                                                                                                                                                                                                       |
| `--frame-select-popup-border-radius`                       | `frame.select.popup.border.radius`                       | `var(     --frame-menu-border-radius,     var(--frame-radius-large)   )`                     | Corner radius of the select popup.                                                                                                                                      | `.frame-select-popup.frame-reka-select-popup.frame-select-content`                                                                                                                                                                                                                                                                                       |
| `--frame-menu-box-shadow`                                  | `frame.menu.box.shadow`                                  | `0 6px 22px #0005`                                                                           | Fallback for: Elevation shadow of the select popup.                                                                                                                     | `.frame-select-popup.frame-reka-select-popup.frame-select-content`                                                                                                                                                                                                                                                                                       |
| `--frame-select-popup-box-shadow`                          | `frame.select.popup.box.shadow`                          | `var(     --frame-menu-box-shadow,     0 6px 22px #0005   )`                                 | Elevation shadow of the select popup.                                                                                                                                   | `.frame-select-popup.frame-reka-select-popup.frame-select-content`                                                                                                                                                                                                                                                                                       |
| `--frame-select-popup-backdrop-filter`                     | `frame.select.popup.backdrop.filter`                     | `blur(18px) saturate(110%)`                                                                  | Backdrop treatment behind the select popup.                                                                                                                             | `.frame-select-popup.frame-reka-select-popup.frame-select-content`                                                                                                                                                                                                                                                                                       |
| `--frame-menu-background`                                  | `frame.menu.background`                                  | `var(--frame-overlay-background)`                                                            | Surface behind floating menu containers, following the shared overlay background.                                                                                       | `.frame-select-popup.frame-reka-select-popup.frame-select-content`                                                                                                                                                                                                                                                                                       |
| `--frame-menu-border`                                      | `frame.menu.border`                                      | `var(--frame-border-color)`                                                                  | Border color around floating menus, independently overridable from control borders.                                                                                     | `.frame-select-popup.frame-reka-select-popup.frame-select-content`                                                                                                                                                                                                                                                                                       |
| `--frame-radius-large`                                     | `frame.radius.large`                                     | `7px`                                                                                        | Large shared corner radius used by panel and menu containers.                                                                                                           | `.frame-select-popup.frame-reka-select-popup.frame-select-content`                                                                                                                                                                                                                                                                                       |
| `--frame-spacing-small`                                    | `frame.spacing.small`                                    | `4px`                                                                                        | Fallback for: Inset around the list of select options. Used when --frame-menu-padding is unset.                                                                         | `.frame-select-content .frame-select-options`                                                                                                                                                                                                                                                                                                            |
| `--frame-menu-padding`                                     | `frame.menu.padding`                                     | `var(     --frame-spacing-small,     4px   )`                                                | Fallback for: Inset around the list of select options.                                                                                                                  | `.frame-select-content .frame-select-options`                                                                                                                                                                                                                                                                                                            |
| `--frame-select-options-padding`                           | `frame.select.options.padding`                           | `var(     --frame-menu-padding,     var(     --frame-spacing-small,     4px   )   )`         | Inset around the list of select options.                                                                                                                                | `.frame-select-content .frame-select-options`                                                                                                                                                                                                                                                                                                            |
| `--frame-menu-row-button-padding`                          | `frame.menu.row.button.padding`                          | `3px 6px`                                                                                    | Fallback for: Internal spacing of each select option row.                                                                                                               | `.frame-select-content .frame-select-options .frame-reka-select-item`                                                                                                                                                                                                                                                                                    |
| `--frame-select-item-padding`                              | `frame.select.item.padding`                              | `var(     --frame-menu-row-button-padding,     3px 6px   )`                                  | Internal spacing of each select option row.                                                                                                                             | `.frame-select-content .frame-select-options .frame-reka-select-item`                                                                                                                                                                                                                                                                                    |
| `--frame-menu-row-button-min-height`                       | `frame.menu.row.button.min.height`                       | `25px`                                                                                       | Fallback for: Minimum height of a select option row.                                                                                                                    | `.frame-select-content .frame-select-options .frame-reka-select-item`                                                                                                                                                                                                                                                                                    |
| `--frame-select-item-min-height`                           | `frame.select.item.min.height`                           | `var(     --frame-menu-row-button-min-height,     25px   )`                                  | Minimum height of a select option row.                                                                                                                                  | `.frame-select-content .frame-select-options .frame-reka-select-item`                                                                                                                                                                                                                                                                                    |
| `--frame-menu-row-button-border-radius`                    | `frame.menu.row.button.border.radius`                    | `var(     --frame-radius-medium   )`                                                         | Fallback for: Corner radius of a select option row.                                                                                                                     | `.frame-select-content .frame-select-options .frame-reka-select-item`                                                                                                                                                                                                                                                                                    |
| `--frame-select-item-radius`                               | `frame.select.item.radius`                               | `var(     --frame-menu-row-button-border-radius,     var(     --frame-radius-medium   )   )` | Corner radius of a select option row.                                                                                                                                   | `.frame-select-content .frame-select-options .frame-reka-select-item`                                                                                                                                                                                                                                                                                    |
| `--frame-menu-row-button-font-size`                        | `frame.menu.row.button.font.size`                        | `12px`                                                                                       | Fallback for: Text size in a select option row.                                                                                                                         | `.frame-select-content .frame-select-options .frame-reka-select-item`                                                                                                                                                                                                                                                                                    |
| `--frame-select-item-font-size`                            | `frame.select.item.font.size`                            | `var(     --frame-menu-row-button-font-size,     12px   )`                                   | Text size in a select option row.                                                                                                                                       | `.frame-select-content .frame-select-options .frame-reka-select-item`                                                                                                                                                                                                                                                                                    |
| `--frame-radius-medium`                                    | `frame.radius.medium`                                    | `4px`                                                                                        | Medium shared corner radius used by ordinary controls.                                                                                                                  | `.frame-select-content .frame-select-options .frame-reka-select-item`                                                                                                                                                                                                                                                                                    |
| `--frame-quick-selection`                                  | `frame.quick.selection`                                  | `var(--frame-accent)`                                                                        | Fallback for: Surface of an enabled highlighted select option.                                                                                                          | `.frame-select-content   .frame-select-options   .frame-reka-select-item[data-highlighted]:not([data-disabled])`                                                                                                                                                                                                                                         |
| `--frame-select-item-highlight-background`                 | `frame.select.item.highlight.background`                 | `var(     --frame-quick-selection,     var(--frame-accent)   )`                              | Surface of an enabled highlighted select option.                                                                                                                        | `.frame-select-content   .frame-select-options   .frame-reka-select-item[data-highlighted]:not([data-disabled])`                                                                                                                                                                                                                                         |
| `--frame-select-item-highlight-color`                      | `frame.select.item.highlight.color`                      | `var(     --frame-accent-foreground   )`                                                     | Foreground of an enabled highlighted select option.                                                                                                                     | `.frame-select-content   .frame-select-options   .frame-reka-select-item[data-highlighted]:not([data-disabled])`                                                                                                                                                                                                                                         |
| `--frame-accent`                                           | `frame.accent`                                           | `#0078d4`                                                                                    | Shared interaction color for keyboard focus, active actions, and accent-filled controls.                                                                                | `.frame-select-content   .frame-select-options   .frame-reka-select-item[data-highlighted]:not([data-disabled])`                                                                                                                                                                                                                                         |
| `--frame-accent-foreground`                                | `frame.accent.foreground`                                | `#ffffff`                                                                                    | Readable text and icon foreground on accent-filled surfaces.                                                                                                            | `.frame-select-content   .frame-select-options   .frame-reka-select-item[data-highlighted]:not([data-disabled])`                                                                                                                                                                                                                                         |
| `--frame-select-popup-solid-background`                    | `frame.select.popup.solid.background`                    | `var(--frame-surface)`                                                                       | Opaque select popup surface when reduced transparency is requested.                                                                                                     | `@media (prefers-reduced-transparency: reduce) { .frame-select-popup.frame-reka-select-popup.frame-select-content }`                                                                                                                                                                                                                                     |
| `--frame-surface`                                          | `frame.surface`                                          | `#181818`                                                                                    | Neutral raised surface behind grouped content and control compositions.                                                                                                 | `@media (prefers-reduced-transparency: reduce) { .frame-select-popup.frame-reka-select-popup.frame-select-content }`                                                                                                                                                                                                                                     |
| `--frame-control-border`                                   | `frame.control.border`                                   | `var(--frame-line)`                                                                          | Right border for .frame-number-field > .frame-control-button:first-child.                                                                                               | `.frame-number-field > .frame-control-button:first-child`                                                                                                                                                                                                                                                                                                |
| `--frame-line`                                             | `frame.line`                                             | `#2b2b2b`                                                                                    | Neutral divider color for content boundaries, tracks, and structural separators.                                                                                        | `.frame-number-field > .frame-control-button:first-child`                                                                                                                                                                                                                                                                                                |
| `--frame-control-border`                                   | `frame.control.border`                                   | `var(--frame-line)`                                                                          | Left border for .frame-number-field > .frame-control-button:last-child.                                                                                                 | `.frame-number-field > .frame-control-button:last-child`                                                                                                                                                                                                                                                                                                 |
| `--frame-line`                                             | `frame.line`                                             | `#2b2b2b`                                                                                    | Neutral divider color for content boundaries, tracks, and structural separators.                                                                                        | `.frame-number-field > .frame-control-button:last-child`                                                                                                                                                                                                                                                                                                 |
| `--frame-menu-hover`                                       | `frame.menu.hover`                                       | `var(--frame-line)`                                                                          | Background for .frame-number-field .frame-control-button:hover:not([data-disabled]).                                                                                    | `.frame-number-field .frame-control-button:hover:not([data-disabled])`                                                                                                                                                                                                                                                                                   |
| `--frame-line`                                             | `frame.line`                                             | `#2b2b2b`                                                                                    | Neutral divider color for content boundaries, tracks, and structural separators.                                                                                        | `.frame-number-field .frame-control-button:hover:not([data-disabled])`                                                                                                                                                                                                                                                                                   |
| `--frame-accent`                                           | `frame.accent`                                           | `#0078d4`                                                                                    | Shared interaction color for keyboard focus, active actions, and accent-filled controls.                                                                                | `.frame-number-field .frame-control-button:focus-visible`                                                                                                                                                                                                                                                                                                |
| `--frame-control-border`                                   | `frame.control.border`                                   | `var(--frame-line)`                                                                          | Top border for .frame-number-steppers > .frame-control-button + .frame-control-button.                                                                                  | `.frame-number-steppers > .frame-control-button + .frame-control-button`                                                                                                                                                                                                                                                                                 |
| `--frame-line`                                             | `frame.line`                                             | `#2b2b2b`                                                                                    | Neutral divider color for content boundaries, tracks, and structural separators.                                                                                        | `.frame-number-steppers > .frame-control-button + .frame-control-button`                                                                                                                                                                                                                                                                                 |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->

### Additional styling guidance

#### Parts and selectors

| Selector                      | Part         | Placement                                                                        |
| ----------------------------- | ------------ | -------------------------------------------------------------------------------- |
| `.frame-combobox-anchor`      | Anchor       | See attribute routing in Anatomy; internal parts have no independent attrs prop. |
| `.frame-form-input`           | Input        | See attribute routing in Anatomy; internal parts have no independent attrs prop. |
| `.frame-control-button`       | Trigger      | See attribute routing in Anatomy; internal parts have no independent attrs prop. |
| `.frame-select-popup`         | Content base | See attribute routing in Anatomy; internal parts have no independent attrs prop. |
| `.frame-reka-select-popup`    | Content      | See attribute routing in Anatomy; internal parts have no independent attrs prop. |
| `.frame-select-options`       | Viewport     | See attribute routing in Anatomy; internal parts have no independent attrs prop. |
| `.frame-reka-select-item`     | Item         | See attribute routing in Anatomy; internal parts have no independent attrs prop. |
| `.frame-select-separator`     | Separator    | See attribute routing in Anatomy; internal parts have no independent attrs prop. |
| `.frame-select-options small` | Item detail  | See attribute routing in Anatomy; internal parts have no independent attrs prop. |

The popup uses shared Reka select rules but does not use the newer FrameSelect-specific frame-select-content rules. Trigger and popup are separate DOM subtrees; a class on Input does not style either.

#### Variables

| Token key                            | Variable                                                   | Value kind  | Default/fallback                                                                                                            | Part/effect                                                        | Scope/limits                                                                                             | Description                                                              |
| ------------------------------------ | ---------------------------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `--frame-accent`                     | `--frame-accent`                                           | color       | Catalog: `#0078d4`. CSS fallback: `#0078d4`                                                                                 | Input/Trigger outline; Item background                             | Shared with other controls using the same variable. State selectors: :focus-visible, [data-highlighted]. | Sets Input/Trigger outline; Item background.                             |
| `--frame-control-background`         | `--frame-control-background`                               | color       | Catalog: `#1d1d1d`. CSS fallback: `#1d1d1d`                                                                                 | Input background                                                   | Shared with other controls using the same variable.                                                      | Sets Input background.                                                   |
| `--frame-control-border`             | `--frame-control-border`                                   | color       | Catalog: `var(--frame-border-color)`. CSS fallback: `#3c4246`                                                               | Input border-color                                                 | Shared with other controls using the same variable.                                                      | Sets Input border-color.                                                 |
| `--frame-control-padding-x`          | `--frame-control-padding-x`                                | length      | Catalog: `calc(var(--frame-spacing-unit) * 2.5)`. CSS fallback: `10px`                                                      | Input/Trigger padding                                              | Shared with other controls using the same variable.                                                      | Sets Input/Trigger padding.                                              |
| `--frame-control-padding-y`          | `--frame-control-padding-y`                                | length      | Catalog: `calc(var(--frame-spacing-unit) * 1.25)`. CSS fallback: `5px`                                                      | Input/Trigger padding                                              | Shared with other controls using the same variable.                                                      | Sets Input/Trigger padding.                                              |
| `--frame-control-radius`             | `--frame-control-radius`                                   | length      | Catalog: `var(--frame-radius-medium)`. CSS fallback: `var(--frame-radius-medium)`                                           | Trigger border-radius; Content border-radius                       | Shared with other controls using the same variable.                                                      | Sets Trigger border-radius; Content border-radius.                       |
| `--frame-control-text`               | `--frame-control-text`                                     | color       | Catalog: `#d4d4d4`. CSS fallback: `#d4d4d4`                                                                                 | Input color                                                        | Shared with other controls using the same variable.                                                      | Sets Input color.                                                        |
| CSS only                             | `--frame-form-input-radius`                                | length      | CSS fallback: `var(--frame-input-radius)`                                                                                   | Input border-radius                                                | CSS only; absent from JSON token allowlist.                                                              | Sets Input border-radius.                                                |
| `--frame-gap`                        | `--frame-gap`                                              | length      | Catalog: `calc(var(--frame-spacing-unit) * 1.5)`. CSS fallback: `6px`                                                       | Anchor gap; Item gap                                               | Shared with other controls using the same variable.                                                      | Sets Anchor gap; Item gap.                                               |
| `--frame-input-radius`               | `--frame-input-radius`                                     | length      | Catalog: `var(--frame-menu-border-radius)`. No local fallback; resolves from the cascade.                                   | Input border-radius                                                | Shared with other controls using the same variable.                                                      | Sets Input border-radius.                                                |
| `--frame-line`                       | `--frame-line`                                             | color       | Catalog: `#2b2b2b`. CSS fallback: `#3c4246`; `#454545`                                                                      | Separator background; Trigger border; Content border-color         | Shared with other controls using the same variable.                                                      | Sets Separator background; Trigger border; Content border-color.         |
| `--frame-overlay-backdrop-filter`    | `--frame-overlay-backdrop-filter`                          | filter      | Catalog: `blur(10px) saturate(110%)`. No local fallback; resolves from the cascade.                                         | Content base backdrop-filter; Content base -webkit-backdrop-filter | Shared with other controls using the same variable.                                                      | Sets Content base backdrop-filter; Content base -webkit-backdrop-filter. |
| `--frame-overlay-background`         | `--frame-overlay-background`                               | color       | Catalog: `color-mix(in srgb, var(--frame-overlay-surface) 83%, transparent)`. No local fallback; resolves from the cascade. | Content background                                                 | Shared with other controls using the same variable.                                                      | Sets Content background.                                                 |
| `--frame-overlay-shadow`             | `--frame-overlay-shadow`                                   | shadow      | Catalog: `0 14px 50px #0006`. CSS fallback: `0 6px 18px #0005`                                                              | Content box-shadow                                                 | Shared with other controls using the same variable.                                                      | Sets Content box-shadow.                                                 |
| `--frame-radius-medium`              | `--frame-radius-medium`                                    | length      | Catalog: `4px`. No local fallback; resolves from the cascade.                                                               | Trigger border-radius; Content border-radius                       | Shared with other controls using the same variable.                                                      | Sets Trigger border-radius; Content border-radius.                       |
| CSS only                             | `--frame-select-options-frame-select-separator-height`     | length      | CSS fallback: `1px`                                                                                                         | Separator height                                                   | CSS only; absent from JSON token allowlist.                                                              | Sets Separator height.                                                   |
| CSS only                             | `--frame-select-options-frame-select-separator-margin`     | CSS spacing | CSS fallback: `5px 0`                                                                                                       | Separator margin                                                   | CSS only; absent from JSON token allowlist.                                                              | Sets Separator margin.                                                   |
| CSS only                             | `--frame-select-options-frame-select-separator-min-height` | length      | CSS fallback: `1px`                                                                                                         | Separator min-height                                               | CSS only; absent from JSON token allowlist.                                                              | Sets Separator min-height.                                               |
| CSS only                             | `--frame-select-options-frame-select-separator-padding`    | CSS spacing | CSS fallback: `0`                                                                                                           | Separator padding                                                  | CSS only; absent from JSON token allowlist.                                                              | Sets Separator padding.                                                  |
| CSS only                             | `--frame-select-options-min-height`                        | length      | CSS fallback: `0`                                                                                                           | Viewport min-height                                                | CSS only; absent from JSON token allowlist.                                                              | Sets Viewport min-height.                                                |
| `--frame-select-options-small-color` | `--frame-select-options-small-color`                       | color       | Catalog: `#999`. CSS fallback: `#999`                                                                                       | Item detail color                                                  | Shared with other controls using the same variable.                                                      | Sets Item detail color.                                                  |
| CSS only                             | `--frame-select-options-small-font-size`                   | length      | CSS fallback: `11px`                                                                                                        | Item detail font-size                                              | CSS only; absent from JSON token allowlist.                                                              | Sets Item detail font-size.                                              |
| `--frame-surface`                    | `--frame-surface`                                          | color       | Catalog: `#181818`. CSS fallback: `#242424`                                                                                 | Trigger background                                                 | Shared with other controls using the same variable.                                                      | Sets Trigger background.                                                 |
| `--frame-text`                       | `--frame-text`                                             | color       | Catalog: `#cccccc`. CSS fallback: `#ccc`; `#fff`                                                                            | Trigger color; Content color; Item color                           | Shared with other controls using the same variable. State selectors: [data-highlighted].                 | Sets Trigger color; Content color; Item color.                           |

See [theme variables](../../styling/theme-variables.md) for theme authoring.
