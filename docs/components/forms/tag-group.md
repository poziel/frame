# FrameTagGroup

A collection of existing tags with optional selection and removal. Unlike TagsInput, it has no text-entry control.

## Features

### Anatomy

```text
FrameTagGroup
TagGroupRoot
└─ TagGroupItem × items
   ├─ TagGroupItemText (item.label)
   └─ TagGroupItemDelete (×; only with an @remove listener)
```

Caller attributes/class/style reach Root. Tag text and delete buttons are generated; no caller content slots are rendered. These Reka parts are internal composition, not separately exported Frame building blocks.

### Basic usage

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { FrameTagGroup } from '@frame/core';
import '@frame/core/style.css';

const items = ref([{ value: 'vue', label: 'Vue' }, { value: 'rust', label: 'Rust' }]);
function removeTags(values: unknown[]) {
  items.value = items.value.filter(item => !values.includes(item.value));
}
</script>

<template>
  <FrameTagGroup :items="items" aria-label="Project tags" @remove="removeTags" />
</template>
```

Load the stylesheet once per application. This component works without a Frame instance.

### Display, selection, and removal

`items` determines visible tags. `modelValue` determines selected tag values; it is not the tag list. Selection defaults to `none`. For selection use `selection-mode="single"` with a string/undefined model or `"multiple"` with an array. Item values in this Frame wrapper are strings, even though the inherited Root contract accepts generic values.

An `@remove` listener enables the generated delete buttons and keyboard removal. Its payload is an array of values. The host must remove those entries from `items`; the event does not mutate the list. Without the listener the tags remain visible and non-removable. Disabling the root or an item prevents that interaction.

### Keyboard and accessibility

Roving focus uses arrows, Home/End and typeahead; looping defaults to true. Enter/Space changes selection when enabled, Delete/Backspace requests removal when a listener exists, and Escape clears selection unless configured otherwise. With multi-selection, removal can include selected tags. Delete buttons are named “Remove ” followed by the item label. Name Root using aria-label/aria-labelledby; there is no Frame label prop.

### Field integration

TagGroup can participate in Reka Field context for selected values and disabled state. Its root has no name/required native form props or hidden serialization helper of its own. The text list is host-owned; include whatever submitted data your application needs explicitly. It is a different control from [FrameTagField](tags-input.md), which commits text into an array.

### Browse without selecting

The tags are navigable but do not represent a selection when selectionMode is none.

<!-- frame:example id="tag-group.browse" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameTagGroup } from '@frame/core';
const demoItems = [
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
<FrameTagGroup :selection-mode="&quot;none&quot;" :items="demoItems" />
</template>
```

### Select one tag

One tag acts as the current category. Selecting another replaces it.

