# FrameTagField

Edit a collection of string tags. The model contains committed tags; the text currently being typed stays inside the input until it is accepted. Frame does not provide suggestions or a separate public draft model.

## Features

### Anatomy

```text
FrameTagField
└─ TagsInputRoot (.frame-tags-input)
   ├─ TagsInputItem (.frame-tags-input-item), once per model string
   │  ├─ TagsInputItemText
   │  └─ TagsInputItemDelete (button.frame-control-button; “Remove {value}”)
   ├─ TagsInputInput (input.frame-form-input)
   └─ native form helper inputs, when named in a form
```

Frame fixes tag text/delete composition and does not include Reka TagsInputClear. There are no public slots for tags, textbox, delete button, or a clear action.

### Basic usage

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { FrameLabel, FrameTagField } from '@frame/core';
import '@frame/core/style.css';

const tags = ref<string[]>(['planning']);
</script>

<template>
  <FrameLabel for="project-tags">Project tags</FrameLabel>
  <FrameTagField
    id="project-tags" v-model="tags" label="Project tags"
    placeholder="Type a tag and press Enter"
  />
</template>
```

The forwarded Root `id` is used by its internal textbox. `label` supplies the textbox accessible name; it does not render a visible label.

### Adding and removing tags

Enter commits nonempty text. The default delimiter is comma, which also commits a tag during ordinary input. By default, merely blurring, pressing Tab, or pasting does not independently commit through the corresponding add-on options. Reka handles duplicate rejection and clears accepted text. Invalid additions do not silently become tags.

The default rejects duplicates. Keep host-assigned values unique too: Frame keys rendered tags by value, so opting into duplicate values can create duplicate Vue keys. It is not a safe assumption that an upstream duplicate option makes Frame's rendering duplicate-safe.

Backspace/Delete at the beginning of the textbox can select and then remove tags. Arrow Left/Right navigate the tag selection with direction-aware behavior; Arrow Up/Down clear that navigation selection. Delete buttons are labeled `Remove {value}` and have `tabindex="-1"`; keyboard interaction is coordinated through the textbox. This selection is navigation state, not a second model of chosen tags.

### Native forms and accessibility

With `name="tags"`, the installed helper submits indexed fields such as `tags[0]` and `tags[1]`. It submits committed tags, not the uncommitted textbox text. Disabled helpers are omitted; an empty required collection uses a validation helper. Host validation still owns application rules and messages.

Provide a visible label and/or the `label` prop. Root/Item data states support visual feedback, but a rejected tag does not automatically create an announced error message. Frame supplies delete names explicitly instead of relying on the item text association alone.

Short follow-up examples reuse the Basic usage setup unless they include their own script. Styles load once per application; these controls need no Frame instance.

### Configuration examples

These examples reuse Basic usage state. The APIs tab explains which attributes are forwarded to Reka rather than declared as Frame props.

```vue
<FrameTagField
  v-model="tags" label="Project tags" name="tags"
  :add-on-paste="true" :max="5"
  placeholder="Up to five tags"
/>
```

### Add text entries

Type a new value and press Enter to add it to the array.

<!-- frame:example id="tags-input.add" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameTagField } from '@frame/core';
const demoModelValue = ref(["Apple","Banana"]);
</script>
<template>
<FrameTagField v-model="demoModelValue" :label="&quot;Fruit tags&quot;" :placeholder="&quot;Add a fruit&quot;" />
</template>
```

### Edit an existing collection

Use a tag’s remove button, or navigate the existing tags with the keyboard.

