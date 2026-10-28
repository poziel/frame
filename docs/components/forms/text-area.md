# FrameTextArea

A styled native textarea for multiline plain text, such as descriptions, notes, and messages. The host owns the string value.

## Features

### Anatomy

```text
FrameTextArea
└─ Reka Primitive (asChild; no extra DOM wrapper)
   └─ textarea.frame-text-area
```

The native textarea handles text editing, form constraints, and focus. There is no separate indicator, state provider, or internal label.

### Basic usage

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { FrameLabel, FrameTextArea } from '@frame/core';
import '@frame/core/style.css';

const description = ref('');
</script>

<template>
  <div>
    <FrameLabel for="description">Description</FrameLabel>
    <FrameTextArea
      id="description"
      v-model="description"
      name="description"
      :rows="6"
      placeholder="Describe this project"
    />
  </div>
</template>
```

### Length and read-only content

Normal textarea attributes and native event listeners fall through to the textarea:

```vue
<FrameTextArea
  id="description"
  v-model="description"
  :maxlength="2000"
  aria-describedby="description-help"
/>
<p id="description-help">Up to 2,000 characters.</p>
```

Use `readonly` for selectable content that cannot be edited, or `disabled` to disable interaction. A named read-only field is included in native form data; a disabled field is not. `required` and length constraints use browser validation. Frame does not add counters or error messages automatically.

### Behavior and accessibility

Enter inserts a newline. Frame does not turn Enter into form submission, debounce input, interpret markup, or grow the textarea to fit its text. The textarea can be resized vertically by default.

Use a visible [label](label.md), or `aria-label` when appropriate. Connect help/errors with `aria-describedby`; the host decides when a value is invalid. A placeholder does not replace a label.

Short follow-up examples reuse the Basic usage setup unless they include their own script. Styles load once per application; these controls need no Frame instance.

### Use a multiline field

Bind a string with v-model; use rows and placeholder to guide input. Associate a visible label using for/id.

<!-- frame:example id="text-area.original-playground" -->

```vue
<FrameTextArea v-model="notes" :rows="5" placeholder="Write a note…" aria-label="Notes" />
```

### Write release notes

A multiline string keeps line breaks intact while the host decides when to persist the draft.

<!-- frame:example id="text-area.release-notes" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameTextArea } from '@frame/core';
const demoModelValue = ref("Changes in this release:\n• Faster workspace search\n• Improved keyboard navigation");
const demoRows = 5;
</script>
<template>
<FrameTextArea v-model="demoModelValue" :rows="demoRows" :placeholder="&quot;Describe the release&quot;" />
</template>
```

### Start a review comment

An empty textarea with a focused prompt helps the user add longer feedback.