<!-- frame:example id="tag-group.single" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameTagGroup } from '@frame/core';
const demoModelValue = ref("apple");
const demoItems = [
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
<FrameTagGroup v-model="demoModelValue" :selection-mode="&quot;single&quot;" :items="demoItems" />
</template>
```

### Select several tags

Multiple selection keeps an array. Toggle tags to build a combination.

<!-- frame:example id="tag-group.multiple" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameTagGroup } from '@frame/core';
const demoModelValue = ref(["apple","grapes"]);
const demoItems = [
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
<FrameTagGroup v-model="demoModelValue" :selection-mode="&quot;multiple&quot;" :items="demoItems" />
</template>
```

### Keep a selection

The selected tag cannot be deselected until another tag replaces it.

<!-- frame:example id="tag-group.required-selection" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameTagGroup } from '@frame/core';
const demoModelValue = ref("apple");
const demoDisallowEmptySelection = true;
const demoItems = [
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
<FrameTagGroup v-model="demoModelValue" :selection-mode="&quot;single&quot;" :disallow-empty-selection="demoDisallowEmptySelection" :items="demoItems" />
</template>
```

## APIs

<!-- frame:generated api="tag-group" -->

### FrameTagGroup

Source: `packages/core/src/components/forms/FrameTagGroup.vue`

#### Properties

| Name                     | Type                                                                            | Default          | Description                                                                                                                                                                                          |
| ------------------------ | ------------------------------------------------------------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `modelValue`             | `AcceptableValue \| AcceptableValue[] \| undefined`                             | Omitted          | The controlled value of the selected tag(s). Can be binded with `v-model`. An array when `selectionMode` is `multiple`.                                                                              |
| `defaultValue`           | `AcceptableValue \| AcceptableValue[] \| undefined`                             | Omitted          | The value of the selected tag(s) when initially rendered. Use when you do not need to control the selection.                                                                                         |
| `selectionMode`          | `TagGroupSelectionMode \| undefined`                                            | 'none'           | The type of selection that is allowed. Tags are not selectable when `none`. defaultValue: 'none'                                                                                                     |
| `disallowEmptySelection` | `boolean \| undefined`                                                          | false            | When `true`, the user cannot deselect the last selected tag.                                                                                                                                         |
| `escapeKeyBehavior`      | `"none" \| "clearSelection" \| undefined`                                       | 'clearSelection' | Whether pressing <kbd>Escape</kbd> clears the selection. defaultValue: 'clearSelection'                                                                                                              |
| `disabled`               | `boolean \| undefined`                                                          | false            | When `true`, prevents the user from interacting with the tag group and all its tags.                                                                                                                 |
| `dir`                    | `Direction \| undefined`                                                        | Omitted          | The reading direction of the tag group when applicable. <br> If omitted, inherits globally from `ConfigProvider` or assumes LTR (left-to-right) reading mode.                                        |
| `loop`                   | `boolean \| undefined`                                                          | false            | When `true`, keyboard navigation will loop from last tag to first, and vice versa. defaultValue: true                                                                                                |
| `by`                     | `string \| ((a: AcceptableValue, b: AcceptableValue) => boolean) \| undefined`  | Omitted          | Use this to compare objects by a particular field, or pass your own comparison function for complete control over how objects are compared.                                                          |
| `asChild`                | `boolean \| undefined`                                                          | false            | Change the default rendered element for the one passed as a child, merging their props and behavior. Read our [Composition](https://www.reka-ui.com/docs/guides/composition) guide for more details. |
| `as`                     | `Component \| AsTag \| undefined`                                               | "div"            | The element or component this component should render as. Can be overwritten by `asChild`. defaultValue: "div"                                                                                       |
| `items`                  | `readonly { value: string; label: string; disabled?: boolean \| undefined; }[]` | Required         | Tag values, visible labels, and disabled states; removal is offered only when a remove listener is supplied.                                                                                         |

#### Events

| Name                | Parameters                                                 | Return type | Description                                                                                                                                                                                  |
| ------------------- | ---------------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `update:modelValue` | `value: AcceptableValue \| AcceptableValue[] \| undefined` | `void`      | Event handler called when the selection changes.                                                                                                                                             |
| `remove`            | `values: AcceptableValue[]`                                | `void`      | Event handler called when the user removes tags, with the values to remove. Tags are only removable when this event has a listener; remove the values from your own list to remove the tags. |

#### Slots

No declared entries.

#### Exposed API

No declared entries.

<!-- /frame:generated -->

### Composition and upstream reference

Defaults below are Reka reference defaults unless a Frame override is stated. Declared means a typed Frame prop/event; Forwarded means attribute/listener fallthrough to the named part; Internal means generated by Frame; Absent means not routed or composed. Generic upstream `T`/`AcceptableValue` describes Reka, not a promise of arbitrary option values in Frame.

#### Root

#### Props

| Prop                     | Reka type                             | Reka required/default | Availability | Frame behavior                                                                                        |
| ------------------------ | ------------------------------------- | --------------------- | ------------ | ----------------------------------------------------------------------------------------------------- |
| `as`                     | `AsTag \| Component`                  | "div"                 | Declared     | Element/component used to render this part.                                                           |
| `asChild`                | `boolean`                             | -                     | Declared     | Typed upstream composition option; fixed generated children are not a public custom-composition slot. |
| `by`                     | `string \| ((a: T, b: T) => boolean)` | -                     | Declared     | Field name or comparator for matching values.                                                         |
| `defaultValue`           | `T \| T[]`                            | -                     | Declared     | Initial uncontrolled value upstream; does not override a supplied controlled model.                   |
| `dir`                    | `"ltr" \| "rtl"`                      | -                     | Declared     | Reading/navigation direction; inherits Reka configuration or LTR when unset.                          |
| `disabled`               | `boolean`                             | -                     | Declared     | Disable interaction for this part and its participating descendants.                                  |
| `disallowEmptySelection` | `boolean`                             | -                     | Declared     | Reject deselection of the final selected tag.                                                         |
| `escapeKeyBehavior`      | `"none" \| "clearSelection"`          | "clearSelection"      | Declared     | Clear selection on Escape or leave it unchanged.                                                      |
| `loop`                   | `boolean`                             | true                  | Declared     | Wrap keyboard navigation at collection endpoints.                                                     |
| `modelValue`             | `T \| T[]`                            | -                     | Declared     | Controlled value; updates require the host to retain the emitted value.                               |
| `selectionMode`          | `"single" \| "multiple" \| "none"`    | "none"                | Declared     | Allow no selection, one selected tag, or several selected tags.                                       |

#### Emits

| Event               | Payload                                                      | Availability | Behavior                                                                              |
| ------------------- | ------------------------------------------------------------ | ------------ | ------------------------------------------------------------------------------------- |
| `remove`            | `[values: T[]]`                                              | Declared     | Requested tag values to remove; host must update items. Not a DOM cancellation event. |
| `update:modelValue` | `[value: AcceptableValue \| AcceptableValue[] \| undefined]` | Declared     | Value changed; retain it in host state. Not cancellable.                              |

#### Slots

| Default-slot field | Reka type               | Frame availability                             |
| ------------------ | ----------------------- | ---------------------------------------------- |
| `modelValue`       | `T \| T[] \| undefined` | Internal; not passed to the Frame caller slot. |

#### Data attributes

| Attribute       | Values/presence         | Meaning               |
| --------------- | ----------------------- | --------------------- |
| `data-disabled` | `Present when disabled` | Group disabled state. |
| `data-empty`    | `Present when empty`    | No registered tags.   |

#### Exposed methods

Frame does not defineExpose or forward the internal Reka instance. Do not depend on internal Reka methods/refs through a Frame component ref.

#### Item

#### Props

| Prop        | Reka type            | Reka required/default | Availability | Frame behavior                                                                                                       |
| ----------- | -------------------- | --------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------- |
| `as`        | `AsTag \| Component` | "div"                 | Internal     | Element/component used to render this part. Not independently configurable through Frame.                            |
| `asChild`   | `boolean`            | -                     | Internal     | Merge the part behavior into one child instead of rendering a wrapper. Not independently configurable through Frame. |
| `disabled`  | `boolean`            | -                     | Internal     | items[n].disabled plus inherited root disabled. Not independently configurable through Frame.                        |
| `textValue` | `string`             | -                     | Internal     | Plain text used for matching/typeahead and naming. Not independently configurable through Frame.                     |
| `value`     | `T`                  | Required upstream     | Internal     | items[n].value. Not independently configurable through Frame.                                                        |

#### Emits

No component emits on this part. Native bubbling listeners are not additional component emits.

#### Slots

| Default-slot field | Reka type | Frame availability                             |
| ------------------ | --------- | ---------------------------------------------- |
| `selected`         | `boolean` | Internal; not passed to the Frame caller slot. |
| `disabled`         | `boolean` | Internal; not passed to the Frame caller slot. |

#### Data attributes

| Attribute       | Values/presence                             | Meaning                      |
| --------------- | ------------------------------------------- | ---------------------------- |
| `data-state`    | `checked \| unchecked; absent in none mode` | Selection state.             |
| `data-disabled` | `Present when disabled`                     | Root or item disabled state. |

#### ItemText

#### Props

| Prop      | Reka type            | Reka required/default | Availability | Frame behavior                                                                                                       |
| --------- | -------------------- | --------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------- |
| `as`      | `AsTag \| Component` | "span"                | Internal     | Element/component used to render this part. Not independently configurable through Frame.                            |
| `asChild` | `boolean`            | -                     | Internal     | Merge the part behavior into one child instead of rendering a wrapper. Not independently configurable through Frame. |

#### Emits

No component emits on this part. Native bubbling listeners are not additional component emits.

#### Slots

Underlying default content has no documented scoped fields. Frame generates this part’s content; no caller slot targets it independently.

#### Data attributes

No component state data attributes are defined on this part. Inherited native/ARIA attributes are not data attributes.

#### ItemDelete

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

| Attribute       | Values/presence         | Meaning                 |
| --------------- | ----------------------- | ----------------------- |
| `data-disabled` | `Present when disabled` | Delete action disabled. |

#### Frame additions

#### Props

| Prop    | Type                                                              | Required/default | Description                                                 |
| ------- | ----------------------------------------------------------------- | ---------------- | ----------------------------------------------------------- |
| `items` | `readonly { value: string; label: string; disabled?: boolean }[]` | Required         | Host-owned rendered tags. Distinct from the selected model. |

#### Emits

No additional Frame-only events; see the part tables for declared or forwarded events.

#### Slots

No public content slots; all internal children are generated.

#### Sources and version

Checked against installed `reka-ui@2.11.0`, the [official Reka reference](https://reka-ui.com/docs/components/tag-group), its [Markdown reference](https://reka-ui.com/docs/components/tag-group.md), and [Frame implementation](../../../packages/core/src/components/forms/FrameTagGroup.vue). Styling comes from [advanced.css](../../../packages/core/src/components/forms/shared/advanced.css) and [shared styles](../../../packages/core/src/style.css). JSON availability comes from the [token catalog](../../../packages/core/src/themes/tokens/tokenCatalog.ts).

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="tag-group" -->

| CSS variable             | Theme path             | Default expression                      | Purpose                                                                                                      | Context                                                                                                                                             |
| ------------------------ | ---------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--frame-gap`            | `frame.gap`            | `calc(var(--frame-spacing-unit) * 1.5)` | Standard space between related content items and control children.                                           | `.frame-tag-group`                                                                                                                                  |
| `--frame-gap`            | `frame.gap`            | `calc(var(--frame-spacing-unit) * 1.5)` | Standard space between related content items and control children.                                           | `.frame-tag`                                                                                                                                        |
| `--frame-line`           | `frame.line`           | `#2b2b2b`                               | Neutral divider color for content boundaries, tracks, and structural separators.                             | `.frame-tag`                                                                                                                                        |
| `--frame-control-radius` | `frame.control.radius` | `var(--frame-radius-medium)`            | Shared corner radius of buttons and ordinary controls; text-entry surfaces may use the input radius instead. | `.frame-tag`                                                                                                                                        |
| `--frame-text`           | `frame.text`           | `#cccccc`                               | Primary foreground for readable text and icons across shell and application content.                         | `.frame-tag`                                                                                                                                        |
| `--frame-surface`        | `frame.surface`        | `#181818`                               | Neutral raised surface behind grouped content and control compositions.                                      | `.frame-tag`                                                                                                                                        |
| `--frame-accent`         | `frame.accent`         | `#0078d4`                               | Shared interaction color for keyboard focus, active actions, and accent-filled controls.                     | `.frame-tag[data-state='checked']`                                                                                                                  |
| `--frame-muted`          | `frame.muted`          | `#8e9496`                               | Secondary foreground for descriptions, hints, and visually subordinate content.                              | `.frame-tag-delete`                                                                                                                                 |
| `--frame-accent`         | `frame.accent`         | `#0078d4`                               | Shared interaction color for keyboard focus, active actions, and accent-filled controls.                     | `:is(   .frame-advanced-input,   .frame-rating-step,   .frame-tag,   .frame-tag-delete,   .frame-color-thumb,   .frame-swatch-item ):focus-visible` |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->

### Additional styling guidance

#### Parts and selectors

| Selector            | Part       | Placement                                                                        |
| ------------------- | ---------- | -------------------------------------------------------------------------------- |
| `.frame-tag-group`  | Root       | See attribute routing in Anatomy; internal parts have no independent attrs prop. |
| `.frame-tag`        | Item       | See attribute routing in Anatomy; internal parts have no independent attrs prop. |
| `.frame-tag-delete` | ItemDelete | See attribute routing in Anatomy; internal parts have no independent attrs prop. |

Tags wrap. Item padding (3px 7px) and delete-button padding (0 2px) are fixed. Root disabled styling fades the whole collection.

#### Variables

| Token key                | Variable                 | Value kind | Default/fallback                                                                                | Part/effect                                | Scope/limits                                                                                               | Description                                      |
| ------------------------ | ------------------------ | ---------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `--frame-accent`         | `--frame-accent`         | color      | Catalog: `#0078d4`. No local fallback; resolves from the cascade.                               | Item border-color; Item/ItemDelete outline | Shared with other controls using the same variable. State selectors: [data-state=checked], :focus-visible. | Sets Item border-color; Item/ItemDelete outline. |
| `--frame-control-radius` | `--frame-control-radius` | length     | Catalog: `var(--frame-radius-medium)`. No local fallback; resolves from the cascade.            | Item border-radius                         | Shared with other controls using the same variable.                                                        | Sets Item border-radius.                         |
| `--frame-gap`            | `--frame-gap`            | length     | Catalog: `calc(var(--frame-spacing-unit) * 1.5)`. No local fallback; resolves from the cascade. | Root gap; Item gap                         | Shared with other controls using the same variable.                                                        | Sets Root gap; Item gap.                         |
| `--frame-line`           | `--frame-line`           | color      | Catalog: `#2b2b2b`. No local fallback; resolves from the cascade.                               | Item border                                | Shared with other controls using the same variable.                                                        | Sets Item border.                                |
| `--frame-muted`          | `--frame-muted`          | color      | Catalog: `#8e9496`. No local fallback; resolves from the cascade.                               | ItemDelete color                           | Shared with other controls using the same variable.                                                        | Sets ItemDelete color.                           |
| `--frame-surface`        | `--frame-surface`        | color      | Catalog: `#181818`. No local fallback; resolves from the cascade.                               | Item background                            | Shared with other controls using the same variable.                                                        | Sets Item background.                            |
| `--frame-text`           | `--frame-text`           | color      | Catalog: `#cccccc`. No local fallback; resolves from the cascade.                               | Item color                                 | Shared with other controls using the same variable.                                                        | Sets Item color.                                 |

See [theme variables](../../styling/theme-variables.md) for theme authoring.
