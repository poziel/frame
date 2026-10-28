# FrameField

A label, control, description, and validation message composed around one application-owned control.

## Features

### Anatomy

```text
FrameField
FieldRoot
├─ FieldLabel (when label is supplied)
├─ FieldControl (asChild)
│  └─ default slot: one application-owned control
├─ FieldDescription (when description is supplied)
└─ FieldError (conditional presence; custom error or validation message)
```

Caller attributes/class/style fall through to Root. The default slot must supply one element/component whose attributes and native events reach the actual control; it is merged through FieldControl asChild. These Reka parts are internal composition, not separately exported Frame building blocks.

### Basic usage

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { FrameField, FrameTextField } from '@frame/core';
import '@frame/core/style.css';

const value = ref('');
</script>

<template>
  <FrameField name="projectName" label="Project name" description="Shown in the workspace" required>
    <FrameTextField v-model="value" />
  </FrameField>
</template>
```

Load the stylesheet once per application. This component works without a Frame instance.

### Validation and messages

Use one field per control. `name` identifies registration in an enclosing FrameForm and takes precedence over the child’s name. `required` and `disabled` are combined with the control’s state. Label/description/error IDs are linked automatically. State is local to this field; ordinary controls still work outside it.

`validationMode` supports `onSubmit`, `onBlur`, and `onChange`; a field override wins over its form default. `onSubmit` revalidates on changes after submission. `validationDebounceTime` delays change validation. `validate(value, formValues)` can return a string, string array, null/undefined, or a promise of those results. Async validation displays results but does not block the synchronous submit event; await any required server check in host submission logic.

`error` forces invalid state and replaces the error message content. Otherwise FieldError uses server errors, custom validation results, or native browser messages. It unmounts when hidden after any closing animation and is suppressed for disabled fields. A host-controlled `invalid` state without a message need not produce useful visible text; supply `error` when appropriate.

### Control composition and accessibility

The slot is wrapped in `FieldControl asChild`, not rendered in a neutral layout container. Use one native input/textarea/select or a component such as FrameTextField whose fallthrough attributes and native events reach that element. Multi-root wrappers or controls that route attributes to a different part need separate verification; this slot does not guarantee integration with every Frame control. Give button-based controls an appropriate visible label without assuming the internal native FieldLabel can be reconfigured through Frame.

FieldControl registers the mounted control and unregisters on unmount. It combines `aria-labelledby`/`aria-describedby` IDs and supplies `aria-invalid`; native input constraints participate in validation. Frame does not forward Root’s validity slot fields or its exposed `validate()` method through the wrapper ref.

### Custom validation

This example reuses Basic usage state and rejects whitespace-only names on blur. The callback receives an unknown control value; its other argument contains named form values. Its complete type is `(value: unknown, formValues: Record<string, unknown>) => Result | Promise<Result>`, where `Result` is `string | string[] | null | undefined | void`.

```vue
<FrameField
  name="projectName"
  label="Project name"
  validation-mode="onBlur"
  :validate="candidate => String(candidate ?? '').trim() ? null : 'Enter a project name'"
>
  <FrameTextField v-model="value" />
</FrameField>
```

### Label and supporting text

The description is connected to the input, keeping help text available while the user edits.

<!-- frame:example id="field.description" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameField, FrameTextField } from '@frame/core';
const fieldValue = ref('Project name');
</script>
<template>
<FrameField :name="&quot;projectName&quot;" :label="&quot;Project name&quot;" :description="&quot;Use a short, recognizable name.&quot;"><FrameTextField v-model="fieldValue" /></FrameField>
</template>
```

### Validate when leaving the field

Clear the input and move focus away. Required validation displays feedback after blur.