<!-- frame:example id="text-area.review-comment" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameTextArea } from '@frame/core';
const demoModelValue = ref("");
const demoRows = 3;
</script>
<template>
<FrameTextArea v-model="demoModelValue" :rows="demoRows" :placeholder="&quot;What should change before this is approved?&quot;" />
</template>
```

## APIs

<!-- frame:generated api="text-area" -->

### FrameTextArea

Source: `packages/core/src/components/forms/FrameTextArea.vue`

#### Properties

| Name               | Type                                                  | Default | Description                                                                        |
| ------------------ | ----------------------------------------------------- | ------- | ---------------------------------------------------------------------------------- |
| `tooltip`          | `string \| false \| undefined`                        | Omitted | Tooltip text; false disables it. When omitted, the native title attribute is used. |
| `tooltipPlacement` | `"top" \| "bottom" \| "left" \| "right" \| undefined` | Omitted | Preferred tooltip side; positioning falls back when space is limited.              |
| `modelValue`       | `string \| undefined`                                 | ""      | Controlled textarea text.                                                          |
| `disabled`         | `boolean \| undefined`                                | false   | Prevents user interaction with the control.                                        |
| `placeholder`      | `string \| undefined`                                 | Omitted | Hint displayed while the editable value is empty.                                  |
| `rows`             | `number \| undefined`                                 | 4       | Initial visible row count of the textarea.                                         |

#### Events

| Name                | Parameters      | Return type | Description                                                 |
| ------------------- | --------------- | ----------- | ----------------------------------------------------------- |
| `update:modelValue` | `value: string` | `void`      | Requests the new application-owned value after interaction. |

#### Slots

| Name      | Parameters | Return type  | Description                              |
| --------- | ---------- | ------------ | ---------------------------------------- |
| `tooltip` | `None`     | `VNodeChild` | Custom tooltip content for the textarea. |

#### Exposed API

| Name      | Parameters | Return type                        | Description                                                                      |
| --------- | ---------- | ---------------------------------- | -------------------------------------------------------------------------------- |
| `element` | `None`     | `HTMLTextAreaElement \| undefined` | Native textarea element; undefined before mount and unwrapped on component refs. |
| `focus`   | `None`     | `void \| undefined`                | Focuses the native textarea when mounted.                                        |

<!-- /frame:generated -->

### Composition and upstream reference

The tables separate Reka types from the actual Frame contract. Declared APIs are typed by Frame; forwarded attributes reach only the named part; internal parts cannot be configured independently. Defaults labeled Reka belong to the underlying reference.

#### Root

Frame supplies this part in its anatomy. Availability below refers to configuration through the Frame wrapper, not direct use of a Reka export.

#### Props

| Prop      | Reka type             | Frame type                | Required/default                    | Availability | Description                                                                                               |
| --------- | --------------------- | ------------------------- | ----------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------- |
| `as`      | `string \| Component` | No independent Frame prop | `div` (Reka)                        | Internal     | Frame fixes Primitive asChild around a native input/textarea; element replacement is not a supported API. |
| `asChild` | `boolean`             | No independent Frame prop | `true` (Frame internal composition) | Internal     | Frame fixes Primitive asChild around a native input/textarea; element replacement is not a supported API. |

#### Emits

No component-defined emits on this part. Native listeners are separate from component emits.

#### Slots

| Upstream slot | Scoped field            | Frame availability                                           |
| ------------- | ----------------------- | ------------------------------------------------------------ |
| default       | No scoped fields listed | Frame supplies the internal composition; no public part slot |

#### Data attributes

| Attribute      | Value/presence           | Meaning                                                                                                     |
| -------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------- |
| Native element | No Reka state attributes | Use native :disabled/:read-only/:focus-visible/validation selectors; caller data-* attributes pass through. |

#### Frame additions

#### Props

| Prop          | Type      | Required/default | Description                                         |
| ------------- | --------- | ---------------- | --------------------------------------------------- |
| `modelValue`  | `string`  | `''`             | Native textarea value.                              |
| `disabled`    | `boolean` | `false`          | Disable native interaction.                         |
| `placeholder` | `string`  | `Unset`          | Empty-field hint.                                   |
| `rows`        | `number`  | `4`              | Native row count; CSS minimum height still applies. |

#### Slots

No additional public Frame slots.

#### Emits

| Emit              | Payload | When                                                                                      |
| ----------------- | ------- | ----------------------------------------------------------------------------------------- |
| update:modelValue | string  | Each native input event; host must retain the value through v-model or an update handler. |

#### Exposed methods

| Member  | Type                                               | Behavior                                                                                                       |
| ------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| focus   | `() => void`                                       | Focus native control once mounted.                                                                             |
| element | `Ref<HTMLTextAreaElement \| undefined>` internally | Native ref exposed through a Vue component ref; public instance access unwraps refs. Unavailable before mount. |

#### Sources and version

[FrameTextArea.vue](../../../packages/core/src/components/forms/FrameTextArea.vue) renders a native textarea through Reka Primitive. Styling lives in [style.css](../../../packages/core/src/style.css).

#### Reka comparison and state hooks

Reka's index has no corresponding TextArea primitive page. [Primitive](https://reka-ui.com/docs/utilities/primitive.md) is the underlying utility: Frame uses its `asChild` mode around a fixed textarea. Primitive's `as` and `asChild` are not declared Frame textarea props or supported element-replacement options; input handling and the exposed ref depend on a textarea.

Frame supplies its own model, update event, and exposed element/focus API. No Reka state slot payload or `data-state`/`data-disabled` attribute is added. Use native `:disabled`, `:read-only`, `:focus-visible`, and validation selectors, or host-owned `aria-invalid`. Caller `data-*` attributes pass through.

Compared with the live Primitive reference and installed Reka `2.11.0` source. See the [coverage review](../../reference/reka-coverage.md).

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="text-area" -->

| CSS variable                             | Theme path                             | Default expression                                                                       | Purpose                                                                                           | Context                                         |
| ---------------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `--frame-input-border`                   | `frame.input.border`                   | `1px solid     var(--frame-control-border)`                                              | Fallback for: Resting border of the text area.                                                    | `.frame-text-area`                              |
| `--frame-text-area-border`               | `frame.text.area.border`               | `var(     --frame-input-border,     1px solid     var(--frame-control-border)   )`       | Resting border of the text area.                                                                  | `.frame-text-area`                              |
| `--frame-text-area-border-radius`        | `frame.text.area.border.radius`        | `var(--frame-input-radius)`                                                              | Corner radius of the text area.                                                                   | `.frame-text-area`                              |
| `--frame-input-hover-border`             | `frame.input.hover.border`             | `1px solid     var(--frame-control-border)`                                              | Fallback for: Border while the pointer hovers over the text area.                                 | `.frame-text-area`                              |
| `--frame-text-area-hover-border`         | `frame.text.area.hover.border`         | `var(     --frame-input-hover-border,     1px solid     var(--frame-control-border)   )` | Border while the pointer hovers over the text area.                                               | `.frame-text-area`                              |
| `--frame-input-hover-outline`            | `frame.input.hover.outline`            | `none`                                                                                   | Fallback for: Outline while the pointer hovers over the text area.                                | `.frame-text-area`                              |
| `--frame-text-area-hover-outline`        | `frame.text.area.hover.outline`        | `var(     --frame-input-hover-outline,     none   )`                                     | Outline while the pointer hovers over the text area.                                              | `.frame-text-area`                              |
| `--frame-input-focus-border`             | `frame.input.focus.border`             | `1px solid var(--frame-accent)`                                                          | Fallback for: Border while focus is within the text area.                                         | `.frame-text-area`                              |
| `--frame-text-area-focus-border`         | `frame.text.area.focus.border`         | `var(     --frame-input-focus-border,     1px solid var(--frame-accent)   )`             | Border while focus is within the text area.                                                       | `.frame-text-area`                              |
| `--frame-input-focus-outline`            | `frame.input.focus.outline`            | `1px solid var(--frame-accent)`                                                          | Fallback for: Focus outline of the text area.                                                     | `.frame-text-area`                              |
| `--frame-text-area-focus-outline`        | `frame.text.area.focus.outline`        | `var(     --frame-input-focus-outline,     1px solid var(--frame-accent)   )`            | Focus outline of the text area.                                                                   | `.frame-text-area`                              |
| `--frame-input-outline-offset`           | `frame.input.outline.offset`           | `0px`                                                                                    | Fallback for: Offset between the outline and the text area.                                       | `.frame-text-area`                              |
| `--frame-text-area-outline-offset`       | `frame.text.area.outline.offset`       | `var(     --frame-input-outline-offset,     0px   )`                                     | Offset between the outline and the text area.                                                     | `.frame-text-area`                              |
| `--frame-control-border`                 | `frame.control.border`                 | `var(--frame-border-color)`                                                              | Resting border color of form controls, independently overridable from menu borders.               | `.frame-text-area`                              |
| `--frame-input-radius`                   | `frame.input.radius`                   | `var(--frame-menu-border-radius)`                                                        | Shared corner radius for text fields, text areas, selects, and composed input surfaces.           | `.frame-text-area`                              |
| `--frame-accent`                         | `frame.accent`                         | `#0078d4`                                                                                | Shared interaction color for keyboard focus, active actions, and accent-filled controls.          | `.frame-text-area`                              |
| `--frame-text-area-width`                | `frame.text.area.width`                | `min(100%, 460px)`                                                                       | Width for .frame-text-area.                                                                       | `.frame-text-area`                              |
| `--frame-text-area-min-height`           | `frame.text.area.min.height`           | `90px`                                                                                   | Minimum height for .frame-text-area.                                                              | `.frame-text-area`                              |
| `--frame-text-area-padding`              | `frame.text.area.padding`              | `8px`                                                                                    | Internal spacing for .frame-text-area.                                                            | `.frame-text-area`                              |
| `--frame-text-area-color`                | `frame.text.area.color`                | `var(--frame-control-text)`                                                              | Foreground for .frame-text-area.                                                                  | `.frame-text-area`                              |
| `--frame-text-area-background`           | `frame.text.area.background`           | `var(     --frame-control-background   )`                                                | Background for .frame-text-area.                                                                  | `.frame-text-area`                              |
| `--frame-text-area-border`               | `frame.text.area.border`               | `1px solid     var(--frame-control-border)`                                              | Border for .frame-text-area.                                                                      | `.frame-text-area`                              |
| `--frame-text-area-border-radius`        | `frame.text.area.border.radius`        | `var(     --frame-input-radius   )`                                                      | Corner radius for .frame-text-area.                                                               | `.frame-text-area`                              |
| `--frame-control-text`                   | `frame.control.text`                   | `#d4d4d4`                                                                                | Foreground for text and icons on resting control surfaces.                                        | `.frame-text-area`                              |
| `--frame-control-background`             | `frame.control.background`             | `#1d1d1d`                                                                                | Resting fill of text-entry controls and other control surfaces.                                   | `.frame-text-area`                              |
| `--frame-chat-composer-textarea-border`  | `frame.chat.composer.textarea.border`  | `0`                                                                                      | Default used by --frame-text-area-focus-border on .frame-chat-composer textarea.frame-text-area.  | `.frame-chat-composer textarea.frame-text-area` |
| `--frame-text-area-border`               | `frame.text.area.border`               | `var(     --frame-chat-composer-textarea-border,     0   )`                              | Resting text-area border within the chat composer.                                                | `.frame-chat-composer textarea.frame-text-area` |
| `--frame-text-area-hover-border`         | `frame.text.area.hover.border`         | `var(     --frame-chat-composer-textarea-border,     0   )`                              | Hovered text-area border within the chat composer.                                                | `.frame-chat-composer textarea.frame-text-area` |
| `--frame-text-area-focus-border`         | `frame.text.area.focus.border`         | `var(     --frame-chat-composer-textarea-border,     0   )`                              | Focused text-area border within the chat composer.                                                | `.frame-chat-composer textarea.frame-text-area` |
| `--frame-chat-composer-textarea-outline` | `frame.chat.composer.textarea.outline` | `none`                                                                                   | Default used by --frame-text-area-focus-outline on .frame-chat-composer textarea.frame-text-area. | `.frame-chat-composer textarea.frame-text-area` |
| `--frame-text-area-hover-outline`        | `frame.text.area.hover.outline`        | `var(     --frame-chat-composer-textarea-outline,     none   )`                          | Hovered text-area outline within the chat composer.                                               | `.frame-chat-composer textarea.frame-text-area` |
| `--frame-text-area-focus-outline`        | `frame.text.area.focus.outline`        | `var(     --frame-chat-composer-textarea-outline,     none   )`                          | Focused text-area outline within the chat composer.                                               | `.frame-chat-composer textarea.frame-text-area` |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->