<!-- frame:example id="tags-input.remove" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameTagField } from '@frame/core';
const demoModelValue = ref(["Apple","Banana","Blueberry"]);
</script>
<template>
<FrameTagField v-model="demoModelValue" :label="&quot;Editable tags&quot;" :placeholder="&quot;Add another&quot;" />
</template>
```

## APIs

<!-- frame:generated api="tags-input" -->

### FrameTagField

Source: `packages/core/src/components/forms/FrameTagField.vue`

#### Properties

| Name          | Type                   | Default  | Description                                                         |
| ------------- | ---------------------- | -------- | ------------------------------------------------------------------- |
| `modelValue`  | `string[]`             | Required | Controlled tag text values; updates include additions and removals. |
| `disabled`    | `boolean \| undefined` | false    | Prevents user interaction with the control.                         |
| `placeholder` | `string \| undefined`  | Omitted  | Hint displayed while the editable value is empty.                   |
| `label`       | `string \| undefined`  | Omitted  | Accessible name of the tag-entry input.                             |

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

| Prop           | Reka type                | Frame type                              | Required/default            | Availability            | Description                                                                                      |
| -------------- | ------------------------ | --------------------------------------- | --------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------ |
| `addOnBlur`    | `boolean`                | Same upstream type; undeclared in Frame | Unset in upstream reference | Forwarded               | Commit tag draft on blur.                                                                        |
| `addOnPaste`   | `boolean`                | Same upstream type; undeclared in Frame | Unset in upstream reference | Forwarded               | Commit pasted tag text.                                                                          |
| `addOnTab`     | `boolean`                | Same upstream type; undeclared in Frame | Unset in upstream reference | Forwarded               | Commit tag draft on Tab.                                                                         |
| `as`           | `AsTag \| Component`     | Same upstream type; undeclared in Frame | `"div"` (Reka)              | Forwarded / limited     | Changes Root composition, not individual children; can break Frame fixed anatomy.                |
| `asChild`      | `boolean`                | Same upstream type; undeclared in Frame | Unset in upstream reference | Forwarded / limited     | Changes Root composition, not individual children; can break Frame fixed anatomy.                |
| `convertValue` | `((value: string) => T)` | Same upstream type; undeclared in Frame | Unset in upstream reference | Forwarded / limited     | Use string results; object values are lost through Frame String normalization.                   |
| `defaultValue` | `T[]`                    | Same upstream type; undeclared in Frame | `[]` (Reka)                 | Forwarded / ineffective | Frame supplies the controlled model; this does not establish uncontrolled Frame state.           |
| `delimiter`    | `string \| RegExp`       | Same upstream type; undeclared in Frame | `","` (Reka)                | Forwarded               | String or RegExp that commits/splits tags.                                                       |
| `dir`          | `"ltr" \| "rtl"`         | Same upstream type; undeclared in Frame | Unset in upstream reference | Forwarded               | Reading/navigation direction.                                                                    |
| `disabled`     | `boolean`                | `boolean`                               | `false`                     | Declared                | Prevent interaction.                                                                             |
| `displayValue` | `((value: T) => string)` | Same upstream type; undeclared in Frame | `value.toString()` (Reka)   | Forwarded               | Format tag display text.                                                                         |
| `duplicate`    | `boolean`                | Same upstream type; undeclared in Frame | Unset in upstream reference | Forwarded / limited     | Root may accept duplicates, but Frame keys chips by value; keep host values unique.              |
| `id`           | `string`                 | Same upstream type; undeclared in Frame | Unset in upstream reference | Forwarded               | Element or form-control identity.                                                                |
| `max`          | `number`                 | Same upstream type; undeclared in Frame | `0` (Reka)                  | Forwarded               | Maximum number of user-added tags; zero means unlimited. Does not sanitize host-assigned arrays. |
| `modelValue`   | `T[] \| null`            | `string[]`                              | `Required`                  | Changed                 | Required string array; entries normalize with String.                                            |
| `name`         | `string`                 | Same upstream type; undeclared in Frame | Unset in upstream reference | Forwarded               | Native submitted field name.                                                                     |
| `required`     | `boolean`                | Same upstream type; undeclared in Frame | Unset in upstream reference | Forwarded               | Native required-value constraint.                                                                |

#### Emits

| Emit                | Reka payload     | Frame payload         | Availability       | Behavior                                                                                             |
| ------------------- | ---------------- | --------------------- | ------------------ | ---------------------------------------------------------------------------------------------------- |
| `addTag`            | `[payload: T]`   | Underlying Root value | Forwarded listener | Undeclared Root listener after accepting a tag; payload is before Frame normalization.               |
| `invalid`           | `[payload: T]`   | Underlying Root value | Forwarded listener | Undeclared Root listener for a rejected addition, not native form validation.                        |
| `removeTag`         | `[payload: T]`   | Underlying Root value | Forwarded listener | Undeclared Root listener after removing a tag; payload is before Frame normalization.                |
| `update:modelValue` | `[payload: T[]]` | string[]              | Declared / changed | Controlled-model update using the conversion described on modelValue above. Not a cancellable event. |

#### Slots

| Upstream slot | Scoped field                                                    | Frame availability                         |
| ------------- | --------------------------------------------------------------- | ------------------------------------------ |
| default       | `modelValue: string \| number \| bigint \| Record<string, any>` | Internal; payload not forwarded to callers |

#### Data attributes

| Attribute     | Value/presence                   | Meaning                     |
| ------------- | -------------------------------- | --------------------------- |
| data-invalid  | Present for rejected draft state | No automatic error message. |
| data-disabled | Present when disabled            | Root disabled state.        |
| data-focused  | Present when focus is within     | Includes child controls.    |

#### Configuration notes

The count limit applies to user additions, not an array assigned directly by the host. `addOnTab` changes keyboard behavior; enable it deliberately. Input-specific `autoFocus` and `maxLength` are not forwarded from Root into the internal textbox. `placeholder` is the explicitly routed input prop. Item `disabled`, `as`, `asChild`, and part-level composition options are not independently available for each tag.

##### Forwarded Root events

Reka's `addTag`, `removeTag`, and `invalid` listeners can reach Root through Vue attribute fallthrough. They are not declared Frame emits; their payload is the underlying value before Frame's model normalization. With ordinary string configuration this is a string. `invalid` reports rejected additions, not native form constraint validation. Only `update:modelValue` is Frame's typed update contract.

#### State notes

The textbox does not add a Reka `data-disabled` attribute in this implementation; use native `:disabled` there. Item `aria-current` reflects navigation selection, not validation. There is no popup/open state.

#### Item

Frame supplies this part in its anatomy. Availability below refers to configuration through the Frame wrapper, not direct use of a Reka export.

#### Props

| Prop       | Reka type                                           | Frame type                | Required/default            | Availability | Description                                                                                   |
| ---------- | --------------------------------------------------- | ------------------------- | --------------------------- | ------------ | --------------------------------------------------------------------------------------------- |
| `as`       | `AsTag \| Component`                                | No independent Frame prop | `"div"` (Reka)              | Internal     | Rendered element/component. Not independently configurable through Frame.                     |
| `asChild`  | `boolean`                                           | No independent Frame prop | Unset in upstream reference | Internal     | Merge behavior into the supplied child element. Not independently configurable through Frame. |
| `disabled` | `boolean`                                           | No independent Frame prop | Unset in upstream reference | Internal     | Derived from group/option disabled state.                                                     |
| `value`    | `string \| number \| bigint \| Record<string, any>` | No independent Frame prop | `Required upstream` (Reka)  | Internal     | Derived from option.value.                                                                    |

#### Emits

No component-defined emits on this part. Native listeners are separate from component emits.

#### Slots

| Upstream slot | Scoped field            | Frame availability                                           |
| ------------- | ----------------------- | ------------------------------------------------------------ |
| default       | No scoped fields listed | Frame supplies the internal composition; no public part slot |

#### Data attributes

| Attribute     | Value/presence        | Meaning                                                       |
| ------------- | --------------------- | ------------------------------------------------------------- |
| data-state    | active / inactive     | Tag keyboard-navigation selection, not collection membership. |
| data-disabled | Present when disabled | Tag/delete disabled state.                                    |

#### ItemText

Frame supplies this part in its anatomy. Availability below refers to configuration through the Frame wrapper, not direct use of a Reka export.

#### Props

| Prop      | Reka type            | Frame type                | Required/default            | Availability | Description                                                                                   |
| --------- | -------------------- | ------------------------- | --------------------------- | ------------ | --------------------------------------------------------------------------------------------- |
| `as`      | `AsTag \| Component` | No independent Frame prop | `"span"` (Reka)             | Internal     | Rendered element/component. Not independently configurable through Frame.                     |
| `asChild` | `boolean`            | No independent Frame prop | Unset in upstream reference | Internal     | Merge behavior into the supplied child element. Not independently configurable through Frame. |

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

#### ItemDelete

Frame supplies this part in its anatomy. Availability below refers to configuration through the Frame wrapper, not direct use of a Reka export.

#### Props

| Prop      | Reka type            | Frame type                | Required/default            | Availability | Description                                                                                   |
| --------- | -------------------- | ------------------------- | --------------------------- | ------------ | --------------------------------------------------------------------------------------------- |
| `as`      | `AsTag \| Component` | No independent Frame prop | `"button"` (Reka)           | Internal     | Rendered element/component. Not independently configurable through Frame.                     |
| `asChild` | `boolean`            | No independent Frame prop | Unset in upstream reference | Internal     | Merge behavior into the supplied child element. Not independently configurable through Frame. |

#### Emits

No component-defined emits on this part. Native listeners are separate from component emits.

#### Slots

| Upstream slot | Scoped field            | Frame availability                                           |
| ------------- | ----------------------- | ------------------------------------------------------------ |
| default       | No scoped fields listed | Frame supplies the internal composition; no public part slot |

#### Data attributes

| Attribute     | Value/presence        | Meaning                                                       |
| ------------- | --------------------- | ------------------------------------------------------------- |
| data-state    | active / inactive     | Tag keyboard-navigation selection, not collection membership. |
| data-disabled | Present when disabled | Tag/delete disabled state.                                    |

#### Input

Frame supplies this part in its anatomy. Availability below refers to configuration through the Frame wrapper, not direct use of a Reka export.

#### Props

| Prop          | Reka type            | Frame type                | Required/default            | Availability | Description                                                                                   |
| ------------- | -------------------- | ------------------------- | --------------------------- | ------------ | --------------------------------------------------------------------------------------------- |
| `as`          | `AsTag \| Component` | No independent Frame prop | `"input"` (Reka)            | Internal     | Rendered element/component. Not independently configurable through Frame.                     |
| `asChild`     | `boolean`            | No independent Frame prop | Unset in upstream reference | Internal     | Merge behavior into the supplied child element. Not independently configurable through Frame. |
| `autoFocus`   | `boolean`            | No independent Frame prop | Unset in upstream reference | Internal     | Autofocus the tag textbox. Not independently configurable through Frame.                      |
| `maxLength`   | `number`             | No independent Frame prop | Unset in upstream reference | Internal     | Textbox character limit. Not independently configurable through Frame.                        |
| `placeholder` | `string`             | No independent Frame prop | Unset in upstream reference | Internal     | Routed from Frame placeholder prop.                                                           |

#### Emits

No component-defined emits on this part. Native listeners are separate from component emits.

#### Slots

| Upstream slot | Scoped field            | Frame availability                                           |
| ------------- | ----------------------- | ------------------------------------------------------------ |
| default       | No scoped fields listed | Frame supplies the internal composition; no public part slot |

#### Data attributes

| Attribute    | Value/presence                   | Meaning                                          |
| ------------ | -------------------------------- | ------------------------------------------------ |
| data-invalid | Present for rejected draft state | Textbox uses native disabled, not data-disabled. |

#### Omitted parts

TagsInputClear is not rendered. Its as/asChild and default content slot are not available through Frame.

#### Frame additions

#### Props

| Prop          | Type     | Required/default | Description                                      |
| ------------- | -------- | ---------------- | ------------------------------------------------ |
| `label`       | `string` | `Unset`          | Accessible name routed to the textbox.           |
| `placeholder` | `string` | `Unset`          | Explicitly routed to the textbox, not just Root. |

#### Slots

No additional public Frame slots.

#### Emits

No additional Frame-only emits. The controlled model event is documented on Root.

#### Exposed methods

No Frame-defined methods or internal Reka refs are exposed.

#### Sources and version

[FrameTagField.vue](../../../packages/core/src/components/forms/FrameTagField.vue) and [controls.css](../../../packages/core/src/components/forms/shared/controls.css) define Frame behavior. Compared with the official [Reka Tags Input reference](https://reka-ui.com/docs/components/tags-input.md) and installed Reka `2.11.0`.

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="tags-input" -->

| CSS variable                        | Theme path                        | Default expression                                                                       | Purpose                                                                                                                                                                 | Context                                                                                                                                                                    |
| ----------------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--frame-input-border`              | `frame.input.border`              | `1px solid     var(--frame-control-border)`                                              | Fallback for: Resting border of the tag entry.                                                                                                                          | `.frame-tags-input`                                                                                                                                                        |
| `--frame-tags-input-border`         | `frame.tags.input.border`         | `var(     --frame-input-border,     1px solid     var(--frame-control-border)   )`       | Resting border of the tag entry.                                                                                                                                        | `.frame-tags-input`                                                                                                                                                        |
| `--frame-tags-input-border-radius`  | `frame.tags.input.border.radius`  | `var(--frame-input-radius)`                                                              | Corner radius of the tag entry.                                                                                                                                         | `.frame-tags-input`                                                                                                                                                        |
| `--frame-input-hover-border`        | `frame.input.hover.border`        | `1px solid     var(--frame-control-border)`                                              | Fallback for: Border while the pointer hovers over the tag entry.                                                                                                       | `.frame-tags-input`                                                                                                                                                        |
| `--frame-tags-input-hover-border`   | `frame.tags.input.hover.border`   | `var(     --frame-input-hover-border,     1px solid     var(--frame-control-border)   )` | Border while the pointer hovers over the tag entry.                                                                                                                     | `.frame-tags-input`                                                                                                                                                        |
| `--frame-input-hover-outline`       | `frame.input.hover.outline`       | `none`                                                                                   | Fallback for: Outline while the pointer hovers over the tag entry.                                                                                                      | `.frame-tags-input`                                                                                                                                                        |
| `--frame-tags-input-hover-outline`  | `frame.tags.input.hover.outline`  | `var(     --frame-input-hover-outline,     none   )`                                     | Outline while the pointer hovers over the tag entry.                                                                                                                    | `.frame-tags-input`                                                                                                                                                        |
| `--frame-input-focus-border`        | `frame.input.focus.border`        | `1px solid var(--frame-accent)`                                                          | Fallback for: Border while focus is within the tag entry.                                                                                                               | `.frame-tags-input`                                                                                                                                                        |
| `--frame-tags-input-focus-border`   | `frame.tags.input.focus.border`   | `var(     --frame-input-focus-border,     1px solid var(--frame-accent)   )`             | Border while focus is within the tag entry.                                                                                                                             | `.frame-tags-input`                                                                                                                                                        |
| `--frame-input-focus-outline`       | `frame.input.focus.outline`       | `1px solid var(--frame-accent)`                                                          | Fallback for: Focus outline of the tag entry.                                                                                                                           | `.frame-tags-input`                                                                                                                                                        |
| `--frame-tags-input-focus-outline`  | `frame.tags.input.focus.outline`  | `var(     --frame-input-focus-outline,     1px solid var(--frame-accent)   )`            | Focus outline of the tag entry.                                                                                                                                         | `.frame-tags-input`                                                                                                                                                        |
| `--frame-input-outline-offset`      | `frame.input.outline.offset`      | `0px`                                                                                    | Fallback for: Offset between the outline and the tag entry.                                                                                                             | `.frame-tags-input`                                                                                                                                                        |
| `--frame-tags-input-outline-offset` | `frame.tags.input.outline.offset` | `var(     --frame-input-outline-offset,     0px   )`                                     | Offset between the outline and the tag entry.                                                                                                                           | `.frame-tags-input`                                                                                                                                                        |
| `--frame-control-border`            | `frame.control.border`            | `var(--frame-border-color)`                                                              | Resting border color of form controls, independently overridable from menu borders.                                                                                     | `.frame-tags-input`                                                                                                                                                        |
| `--frame-input-radius`              | `frame.input.radius`              | `var(--frame-menu-border-radius)`                                                        | Shared corner radius for text fields, text areas, selects, and composed input surfaces.                                                                                 | `.frame-tags-input`                                                                                                                                                        |
| `--frame-accent`                    | `frame.accent`                    | `#0078d4`                                                                                | Shared interaction color for keyboard focus, active actions, and accent-filled controls.                                                                                | `.frame-tags-input`                                                                                                                                                        |
| `--frame-gap`                       | `frame.gap`                       | `6px`                                                                                    | Space between children for .frame-form-inline, .frame-number-field, .frame-pin-input, .frame-tags-input, .frame-combobox-anchor.                                        | `.frame-form-inline, .frame-number-field, .frame-pin-input, .frame-tags-input, .frame-combobox-anchor`                                                                     |
| `--frame-text`                      | `frame.text`                      | `#ccc`                                                                                   | Foreground for .frame-form-input, .frame-control-button, .frame-toggle, .frame-choice-item, .frame-check-control.                                                       | `.frame-form-input, .frame-control-button, .frame-toggle, .frame-choice-item, .frame-check-control`                                                                        |
| `--frame-surface`                   | `frame.surface`                   | `#242424`                                                                                | Background for .frame-form-input, .frame-control-button, .frame-toggle, .frame-choice-item, .frame-check-control.                                                       | `.frame-form-input, .frame-control-button, .frame-toggle, .frame-choice-item, .frame-check-control`                                                                        |
| `--frame-line`                      | `frame.line`                      | `#454545`                                                                                | Border for .frame-form-input, .frame-control-button, .frame-toggle, .frame-choice-item, .frame-check-control.                                                           | `.frame-form-input, .frame-control-button, .frame-toggle, .frame-choice-item, .frame-check-control`                                                                        |
| `--frame-control-radius`            | `frame.control.radius`            | `var(--frame-radius-medium)`                                                             | Corner radius for .frame-form-input, .frame-control-button, .frame-toggle, .frame-choice-item, .frame-check-control.                                                    | `.frame-form-input, .frame-control-button, .frame-toggle, .frame-choice-item, .frame-check-control`                                                                        |
| `--frame-control-padding-y`         | `frame.control.padding.y`         | `5px`                                                                                    | Internal spacing for .frame-form-input, .frame-control-button, .frame-toggle, .frame-choice-item, .frame-check-control.                                                 | `.frame-form-input, .frame-control-button, .frame-toggle, .frame-choice-item, .frame-check-control`                                                                        |
| `--frame-control-padding-x`         | `frame.control.padding.x`         | `10px`                                                                                   | Internal spacing for .frame-form-input, .frame-control-button, .frame-toggle, .frame-choice-item, .frame-check-control.                                                 | `.frame-form-input, .frame-control-button, .frame-toggle, .frame-choice-item, .frame-check-control`                                                                        |
| `--frame-radius-medium`             | `frame.radius.medium`             | `4px`                                                                                    | Medium shared corner radius used by ordinary controls.                                                                                                                  | `.frame-form-input, .frame-control-button, .frame-toggle, .frame-choice-item, .frame-check-control`                                                                        |
| `--frame-accent`                    | `frame.accent`                    | `#0078d4`                                                                                | Outline for :is( .frame-form-input, .frame-control-button, .frame-toggle, .frame-choice-item, .frame-check-control, .frame-switch, .frame-slider-thumb ):focus-visible. | `:is(   .frame-form-input,   .frame-control-button,   .frame-toggle,   .frame-choice-item,   .frame-check-control,   .frame-switch,   .frame-slider-thumb ):focus-visible` |
| `--frame-control-padding-y`         | `frame.control.padding.y`         | `5px`                                                                                    | Internal spacing for .frame-tags-input.                                                                                                                                 | `.frame-tags-input`                                                                                                                                                        |
| `--frame-line`                      | `frame.line`                      | `#454545`                                                                                | Border for .frame-tags-input.                                                                                                                                           | `.frame-tags-input`                                                                                                                                                        |
| `--frame-control-radius`            | `frame.control.radius`            | `var(--frame-radius-medium)`                                                             | Corner radius for .frame-tags-input.                                                                                                                                    | `.frame-tags-input`                                                                                                                                                        |
| `--frame-radius-medium`             | `frame.radius.medium`             | `4px`                                                                                    | Medium shared corner radius used by ordinary controls.                                                                                                                  | `.frame-tags-input`                                                                                                                                                        |
| `--frame-gap`                       | `frame.gap`                       | `6px`                                                                                    | Space between children for .frame-tags-input-item.                                                                                                                      | `.frame-tags-input-item`                                                                                                                                                   |
| `--frame-line`                      | `frame.line`                      | `#454545`                                                                                | Background for .frame-tags-input-item.                                                                                                                                  | `.frame-tags-input-item`                                                                                                                                                   |
| `--frame-control-radius`            | `frame.control.radius`            | `var(--frame-radius-medium)`                                                             | Corner radius for .frame-tags-input-item.                                                                                                                               | `.frame-tags-input-item`                                                                                                                                                   |
| `--frame-control-padding-x`         | `frame.control.padding.x`         | `10px`                                                                                   | Left internal spacing for .frame-tags-input-item.                                                                                                                       | `.frame-tags-input-item`                                                                                                                                                   |
| `--frame-radius-medium`             | `frame.radius.medium`             | `4px`                                                                                    | Medium shared corner radius used by ordinary controls.                                                                                                                  | `.frame-tags-input-item`                                                                                                                                                   |
| `--frame-tags-input-border-color`   | `frame.tags.input.border.color`   | `var(--frame-control-border)`                                                            | Border color of the tag entry container.                                                                                                                                | `.frame-tags-input`                                                                                                                                                        |
| `--frame-tags-input-radius`         | `frame.tags.input.radius`         | `var(--frame-input-radius)`                                                              | Corner radius of the tag entry container.                                                                                                                               | `.frame-tags-input`                                                                                                                                                        |
| `--frame-control-border`            | `frame.control.border`            | `var(--frame-line)`                                                                      | Right border for .frame-number-field > .frame-control-button:first-child.                                                                                               | `.frame-number-field > .frame-control-button:first-child`                                                                                                                  |
| `--frame-line`                      | `frame.line`                      | `#2b2b2b`                                                                                | Neutral divider color for content boundaries, tracks, and structural separators.                                                                                        | `.frame-number-field > .frame-control-button:first-child`                                                                                                                  |
| `--frame-control-border`            | `frame.control.border`            | `var(--frame-line)`                                                                      | Left border for .frame-number-field > .frame-control-button:last-child.                                                                                                 | `.frame-number-field > .frame-control-button:last-child`                                                                                                                   |
| `--frame-line`                      | `frame.line`                      | `#2b2b2b`                                                                                | Neutral divider color for content boundaries, tracks, and structural separators.                                                                                        | `.frame-number-field > .frame-control-button:last-child`                                                                                                                   |
| `--frame-menu-hover`                | `frame.menu.hover`                | `var(--frame-line)`                                                                      | Background for .frame-number-field .frame-control-button:hover:not([data-disabled]).                                                                                    | `.frame-number-field .frame-control-button:hover:not([data-disabled])`                                                                                                     |
| `--frame-line`                      | `frame.line`                      | `#2b2b2b`                                                                                | Neutral divider color for content boundaries, tracks, and structural separators.                                                                                        | `.frame-number-field .frame-control-button:hover:not([data-disabled])`                                                                                                     |
| `--frame-accent`                    | `frame.accent`                    | `#0078d4`                                                                                | Shared interaction color for keyboard focus, active actions, and accent-filled controls.                                                                                | `.frame-number-field .frame-control-button:focus-visible`                                                                                                                  |
| `--frame-control-border`            | `frame.control.border`            | `var(--frame-line)`                                                                      | Top border for .frame-number-steppers > .frame-control-button + .frame-control-button.                                                                                  | `.frame-number-steppers > .frame-control-button + .frame-control-button`                                                                                                   |
| `--frame-line`                      | `frame.line`                      | `#2b2b2b`                                                                                | Neutral divider color for content boundaries, tracks, and structural separators.                                                                                        | `.frame-number-steppers > .frame-control-button + .frame-control-button`                                                                                                   |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->

