# FrameTextField

A styled native input for one line of text. Use it for names, search terms, passwords, email addresses, and other native input types. Use [FrameTextArea](text-area.md) for multiple lines.

## Features

### Anatomy

```text
FrameTextField
└─ Reka Primitive (asChild; no extra DOM wrapper)
   └─ input.frame-text-input
```

The input owns value, native events, constraints, and focus. There is no separate indicator, root state provider, or internal label. Compose a FrameLabel beside it as shown below.

### Basic usage

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { FrameLabel, FrameTextField } from '@frame/core';
import '@frame/core/style.css';

const projectName = ref('');
</script>

<template>
  <div>
    <FrameLabel for="project-name">Project name</FrameLabel>
    <FrameTextField
      id="project-name"
      v-model="projectName"
      name="projectName"
      placeholder="For example, Field notes"
    />
  </div>
</template>
```

### Native input options

The component passes normal attributes and native event listeners to its input. For example, use `required`, `minlength`, `maxlength`, `autocomplete`, `readonly`, `aria-describedby`, or `@blur` as needed:

```vue
<FrameTextField
  id="project-name"
  v-model="projectName"
  required
  :maxlength="80"
  autocomplete="off"
  aria-describedby="project-name-help"
/>
<p id="project-name-help">At most 80 characters.</p>
```

`readonly` keeps the input focusable and its value available to native form submission. `disabled` prevents editing and excludes it from native form data. Browser validation comes from native input constraints, not a Frame error-message system.

### Numeric values

For `type="number"`, nonempty input emits the native input's `valueAsNumber`; clearing it emits `''`. Use a model that accepts both strings and numbers:

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { FrameLabel, FrameTextField } from '@frame/core';
import '@frame/core/style.css';

const quantity = ref<string | number>('');
</script>

<template>
  <FrameLabel for="quantity">Quantity</FrameLabel>
  <FrameTextField id="quantity" v-model="quantity" type="number" :min="0" :step="1" />
</template>
```

Other types emit strings. Treat the model according to its runtime value before using it in calculations. The component does not add numeric formatting or domain validation. File selection is not represented by this string/number model; use a host file input when you need `File` objects.

### Behavior and accessibility

Editing, selection, keyboard behavior, autofill, and type-specific validation follow the native input. Frame emits updates during input; it does not debounce or wait for blur. A model update does not save data or trigger application requests on its own.

Associate a [FrameLabel](label.md) using `id`/`for`, or supply an accessible name such as `aria-label` when no visible label fits. Error/help messages belong to the host; connect them using `aria-describedby` and set `aria-invalid` when appropriate.

Short follow-up examples reuse the Basic usage setup unless they include their own script. Styles load once per application; these controls need no Frame instance.

### Try native text editing

Bind the value with v-model and associate a visible label using for/id. Numeric inputs emit numbers; an empty numeric input emits an empty string so a host can validate it.

<!-- frame:example id="text-input.original-playground" -->

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { FrameTextField } from '@frame/core';
const name = ref('Workspace');
</script>
<template><label for="name">Name</label><FrameTextField id="name" v-model="name" /></template>
```

### Name a workspace

A controlled text input updates the host string while retaining standard native input attributes.

<!-- frame:example id="text-input.workspace-name" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameTextField } from '@frame/core';
const demoModelValue = ref("Design workspace");
</script>
<template>
<FrameTextField v-model="demoModelValue" :type="&quot;text&quot;" :placeholder="&quot;Workspace name&quot;" />
</template>
```

### Filter a file list

Search input semantics identify a query field; the host decides how its string filters application data.

<!-- frame:example id="text-input.filter-files" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameTextField } from '@frame/core';
const demoModelValue = ref("");
</script>
<template>
<FrameTextField v-model="demoModelValue" :type="&quot;search&quot;" :placeholder="&quot;Filter files…&quot;" />
</template>
```

### Enter a numeric limit

Number input emits a numeric value for entered numbers; an empty field remains available for host validation.

<!-- frame:example id="text-input.numeric-limit" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameTextField } from '@frame/core';
const demoModelValue = ref(25);
</script>
<template>
<FrameTextField v-model="demoModelValue" :type="&quot;number&quot;" :placeholder="&quot;Maximum results&quot;" />
</template>
```

## APIs

<!-- frame:generated api="text-input" -->

### FrameTextField

Source: `packages/core/src/components/forms/FrameTextField.vue`