### Additional styling guidance

#### Parts and selectors

| Selector           | Part            | Placement/attribute target               |
| ------------------ | --------------- | ---------------------------------------- |
| `.frame-text-area` | Native textarea | Caller class/style targets this element. |

The native textarea is the target. Vertical resizing is enabled; there is no dedicated resize prop.

#### Variables

| Token key                    | Variable                          | Value kind                     | Default/fallback                                      | Part/effect                   | Scope/limits                                                        | Description              |
| ---------------------------- | --------------------------------- | ------------------------------ | ----------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------- | ------------------------ |
| `--frame-control-background` | `--frame-control-background`      | color                          | Catalog: `#1d1d1d`                                    | Native textarea background    | Shared across controls using this variable.                         | Control background.      |
| `--frame-control-border`     | `--frame-control-border`          | color                          | Catalog: `var(--frame-border-color)`                  | Native textarea border        | Shared across controls using this variable.                         | Control border.          |
| `--frame-control-text`       | `--frame-control-text`            | color                          | Catalog: `#d4d4d4`                                    | Native textarea color         | Shared across controls using this variable.                         | Control text.            |
| `--frame-input-radius`       | `--frame-input-radius`            | length                         | Catalog: `var(--frame-menu-border-radius)`            | Native textarea border-radius | Shared across controls using this variable.                         | Input radius.            |
| CSS only                     | `--frame-text-area-background`    | color                          | CSS fallback: `var(--frame-control-background)`       | Native textarea background    | Local to matching component rules. CSS only; not in JSON allowlist. | Text area background.    |
| CSS only                     | `--frame-text-area-border`        | border shorthand               | CSS fallback: `1px solid var(--frame-control-border)` | Native textarea border        | Local to matching component rules. CSS only; not in JSON allowlist. | Text area border.        |
| CSS only                     | `--frame-text-area-border-radius` | length / CSS length expression | CSS fallback: `var(--frame-input-radius)`             | Native textarea border-radius | Local to matching component rules. CSS only; not in JSON allowlist. | Text area border radius. |
| CSS only                     | `--frame-text-area-color`         | color                          | CSS fallback: `var(--frame-control-text)`             | Native textarea color         | Local to matching component rules. CSS only; not in JSON allowlist. | Text area color.         |
| CSS only                     | `--frame-text-area-min-height`    | length / CSS length expression | CSS fallback: `90px`                                  | Native textarea min-height    | Local to matching component rules. CSS only; not in JSON allowlist. | Text area min height.    |
| CSS only                     | `--frame-text-area-padding`       | CSS spacing                    | CSS fallback: `8px`                                   | Native textarea padding       | Local to matching component rules. CSS only; not in JSON allowlist. | Text area padding.       |
| CSS only                     | `--frame-text-area-width`         | length / CSS length expression | CSS fallback: `min(100%, 460px)`                      | Native textarea width         | Local to matching component rules. CSS only; not in JSON allowlist. | Text area width.         |

See [theme variables](../../styling/theme-variables.md) for theme authoring.