### Additional styling guidance

#### Parts and selectors

| Selector                 | Part               | Placement/attribute target                                       |
| ------------------------ | ------------------ | ---------------------------------------------------------------- |
| `.frame-tags-input`      | Root               | Caller class/style targets this element.                         |
| `.frame-tags-input-item` | Tag item           | Internal part; caller attributes do not target it independently. |
| `.frame-form-input`      | Input cell/textbox | Internal part; caller attributes do not target it independently. |
| `.frame-control-button`  | Action button      | Internal part; caller attributes do not target it independently. |

Chips wrap inside Root. Item active/inactive is keyboard navigation state.

#### Variables

| Token key                    | Variable                          | Value kind                     | Default/fallback                                                                  | Part/effect                                                             | Scope/limits                                                                 | Description              |
| ---------------------------- | --------------------------------- | ------------------------------ | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------ |
| `--frame-accent`             | `--frame-accent`                  | color                          | Catalog: `#0078d4`; CSS fallback: `#0078d4`                                       | Input cell/textbox, Action button outline                               | Shared across controls using this variable. State rules: :focus-visible.     | Accent.                  |
| `--frame-control-background` | `--frame-control-background`      | color                          | Catalog: `#1d1d1d`; CSS fallback: `#1d1d1d`                                       | Input cell/textbox background                                           | Shared across controls using this variable.                                  | Control background.      |
| `--frame-control-border`     | `--frame-control-border`          | color                          | Catalog: `var(--frame-border-color)`; CSS fallback: `#3c4246`                     | Input cell/textbox border-color; Root border-color                      | Shared across controls using this variable.                                  | Control border.          |
| `--frame-control-padding-x`  | `--frame-control-padding-x`       | length                         | Catalog: `calc(var(--frame-spacing-unit) * 2.5)`; CSS fallback: `10px`            | Input cell/textbox, Action button padding; Tag item padding-left        | Shared across controls using this variable.                                  | Control padding x.       |
| `--frame-control-padding-y`  | `--frame-control-padding-y`       | length                         | Catalog: `calc(var(--frame-spacing-unit) * 1.25)`; CSS fallback: `5px`            | Input cell/textbox, Action button padding; Root padding                 | Shared across controls using this variable.                                  | Control padding y.       |
| `--frame-control-radius`     | `--frame-control-radius`          | length                         | Catalog: `var(--frame-radius-medium)`; CSS fallback: `var(--frame-radius-medium)` | Action button border-radius; Root border-radius; Tag item border-radius | Shared across controls using this variable.                                  | Control radius.          |
| `--frame-control-text`       | `--frame-control-text`            | color                          | Catalog: `#d4d4d4`; CSS fallback: `#d4d4d4`                                       | Input cell/textbox color                                                | Shared across controls using this variable.                                  | Control text.            |
| CSS only                     | `--frame-form-input-radius`       | length / CSS length expression | CSS fallback: `var(--frame-input-radius)`                                         | Input cell/textbox border-radius                                        | Shared across controls using this variable. CSS only; not in JSON allowlist. | Form input radius.       |
| `--frame-gap`                | `--frame-gap`                     | length                         | Catalog: `calc(var(--frame-spacing-unit) * 1.5)`; CSS fallback: `6px`             | Root gap; Tag item gap                                                  | Shared across controls using this variable.                                  | Gap.                     |
| `--frame-input-radius`       | `--frame-input-radius`            | length                         | Catalog: `var(--frame-menu-border-radius)`                                        | Input cell/textbox border-radius; Root border-radius                    | Shared across controls using this variable.                                  | Input radius.            |
| `--frame-line`               | `--frame-line`                    | color                          | Catalog: `#2b2b2b`; CSS fallback: `#454545`                                       | Action button border; Root border; Tag item background                  | Shared across controls using this variable.                                  | Line.                    |
| `--frame-radius-medium`      | `--frame-radius-medium`           | length                         | Catalog: `4px`                                                                    | Action button border-radius; Root border-radius; Tag item border-radius | Shared across controls using this variable.                                  | Radius medium.           |
| `--frame-surface`            | `--frame-surface`                 | color                          | Catalog: `#181818`; CSS fallback: `#242424`                                       | Action button background                                                | Shared across controls using this variable.                                  | Surface.                 |
| CSS only                     | `--frame-tags-input-border-color` | color                          | CSS fallback: `var(--frame-control-border)`                                       | Root border-color                                                       | Shared across controls using this variable. CSS only; not in JSON allowlist. | Tags input border color. |
| CSS only                     | `--frame-tags-input-radius`       | length / CSS length expression | CSS fallback: `var(--frame-input-radius)`                                         | Root border-radius                                                      | Shared across controls using this variable. CSS only; not in JSON allowlist. | Tags input radius.       |
| `--frame-text`               | `--frame-text`                    | color                          | Catalog: `#cccccc`; CSS fallback: `#ccc`                                          | Action button color                                                     | Shared across controls using this variable.                                  | Text.                    |

See [theme variables](../../styling/theme-variables.md) for theme authoring.
