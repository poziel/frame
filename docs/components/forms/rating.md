# FrameRating

A numeric score input with generated stars and optional fractional steps, clearing, and hover previews.

## Features

### Anatomy

```text
FrameRating
RatingRoot (RadioGroupRoot internally)
└─ RatingItem × generated items
   └─ RatingItemIndicator × fractional steps
      └─ Frame default slot { value } (fallback: ★)
```

Caller attributes/class/style reach Root. Root and Item scoped slots are consumed internally; only the per-indicator Frame slot is exposed. These Reka parts are internal composition, not separately exported Frame building blocks.

### Basic usage

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { FrameRating } from '@frame/core';
import '@frame/core/style.css';

const value = ref(3);
</script>

<template>
  <FrameRating v-model="value" aria-label="Project rating" :step="0.5" hoverable clearable />
</template>
```

Load the stylesheet once per application. This component works without a Frame instance.

### Fractional scores and custom content

`length` defaults to 5 and `step` to 1; supported steps are `1`, `0.5`, `0.25`, and `0.1`. Frame renders each generated step, not just one element per star. `hoverable` previews the pointer score; `clearable` lets clicking the selected score reset to zero. Both are opt-in. The host owns model persistence.

The default slot runs per indicator and receives `{ value: number }`. It replaces the star content, not Item or Root. Keep replacement content noninteractive. Frame uses Reka’s runtime width/opacity/z-index variables to clip and stack fractional indicators; replacing their sizing without preserving that behavior can break hit areas.

### Keyboard, accessibility, and forms

Reka uses radio-group interaction: Tab enters, arrows move between enabled steps and select through the underlying radio behavior. Root `aria-label` names the group and generated indicators are named by their numeric step. `orientation` affects navigation; Frame’s star layout remains inline. `name` and `required` use Reka’s radio form integration.

This installed RatingRoot has no `readonly` prop. A readonly attribute is not a supported read-only rating mode; use `disabled` when interaction must stop and account for its disabled semantics. Frame does not expose internal indicator attributes or refs.

### Replace the indicator glyph

This example reuses Basic usage state. The slot runs once per generated step; keep its content noninteractive and retain Reka’s fractional clipping on the surrounding indicator.

```vue
<FrameRating v-model="value" aria-label="Project rating" :step="0.5">
  <template #default="{ value: stepValue }">
    <span aria-hidden="true" :title="String(stepValue)">♥</span>
  </template>
</FrameRating>
```

### Half-step ratings

Choose between whole and half scores while retaining five visible rating items.

<!-- frame:example id="rating.fractional" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameRating } from '@frame/core';
const demoModelValue = ref(3.5);
const demoLength = 5;
const demoStep = 0.5;
</script>
<template>
<FrameRating v-model="demoModelValue" :length="demoLength" :step="demoStep" />
</template>
```

### Preview before choosing

Move over the stars to preview another score, then leave without clicking. The stored score stays unchanged.

<!-- frame:example id="rating.preview" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameRating } from '@frame/core';
const demoModelValue = ref(2);
const demoLength = 5;
const demoHoverable = true;
</script>
<template>
<FrameRating v-model="demoModelValue" :length="demoLength" :hoverable="demoHoverable" />
</template>
```

### Clear the current score

Activate the currently selected score again to reset the rating to zero.

<!-- frame:example id="rating.clear" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameRating } from '@frame/core';
const demoModelValue = ref(4);
const demoLength = 5;
const demoClearable = true;
</script>
<template>
<FrameRating v-model="demoModelValue" :length="demoLength" :clearable="demoClearable" />
</template>
```

### Custom rating content

Replace the default star through the slot while preserving the rating interaction.

<!-- frame:example id="rating.symbols" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameRating } from '@frame/core';
const demoModelValue = ref(3);
const demoLength = 5;
</script>
<template>
<FrameRating v-model="demoModelValue" :length="demoLength">
  <template #default><span v-text="&quot;♥&quot;" /></template>