#### Properties

| Name               | Type                                                  | Default | Description                                                                               |
| ------------------ | ----------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------- |
| `tooltip`          | `string \| false \| undefined`                        | Omitted | Tooltip text; false disables it. When omitted, the native title attribute is used.        |
| `tooltipPlacement` | `"top" \| "bottom" \| "left" \| "right" \| undefined` | Omitted | Preferred tooltip side; positioning falls back when space is limited.                     |
| `modelValue`       | `string \| number \| undefined`                       | Omitted | Controlled input value; when omitted the native value attribute supplies the display.     |
| `type`             | `InputTypeHTMLAttribute \| undefined`                 | "text"  | Native input type; number inputs emit numbers for nonempty values and strings when empty. |
| `disabled`         | `boolean \| undefined`                                | false   | Prevents user interaction with the control.                                               |
| `placeholder`      | `string \| undefined`                                 | Omitted | Hint displayed while the editable value is empty.                                         |

#### Events

| Name                | Parameters                | Return type | Description                                                 |
| ------------------- | ------------------------- | ----------- | ----------------------------------------------------------- |
| `update:modelValue` | `value: string \| number` | `void`      | Requests the new application-owned value after interaction. |

#### Slots

| Name      | Parameters | Return type  | Description                           |
| --------- | ---------- | ------------ | ------------------------------------- |
| `tooltip` | `None`     | `VNodeChild` | Custom tooltip content for the input. |

#### Exposed API

| Name      | Parameters | Return type                     | Description                                                                   |
| --------- | ---------- | ------------------------------- | ----------------------------------------------------------------------------- |
| `element` | `None`     | `HTMLInputElement \| undefined` | Native input element; undefined before mount and unwrapped on component refs. |
| `focus`   | `None`     | `void \| undefined`             | Focuses the native input when mounted.                                        |

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

| Prop          | Type                     | Required/default | Description                                                                            |
| ------------- | ------------------------ | ---------------- | -------------------------------------------------------------------------------------- |
| `modelValue`  | `string \| number`       | `''`             | Native input value; numbers are emitted for nonempty number inputs, otherwise strings. |
| `type`        | `InputTypeHTMLAttribute` | `text`           | Native input type.                                                                     |
| `disabled`    | `boolean`                | `false`          | Disable native interaction.                                                            |
| `placeholder` | `string`                 | `Unset`          | Empty-field hint.                                                                      |

#### Slots

No additional public Frame slots.

#### Emits

| Emit              | Payload          | When                                                                                      |
| ----------------- | ---------------- | ----------------------------------------------------------------------------------------- |
| update:modelValue | string \| number | Each native input event; host must retain the value through v-model or an update handler. |

#### Exposed methods

| Member  | Type                                            | Behavior                                                                                                       |
| ------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| focus   | `() => void`                                    | Focus native control once mounted.                                                                             |
| element | `Ref<HTMLInputElement \| undefined>` internally | Native ref exposed through a Vue component ref; public instance access unwraps refs. Unavailable before mount. |

#### Sources and version

[FrameTextField.vue](../../../packages/core/src/components/forms/FrameTextField.vue) renders a native input through Reka Primitive. Styling lives in [style.css](../../../packages/core/src/style.css).

#### Reka comparison and state hooks

Reka's index has no equivalent TextInput primitive page. The relevant reference is [Primitive](https://reka-ui.com/docs/utilities/primitive.md), which offers `as` and `asChild`; Frame uses `asChild` internally around its fixed native input. These are not declared Frame input props or a supported way to replace its element, because its value handling and exposed ref expect an input.

Primitive adds no checked/open state model, update events, or stateful slot payloads. Frame defines its own input model/update event and exposes `focus`/`element` as listed above. It supplies no Reka `data-state` or `data-disabled` attributes. Use native `:disabled`, `:read-only`, `:focus-visible`, `:valid`/`:invalid`, or host-supplied `aria-invalid` selectors instead. Caller-defined `data-*` attributes pass to the input.

Compared with the live Primitive reference and installed Reka `2.11.0` source. See the [coverage review](../../reference/reka-coverage.md).

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="text-input" -->