<!-- frame:example id="field.required" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameField, FrameTextField } from '@frame/core';
const demoRequired = true;
const fieldValue = ref('Project name');
</script>
<template>
<FrameField :name="&quot;projectName&quot;" :label="&quot;Required name&quot;" :required="demoRequired" :validation-mode="&quot;onBlur&quot;" :description="&quot;Clear this value, then leave the field.&quot;"><FrameTextField v-model="fieldValue" /></FrameField>
</template>
```

### Show an external error

An explicit error marks the control invalid and supplies feedback from application validation.

<!-- frame:example id="field.external-error" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameField, FrameTextField } from '@frame/core';
const fieldValue = ref('Project name');
</script>
<template>
<FrameField :name="&quot;projectName&quot;" :label="&quot;Project name&quot;" :error="&quot;This project name is already taken.&quot;"><FrameTextField v-model="fieldValue" /></FrameField>
</template>
```

## APIs

<!-- frame:generated api="field" -->

### FrameField

Source: `packages/core/src/components/forms/FrameField.vue`

#### Properties

| Name                     | Type                                                  | Default    | Description                                                                                                                                                                                                                                                                                                                 |
| ------------------------ | ----------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`                   | `string \| undefined`                                 | Omitted    | The name of the field. Submitted with its owning form as part of a name/value pair, and used to match server `errors` on a `FormRoot`. Takes precedence over the `name` of the control.                                                                                                                                     |
| `disabled`               | `boolean \| undefined`                                | false      | When `true`, prevents the user from interacting with the field's control. Takes precedence over the `disabled` of the control.                                                                                                                                                                                              |
| `required`               | `boolean \| undefined`                                | false      | When `true`, indicates that the user must set the value before the owning form can be submitted.                                                                                                                                                                                                                            |
| `invalid`                | `boolean \| undefined`                                | false      | When `true`, marks the field invalid regardless of its own validation. Useful when the field state is controlled by an external library.                                                                                                                                                                                    |
| `dirty`                  | `boolean \| undefined`                                | false      | Whether the field's value has changed from its initial value. Useful when the field state is controlled by an external library.                                                                                                                                                                                             |
| `touched`                | `boolean \| undefined`                                | false      | Whether the field has been touched (its control blurred). Useful when the field state is controlled by an external library.                                                                                                                                                                                                 |
| `validate`               | `FieldValidateFn \| undefined`                        | Omitted    | Custom validation function. Return an error message (or array of messages) when invalid, or `null`/`undefined` when valid. Receives the control's value and the values of every named field in the owning form. Can be async, but an async `validate` does not prevent form submission when `validationMode` is `onSubmit`. |
| `validationMode`         | `FieldValidationMode \| undefined`                    | "onSubmit" | When the field (re-)runs validation. Takes precedence over the `validationMode` of an ancestor `FormRoot`. - `onSubmit`: when the form is submitted, then on every change after that. - `onBlur`: when the control loses focus. - `onChange`: on every change to the control's value. defaultValue: "onSubmit"              |
| `validationDebounceTime` | `number \| undefined`                                 | Omitted    | How long to wait (in ms) between `validate` calls when validating on change.                                                                                                                                                                                                                                                |
| `asChild`                | `boolean \| undefined`                                | false      | Change the default rendered element for the one passed as a child, merging their props and behavior. Read our [Composition](https://www.reka-ui.com/docs/guides/composition) guide for more details.                                                                                                                        |
| `as`                     | `Component \| AsTag \| undefined`                     | "div"      | The element or component this component should render as. Can be overwritten by `asChild`. defaultValue: "div"                                                                                                                                                                                                              |
| `tooltip`                | `string \| false \| undefined`                        | Omitted    | Tooltip text; false disables it. When omitted, the native title attribute is used.                                                                                                                                                                                                                                          |
| `tooltipPlacement`       | `"top" \| "bottom" \| "left" \| "right" \| undefined` | Omitted    | Preferred tooltip side; positioning falls back when space is limited.                                                                                                                                                                                                                                                       |
| `label`                  | `string \| undefined`                                 | Omitted    | Label rendered before the slotted control.                                                                                                                                                                                                                                                                                  |
| `description`            | `string \| undefined`                                 | Omitted    | Supporting description associated with the control.                                                                                                                                                                                                                                                                         |
| `error`                  | `string \| undefined`                                 | Omitted    | Explicit validation error; also marks the field invalid.                                                                                                                                                                                                                                                                    |

#### Events

No declared entries.

#### Slots

| Name      | Parameters | Return type  | Description                                                                             |
| --------- | ---------- | ------------ | --------------------------------------------------------------------------------------- |
| `default` | `None`     | `VNodeChild` | Form control composed through the field primitive to associate labels and descriptions. |
| `tooltip` | `None`     | `VNodeChild` | Custom tooltip content for the field.                                                   |

#### Exposed API

No declared entries.

<!-- /frame:generated -->

### Composition and upstream reference

Defaults below are Reka reference defaults unless a Frame override is stated. Declared means a typed Frame prop/event; Forwarded means attribute/listener fallthrough to the named part; Internal means generated by Frame; Absent means not routed or composed. Generic upstream `T`/`AcceptableValue` describes Reka, not a promise of arbitrary option values in Frame.

#### Root

#### Props

| Prop                     | Reka type                              | Reka required/default | Availability | Frame behavior                                                                                                          |
| ------------------------ | -------------------------------------- | --------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `as`                     | `AsTag \| Component`                   | "div"                 | Declared     | Element/component used to render this part.                                                                             |
| `asChild`                | `boolean`                              | -                     | Declared     | Typed upstream composition option; fixed generated children are not a public custom-composition slot.                   |
| `dirty`                  | `boolean`                              | -                     | Declared     | Externally controlled change-from-initial state.                                                                        |
| `disabled`               | `boolean`                              | -                     | Declared     | Disable interaction for this part and its participating descendants.                                                    |
| `invalid`                | `boolean`                              | -                     | Changed      | Frame combines the prop with Boolean(error); default is unset.                                                          |
| `name`                   | `string`                               | -                     | Declared     | Submitted/registered field identity.                                                                                    |
| `required`               | `boolean`                              | -                     | Declared     | Participate in the owning form’s required-value constraint.                                                             |
| `touched`                | `boolean`                              | -                     | Declared     | Externally controlled blurred/touched state.                                                                            |
| `validate`               | `FieldValidateFn`                      | -                     | Declared     | Validate the current value against all named form values; return messages or no error, synchronously or asynchronously. |
| `validationDebounceTime` | `number`                               | -                     | Declared     | Milliseconds to wait before change validation runs.                                                                     |
| `validationMode`         | `"onBlur" \| "onChange" \| "onSubmit"` | -                     | Declared     | Choose change, blur, or submit-triggered validation.                                                                    |

#### Emits

No component emits on this part. Native bubbling listeners are not additional component emits.

#### Slots

| Default-slot field | Reka type  | Frame availability                             |
| ------------------ | ---------- | ---------------------------------------------- |
| `invalid`          | `boolean`  | Internal; not passed to the Frame caller slot. |
| `errors`           | `string[]` | Internal; not passed to the Frame caller slot. |

#### Data attributes

| Attribute       | Values/presence     | Meaning                                                          |
| --------------- | ------------------- | ---------------------------------------------------------------- |
| `data-disabled` | `Present when true` | Disabled field; shared on participating field parts.             |
| `data-valid`    | `Present when true` | Known valid result; shared on participating field parts.         |
| `data-invalid`  | `Present when true` | Known invalid result; shared on participating field parts.       |
| `data-dirty`    | `Present when true` | Changed from initial value; shared on participating field parts. |
| `data-touched`  | `Present when true` | Control blurred; shared on participating field parts.            |
| `data-filled`   | `Present when true` | Nonempty value; shared on participating field parts.             |
| `data-focused`  | `Present when true` | Control currently focused; shared on participating field parts.  |

#### Exposed methods

Frame does not defineExpose or forward the internal Reka instance. Reka’s validate(): boolean is therefore not a FrameField ref method.

#### Label

#### Props

| Prop          | Reka type            | Reka required/default | Availability | Frame behavior                                                                                                                                         |
| ------------- | -------------------- | --------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `as`          | `AsTag \| Component` | "div"                 | Internal     | Installed FieldLabel delegates to Label, rendering label by default; the live reference table lists div. Not independently configurable through Frame. |
| `asChild`     | `boolean`            | -                     | Internal     | Merge the part behavior into one child instead of rendering a wrapper. Not independently configurable through Frame.                                   |
| `for`         | `string`             | -                     | Internal     | ID of the associated control. Not independently configurable through Frame.                                                                            |
| `nativeLabel` | `boolean`            | true                  | Internal     | Use native label association instead of focus-on-click behavior. Not independently configurable through Frame.                                         |

#### Emits

No component emits on this part. Native bubbling listeners are not additional component emits.

#### Slots

Underlying default content has no documented scoped fields. Frame generates this part’s content; no caller slot targets it independently.

#### Data attributes

| Attribute       | Values/presence     | Meaning                                                          |
| --------------- | ------------------- | ---------------------------------------------------------------- |
| `data-disabled` | `Present when true` | Disabled field; shared on participating field parts.             |
| `data-valid`    | `Present when true` | Known valid result; shared on participating field parts.         |
| `data-invalid`  | `Present when true` | Known invalid result; shared on participating field parts.       |
| `data-dirty`    | `Present when true` | Changed from initial value; shared on participating field parts. |
| `data-touched`  | `Present when true` | Control blurred; shared on participating field parts.            |
| `data-filled`   | `Present when true` | Nonempty value; shared on participating field parts.             |
| `data-focused`  | `Present when true` | Control currently focused; shared on participating field parts.  |

#### Control

#### Props

| Prop           | Reka type            | Reka required/default | Availability | Frame behavior                                                                                                                    |
| -------------- | -------------------- | --------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `as`           | `AsTag \| Component` | "input"               | Internal     | Element/component used to render this part. Not independently configurable through Frame.                                         |
| `asChild`      | `boolean`            | -                     | Internal     | true; merges into the caller’s single slotted control. Not independently configurable through Frame.                              |
| `defaultValue` | `string \| number`   | -                     | Internal     | Initial uncontrolled value upstream; does not override a supplied controlled model. Not independently configurable through Frame. |
| `id`           | `string`             | -                     | Internal     | DOM identity of the control/part. Not independently configurable through Frame.                                                   |
| `modelValue`   | `string \| number`   | -                     | Internal     | Controlled value; updates require the host to retain the emitted value. Not independently configurable through Frame.             |

#### Emits

| Event               | Payload           | Availability | Behavior                                                                                                                              |
| ------------------- | ----------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `update:modelValue` | `[value: string]` | Internal     | Value changed; retain it in host state. Not cancellable. Not forwarded as a Frame event; caller cannot cancel this internal emission. |

#### Slots

Underlying default content has no documented scoped fields. Frame passes caller content through without a payload.

#### Data attributes

| Attribute       | Values/presence     | Meaning                                                          |
| --------------- | ------------------- | ---------------------------------------------------------------- |
| `data-disabled` | `Present when true` | Disabled field; shared on participating field parts.             |
| `data-valid`    | `Present when true` | Known valid result; shared on participating field parts.         |
| `data-invalid`  | `Present when true` | Known invalid result; shared on participating field parts.       |
| `data-dirty`    | `Present when true` | Changed from initial value; shared on participating field parts. |
| `data-touched`  | `Present when true` | Control blurred; shared on participating field parts.            |
| `data-filled`   | `Present when true` | Nonempty value; shared on participating field parts.             |
| `data-focused`  | `Present when true` | Control currently focused; shared on participating field parts.  |

#### Description

#### Props

| Prop      | Reka type            | Reka required/default | Availability | Frame behavior                                                                                                       |
| --------- | -------------------- | --------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------- |
| `as`      | `AsTag \| Component` | "p"                   | Internal     | Element/component used to render this part. Not independently configurable through Frame.                            |
| `asChild` | `boolean`            | -                     | Internal     | Merge the part behavior into one child instead of rendering a wrapper. Not independently configurable through Frame. |
| `id`      | `string`             | -                     | Internal     | DOM identity of the control/part. Not independently configurable through Frame.                                      |

#### Emits

No component emits on this part. Native bubbling listeners are not additional component emits.

#### Slots

Underlying default content has no documented scoped fields. Frame generates this part’s content; no caller slot targets it independently.

#### Data attributes

| Attribute       | Values/presence     | Meaning                                                          |
| --------------- | ------------------- | ---------------------------------------------------------------- |
| `data-disabled` | `Present when true` | Disabled field; shared on participating field parts.             |
| `data-valid`    | `Present when true` | Known valid result; shared on participating field parts.         |
| `data-invalid`  | `Present when true` | Known invalid result; shared on participating field parts.       |
| `data-dirty`    | `Present when true` | Changed from initial value; shared on participating field parts. |
| `data-touched`  | `Present when true` | Control blurred; shared on participating field parts.            |
| `data-filled`   | `Present when true` | Nonempty value; shared on participating field parts.             |
| `data-focused`  | `Present when true` | Control currently focused; shared on participating field parts.  |

#### Error

#### Props

| Prop         | Reka type                        | Reka required/default | Availability | Frame behavior                                                                                                            |
| ------------ | -------------------------------- | --------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `as`         | `AsTag \| Component`             | "div"                 | Internal     | Element/component used to render this part. Not independently configurable through Frame.                                 |
| `asChild`    | `boolean`                        | -                     | Internal     | Merge the part behavior into one child instead of rendering a wrapper. Not independently configurable through Frame.      |
| `forceMount` | `boolean`                        | -                     | Internal     | Retain a presence-controlled part for animation. Not independently configurable through Frame.                            |
| `id`         | `string`                         | -                     | Internal     | DOM identity of the control/part. Not independently configurable through Frame.                                           |
| `match`      | `boolean \| keyof ValidityState` | -                     | Internal     | Error visibility rule: validity key, always true, or current invalid state. Not independently configurable through Frame. |

#### Emits

No component emits on this part. Native bubbling listeners are not additional component emits.

#### Slots

| Default-slot field | Reka type  | Frame availability                             |
| ------------------ | ---------- | ---------------------------------------------- |
| `errors`           | `string[]` | Internal; not passed to the Frame caller slot. |

#### Data attributes

| Attribute       | Values/presence     | Meaning                                                          |
| --------------- | ------------------- | ---------------------------------------------------------------- |
| `data-disabled` | `Present when true` | Disabled field; shared on participating field parts.             |
| `data-valid`    | `Present when true` | Known valid result; shared on participating field parts.         |
| `data-invalid`  | `Present when true` | Known invalid result; shared on participating field parts.       |
| `data-dirty`    | `Present when true` | Changed from initial value; shared on participating field parts. |
| `data-touched`  | `Present when true` | Control blurred; shared on participating field parts.            |
| `data-filled`   | `Present when true` | Nonempty value; shared on participating field parts.             |
| `data-focused`  | `Present when true` | Control currently focused; shared on participating field parts.  |
| `data-state`    | `open \| closed`    | Error presence state; closing can wait for animation.            |

#### Omitted parts

`Validity` are not rendered by this wrapper. Their props, slots, presence controls, and composition APIs are not available through Frame. See the [Reka reference](https://reka-ui.com/docs/components/field).

#### Frame additions

#### Props

| Prop          | Type     | Required/default | Description                                                                                   |
| ------------- | -------- | ---------------- | --------------------------------------------------------------------------------------------- |
| `label`       | `string` | Unset            | Visible FieldLabel; omitted when empty.                                                       |
| `description` | `string` | Unset            | Visible description linked to the control.                                                    |
| `error`       | `string` | Unset            | Marks Root invalid and replaces visible error content; disabled fields still suppress errors. |

#### Emits

No additional Frame-only events; see the part tables for declared or forwarded events.

#### Slots

`default`: one control child merged through FieldControl asChild. No scoped payload. Label, Description and Error have no public slots.

#### Sources and version

Checked against installed `reka-ui@2.11.0`, the [official Reka reference](https://reka-ui.com/docs/components/field), its [Markdown reference](https://reka-ui.com/docs/components/field.md), and [Frame implementation](../../../packages/core/src/components/forms/FrameField.vue). Styling comes from [advanced.scss](../../../packages/core/src/components/forms/styles/advanced.scss) and [shared styles](../../../packages/core/src/styles/index.scss). JSON availability comes from the [token catalog](../../../packages/core/src/themes/tokens/tokenCatalog.ts).

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="field" -->

| CSS variable     | Theme path     | Default expression                        | Purpose                                                                              | Context                                                         |
| ---------------- | -------------- | ----------------------------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| `--frame-muted`  | `frame.muted`  | No declared default; supplied by context. | Secondary foreground for descriptions, hints, and visually subordinate content.      | `.frame-field-description`                                      |
| `--frame-gap`    | `frame.gap`    | No declared default; supplied by context. | Standard space between related content items and control children.                   | `.frame-field`                                                  |
| `--frame-text`   | `frame.text`   | No declared default; supplied by context. | Primary foreground for readable text and icons across shell and application content. | `.frame-field-label`                                            |
| `--frame-danger` | `frame.danger` | `#f48771`                                 | Foreground of field validation messages.                                             | `.frame-field-error`                                            |
| `--frame-danger` | `frame.danger` | `#f48771`                                 | Foreground of field validation messages.                                             | `.frame-field [data-invalid], .frame-field [aria-invalid=true]` |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->

