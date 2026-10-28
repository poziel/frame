# FrameSlider

A horizontal, single-thumb numeric slider. Frame adapts Reka’s array model to one number.

## Features

### Anatomy

```text
FrameSlider
SliderRoot (modelValue converted to [number])
├─ SliderTrack
│  └─ SliderRange
└─ SliderThumb (caller attributes)
input[type=hidden] (optional name/form submission)
```

Automatic fallthrough is disabled. Undeclared attributes/class/style/listeners go to Thumb. They cannot configure Root orientation, inversion, commit events, or additional thumbs. These Reka parts are internal composition, not separately exported Frame building blocks.

### Basic usage

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { FrameSlider } from '@frame/core';
import '@frame/core/style.css';

const value = ref(40);
</script>

<template>
  <FrameSlider v-model="value" aria-label="Volume" :min="0" :max="100" :step="5" />
  <output>{{ value }}</output>
</template>
```

Load the stylesheet once per application. This component works without a Frame instance.

### Value, bounds, and interaction

Use one finite number within `min` and `max`, with a positive `step`. Frame defaults to 0–100 in increments of 1. Pointer dragging and keyboard changes emit a number; Reka’s first array entry is used and a missing entry falls back to the current model. The wrapper renders exactly one thumb and has no range-selection API.

Arrow keys change by one step; Home/End jump to bounds; Page Up/Down and shifted arrow interactions use larger steps. Keyboard behavior and pointer tracking come from Reka. The control is horizontal with Reka’s default alignment/inversion. Passing orientation, inverted, or minStepsBetweenThumbs to Frame sends them to Thumb and does not configure Root. Reka uses pointer events; use pointer listeners for drag observation.

### Accessibility and forms

Pass `aria-label` or `aria-labelledby` to name Thumb, the focusable role=slider element. Caller class/style also targets Thumb; it does not set the track width. Ensure the surrounding layout gives the Root enough available width.

`name` creates a hidden input with the raw number; `form` associates that helper with a form ID. Reka Root receives an empty name to avoid duplicate submitted values. `required` reaches Root but Frame has no separate required-validation helper for the number. A value is not validated against application rules automatically. Root’s `valueCommit` event is not forwarded: a listener on Frame lands on Thumb and will not receive Root commit emissions. Use the numeric model for current values and define host save timing explicitly.

### Adjust a bounded value

Drag or click within the track to choose a value between zero and one hundred.

<!-- frame:example id="slider.continuous" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameSlider } from '@frame/core';
const demoModelValue = ref(35);
const demoMin = 0;
const demoMax = 100;
</script>
<template>
<FrameSlider v-model="demoModelValue" :min="demoMin" :max="demoMax" />
</template>
```

### Snap to larger steps

A step of 25 restricts selection to coarse levels.

<!-- frame:example id="slider.steps" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameSlider } from '@frame/core';
const demoModelValue = ref(50);
const demoMin = 0;
const demoMax = 100;
const demoStep = 25;
</script>
<template>
<FrameSlider v-model="demoModelValue" :min="demoMin" :max="demoMax" :step="demoStep" />
</template>
```

### Use a signed range

Custom bounds allow values below and above zero.

<!-- frame:example id="slider.negative" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameSlider } from '@frame/core';
const demoModelValue = ref(-2);
const demoMin = -10;
const demoMax = 10;
const demoStep = 1;
</script>
<template>
<FrameSlider v-model="demoModelValue" :min="demoMin" :max="demoMax" :step="demoStep" />
</template>
```

## APIs

<!-- frame:generated api="slider" -->

### FrameSlider

Source: `packages/core/src/components/forms/FrameSlider.vue`

#### Properties

| Name         | Type                   | Default  | Description                                                        |
| ------------ | ---------------------- | -------- | ------------------------------------------------------------------ |
| `modelValue` | `number`               | Required | Controlled numeric value represented by the single slider thumb.   |
| `name`       | `string \| undefined`  | Omitted  | Name of the hidden input included in native form submission.       |
| `form`       | `string \| undefined`  | Omitted  | Identifier of the native form associated with the submitted input. |
| `required`   | `boolean \| undefined` | false    | Requires a value when the associated form is validated.            |
| `min`        | `number \| undefined`  | 0        | Smallest value accepted by the numeric control.                    |
| `max`        | `number \| undefined`  | 100      | Largest value accepted by the numeric control.                     |
| `step`       | `number \| undefined`  | 1        | Increment used for keyboard, pointer, and stepper changes.         |
| `disabled`   | `boolean \| undefined` | false    | Prevents user interaction with the control.                        |

#### Events

| Name                | Parameters      | Return type | Description                                                 |
| ------------------- | --------------- | ----------- | ----------------------------------------------------------- |
| `update:modelValue` | `value: number` | `void`      | Requests the new application-owned value after interaction. |

#### Slots

No declared entries.

#### Exposed API

No declared entries.

<!-- /frame:generated -->

### Composition and upstream reference