| CSS variable                                     | Theme path                                     | Default expression                                                                       | Purpose                                                                                  | Context                                    |
| ------------------------------------------------ | ---------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------ |
| `--frame-input-border`                           | `frame.input.border`                           | `1px solid     var(--frame-control-border)`                                              | Fallback for: Resting border of the text input.                                          | `.frame-text-input`                        |
| `--frame-text-input-border`                      | `frame.text.input.border`                      | `var(     --frame-input-border,     1px solid     var(--frame-control-border)   )`       | Resting border of the text input.                                                        | `.frame-text-input`                        |
| `--frame-text-input-border-radius`               | `frame.text.input.border.radius`               | `var(--frame-input-radius)`                                                              | Corner radius of the text input.                                                         | `.frame-text-input`                        |
| `--frame-input-hover-border`                     | `frame.input.hover.border`                     | `1px solid     var(--frame-control-border)`                                              | Fallback for: Border while the pointer hovers over the text input.                       | `.frame-text-input`                        |
| `--frame-text-input-hover-border`                | `frame.text.input.hover.border`                | `var(     --frame-input-hover-border,     1px solid     var(--frame-control-border)   )` | Border while the pointer hovers over the text input.                                     | `.frame-text-input`                        |
| `--frame-input-hover-outline`                    | `frame.input.hover.outline`                    | `none`                                                                                   | Fallback for: Outline while the pointer hovers over the text input.                      | `.frame-text-input`                        |
| `--frame-text-input-hover-outline`               | `frame.text.input.hover.outline`               | `var(     --frame-input-hover-outline,     none   )`                                     | Outline while the pointer hovers over the text input.                                    | `.frame-text-input`                        |
| `--frame-input-focus-border`                     | `frame.input.focus.border`                     | `1px solid var(--frame-accent)`                                                          | Fallback for: Border while focus is within the text input.                               | `.frame-text-input`                        |
| `--frame-text-input-focus-border`                | `frame.text.input.focus.border`                | `var(     --frame-input-focus-border,     1px solid var(--frame-accent)   )`             | Border while focus is within the text input.                                             | `.frame-text-input`                        |
| `--frame-input-focus-outline`                    | `frame.input.focus.outline`                    | `1px solid var(--frame-accent)`                                                          | Fallback for: Focus outline of the text input.                                           | `.frame-text-input`                        |
| `--frame-text-input-focus-outline`               | `frame.text.input.focus.outline`               | `var(     --frame-input-focus-outline,     1px solid var(--frame-accent)   )`            | Focus outline of the text input.                                                         | `.frame-text-input`                        |
| `--frame-input-outline-offset`                   | `frame.input.outline.offset`                   | `0px`                                                                                    | Fallback for: Offset between the outline and the text input.                             | `.frame-text-input`                        |
| `--frame-text-input-outline-offset`              | `frame.text.input.outline.offset`              | `var(     --frame-input-outline-offset,     0px   )`                                     | Offset between the outline and the text input.                                           | `.frame-text-input`                        |
| `--frame-control-border`                         | `frame.control.border`                         | `var(--frame-border-color)`                                                              | Resting border color of form controls, independently overridable from menu borders.      | `.frame-text-input`                        |
| `--frame-input-radius`                           | `frame.input.radius`                           | `var(--frame-menu-border-radius)`                                                        | Shared corner radius for text fields, text areas, selects, and composed input surfaces.  | `.frame-text-input`                        |
| `--frame-accent`                                 | `frame.accent`                                 | `#0078d4`                                                                                | Shared interaction color for keyboard focus, active actions, and accent-filled controls. | `.frame-text-input`                        |
| `--frame-text-input-width`                       | `frame.text.input.width`                       | `min(100%, 340px)`                                                                       | Width for .frame-text-input.                                                             | `.frame-text-input`                        |
| `--frame-text-input-padding`                     | `frame.text.input.padding`                     | `6px 8px`                                                                                | Internal spacing for .frame-text-input.                                                  | `.frame-text-input`                        |
| `--frame-text-input-min-height`                  | `frame.text.input.min.height`                  | `28px`                                                                                   | Minimum height for .frame-text-input.                                                    | `.frame-text-input`                        |
| `--frame-text-input-color`                       | `frame.text.input.color`                       | `var(--frame-control-text)`                                                              | Foreground for .frame-text-input.                                                        | `.frame-text-input`                        |
| `--frame-text-input-background`                  | `frame.text.input.background`                  | `var(     --frame-control-background   )`                                                | Background for .frame-text-input.                                                        | `.frame-text-input`                        |
| `--frame-text-input-border`                      | `frame.text.input.border`                      | `1px solid     var(--frame-control-border)`                                              | Border for .frame-text-input.                                                            | `.frame-text-input`                        |
| `--frame-text-input-border-radius`               | `frame.text.input.border.radius`               | `var(     --frame-input-radius   )`                                                      | Corner radius for .frame-text-input.                                                     | `.frame-text-input`                        |
| `--frame-control-text`                           | `frame.control.text`                           | `#d4d4d4`                                                                                | Foreground for text and icons on resting control surfaces.                               | `.frame-text-input`                        |
| `--frame-control-background`                     | `frame.control.background`                     | `#1d1d1d`                                                                                | Resting fill of text-entry controls and other control surfaces.                          | `.frame-text-input`                        |
| `--frame-text-input-disabled-opacity`            | `frame.text.input.disabled.opacity`            | `0.45`                                                                                   | Opacity for .frame-text-input:disabled.                                                  | `.frame-text-input:disabled`               |
| `--frame-terminal-search-frame-text-input-width` | `frame.terminal.search.frame.text.input.width` | `min(     240px,     60%   )`                                                            | Width for .frame-terminal-search .frame-text-input.                                      | `.frame-terminal-search .frame-text-input` |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->

