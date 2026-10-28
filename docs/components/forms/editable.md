# FrameEditable

Inline text editing with a preview and an input. Edits are submitted or cancelled through Reka’s editing lifecycle.

## Features

### Anatomy

```text
FrameEditable
EditableRoot
└─ EditableArea
   ├─ EditablePreview
   └─ EditableInput
```

Caller attributes/listeners fall through to Root. Preview and Input are internal and receive the label prop separately. These Reka parts are internal composition, not separately exported Frame building blocks.

### Basic usage

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { FrameEditable } from '@frame/core';
import '@frame/core/style.css';

const value = ref('My project');
</script>

<template>
  <FrameEditable v-model="value" label="Project name" />
</template>
```

Load the stylesheet once per application. This component works without a Frame instance.

### Editing lifecycle

Reka starts editing when Preview receives focus by default. Input maintains a draft; the default `submitMode="blur"` commits on leaving. Escape cancels and restores the committed value. Enter only commits if you forward `submit-mode="enter"` or `"both"`; IME composition is excluded from the Enter commit path. `@submit` and `@update:state` are forwarded Root events, not Frame-declared emits. State updates use `edit`, `submit`, or `cancel`.

Forwarded `activationMode`, `selectOnFocus`, `startWithEditMode`, `maxLength`, `readonly`, and `autoResize` configure Root. Frame narrows `placeholder` to one string, rather than Reka’s separate edit/preview object. It always supplies the controlled string model and converts a nullish model update to an empty string. The host must retain emitted changes.

### Accessibility and forms

`label` names Preview and Input. Preview is keyboard focusable when editable. Root `name`/`required` are forwarded to Reka’s form integration. A Root `id` is interpreted by Reka; arbitrary native attributes on Root are not inner input attributes. Frame does not expose edit/cancel/submit methods through a component ref, and does not render Reka’s separate trigger parts.

### Commit on Enter or blur

This example reuses Basic usage state. `submitMode` and `selectOnFocus` are forwarded Root configuration.

```vue
<FrameEditable v-model="value" label="Project name" submit-mode="both" select-on-focus />
```

### Edit in place

Activate the text, change it, and leave the field to finish. Press Escape during editing to cancel.

<!-- frame:example id="editable.inline" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameEditable } from '@frame/core';
const demoModelValue = ref("Reka UI");
</script>
<template>
<FrameEditable v-model="demoModelValue" :label="&quot;Project title&quot;" />
</template>
```

### Save only with Enter

Double-click to edit. Enter saves; clicking away or pressing Escape discards the draft.

<!-- frame:example id="editable.enter-only" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameEditable } from '@frame/core';
const demoModelValue = ref("Explicit commit");
</script>
<template>
<FrameEditable v-model="demoModelValue" :label="&quot;Enter-only title&quot;" :activation-mode="&quot;dblclick&quot;" :submit-mode="&quot;enter&quot;" />
</template>
```

### Start from an empty value

The preview shows a placeholder until a title is entered. Placeholder text is not stored in the model.

<!-- frame:example id="editable.empty" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameEditable } from '@frame/core';
const demoModelValue = ref("");
</script>
<template>
<FrameEditable v-model="demoModelValue" :placeholder="&quot;Click to add a title&quot;" :label="&quot;Untitled project&quot;" />
</template>
```

## APIs

<!-- frame:generated api="editable" -->

### FrameEditable

Source: `packages/core/src/components/forms/FrameEditable.vue`

#### Properties

| Name                | Type                                                  | Default  | Description                                                                             |
| ------------------- | ----------------------------------------------------- | -------- | --------------------------------------------------------------------------------------- |
| `tooltip`           | `string \| false \| undefined`                        | Omitted  | Tooltip text; false disables it. When omitted, the native title attribute is used.      |
| `tooltipPlacement`  | `"top" \| "bottom" \| "left" \| "right" \| undefined` | Omitted  | Preferred tooltip side; positioning falls back when space is limited.                   |
| `modelValue`        | `string`                                              | Required | Text displayed in the preview and edited by the input.                                  |
| `placeholder`       | `string \| undefined`                                 | Omitted  | Hint displayed while the editable value is empty.                                       |
| `disabled`          | `boolean \| undefined`                                | false    | Prevents user interaction with the control.                                             |
| `label`             | `string \| undefined`                                 | Omitted  | Accessible name of the editable input.                                                  |
| `submitMode`        | `"both" \| "enter" \| undefined`                      | "both"   | both: Enter and leaving the field save; enter: only Enter saves. Escape always cancels. |
| `activationMode`    | `"focus" \| "none" \| "dblclick" \| undefined`        | "focus"  | Interaction that enters editing; none requires explicit activation by the primitive.    |
| `startWithEditMode` | `boolean \| undefined`                                | false    | Starts with the input active instead of the preview.                                    |
| `selectOnFocus`     | `boolean \| undefined`                                | false    | Selects the editable text when the input receives focus.                                |