</FrameRating>
</template>
```

## APIs

<!-- frame:generated api="rating" -->

### FrameRating

Source: `packages/core/src/components/forms/FrameRating.vue`

#### Properties

| Name           | Type                                   | Default | Description                                                                                                                                                                                          |
| -------------- | -------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `defaultValue` | `number \| undefined`                  | Omitted | The rating value when initially rendered. Use when you do not need to control the state of the rating.                                                                                               |
| `modelValue`   | `number \| undefined`                  | Omitted | The controlled rating value. Can be bound with `v-model`.                                                                                                                                            |
| `length`       | `number \| undefined`                  | Omitted | The number of rating items to render.                                                                                                                                                                |
| `clearable`    | `boolean \| undefined`                 | false   | When `true`, clicking the currently selected rating resets the value to `0`.                                                                                                                         |
| `hoverable`    | `boolean \| undefined`                 | false   | When `true`, the rating previews the value under the pointer on hover.                                                                                                                               |
| `step`         | `1 \| 0.5 \| 0.25 \| 0.1 \| undefined` | Omitted | The granularity each rating item is divided into.                                                                                                                                                    |
| `disabled`     | `boolean \| undefined`                 | false   | When `true`, prevents the user from interacting with radio items.                                                                                                                                    |
| `name`         | `string \| undefined`                  | Omitted | The name of the field. Submitted with its owning form as part of a name/value pair.                                                                                                                  |
| `required`     | `boolean \| undefined`                 | false   | When `true`, indicates that the user must set the value before the owning form can be submitted.                                                                                                     |
| `asChild`      | `boolean \| undefined`                 | false   | Change the default rendered element for the one passed as a child, merging their props and behavior. Read our [Composition](https://www.reka-ui.com/docs/guides/composition) guide for more details. |
| `as`           | `Component \| AsTag \| undefined`      | "div"   | The element or component this component should render as. Can be overwritten by `asChild`. defaultValue: "div"                                                                                       |
| `dir`          | `Direction \| undefined`               | Omitted | The reading direction of the combobox when applicable. <br> If omitted, inherits globally from `ConfigProvider` or assumes LTR (left-to-right) reading mode.                                         |
| `loop`         | `boolean \| undefined`                 | false   | When `true`, keyboard navigation will loop from last item to first, and vice versa.                                                                                                                  |
| `orientation`  | `DataOrientation \| undefined`         | Omitted | The orientation of the component.                                                                                                                                                                    |

#### Events

| Name                | Parameters        | Return type | Description                                 |
| ------------------- | ----------------- | ----------- | ------------------------------------------- |
| `update:modelValue` | `payload: number` | `void`      | Event handler called when the value changes |

#### Slots

| Name      | Parameters           | Return type  | Description                                    |
| --------- | -------------------- | ------------ | ---------------------------------------------- |
| `default` | `{ value: number; }` | `VNodeChild` | Content for a rating step; defaults to a star. |

#### Exposed API

No declared entries.

<!-- /frame:generated -->

### Composition and upstream reference

Defaults below are Reka reference defaults unless a Frame override is stated. Declared means a typed Frame prop/event; Forwarded means attribute/listener fallthrough to the named part; Internal means generated by Frame; Absent means not routed or composed. Generic upstream `T`/`AcceptableValue` describes Reka, not a promise of arbitrary option values in Frame.

#### Root

#### Props

| Prop           | Reka type                    | Reka required/default | Availability | Frame behavior                                                                                        |
| -------------- | ---------------------------- | --------------------- | ------------ | ----------------------------------------------------------------------------------------------------- |
| `as`           | `AsTag \| Component`         | "div"                 | Declared     | Element/component used to render this part.                                                           |
| `asChild`      | `boolean`                    | -                     | Declared     | Typed upstream composition option; fixed generated children are not a public custom-composition slot. |
| `clearable`    | `boolean`                    | -                     | Declared     | Clicking the selected rating can reset it to zero.                                                    |
| `defaultValue` | `number`                     | -                     | Declared     | Initial uncontrolled value upstream; does not override a supplied controlled model.                   |
| `dir`          | `"ltr" \| "rtl"`             | -                     | Declared     | Reading/navigation direction; inherits Reka configuration or LTR when unset.                          |
| `disabled`     | `boolean`                    | -                     | Declared     | Disable interaction for this part and its participating descendants.                                  |
| `hoverable`    | `boolean`                    | -                     | Declared     | Preview the score under the pointer.                                                                  |
| `length`       | `number`                     | 5                     | Declared     | Number of generated rating items.                                                                     |
| `loop`         | `boolean`                    | -                     | Declared     | Wrap keyboard navigation at collection endpoints.                                                     |
| `modelValue`   | `number`                     | -                     | Declared     | Controlled value; updates require the host to retain the emitted value.                               |
| `name`         | `string`                     | -                     | Declared     | Submitted/registered field identity.                                                                  |
| `orientation`  | `"vertical" \| "horizontal"` | "horizontal"          | Declared     | Keyboard navigation axis; Frame styling can impose a separate visual layout.                          |
| `required`     | `boolean`                    | -                     | Declared     | Participate in the owning form’s required-value constraint.                                           |
| `step`         | `1 \| 0.5 \| 0.25 \| 0.1`    | 1                     | Declared     | Numeric increment or fractional rating precision.                                                     |

#### Emits

| Event               | Payload             | Availability | Behavior                                                 |
| ------------------- | ------------------- | ------------ | -------------------------------------------------------- |
| `update:modelValue` | `[payload: number]` | Declared     | Value changed; retain it in host state. Not cancellable. |

#### Slots

| Default-slot field | Reka type             | Frame availability                             |
| ------------------ | --------------------- | ---------------------------------------------- |
| `modelValue`       | `number \| undefined` | Internal; not passed to the Frame caller slot. |
| `items`            | `number[]`            | Internal; not passed to the Frame caller slot. |

#### Data attributes

| Attribute       | Values/presence         | Meaning                                                                                  |
| --------------- | ----------------------- | ---------------------------------------------------------------------------------------- |
| `data-disabled` | `Present when disabled` | Underlying radio-group state; navigation axis is aria-orientation, not a data attribute. |

#### Exposed methods

Frame does not defineExpose or forward the internal Reka instance. Do not depend on internal Reka methods/refs through a Frame component ref.

#### Item

#### Props

| Prop      | Reka type            | Reka required/default | Availability | Frame behavior                                                                                                       |
| --------- | -------------------- | --------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------- |
| `as`      | `AsTag \| Component` | "label"               | Internal     | Element/component used to render this part. Not independently configurable through Frame.                            |
| `asChild` | `boolean`            | -                     | Internal     | Merge the part behavior into one child instead of rendering a wrapper. Not independently configurable through Frame. |
| `item`    | `number`             | Required upstream     | Internal     | Generated from Root’s items. Not independently configurable through Frame.                                           |

#### Emits

No component emits on this part. Native bubbling listeners are not additional component emits.

#### Slots

| Default-slot field | Reka type  | Frame availability                             |
| ------------------ | ---------- | ---------------------------------------------- |
| `steps`            | `number[]` | Internal; not passed to the Frame caller slot. |

#### Data attributes

No component state data attributes are defined on this part. Inherited native/ARIA attributes are not data attributes.

#### ItemIndicator

#### Props

| Prop      | Reka type            | Reka required/default | Availability | Frame behavior                                                                                                       |
| --------- | -------------------- | --------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------- |
| `as`      | `AsTag \| Component` | "div"                 | Internal     | Element/component used to render this part. Not independently configurable through Frame.                            |
| `asChild` | `boolean`            | -                     | Internal     | Merge the part behavior into one child instead of rendering a wrapper. Not independently configurable through Frame. |
| `step`    | `number`             | Required upstream     | Internal     | Generated from Item’s steps. Not independently configurable through Frame.                                           |

#### Emits

No component emits on this part. Native bubbling listeners are not additional component emits.

#### Slots

Underlying default content has no documented scoped fields. Frame generates this part’s content; no caller slot targets it independently.

#### Data attributes

| Attribute       | Values/presence            | Meaning                                                                       |
| --------------- | -------------------------- | ----------------------------------------------------------------------------- |
| `data-state`    | `active, otherwise absent` | Filled score or hover preview; aria-checked separately tracks selected radio. |
| `data-disabled` | `Present when disabled`    | Underlying radio disabled state.                                              |

#### Frame additions

#### Props

No Frame-only props.

#### Emits

No additional Frame-only events; see the part tables for declared or forwarded events.

#### Slots

`default`: `{ value: number }`, rendered inside each ItemIndicator; fallback is ★. This is the step value, not the entire Root slot payload.

#### Sources and version

Checked against installed `reka-ui@2.11.0`, the [official Reka reference](https://reka-ui.com/docs/components/rating), its [Markdown reference](https://reka-ui.com/docs/components/rating.md), and [Frame implementation](../../../packages/core/src/components/forms/FrameRating.vue). Styling comes from [advanced.css](../../../packages/core/src/components/forms/shared/advanced.css) and [shared styles](../../../packages/core/src/style.css). JSON availability comes from the [token catalog](../../../packages/core/src/themes/tokens/tokenCatalog.ts).

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="rating" -->

| CSS variable     | Theme path     | Default expression | Purpose                                                                                  | Context                                                                                                                                             |
| ---------------- | -------------- | ------------------ | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--frame-muted`  | `frame.muted`  | `#8e9496`          | Secondary foreground for descriptions, hints, and visually subordinate content.          | `.frame-rating-step`                                                                                                                                |
| `--frame-accent` | `frame.accent` | `#0078d4`          | Shared interaction color for keyboard focus, active actions, and accent-filled controls. | `.frame-rating-step[data-state='active']`                                                                                                           |
| `--frame-accent` | `frame.accent` | `#0078d4`          | Shared interaction color for keyboard focus, active actions, and accent-filled controls. | `:is(   .frame-advanced-input,   .frame-rating-step,   .frame-tag,   .frame-tag-delete,   .frame-color-thumb,   .frame-swatch-item ):focus-visible` |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->

