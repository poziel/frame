# FrameLabel

Gives a form control a visible, clickable label. Match its `for` prop to the control's `id` so users can activate or focus the control by clicking its label.

## Features

### Anatomy

```text
FrameLabel
└─ Reka Label (.frame-label; native label by default)
   └─ default slot
```

This component has one part. It creates no input, indicator, validation message, or form group.

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
    <FrameTextField id="project-name" v-model="projectName" />
  </div>
</template>
```

IDs must be unique in the document. When rendering repeated forms, generate an ID per field rather than copying a fixed one.

### Required fields and help text

A label can contain your own text or markup. Marking it with an asterisk does not make the field required; set `required` on the control itself. Connect help text to the control with `aria-describedby`:

```vue
<FrameLabel for="project-name">Project name (required)</FrameLabel>
<FrameTextField
  id="project-name"
  v-model="projectName"
  required
  aria-describedby="project-name-help"
/>
<p id="project-name-help">Use a name your team will recognize.</p>
```

### Behavior and accessibility

The label does not validate or own the field's value. Its `for` association uses native label behavior. Clicking a label for a disabled input does not enable it. The underlying label prevents text selection on repeated mouse clicks; it adds no keyboard stop of its own.

Use visible text describing the field, rather than only an icon. A placeholder is not a persistent label. Checkbox and Switch already include a label wrapper and accept inline label content; use their own labeling APIs rather than nesting labels.

Short follow-up examples reuse the Basic usage setup unless they include their own script. Styles load once per application; these controls need no Frame instance.

## APIs

The tables separate Reka types from the actual Frame contract. Declared APIs are typed by Frame; forwarded attributes reach only the named part; internal parts cannot be configured independently. Defaults labeled Reka belong to the underlying reference.

### Root

Frame supplies this part in its anatomy. Availability below refers to configuration through the Frame wrapper, not direct use of a Reka export.

#### Props

| Prop | Reka type | Frame type | Required/default | Availability | Description |
| --- | --- | --- | --- | --- | --- |
| `as` | `AsTag \| Component` | Same upstream type; undeclared in Frame | `"label"` (Reka) | Forwarded | Rendered element/component. |
| `asChild` | `boolean` | Same upstream type; undeclared in Frame | Unset in upstream reference | Forwarded | Merge behavior into the supplied child element. |
| `for` | `string` | `string` | `Unset` | Declared | Associated control ID. |

#### Emits

No component-defined emits on this part. Native listeners are separate from component emits.

#### Slots

`default` contains label text/inline markup, with no scoped payload. Frame passes it to Reka Label.

#### Data attributes

| Attribute | Value/presence | Meaning |
| --- | --- | --- |
| — | None supplied by this part | Label/text/separator parts do not add checked/open state markers. |

#### Wrapper boundaries

Reka Label documents `for`, `as` (default `'label'`), and `asChild`. Frame declares only `for`; Vue's attribute fallthrough can also pass `as`/`asChild` to the underlying Label. They are not typed Frame props. Changing the rendered tag can remove native label association, and `asChild` requires a suitable single child; ordinary text-slot usage should retain the default native label.

Reka Label declares no component model, update event, or state slot payload. Frame also adds none. There are no label-specific checked/disabled/open data attributes; use native control state on the associated input. Attributes such as `data-testid` are caller-owned and simply pass through.

### Frame additions

#### Props

No additional Frame-only props.

#### Slots

No additional public Frame slots.

#### Emits

No component model or additional Frame-only emits.

#### Exposed methods

No Frame-defined methods or internal Reka refs are exposed.

### Sources and version

[FrameLabel.vue](../../../packages/core/src/components/forms/FrameLabel.vue) wraps Reka Label. Only `for` is declared as a Frame prop.

Compared with the [Reka Label reference](https://reka-ui.com/docs/components/label.md) and installed Reka `2.11.0` source. See the [coverage review](../../reference/reka-coverage.md).

## Styling

### Parts and selectors

| Selector | Part | Placement/attribute target |
| --- | --- | --- |
| `.frame-label` | Label | Caller class/style targets this element. |

The label inherits its parent typography/color and has no dedicated component variables.

### Variables

No directly consumed component variables. Label text inherits the surrounding styling; there is no dedicated JSON key or CSS variable to list.

See [theme variables](../../styling/theme-variables.md) for theme authoring.