#### Events

| Name                | Parameters                              | Return type | Description                                                  |
| ------------------- | --------------------------------------- | ----------- | ------------------------------------------------------------ |
| `update:modelValue` | `value: string`                         | `void`      | Requests the new application-owned value after interaction.  |
| `submit`            | `value: string`                         | `void`      | The edited text was committed.                               |
| `cancel`            | `None`                                  | `void`      | Editing was cancelled and the preview is restored.           |
| `update:state`      | `state: "submit" \| "cancel" \| "edit"` | `void`      | Editable presentation entered edit, submit, or cancel state. |

#### Slots

| Name      | Parameters | Return type  | Description                                    |
| --------- | ---------- | ------------ | ---------------------------------------------- |
| `tooltip` | `None`     | `VNodeChild` | Custom tooltip content for the editable field. |

#### Exposed API

No declared entries.

<!-- /frame:generated -->

### Composition and upstream reference

Defaults below are Reka reference defaults unless a Frame override is stated. Declared means a typed Frame prop/event; Forwarded means attribute/listener fallthrough to the named part; Internal means generated by Frame; Absent means not routed or composed. Generic upstream `T`/`AcceptableValue` describes Reka, not a promise of arbitrary option values in Frame.

#### Root

#### Props

| Prop                | Reka type                                      | Reka required/default | Availability | Frame behavior                                                                                                                                                   |
| ------------------- | ---------------------------------------------- | --------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `activationMode`    | `"dblclick" \| "focus" \| "none"`              | "focus"               | Forwarded    | Start editing on focus, double-click, or only explicit triggers.                                                                                                 |
| `as`                | `AsTag \| Component`                           | "div"                 | Forwarded    | Element/component used to render this part.                                                                                                                      |
| `asChild`           | `boolean`                                      | -                     | Forwarded    | Reaches Root, but Frame supplies fixed internal children; no public composition contract for replacing them.                                                     |
| `autoResize`        | `boolean`                                      | false                 | Forwarded    | Use overlapping preview/input sizing to follow content.                                                                                                          |
| `defaultValue`      | `string`                                       | -                     | Forwarded    | Initial uncontrolled value upstream; does not override a supplied controlled model. Frame always supplies modelValue, so this does not initialize wrapper state. |
| `dir`               | `"ltr" \| "rtl"`                               | -                     | Forwarded    | Reading/navigation direction; inherits Reka configuration or LTR when unset.                                                                                     |
| `disabled`          | `boolean`                                      | false                 | Declared     | Frame: `boolean`, false. Disable interaction for this part and its participating descendants.                                                                    |
| `id`                | `string`                                       | -                     | Forwarded    | DOM identity of the control/part.                                                                                                                                |
| `maxLength`         | `number`                                       | -                     | Forwarded    | Limit the text input’s character count.                                                                                                                          |
| `modelValue`        | `string \| null`                               | -                     | Changed      | Frame: `string`, Required. Controlled value; updates require the host to retain the emitted value. Nullish updates become an empty string.                       |
| `name`              | `string`                                       | -                     | Forwarded    | Submitted/registered field identity.                                                                                                                             |
| `placeholder`       | `string \| { edit: string; preview: string; }` | "Enter text..."       | Changed      | Frame: `string`, Reka: Enter text.... Empty display/edit hint.                                                                                                   |
| `readonly`          | `boolean`                                      | -                     | Forwarded    | Allow focus and reading while preventing edits.                                                                                                                  |
| `required`          | `boolean`                                      | false                 | Forwarded    | Participate in the owning form’s required-value constraint.                                                                                                      |
| `selectOnFocus`     | `boolean`                                      | false                 | Forwarded    | Select the input text on entering edit mode.                                                                                                                     |
| `startWithEditMode` | `boolean`                                      | -                     | Forwarded    | Enter editing immediately after mount.                                                                                                                           |
| `submitMode`        | `"blur" \| "none" \| "enter" \| "both"`        | "blur"                | Forwarded    | Commit on blur, Enter, both, or only an explicit trigger.                                                                                                        |