Defaults below are Reka reference defaults unless a Frame override is stated. Declared means a typed Frame prop/event; Forwarded means attribute/listener fallthrough to the named part; Internal means generated by Frame; Absent means not routed or composed. Generic upstream `T`/`AcceptableValue` describes Reka, not a promise of arbitrary option values in Frame.

#### Root

#### Props

| Prop                    | Reka type                    | Reka required/default | Availability | Frame behavior                                                                                                                                                      |
| ----------------------- | ---------------------------- | --------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `as`                    | `AsTag \| Component`         | "span"                | Absent       | Not routed to Root. Undeclared attributes target Thumb.                                                                                                             |
| `asChild`               | `boolean`                    | -                     | Absent       | Not routed to Root. Undeclared attributes target Thumb.                                                                                                             |
| `defaultValue`          | `number[]`                   | [0]                   | Absent       | Not routed to Root. Undeclared attributes target Thumb.                                                                                                             |
| `dir`                   | `"ltr" \| "rtl"`             | -                     | Absent       | Not routed to Root. Undeclared attributes target Thumb.                                                                                                             |
| `disabled`              | `boolean`                    | false                 | Declared     | Frame: `boolean`, false. Disable interaction for this part and its participating descendants.                                                                       |
| `inverted`              | `boolean`                    | false                 | Absent       | Not routed to Root. Undeclared attributes target Thumb.                                                                                                             |
| `max`                   | `number`                     | 100                   | Declared     | Frame: `number`, 100. Upper numeric bound.                                                                                                                          |
| `min`                   | `number`                     | 0                     | Declared     | Frame: `number`, 0. Lower numeric bound.                                                                                                                            |
| `minStepsBetweenThumbs` | `number`                     | 0                     | Absent       | Not routed to Root. Undeclared attributes target Thumb.                                                                                                             |
| `modelValue`            | `number[] \| null`           | -                     | Changed      | Frame: `number`, Required. Controlled value; updates require the host to retain the emitted value. Adapted to [number] internally; updates return the first number. |
| `name`                  | `string`                     | -                     | Changed      | Frame: `string`, Unset. Submitted/registered field identity. Frame serializes through a separate hidden input; Reka receives name="".                               |
| `orientation`           | `"vertical" \| "horizontal"` | "horizontal"          | Absent       | Not routed to Root. Undeclared attributes target Thumb.                                                                                                             |
| `required`              | `boolean`                    | -                     | Declared     | Frame: `boolean`, false. Participate in the owning form’s required-value constraint.                                                                                |
| `step`                  | `number`                     | 1                     | Declared     | Frame: `number`, 1. Numeric increment or fractional rating precision.                                                                                               |
| `thumbAlignment`        | `"contain" \| "overflow"`    | "contain"             | Absent       | Not routed to Root. Undeclared attributes target Thumb.                                                                                                             |

#### Emits

| Event               | Payload               | Availability | Behavior                                                                                                            |
| ------------------- | --------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------- |
| `update:modelValue` | `[value: number]`     | Declared     | Value changed; retain it in host state. Not cancellable. Payload shown is Frame’s public payload.                   |
| `valueCommit`       | `[payload: number[]]` | Absent       | Array value at the end of a slider interaction. Caller listeners target Thumb, so this Root event is not forwarded. |

#### Slots

| Default-slot field | Reka type          | Frame availability                             |
| ------------------ | ------------------ | ---------------------------------------------- |
| `modelValue`       | `number[] \| null` | Internal; not passed to the Frame caller slot. |

#### Data attributes

| Attribute          | Values/presence         | Meaning                                                                            |
| ------------------ | ----------------------- | ---------------------------------------------------------------------------------- |
| `data-disabled`    | `Present when disabled` | Inherited Root disabled state.                                                     |
| `data-orientation` | `horizontal`            | Wrapper uses default horizontal Root; child attributes cannot change its geometry. |

#### Exposed methods

Frame does not defineExpose or forward the internal Reka instance. Do not depend on internal Reka methods/refs through a Frame component ref.

#### Track

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

| Attribute          | Values/presence         | Meaning                                                                            |
| ------------------ | ----------------------- | ---------------------------------------------------------------------------------- |
| `data-disabled`    | `Present when disabled` | Inherited Root disabled state.                                                     |
| `data-orientation` | `horizontal`            | Wrapper uses default horizontal Root; child attributes cannot change its geometry. |

#### Range

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

| Attribute          | Values/presence         | Meaning                                                                            |
| ------------------ | ----------------------- | ---------------------------------------------------------------------------------- |
| `data-disabled`    | `Present when disabled` | Inherited Root disabled state.                                                     |
| `data-orientation` | `horizontal`            | Wrapper uses default horizontal Root; child attributes cannot change its geometry. |

#### Thumb

#### Props

