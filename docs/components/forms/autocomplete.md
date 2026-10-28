# FrameAutocomplete

A text input with suggestions. The model is the entered string, including text that does not match any suggestion.

## Features

### Anatomy

```text
FrameAutocomplete
AutocompleteRoot
├─ AutocompleteAnchor (asChild → div; overlay reference)
│  └─ AutocompleteInput
└─ AutocompletePortal (Frame overlay target or body)
   └─ AutocompleteContent (popper)
      ├─ AutocompleteItem × filtered options
      └─ AutocompleteEmpty (fixed message)
```

Caller attributes, including class/style, fall through to Root. They do not configure Input or Content. The label and placeholder props are routed to Input. These Reka parts are internal composition, not separately exported Frame building blocks.

### Basic usage

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { FrameAutocomplete } from '@frame/core';
import '@frame/core/style.css';

const value = ref('');
</script>

<template>
  <FrameAutocomplete v-model="value" label="Language" :options="['Vue', 'Rust', 'TypeScript']" />
  <p>Entered: {{ value }}</p>
</template>
```

Load the stylesheet once per application. This component works without a Frame instance.

### Suggestions and free text

Bind `v-model` for predictable Frame filtering. Frame performs a case-insensitive substring match using `props.modelValue`; Reka then applies its own filter unless `ignoreFilter` is true. `ignoreFilter` disables only Reka’s filter, not Frame’s substring pass. Uncontrolled `defaultValue` is accepted by Reka, but Frame’s candidate list does not track subsequent internal text changes without a bound model.

Use distinct, nonempty suggestions: each string is both the Vue key and item value. There is no option-level disabled metadata, custom item slot, remote-query hook, or validation that text belongs to the list. Update `options` from the host if suggestions come from a service.

### Popup and keyboard behavior

Typing opens suggestions; Arrow Up/Down opens or navigates the list, Enter accepts a highlighted suggestion, and Escape dismisses. IME composition is handled by Reka before processing committed input. `openOnFocus` and `openOnClick` default to false; `v-model:open` is supported. Hover highlighting defaults to true.

The fixed empty message is “No matching suggestions”. Popups use Frame’s overlay boundary when injected, otherwise the standalone portal target. Content is positioned with an 8px collision inset and 4px side offset; wrapper height is capped at 260px and the available boundary height minus 16px. Popup state is local to this control.

### Forms and accessibility

`label` names the textbox; render visible explanatory text separately when needed. Root supports `name` and `required` through Reka’s field/form integration. A free-text model is not an allowed-choice constraint. Native input attributes passed to Frame land on Root, so attributes such as input `type`, `autocomplete`, or `maxlength` do not configure the inner textbox.

### Open on focus

This example reuses Basic usage state. The host still retains free text; opening the popup does not select a suggestion.

```vue
<FrameAutocomplete v-model="value" label="Language" :options="['Vue', 'Rust']" open-on-focus />
```

### Free text with suggestions

Select a fruit, or type a new name and leave the field. The text remains the value even without a match.

<!-- frame:example id="autocomplete.free-text" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameAutocomplete } from '@frame/core';
const demoModelValue = ref("");
const demoOptions = [
  "Apple",
  "Apricot",
  "Banana",
  "Blueberry",
  "Grapes"
];
const demoOpenOnFocus = true;
</script>
<template>
<FrameAutocomplete v-model="demoModelValue" :options="demoOptions" :label="&quot;Fruit&quot;" :placeholder="&quot;Type or choose a fruit&quot;" :open-on-focus="demoOpenOnFocus" />
</template>
```

### Filtered suggestions and empty results

Start with “ap”, then replace it with “pear”. The list narrows and displays its empty message when nothing matches.