#### Emits

| Event               | Payload                                   | Availability | Behavior                                                                                              |
| ------------------- | ----------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------- |
| `submit`            | `[value: string \| null \| undefined]`    | Forwarded    | Edit commit or validated form submission; see Features for the native SubmitEvent cancellation rules. |
| `update:modelValue` | `[value: string]`                         | Declared     | Value changed; retain it in host state. Not cancellable. Payload shown is Frame’s public payload.     |
| `update:state`      | `[state: "cancel" \| "submit" \| "edit"]` | Forwarded    | Editing entered, submitted, or cancelled. Not cancellable.                                            |

#### Slots

| Default-slot field | Reka type                     | Frame availability                             |
| ------------------ | ----------------------------- | ---------------------------------------------- |
| `isEditing`        | `boolean`                     | Internal; not passed to the Frame caller slot. |
| `modelValue`       | `string \| null \| undefined` | Internal; not passed to the Frame caller slot. |
| `isEmpty`          | `boolean`                     | Internal; not passed to the Frame caller slot. |
| `submit`           | `(): void`                    | Internal; not passed to the Frame caller slot. |
| `cancel`           | `(): void`                    | Internal; not passed to the Frame caller slot. |
| `edit`             | `(): void`                    | Internal; not passed to the Frame caller slot. |

#### Data attributes

| Attribute                | Values/presence | Meaning                                                   |
| ------------------------ | --------------- | --------------------------------------------------------- |
| `data-dismissable-layer` | `Present`       | Internal dismissal marker; no editing data-state on Root. |

#### Exposed methods

Frame does not defineExpose or forward the internal Reka instance. Reka editing methods are internal; use the documented lifecycle props/events.

#### Area

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

| Attribute                | Values/presence            | Meaning                      |
| ------------------------ | -------------------------- | ---------------------------- |
| `data-placeholder-shown` | `Present when not editing` | State owned by EditableArea. |
| `data-focus`             | `Present when editing`     | State owned by EditableArea. |
| `data-focused`           | `Present when editing`     | State owned by EditableArea. |
| `data-empty`             | `Present when empty`       | State owned by EditableArea. |
| `data-readonly`          | `Present when read-only`   | State owned by EditableArea. |
| `data-disabled`          | `Present when disabled`    | State owned by EditableArea. |

#### Preview

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

| Attribute                | Values/presence            | Meaning                                                                     |
| ------------------------ | -------------------------- | --------------------------------------------------------------------------- |
| `data-placeholder-shown` | `Present when not editing` | Installed implementation marks preview mode, not just an empty placeholder. |

#### Input

#### Props

| Prop      | Reka type            | Reka required/default | Availability | Frame behavior                                                                                                       |
| --------- | -------------------- | --------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------- |
| `as`      | `AsTag \| Component` | "input"               | Internal     | Element/component used to render this part. Not independently configurable through Frame.                            |
| `asChild` | `boolean`            | -                     | Internal     | Merge the part behavior into one child instead of rendering a wrapper. Not independently configurable through Frame. |

#### Emits

No component emits on this part. Native bubbling listeners are not additional component emits.

#### Slots

Underlying default content has no documented scoped fields. Frame generates this part’s content; no caller slot targets it independently.

#### Data attributes

| Attribute       | Values/presence          | Meaning                       |
| --------------- | ------------------------ | ----------------------------- |
| `data-disabled` | `Present when disabled`  | Native input disabled state.  |
| `data-readonly` | `Present when read-only` | Native input read-only state. |

#### Omitted parts