### Additional styling guidance

#### Parts and selectors

| Selector             | Part          | Placement                                                                        |
| -------------------- | ------------- | -------------------------------------------------------------------------------- |
| `.frame-rating`      | Root          | See attribute routing in Anatomy; internal parts have no independent attrs prop. |
| `.frame-rating-item` | Item          | See attribute routing in Anatomy; internal parts have no independent attrs prop. |
| `.frame-rating-step` | ItemIndicator | See attribute routing in Anatomy; internal parts have no independent attrs prop. |

Items are fixed at 24 by 28px, with 3px group gaps and 24px indicator glyphs. Reka’s --reka-rating-item-step-* values are runtime geometry outputs, not Frame JSON override keys.

#### Variables

| Token key        | Variable         | Value kind | Default/fallback                                                  | Part/effect                                | Scope/limits                                                                                              | Description                                      |
| ---------------- | ---------------- | ---------- | ----------------------------------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `--frame-accent` | `--frame-accent` | color      | Catalog: `#0078d4`. No local fallback; resolves from the cascade. | ItemIndicator color; ItemIndicator outline | Shared with other controls using the same variable. State selectors: [data-state=active], :focus-visible. | Sets ItemIndicator color; ItemIndicator outline. |
| `--frame-muted`  | `--frame-muted`  | color      | Catalog: `#8e9496`. No local fallback; resolves from the cascade. | ItemIndicator color                        | Shared with other controls using the same variable.                                                       | Sets ItemIndicator color.                        |

See [theme variables](../../styling/theme-variables.md) for theme authoring.