### Additional styling guidance

#### Parts and selectors

| Selector                   | Part                                    | Placement                                                                        |
| -------------------------- | --------------------------------------- | -------------------------------------------------------------------------------- |
| `.frame-field`             | Root and descendant invalid-state rules | See attribute routing in Anatomy; internal parts have no independent attrs prop. |
| `.frame-field-label`       | Label                                   | See attribute routing in Anatomy; internal parts have no independent attrs prop. |
| `.frame-field-description` | Description                             | See attribute routing in Anatomy; internal parts have no independent attrs prop. |
| `.frame-field-error`       | Error                                   | See attribute routing in Anatomy; internal parts have no independent attrs prop. |

Error/description font sizes are fixed at 11px; label weight is 500. The invalid descendant rule changes border-color, not every invalid child’s entire appearance.

#### Variables

| Token key        | Variable         | Value kind | Default/fallback                                                                                | Part/effect                                                       | Scope/limits                                                                         | Description                                                             |
| ---------------- | ---------------- | ---------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| `--frame-danger` | `--frame-danger` | color      | Catalog: `#f48771`. CSS fallback: `#f48771`                                                     | Error color; Root and descendant invalid-state rules border-color | Shared with other controls using the same variable. State selectors: [data-invalid]. | Sets Error color; Root and descendant invalid-state rules border-color. |
| `--frame-gap`    | `--frame-gap`    | length     | Catalog: `calc(var(--frame-spacing-unit) * 1.5)`. No local fallback; resolves from the cascade. | Root and descendant invalid-state rules gap                       | Shared with other controls using the same variable.                                  | Sets Root and descendant invalid-state rules gap.                       |
| `--frame-muted`  | `--frame-muted`  | color      | Catalog: `#8e9496`. No local fallback; resolves from the cascade.                               | Description color                                                 | Shared with other controls using the same variable.                                  | Sets Description color.                                                 |
| `--frame-text`   | `--frame-text`   | color      | Catalog: `#cccccc`. No local fallback; resolves from the cascade.                               | Label color                                                       | Shared with other controls using the same variable.                                  | Sets Label color.                                                       |

See [theme variables](../../styling/theme-variables.md) for theme authoring.