<!-- frame:example id="autocomplete.matching" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameAutocomplete } from '@frame/core';
const demoModelValue = ref("ap");
const demoOptions = [
  "Apple",
  "Apricot",
  "Banana",
  "Blueberry",
  "Grapes"
];
const demoOpenOnFocus = true;
</script>
<template>
<FrameAutocomplete v-model="demoModelValue" :options="demoOptions" :label="&quot;Fruit search&quot;" :open-on-focus="demoOpenOnFocus" />
</template>
```

### Open on focus

Tab into the input to see suggestions before typing. This suits short lists users may want to browse.

<!-- frame:example id="autocomplete.focus-behavior" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameAutocomplete } from '@frame/core';
const demoModelValue = ref("");
const demoOptions = [
  "Apple",
  "Apricot",
  "Banana",
  "Blueberry",
  "Grapes"
];
const demoOpenOnFocus = true;
const demoOpenOnClick = true;
</script>
<template>
<FrameAutocomplete v-model="demoModelValue" :options="demoOptions" :label="&quot;Browse suggestions&quot;" :open-on-focus="demoOpenOnFocus" :open-on-click="demoOpenOnClick" />
</template>
```

## APIs

<!-- frame:generated api="autocomplete" -->

### FrameAutocomplete

Source: `packages/core/src/components/forms/FrameAutocomplete.vue`

#### Properties