`Edit Trigger`, `Submit Trigger`, `Cancel Trigger` are not rendered by this wrapper. Their props, slots, presence controls, and composition APIs are not available through Frame. See the [Reka reference](https://reka-ui.com/docs/components/editable).

#### Frame additions

#### Props

| Prop    | Type     | Required/default | Description                                    |
| ------- | -------- | ---------------- | ---------------------------------------------- |
| `label` | `string` | Unset            | Accessible name set on both Preview and Input. |

#### Emits

No additional Frame-only events; see the part tables for declared or forwarded events.

#### Slots

No public content slots; all internal children are generated.

#### Sources and version

Checked against installed `reka-ui@2.11.0`, the [official Reka reference](https://reka-ui.com/docs/components/editable), its [Markdown reference](https://reka-ui.com/docs/components/editable.md), and [Frame implementation](../../../packages/core/src/components/forms/FrameEditable.vue). Styling comes from [controls.scss](../../../packages/core/src/components/forms/styles/controls.scss) and [shared styles](../../../packages/core/src/styles/index.scss). JSON availability comes from the [token catalog](../../../packages/core/src/themes/tokens/tokenCatalog.ts).

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="editable" -->

| CSS variable                            | Theme path                            | Default expression                                                                       | Purpose                                                                                  | Context                              |
| --------------------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------ |
| `--frame-input-border`                  | `frame.input.border`                  | `1px solid     var(--frame-control-border)`                                              | Fallback for: Resting border of the text input.                                          | `.frame-form-input`                  |
| `--frame-form-input-border`             | `frame.form.input.border`             | `var(     --frame-input-border,     1px solid     var(--frame-control-border)   )`       | Resting border of the form-input text surface.                                           | `.frame-form-input`                  |
| `--frame-control-border`                | `frame.control.border`                | No declared default; supplied by context.                                                | Resting border color of form controls, independently overridable from menu borders.      | `.frame-form-input`                  |
| `--frame-form-input-border-radius`      | `frame.form.input.border.radius`      | `var(     --frame-input-radius   )`                                                      | Corner radius of the form-input text surface.                                            | `.frame-form-input`                  |
| `--frame-input-radius`                  | `frame.input.radius`                  | No declared default; supplied by context.                                                | Shared corner radius for text fields, text areas, selects, and composed input surfaces.  | `.frame-form-input`                  |
| `--frame-input-hover-border`            | `frame.input.hover.border`            | `1px solid     var(--frame-control-border)`                                              | Fallback for: Border while the pointer hovers over the text input.                       | `.frame-form-input`                  |
| `--frame-form-input-hover-border`       | `frame.form.input.hover.border`       | `var(     --frame-input-hover-border,     1px solid     var(--frame-control-border)   )` | Border while the pointer hovers of the form-input text surface.                          | `.frame-form-input`                  |
| `--frame-input-hover-outline`           | `frame.input.hover.outline`           | `none`                                                                                   | Fallback for: Outline while the pointer hovers over the text input.                      | `.frame-form-input`                  |
| `--frame-form-input-hover-outline`      | `frame.form.input.hover.outline`      | `var(     --frame-input-hover-outline,     none   )`                                     | Outline while the pointer hovers of the form-input text surface.                         | `.frame-form-input`                  |
| `--frame-input-focus-border`            | `frame.input.focus.border`            | `1px solid var(--frame-accent)`                                                          | Fallback for: Border while focus is within the text input.                               | `.frame-form-input`                  |
| `--frame-form-input-focus-border`       | `frame.form.input.focus.border`       | `var(     --frame-input-focus-border,     1px solid var(--frame-accent)   )`             | Border while focus is within the input of the form-input text surface.                   | `.frame-form-input`                  |
| `--frame-accent`                        | `frame.accent`                        | No declared default; supplied by context.                                                | Shared interaction color for keyboard focus, active actions, and accent-filled controls. | `.frame-form-input`                  |
| `--frame-input-focus-outline`           | `frame.input.focus.outline`           | `1px solid var(--frame-accent)`                                                          | Fallback for: Focus outline of the text input.                                           | `.frame-form-input`                  |
| `--frame-form-input-focus-outline`      | `frame.form.input.focus.outline`      | `var(     --frame-input-focus-outline,     1px solid var(--frame-accent)   )`            | Outline while focus is within the input of the form-input text surface.                  | `.frame-form-input`                  |
| `--frame-input-outline-offset`          | `frame.input.outline.offset`          | `0px`                                                                                    | Fallback for: Offset between the outline and the text input.                             | `.frame-form-input`                  |
| `--frame-form-input-outline-offset`     | `frame.form.input.outline.offset`     | `var(     --frame-input-outline-offset,     0px   )`                                     | Offset between the outline and input of the form-input text surface.                     | `.frame-form-input`                  |
| `--frame-input-border`                  | `frame.input.border`                  | `1px solid     var(--frame-control-border)`                                              | Fallback for: Resting border of the text input.                                          | `.frame-editable-input`              |
| `--frame-editable-input-border`         | `frame.editable.input.border`         | `var(     --frame-input-border,     1px solid     var(--frame-control-border)   )`       | Resting border of the editable-input text surface.                                       | `.frame-editable-input`              |
| `--frame-control-border`                | `frame.control.border`                | No declared default; supplied by context.                                                | Resting border color of form controls, independently overridable from menu borders.      | `.frame-editable-input`              |
| `--frame-editable-input-border-radius`  | `frame.editable.input.border.radius`  | `var(     --frame-input-radius   )`                                                      | Corner radius of the editable-input text surface.                                        | `.frame-editable-input`              |
| `--frame-input-radius`                  | `frame.input.radius`                  | No declared default; supplied by context.                                                | Shared corner radius for text fields, text areas, selects, and composed input surfaces.  | `.frame-editable-input`              |
| `--frame-input-hover-border`            | `frame.input.hover.border`            | `1px solid     var(--frame-control-border)`                                              | Fallback for: Border while the pointer hovers over the text input.                       | `.frame-editable-input`              |
| `--frame-editable-input-hover-border`   | `frame.editable.input.hover.border`   | `var(     --frame-input-hover-border,     1px solid     var(--frame-control-border)   )` | Border while the pointer hovers of the editable-input text surface.                      | `.frame-editable-input`              |
| `--frame-input-hover-outline`           | `frame.input.hover.outline`           | `none`                                                                                   | Fallback for: Outline while the pointer hovers over the text input.                      | `.frame-editable-input`              |
| `--frame-editable-input-hover-outline`  | `frame.editable.input.hover.outline`  | `var(     --frame-input-hover-outline,     none   )`                                     | Outline while the pointer hovers of the editable-input text surface.                     | `.frame-editable-input`              |
| `--frame-input-focus-border`            | `frame.input.focus.border`            | `1px solid var(--frame-accent)`                                                          | Fallback for: Border while focus is within the text input.                               | `.frame-editable-input`              |
| `--frame-editable-input-focus-border`   | `frame.editable.input.focus.border`   | `var(     --frame-input-focus-border,     1px solid var(--frame-accent)   )`             | Border while focus is within the input of the editable-input text surface.               | `.frame-editable-input`              |
| `--frame-accent`                        | `frame.accent`                        | No declared default; supplied by context.                                                | Shared interaction color for keyboard focus, active actions, and accent-filled controls. | `.frame-editable-input`              |
| `--frame-input-focus-outline`           | `frame.input.focus.outline`           | `1px solid var(--frame-accent)`                                                          | Fallback for: Focus outline of the text input.                                           | `.frame-editable-input`              |
| `--frame-editable-input-focus-outline`  | `frame.editable.input.focus.outline`  | `var(     --frame-input-focus-outline,     1px solid var(--frame-accent)   )`            | Outline while focus is within the input of the editable-input text surface.              | `.frame-editable-input`              |
| `--frame-input-outline-offset`          | `frame.input.outline.offset`          | `0px`                                                                                    | Fallback for: Offset between the outline and the text input.                             | `.frame-editable-input`              |
| `--frame-editable-input-outline-offset` | `frame.editable.input.outline.offset` | `var(     --frame-input-outline-offset,     0px   )`                                     | Offset between the outline and input of the editable-input text surface.                 | `.frame-editable-input`              |
| `--frame-text`                          | `frame.text`                          | `#ccc`                                                                                   | Foreground for .frame-control-surface.                                                   | `.frame-control-surface`             |
| `--frame-surface`                       | `frame.surface`                       | `#242424`                                                                                | Background for .frame-control-surface.                                                   | `.frame-control-surface`             |
| `--frame-line`                          | `frame.line`                          | `#454545`                                                                                | Border for .frame-control-surface.                                                       | `.frame-control-surface`             |
| `--frame-control-radius`                | `frame.control.radius`                | `var(--frame-radius-medium)`                                                             | Corner radius for .frame-control-surface.                                                | `.frame-control-surface`             |
| `--frame-control-padding-y`             | `frame.control.padding.y`             | `5px`                                                                                    | Internal spacing for .frame-control-surface.                                             | `.frame-control-surface`             |
| `--frame-control-padding-x`             | `frame.control.padding.x`             | `10px`                                                                                   | Internal spacing for .frame-control-surface.                                             | `.frame-control-surface`             |
| `--frame-radius-medium`                 | `frame.radius.medium`                 | No declared default; supplied by context.                                                | Medium shared corner radius used by ordinary controls.                                   | `.frame-control-surface`             |
| `--frame-form-input-radius`             | `frame.form.input.radius`             | `var(--frame-input-radius)`                                                              | Corner radius of the legacy form input surface.                                          | `.frame-form-input`                  |
| `--frame-control-text`                  | `frame.control.text`                  | `#d4d4d4`                                                                                | Foreground for .frame-form-input.                                                        | `.frame-form-input`                  |
| `--frame-control-background`            | `frame.control.background`            | `#1d1d1d`                                                                                | Background for .frame-form-input.                                                        | `.frame-form-input`                  |
| `--frame-control-border`                | `frame.control.border`                | `#3c4246`                                                                                | Border color for .frame-form-input.                                                      | `.frame-form-input`                  |
| `--frame-accent`                        | `frame.accent`                        | `#0078d4`                                                                                | Elevation shadow for .frame-control-focus:focus-visible.                                 | `.frame-control-focus:focus-visible` |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->

### Additional styling guidance

#### Parts and selectors

| Selector            | Part              | Placement                                                                        |
| ------------------- | ----------------- | -------------------------------------------------------------------------------- |
| `.frame-editable`   | Root              | See attribute routing in Anatomy; internal parts have no independent attrs prop. |
| `.frame-form-input` | Preview and Input | See attribute routing in Anatomy; internal parts have no independent attrs prop. |

Preview and Input share form-input styles and inherited typography; there are no dedicated editable geometry tokens.

#### Variables

| Token key                    | Variable                     | Value kind | Default/fallback                                                                          | Part/effect                     | Scope/limits                                                                         | Description                           |
| ---------------------------- | ---------------------------- | ---------- | ----------------------------------------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------- |
| `--frame-accent`             | `--frame-accent`             | color      | Catalog: `#0078d4`. CSS fallback: `#0078d4`                                               | Preview and Input outline       | Shared with other controls using the same variable. State selectors: :focus-visible. | Sets Preview and Input outline.       |
| `--frame-control-background` | `--frame-control-background` | color      | Catalog: `#1d1d1d`. CSS fallback: `#1d1d1d`                                               | Preview and Input background    | Shared with other controls using the same variable.                                  | Sets Preview and Input background.    |
| `--frame-control-border`     | `--frame-control-border`     | color      | Catalog: `var(--frame-border-color)`. CSS fallback: `#3c4246`                             | Preview and Input border-color  | Shared with other controls using the same variable.                                  | Sets Preview and Input border-color.  |
| `--frame-control-padding-x`  | `--frame-control-padding-x`  | length     | Catalog: `calc(var(--frame-spacing-unit) * 2.5)`. CSS fallback: `10px`                    | Preview and Input padding       | Shared with other controls using the same variable.                                  | Sets Preview and Input padding.       |
| `--frame-control-padding-y`  | `--frame-control-padding-y`  | length     | Catalog: `calc(var(--frame-spacing-unit) * 1.25)`. CSS fallback: `5px`                    | Preview and Input padding       | Shared with other controls using the same variable.                                  | Sets Preview and Input padding.       |
| `--frame-control-text`       | `--frame-control-text`       | color      | Catalog: `#d4d4d4`. CSS fallback: `#d4d4d4`                                               | Preview and Input color         | Shared with other controls using the same variable.                                  | Sets Preview and Input color.         |
| CSS only                     | `--frame-form-input-radius`  | length     | CSS fallback: `var(--frame-input-radius)`                                                 | Preview and Input border-radius | CSS only; absent from JSON token allowlist.                                          | Sets Preview and Input border-radius. |
| `--frame-input-radius`       | `--frame-input-radius`       | length     | Catalog: `var(--frame-menu-border-radius)`. No local fallback; resolves from the cascade. | Preview and Input border-radius | Shared with other controls using the same variable.                                  | Sets Preview and Input border-radius. |

See [theme variables](../../styling/theme-variables.md) for theme authoring.