### Additional styling guidance

#### Parts and selectors

| Selector            | Part         | Placement/attribute target               |
| ------------------- | ------------ | ---------------------------------------- |
| `.frame-text-input` | Native input | Caller class/style targets this element. |

The native input is the styling target; its font is inherited.

#### Variables

| Token key                    | Variable                              | Value kind                     | Default/fallback                                      | Part/effect                | Scope/limits                                                                                | Description                  |
| ---------------------------- | ------------------------------------- | ------------------------------ | ----------------------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------- |
| `--frame-control-background` | `--frame-control-background`          | color                          | Catalog: `#1d1d1d`                                    | Native input background    | Shared across controls using this variable.                                                 | Control background.          |
| `--frame-control-border`     | `--frame-control-border`              | color                          | Catalog: `var(--frame-border-color)`                  | Native input border        | Shared across controls using this variable.                                                 | Control border.              |
| `--frame-control-text`       | `--frame-control-text`                | color                          | Catalog: `#d4d4d4`                                    | Native input color         | Shared across controls using this variable.                                                 | Control text.                |
| `--frame-input-radius`       | `--frame-input-radius`                | length                         | Catalog: `var(--frame-menu-border-radius)`            | Native input border-radius | Shared across controls using this variable.                                                 | Input radius.                |
| CSS only                     | `--frame-text-input-background`       | color                          | CSS fallback: `var(--frame-control-background)`       | Native input background    | Local to matching component rules. CSS only; not in JSON allowlist.                         | Text input background.       |
| CSS only                     | `--frame-text-input-border`           | border shorthand               | CSS fallback: `1px solid var(--frame-control-border)` | Native input border        | Local to matching component rules. CSS only; not in JSON allowlist.                         | Text input border.           |
| CSS only                     | `--frame-text-input-border-radius`    | length / CSS length expression | CSS fallback: `var(--frame-input-radius)`             | Native input border-radius | Local to matching component rules. CSS only; not in JSON allowlist.                         | Text input border radius.    |
| CSS only                     | `--frame-text-input-color`            | color                          | CSS fallback: `var(--frame-control-text)`             | Native input color         | Local to matching component rules. CSS only; not in JSON allowlist.                         | Text input color.            |
| CSS only                     | `--frame-text-input-disabled-opacity` | opacity number                 | CSS fallback: `.45`                                   | Native input opacity       | Local to matching component rules. CSS only; not in JSON allowlist. State rules: :disabled. | Text input disabled opacity. |
| CSS only                     | `--frame-text-input-min-height`       | length / CSS length expression | CSS fallback: `28px`                                  | Native input min-height    | Local to matching component rules. CSS only; not in JSON allowlist.                         | Text input min height.       |
| CSS only                     | `--frame-text-input-padding`          | CSS spacing                    | CSS fallback: `6px 8px`                               | Native input padding       | Local to matching component rules. CSS only; not in JSON allowlist.                         | Text input padding.          |
| CSS only                     | `--frame-text-input-width`            | length / CSS length expression | CSS fallback: `min(100%, 340px)`                      | Native input width         | Local to matching component rules. CSS only; not in JSON allowlist.                         | Text input width.            |

See [theme variables](../../styling/theme-variables.md) for theme authoring.