| Name                    | Type                              | Default  | Description                                                                                                                                                                                          |
| ----------------------- | --------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `modelValue`            | `string \| undefined`             | Omitted  | The controlled value of the Autocomplete (the input text). Can be bound with `v-model`.                                                                                                              |
| `defaultValue`          | `string \| undefined`             | Omitted  | The value of the autocomplete when initially rendered. Use when you do not need to control the state.                                                                                                |
| `open`                  | `boolean \| undefined`            | false    | The controlled open state of the Autocomplete. Can be bound with `v-model:open`.                                                                                                                     |
| `defaultOpen`           | `boolean \| undefined`            | false    | The open state of the autocomplete when it is initially rendered. Use when you do not need to control its open state.                                                                                |
| `disabled`              | `boolean \| undefined`            | false    | When `true`, prevents the user from interacting with autocomplete                                                                                                                                    |
| `dir`                   | `Direction \| undefined`          | Omitted  | The reading direction of the autocomplete when applicable.                                                                                                                                           |
| `name`                  | `string \| undefined`             | Omitted  | The name of the field. Submitted with its owning form as part of a name/value pair.                                                                                                                  |
| `required`              | `boolean \| undefined`            | false    | When `true`, indicates that the user must set the value before the owning form can be submitted.                                                                                                     |
| `resetSearchTermOnBlur` | `boolean \| undefined`            | false    | Whether to reset the searchTerm when the Autocomplete input blurred defaultValue: `false`                                                                                                            |
| `openOnFocus`           | `boolean \| undefined`            | false    | Whether to open the autocomplete when the input is focused defaultValue: `false`                                                                                                                     |
| `openOnClick`           | `boolean \| undefined`            | false    | Whether to open the autocomplete when the input is clicked defaultValue: `false`                                                                                                                     |
| `ignoreFilter`          | `boolean \| undefined`            | false    | When `true`, disable the default filters                                                                                                                                                             |
| `highlightOnHover`      | `boolean \| undefined`            | false    | When `true`, hover over item will trigger highlight                                                                                                                                                  |
| `loop`                  | `boolean \| undefined`            | false    | When `true`, keyboard navigation will loop from last item to first, and vice versa.                                                                                                                  |
| `asChild`               | `boolean \| undefined`            | false    | Change the default rendered element for the one passed as a child, merging their props and behavior. Read our [Composition](https://www.reka-ui.com/docs/guides/composition) guide for more details. |
| `as`                    | `Component \| AsTag \| undefined` | "div"    | The element or component this component should render as. Can be overwritten by `asChild`. defaultValue: "div"                                                                                       |
| `options`               | `readonly string[]`               | Required | Text suggestions filtered against the current input value.                                                                                                                                           |
| `label`                 | `string`                          | Required | Accessible name of the autocomplete input.                                                                                                                                                           |
| `placeholder`           | `string \| undefined`             | Omitted  | Hint displayed while the editable value is empty.                                                                                                                                                    |

#### Events

| Name                | Parameters                                                   | Return type | Description                                                           |
| ------------------- | ------------------------------------------------------------ | ----------- | --------------------------------------------------------------------- |
| `update:modelValue` | `value: string`                                              | `void`      | Event handler called when the value changes.                          |
| `update:open`       | `value: boolean`                                             | `void`      | Event handler called when the open state of the autocomplete changes. |
| `highlight`         | `payload: { ref: HTMLElement; value: string; } \| undefined` | `void`      | Event handler when highlighted element changes.                       |

#### Slots

No declared entries.

#### Exposed API

No declared entries.

<!-- /frame:generated -->

### Composition and upstream reference

Defaults below are Reka reference defaults unless a Frame override is stated. Declared means a typed Frame prop/event; Forwarded means attribute/listener fallthrough to the named part; Internal means generated by Frame; Absent means not routed or composed. Generic upstream `T`/`AcceptableValue` describes Reka, not a promise of arbitrary option values in Frame.

#### Root

#### Props

| Prop                    | Reka type            | Reka required/default | Availability | Frame behavior                                                                                        |
| ----------------------- | -------------------- | --------------------- | ------------ | ----------------------------------------------------------------------------------------------------- |
| `as`                    | `AsTag \| Component` | "div"                 | Declared     | Element/component used to render this part.                                                           |
| `asChild`               | `boolean`            | -                     | Declared     | Typed upstream composition option; fixed generated children are not a public custom-composition slot. |
| `defaultOpen`           | `boolean`            | -                     | Declared     | Initial popup visibility when open is uncontrolled.                                                   |
| `defaultValue`          | `string`             | -                     | Declared     | Initial uncontrolled value upstream; does not override a supplied controlled model.                   |
| `dir`                   | `"ltr" \| "rtl"`     | -                     | Declared     | Reading/navigation direction; inherits Reka configuration or LTR when unset.                          |
| `disabled`              | `boolean`            | -                     | Declared     | Disable interaction for this part and its participating descendants.                                  |
| `highlightOnHover`      | `boolean`            | true                  | Declared     | Let pointer hover move the active highlight.                                                          |
| `ignoreFilter`          | `boolean`            | -                     | Declared     | Skip Reka’s own candidate filter; does not bypass Frame filtering.                                    |
| `loop`                  | `boolean`            | -                     | Declared     | Wrap keyboard navigation at collection endpoints.                                                     |
| `modelValue`            | `string`             | -                     | Declared     | Controlled value; updates require the host to retain the emitted value.                               |
| `name`                  | `string`             | -                     | Declared     | Submitted/registered field identity.                                                                  |
| `open`                  | `boolean`            | -                     | Declared     | Controlled popup visibility.                                                                          |
| `openOnClick`           | `boolean`            | false                 | Declared     | Open suggestions when the input is clicked.                                                           |
| `openOnFocus`           | `boolean`            | false                 | Declared     | Open suggestions when the input gains focus.                                                          |
| `required`              | `boolean`            | -                     | Declared     | Participate in the owning form’s required-value constraint.                                           |
| `resetSearchTermOnBlur` | `boolean`            | false                 | Declared     | Restore the input search display when focus leaves.                                                   |

#### Emits

| Event               | Payload                                                       | Availability | Behavior                                                                                                     |
| ------------------- | ------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------ |
| `highlight`         | `[payload: { ref: HTMLElement; value: string } \| undefined]` | Declared     | Active highlighted item changed; includes its element and value, or undefined when cleared. Not cancellable. |
| `update:modelValue` | `[value: string]`                                             | Declared     | Value changed; retain it in host state. Not cancellable.                                                     |
| `update:open`       | `[value: boolean]`                                            | Declared     | Popup visibility changed. Not cancellable.                                                                   |

#### Slots

| Default-slot field | Reka type | Frame availability                             |
| ------------------ | --------- | ---------------------------------------------- |
| `open`             | `boolean` | Internal; not passed to the Frame caller slot. |
| `modelValue`       | `string`  | Internal; not passed to the Frame caller slot. |

#### Data attributes

| Attribute       | Values/presence         | Meaning                      |
| --------------- | ----------------------- | ---------------------------- |
| `data-disabled` | `Present when disabled` | Inherited ListboxRoot state. |

#### Exposed methods

Frame does not defineExpose or forward the internal Reka instance. Do not depend on internal Reka methods/refs through a Frame component ref.

#### Anchor

#### Props

| Prop        | Reka type            | Reka required/default | Availability | Frame behavior                                                                                     |
| ----------- | -------------------- | --------------------- | ------------ | -------------------------------------------------------------------------------------------------- |
| `as`        | `AsTag \| Component` | "div"                 | Internal     | Element/component used to render this part. Not independently configurable through Frame.          |
| `asChild`   | `boolean`            | -                     | Internal     | true; wraps the anchor div. Not independently configurable through Frame.                          |
| `reference` | `ReferenceElement`   | -                     | Internal     | Anchor element or virtual reference for positioning. Not independently configurable through Frame. |

#### Emits

No component emits on this part. Native bubbling listeners are not additional component emits.

#### Slots

Underlying default content has no documented scoped fields. Frame generates this part’s content; no caller slot targets it independently.

#### Data attributes

No component state data attributes are defined on this part. Inherited native/ARIA attributes are not data attributes.

#### Input

#### Props

| Prop         | Reka type            | Reka required/default | Availability | Frame behavior                                                                                                       |
| ------------ | -------------------- | --------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------- |
| `as`         | `AsTag \| Component` | "input"               | Internal     | Element/component used to render this part. Not independently configurable through Frame.                            |
| `asChild`    | `boolean`            | -                     | Internal     | Merge the part behavior into one child instead of rendering a wrapper. Not independently configurable through Frame. |
| `autoFocus`  | `boolean`            | -                     | Internal     | Focus the input after mount. Not independently configurable through Frame.                                           |
| `disabled`   | `boolean`            | -                     | Internal     | Disable interaction for this part and its participating descendants. Not independently configurable through Frame.   |
| `modelValue` | `string`             | -                     | Internal     | Reka coordinates text with Root; no independent Frame input model. Not independently configurable through Frame.     |

#### Emits

| Event               | Payload    | Availability | Behavior                                                                                                                              |
| ------------------- | ---------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `update:modelValue` | `[string]` | Internal     | Value changed; retain it in host state. Not cancellable. Not forwarded as a Frame event; caller cannot cancel this internal emission. |

#### Slots

Underlying default content has no documented scoped fields. Frame generates this part’s content; no caller slot targets it independently.

#### Data attributes

| Attribute       | Values/presence         | Meaning                    |
| --------------- | ----------------------- | -------------------------- |
| `data-disabled` | `Present when disabled` | ListboxFilter input state. |

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
| `sideOffset`                  | `number`                                                                    | -                     | Internal     | 4px. Not independently configurable through Frame.                                                                         |
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

#### Item

#### Props

| Prop        | Reka type            | Reka required/default | Availability | Frame behavior                                                                                                       |
| ----------- | -------------------- | --------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------- |
| `as`        | `AsTag \| Component` | "div"                 | Internal     | Element/component used to render this part. Not independently configurable through Frame.                            |
| `asChild`   | `boolean`            | -                     | Internal     | Merge the part behavior into one child instead of rendering a wrapper. Not independently configurable through Frame. |
| `disabled`  | `boolean`            | -                     | Internal     | Disable interaction for this part and its participating descendants. Not independently configurable through Frame.   |
| `textValue` | `string`             | -                     | Internal     | Plain text used for matching/typeahead and naming. Not independently configurable through Frame.                     |
| `value`     | `T`                  | Required upstream     | Internal     | Stable item identity used by selection. Not independently configurable through Frame.                                |

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

#### Omitted parts

`Trigger`, `Cancel`, `Viewport`, `Group`, `Label`, `Separator`, `Arrow`, `Virtualizer` are not rendered by this wrapper. Their props, slots, presence controls, and composition APIs are not available through Frame. See the [Reka reference](https://reka-ui.com/docs/components/autocomplete).

#### Frame additions

#### Props

| Prop          | Type                | Required/default | Description                                                   |
| ------------- | ------------------- | ---------------- | ------------------------------------------------------------- |
| `options`     | `readonly string[]` | Required         | Suggestions; Frame filters them by the controlled model text. |
| `label`       | `string`            | Required         | Accessible name on Input; no visible label is rendered.       |
| `placeholder` | `string`            | Unset            | Hint routed to Input.                                         |

#### Emits

No additional Frame-only events; see the part tables for declared or forwarded events.

#### Slots

No public content slots; all internal children are generated.

#### Sources and version

Checked against installed `reka-ui@2.11.0`, the [official Reka reference](https://reka-ui.com/docs/components/autocomplete), its [Markdown reference](https://reka-ui.com/docs/components/autocomplete.md), and [Frame implementation](../../../packages/core/src/components/forms/FrameAutocomplete.vue). Styling comes from [advanced.scss](../../../packages/core/src/components/forms/styles/advanced.scss) and [shared styles](../../../packages/core/src/styles/index.scss). JSON availability comes from the [token catalog](../../../packages/core/src/themes/tokens/tokenCatalog.ts).

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="autocomplete" -->

| CSS variable                                | Theme path                                | Default expression                                                                       | Purpose                                                                                                      | Context                                    |
| ------------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------ |
| `--frame-muted`                             | `frame.muted`                             | No declared default; supplied by context.                                                | Secondary foreground for descriptions, hints, and visually subordinate content.                              | `.frame-field-description`                 |
| `--frame-menu-border`                       | `frame.menu.border`                       | No declared default; supplied by context.                                                | Border color around floating menus, independently overridable from control borders.                          | `.frame-advanced-popup`                    |
| `--frame-control-radius`                    | `frame.control.radius`                    | No declared default; supplied by context.                                                | Shared corner radius of buttons and ordinary controls; text-entry surfaces may use the input radius instead. | `.frame-advanced-popup`                    |
| `--frame-menu-background`                   | `frame.menu.background`                   | No declared default; supplied by context.                                                | Surface behind floating menu containers, following the shared overlay background.                            | `.frame-advanced-popup`                    |
| `--frame-text`                              | `frame.text`                              | No declared default; supplied by context.                                                | Primary foreground for readable text and icons across shell and application content.                         | `.frame-advanced-popup`                    |
| `--frame-overlay-shadow`                    | `frame.overlay.shadow`                    | No declared default; supplied by context.                                                | Elevation shadow separating floating overlays from underlying content.                                       | `.frame-advanced-popup`                    |
| `--frame-font-body`                         | `frame.font.body`                         | No declared default; supplied by context.                                                | Primary font family inherited by shell content and ordinary controls.                                        | `.frame-advanced-popup`                    |
| `--frame-font-size-body`                    | `frame.font.size.body`                    | No declared default; supplied by context.                                                | Base text size inherited by shell content and ordinary controls.                                             | `.frame-advanced-popup`                    |
| `--frame-input-border`                      | `frame.input.border`                      | `1px solid     var(--frame-control-border)`                                              | Fallback for: Resting border of the text input.                                                              | `.frame-autocomplete-input`                |
| `--frame-autocomplete-input-border`         | `frame.autocomplete.input.border`         | `var(     --frame-input-border,     1px solid     var(--frame-control-border)   )`       | Resting border of the autocomplete-input text surface.                                                       | `.frame-autocomplete-input`                |
| `--frame-control-border`                    | `frame.control.border`                    | No declared default; supplied by context.                                                | Resting border color of form controls, independently overridable from menu borders.                          | `.frame-autocomplete-input`                |
| `--frame-autocomplete-input-border-radius`  | `frame.autocomplete.input.border.radius`  | `var(     --frame-input-radius   )`                                                      | Corner radius of the autocomplete-input text surface.                                                        | `.frame-autocomplete-input`                |
| `--frame-input-radius`                      | `frame.input.radius`                      | No declared default; supplied by context.                                                | Shared corner radius for text fields, text areas, selects, and composed input surfaces.                      | `.frame-autocomplete-input`                |
| `--frame-input-hover-border`                | `frame.input.hover.border`                | `1px solid     var(--frame-control-border)`                                              | Fallback for: Border while the pointer hovers over the text input.                                           | `.frame-autocomplete-input`                |
| `--frame-autocomplete-input-hover-border`   | `frame.autocomplete.input.hover.border`   | `var(     --frame-input-hover-border,     1px solid     var(--frame-control-border)   )` | Border while the pointer hovers of the autocomplete-input text surface.                                      | `.frame-autocomplete-input`                |
| `--frame-input-hover-outline`               | `frame.input.hover.outline`               | `none`                                                                                   | Fallback for: Outline while the pointer hovers over the text input.                                          | `.frame-autocomplete-input`                |
| `--frame-autocomplete-input-hover-outline`  | `frame.autocomplete.input.hover.outline`  | `var(     --frame-input-hover-outline,     none   )`                                     | Outline while the pointer hovers of the autocomplete-input text surface.                                     | `.frame-autocomplete-input`                |
| `--frame-input-focus-border`                | `frame.input.focus.border`                | `1px solid var(--frame-accent)`                                                          | Fallback for: Border while focus is within the text input.                                                   | `.frame-autocomplete-input`                |
| `--frame-autocomplete-input-focus-border`   | `frame.autocomplete.input.focus.border`   | `var(     --frame-input-focus-border,     1px solid var(--frame-accent)   )`             | Border while focus is within the input of the autocomplete-input text surface.                               | `.frame-autocomplete-input`                |
| `--frame-accent`                            | `frame.accent`                            | No declared default; supplied by context.                                                | Shared interaction color for keyboard focus, active actions, and accent-filled controls.                     | `.frame-autocomplete-input`                |
| `--frame-input-focus-outline`               | `frame.input.focus.outline`               | `1px solid var(--frame-accent)`                                                          | Fallback for: Focus outline of the text input.                                                               | `.frame-autocomplete-input`                |
| `--frame-autocomplete-input-focus-outline`  | `frame.autocomplete.input.focus.outline`  | `var(     --frame-input-focus-outline,     1px solid var(--frame-accent)   )`            | Outline while focus is within the input of the autocomplete-input text surface.                              | `.frame-autocomplete-input`                |
| `--frame-input-outline-offset`              | `frame.input.outline.offset`              | `0px`                                                                                    | Fallback for: Offset between the outline and the text input.                                                 | `.frame-autocomplete-input`                |
| `--frame-autocomplete-input-outline-offset` | `frame.autocomplete.input.outline.offset` | `var(     --frame-input-outline-offset,     0px   )`                                     | Offset between the outline and input of the autocomplete-input text surface.                                 | `.frame-autocomplete-input`                |
| `--frame-overlay-backdrop-filter`           | `frame.overlay.backdrop.filter`           | No declared default; supplied by context.                                                | Blur and saturation treatment behind shared translucent floating surfaces.                                   | `.frame-overlay-surface`                   |
| `--frame-control-radius`                    | `frame.control.radius`                    | No declared default; supplied by context.                                                | Shared corner radius of buttons and ordinary controls; text-entry surfaces may use the input radius instead. | `.frame-advanced-option`                   |
| `--frame-menu-hover`                        | `frame.menu.hover`                        | No declared default; supplied by context.                                                | Neutral hover and highlight fill for ordinary menu rows.                                                     | `.frame-advanced-option[data-highlighted]` |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->

### Additional styling guidance

#### Parts and selectors

| Selector                   | Part              | Placement                                                                        |
| -------------------------- | ----------------- | -------------------------------------------------------------------------------- |
| `.frame-autocomplete`      | Root              | See attribute routing in Anatomy; internal parts have no independent attrs prop. |
| `.frame-advanced-input`    | Input             | See attribute routing in Anatomy; internal parts have no independent attrs prop. |
| `.frame-advanced-popup`    | portalled Content | See attribute routing in Anatomy; internal parts have no independent attrs prop. |
| `.frame-advanced-option`   | Item              | See attribute routing in Anatomy; internal parts have no independent attrs prop. |
| `.frame-field-description` | Empty             | See attribute routing in Anatomy; internal parts have no independent attrs prop. |

Input minimum height is 28px and width is min(100%, 340px). Popup padding, row padding, collision inset, and height cap are currently fixed.

#### Variables

| Token key                         | Variable                          | Value kind | Default/fallback                                                                                 | Part/effect                                                                  | Scope/limits                                                                             | Description                                                                        |
| --------------------------------- | --------------------------------- | ---------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `--frame-accent`                  | `--frame-accent`                  | color      | Catalog: `#0078d4`. No local fallback; resolves from the cascade.                                | Input outline                                                                | Shared with other controls using the same variable. State selectors: :focus-visible.     | Sets Input outline.                                                                |
| CSS only                          | `--frame-advanced-input-radius`   | length     | CSS fallback: `var(--frame-input-radius)`                                                        | Input border-radius                                                          | CSS only; absent from JSON token allowlist.                                              | Sets Input border-radius.                                                          |
| `--frame-control-background`      | `--frame-control-background`      | color      | Catalog: `#1d1d1d`. No local fallback; resolves from the cascade.                                | Input background                                                             | Shared with other controls using the same variable.                                      | Sets Input background.                                                             |
| `--frame-control-border`          | `--frame-control-border`          | color      | Catalog: `var(--frame-border-color)`. No local fallback; resolves from the cascade.              | Input border                                                                 | Shared with other controls using the same variable.                                      | Sets Input border.                                                                 |
| `--frame-control-padding-x`       | `--frame-control-padding-x`       | length     | Catalog: `calc(var(--frame-spacing-unit) * 2.5)`. No local fallback; resolves from the cascade.  | Input padding                                                                | Shared with other controls using the same variable.                                      | Sets Input padding.                                                                |
| `--frame-control-padding-y`       | `--frame-control-padding-y`       | length     | Catalog: `calc(var(--frame-spacing-unit) * 1.25)`. No local fallback; resolves from the cascade. | Input padding                                                                | Shared with other controls using the same variable.                                      | Sets Input padding.                                                                |
| `--frame-control-radius`          | `--frame-control-radius`          | length     | Catalog: `var(--frame-radius-medium)`. No local fallback; resolves from the cascade.             | portalled Content border-radius; Item border-radius                          | Shared with other controls using the same variable.                                      | Sets portalled Content border-radius; Item border-radius.                          |
| `--frame-control-text`            | `--frame-control-text`            | color      | Catalog: `#d4d4d4`. No local fallback; resolves from the cascade.                                | Input color                                                                  | Shared with other controls using the same variable.                                      | Sets Input color.                                                                  |
| `--frame-font-body`               | `--frame-font-body`               | family     | Catalog: `"Segoe UI", sans-serif`. No local fallback; resolves from the cascade.                 | portalled Content font-family                                                | Shared with other controls using the same variable.                                      | Sets portalled Content font-family.                                                |
| `--frame-font-size-body`          | `--frame-font-size-body`          | length     | Catalog: `12px`. No local fallback; resolves from the cascade.                                   | portalled Content font-size                                                  | Shared with other controls using the same variable.                                      | Sets portalled Content font-size.                                                  |
| `--frame-input-radius`            | `--frame-input-radius`            | length     | Catalog: `var(--frame-menu-border-radius)`. No local fallback; resolves from the cascade.        | Input border-radius                                                          | Shared with other controls using the same variable.                                      | Sets Input border-radius.                                                          |
| `--frame-menu-background`         | `--frame-menu-background`         | color      | Catalog: `var(--frame-overlay-background)`. No local fallback; resolves from the cascade.        | portalled Content background                                                 | Shared with other controls using the same variable.                                      | Sets portalled Content background.                                                 |
| `--frame-menu-border`             | `--frame-menu-border`             | color      | Catalog: `var(--frame-border-color)`. No local fallback; resolves from the cascade.              | portalled Content border                                                     | Shared with other controls using the same variable.                                      | Sets portalled Content border.                                                     |
| `--frame-menu-hover`              | `--frame-menu-hover`              | color      | Catalog: `#303336`. No local fallback; resolves from the cascade.                                | Item background                                                              | Shared with other controls using the same variable. State selectors: [data-highlighted]. | Sets Item background.                                                              |
| `--frame-muted`                   | `--frame-muted`                   | color      | Catalog: `#8e9496`. No local fallback; resolves from the cascade.                                | Empty color                                                                  | Shared with other controls using the same variable.                                      | Sets Empty color.                                                                  |
| `--frame-overlay-backdrop-filter` | `--frame-overlay-backdrop-filter` | filter     | Catalog: `blur(10px) saturate(110%)`. No local fallback; resolves from the cascade.              | portalled Content backdrop-filter; portalled Content -webkit-backdrop-filter | Shared with other controls using the same variable.                                      | Sets portalled Content backdrop-filter; portalled Content -webkit-backdrop-filter. |
| `--frame-overlay-shadow`          | `--frame-overlay-shadow`          | shadow     | Catalog: `0 14px 50px #0006`. No local fallback; resolves from the cascade.                      | portalled Content box-shadow                                                 | Shared with other controls using the same variable.                                      | Sets portalled Content box-shadow.                                                 |
| `--frame-text`                    | `--frame-text`                    | color      | Catalog: `#cccccc`. No local fallback; resolves from the cascade.                                | portalled Content color                                                      | Shared with other controls using the same variable.                                      | Sets portalled Content color.                                                      |

See [theme variables](../../styling/theme-variables.md) for theme authoring.