| Prop      | Reka type            | Reka required/default | Availability | Frame behavior                                                         |
| --------- | -------------------- | --------------------- | ------------ | ---------------------------------------------------------------------- |
| `as`      | `AsTag \| Component` | "span"                | Forwarded    | Element/component used to render this part.                            |
| `asChild` | `boolean`            | -                     | Forwarded    | Merge the part behavior into one child instead of rendering a wrapper. |

#### Emits

No component emits on this part. Native bubbling listeners are not additional component emits.

#### Slots

Underlying default content has no documented scoped fields. Frame generates this part’s content; no caller slot targets it independently.

#### Data attributes

| Attribute          | Values/presence         | Meaning                                                                            |
| ------------------ | ----------------------- | ---------------------------------------------------------------------------------- |
| `data-disabled`    | `Present when disabled` | Inherited Root disabled state.                                                     |
| `data-orientation` | `horizontal`            | Wrapper uses default horizontal Root; child attributes cannot change its geometry. |

#### Frame additions

#### Props

| Prop   | Type     | Required/default | Description                               |
| ------ | -------- | ---------------- | ----------------------------------------- |
| `form` | `string` | Unset            | Form ID on Frame hidden submission input. |

#### Emits

No additional Frame-only events; see the part tables for declared or forwarded events.

#### Slots

No public content slots; all internal children are generated.

#### Sources and version

Checked against installed `reka-ui@2.11.0`, the [official Reka reference](https://reka-ui.com/docs/components/slider), its [Markdown reference](https://reka-ui.com/docs/components/slider.md), and [Frame implementation](../../../packages/core/src/components/forms/FrameSlider.vue). Styling comes from [controls.scss](../../../packages/core/src/components/forms/styles/controls.scss) and [shared styles](../../../packages/core/src/styles/index.scss). JSON availability comes from the [token catalog](../../../packages/core/src/themes/tokens/tokenCatalog.ts).

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="slider" -->

| CSS variable           | Theme path           | Default expression                        | Purpose                                                                                  | Context                              |
| ---------------------- | -------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------ |
| `--frame-accent`       | `frame.accent`       | `#0078d4`                                 | Elevation shadow for .frame-control-focus:focus-visible.                                 | `.frame-control-focus:focus-visible` |
| `--frame-line`         | `frame.line`         | `#454545`                                 | Border for .frame-slider-track.                                                          | `.frame-slider-track`                |
| `--frame-accent`       | `frame.accent`       | `#0078d4`                                 | Elevation shadow for .frame-slider-range.                                                | `.frame-slider-range`                |
| `--frame-text`         | `frame.text`         | `#ccc`                                    | Foreground for .frame-slider-thumb.                                                      | `.frame-slider-thumb`                |
| `--frame-slider-width` | `frame.slider.width` | `min(100%, 340px)`                        | Width for .frame-slider.                                                                 | `.frame-slider`                      |
| `--frame-accent`       | `frame.accent`       | No declared default; supplied by context. | Shared interaction color for keyboard focus, active actions, and accent-filled controls. | `.frame-slider`                      |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->

### Additional styling guidance

#### Parts and selectors

| Selector              | Part      | Placement                                                                        |
| --------------------- | --------- | -------------------------------------------------------------------------------- |
| `.frame-slider`       | Root base | See attribute routing in Anatomy; internal parts have no independent attrs prop. |
| `.frame-slider-root`  | Root      | See attribute routing in Anatomy; internal parts have no independent attrs prop. |
| `.frame-slider-track` | Track     | See attribute routing in Anatomy; internal parts have no independent attrs prop. |
| `.frame-slider-range` | Range     | See attribute routing in Anatomy; internal parts have no independent attrs prop. |
| `.frame-slider-thumb` | Thumb     | See attribute routing in Anatomy; internal parts have no independent attrs prop. |

Root height is 20px, Track is 4px high, and Thumb is 12px square. Width comes from layout; the older frame-slider base rule also sets the root width. No dedicated track-size or thumb-size token is provided.

#### Variables

| Token key        | Variable               | Value kind | Default/fallback                            | Part/effect                     | Scope/limits                                                                         | Description                           |
| ---------------- | ---------------------- | ---------- | ------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------- |
| `--frame-accent` | `--frame-accent`       | color      | Catalog: `#0078d4`. CSS fallback: `#0078d4` | Thumb outline; Range background | Shared with other controls using the same variable. State selectors: :focus-visible. | Sets Thumb outline; Range background. |
| `--frame-line`   | `--frame-line`         | color      | Catalog: `#2b2b2b`. CSS fallback: `#454545` | Track background                | Shared with other controls using the same variable.                                  | Sets Track background.                |
| CSS only         | `--frame-slider-width` | length     | CSS fallback: `min(100%, 340px)`            | Root base width                 | CSS only; absent from JSON token allowlist.                                          | Sets Root base width.                 |
| `--frame-text`   | `--frame-text`         | color      | Catalog: `#cccccc`. CSS fallback: `#ccc`    | Thumb background                | Shared with other controls using the same variable.                                  | Sets Thumb background.                |

See [theme variables](../../styling/theme-variables.md) for theme authoring.
