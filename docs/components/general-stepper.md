# Stepper

A themed stepper powered by Reka UI.

## Features

### Guide a project setup

A linear stepper shows progress through an ordered setup flow; the host decides when a step is complete.

<!-- frame:example id="general-stepper.task-0" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameStepper } from '@frame/core';
const demoItems = [
  {
    "step": 1,
    "label": "Details"
  },
  {
    "step": 2,
    "label": "Review"
  },
  {
    "step": 3,
    "label": "Create"
  }
];
const demoDefaultValue = 1;
</script>
<template>
<FrameStepper :items="demoItems" :default-value="demoDefaultValue" :label="&quot;Project setup&quot;" />
</template>
```

### Revisit completed steps

Non-linear navigation lets users return to earlier steps when the task does not require a strict order.

<!-- frame:example id="general-stepper.task-1" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameStepper } from '@frame/core';
const demoItems = [
  {
    "step": 1,
    "label": "Details",
    "completed": true
  },
  {
    "step": 2,
    "label": "Review"
  },
  {
    "step": 3,
    "label": "Create"
  }
];
const demoDefaultValue = 2;
const demoLinear = false;
</script>
<template>
<FrameStepper :items="demoItems" :default-value="demoDefaultValue" :linear="demoLinear" :label="&quot;Project setup&quot;" />
</template>
```

## APIs

<!-- frame:generated api="general-stepper" -->

### FrameStepper

Source: `packages/core/src/components/navigation/FrameStepper.vue`

#### Properties

| Name           | Type                              | Default    | Description                                                                                                                                                                                          |
| -------------- | --------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `defaultValue` | `number \| undefined`             | Omitted    | The value of the step that should be active when initially rendered. Use when you do not need to control the state of the steps.                                                                     |
| `orientation`  | `DataOrientation \| undefined`    | horizontal | The orientation the steps are laid out. Mainly so arrow navigation is done accordingly (left & right vs. up & down). defaultValue: horizontal                                                        |
| `dir`          | `Direction \| undefined`          | Omitted    | The reading direction of the combobox when applicable. <br> If omitted, inherits globally from `ConfigProvider` or assumes LTR (left-to-right) reading mode.                                         |
| `modelValue`   | `number \| undefined`             | Omitted    | The controlled value of the step to activate. Can be bound as `v-model`.                                                                                                                             |
| `linear`       | `boolean \| undefined`            | false      | Whether or not the steps must be completed in order.                                                                                                                                                 |
| `asChild`      | `boolean \| undefined`            | false      | Change the default rendered element for the one passed as a child, merging their props and behavior. Read our [Composition](https://www.reka-ui.com/docs/guides/composition) guide for more details. |
| `as`           | `Component \| AsTag \| undefined` | "div"      | The element or component this component should render as. Can be overwritten by `asChild`. defaultValue: "div"                                                                                       |
| `items`        | `FrameStepItem[] \| undefined`    | Omitted    | Items rendered by the built-in composition; a default slot replaces that composition.                                                                                                                |
| `label`        | `string \| undefined`             | Omitted    | Accessible name for this component and its built-in control or region.                                                                                                                               |

#### Events

| Name                | Parameters                     | Return type | Description                                 |
| ------------------- | ------------------------------ | ----------- | ------------------------------------------- |
| `update:modelValue` | `payload: number \| undefined` | `void`      | Event handler called when the value changes |

#### Slots

| Name      | Parameters                                                                                                                                                                                                                                                                            | Return type  | Description                                                              |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------ |
| `default` | `{ modelValue: number \| undefined; totalSteps: number; isNextDisabled: boolean; isPrevDisabled: boolean; isFirstStep: boolean; isLastStep: boolean; goToStep: (step: number) => void; nextStep: () => void; prevStep: () => void; hasNext: () => boolean; hasPrev: () => boolean; }` | `VNodeChild` | Replaces the generated steps with the root primitive's navigation state. |

#### Exposed API

No declared entries.

<!-- /frame:generated -->

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="general-stepper" -->

| CSS variable               | Theme path               | Default expression                         | Purpose                                                                                                                                                                                                                                                                                                                    | Context                                                                                                                                                                                                                                                                |
| -------------------------- | ------------------------ | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--frame-font-body`        | `frame.font.body`        | `sans-serif`                               | Font family for .frame-tabs, .frame-stepper, .frame-toolbar, .frame-tree, .frame-splitter, .frame-navigation-menu, .frame-menubar.                                                                                                                                                                                         | `.frame-tabs, .frame-stepper, .frame-toolbar, .frame-tree, .frame-splitter, .frame-navigation-menu, .frame-menubar`                                                                                                                                                    |
| `--frame-font-size-body`   | `frame.font.size.body`   | `13px`                                     | Text size for .frame-tabs, .frame-stepper, .frame-toolbar, .frame-tree, .frame-splitter, .frame-navigation-menu, .frame-menubar.                                                                                                                                                                                           | `.frame-tabs, .frame-stepper, .frame-toolbar, .frame-tree, .frame-splitter, .frame-navigation-menu, .frame-menubar`                                                                                                                                                    |
| `--frame-control-text`     | `frame.control.text`     | `var(--frame-text)`                        | Foreground for .frame-tabs, .frame-stepper, .frame-toolbar, .frame-tree, .frame-splitter, .frame-navigation-menu, .frame-menubar.                                                                                                                                                                                          | `.frame-tabs, .frame-stepper, .frame-toolbar, .frame-tree, .frame-splitter, .frame-navigation-menu, .frame-menubar`                                                                                                                                                    |
| `--frame-text`             | `frame.text`             | `#cccccc`                                  | Primary foreground for readable text and icons across shell and application content.                                                                                                                                                                                                                                       | `.frame-tabs, .frame-stepper, .frame-toolbar, .frame-tree, .frame-splitter, .frame-navigation-menu, .frame-menubar`                                                                                                                                                    |
| `--frame-accent`           | `frame.accent`           | `#007acc`                                  | Outline for .frame-toolbar-button:focus-visible, .frame-navigation-link:focus-visible, .frame-navigation-trigger:focus-visible, .frame-menubar-trigger:focus-visible, .frame-tree-item:focus-visible, .frame-stepper-trigger:focus-visible, .frame-splitter-handle:focus-visible. Used when --frame-focus-border is unset. | `.frame-toolbar-button:focus-visible, .frame-navigation-link:focus-visible, .frame-navigation-trigger:focus-visible, .frame-menubar-trigger:focus-visible, .frame-tree-item:focus-visible, .frame-stepper-trigger:focus-visible, .frame-splitter-handle:focus-visible` |
| `--frame-focus-border`     | `frame.focus.border`     | `var(     --frame-accent,     #007acc   )` | Outline for .frame-toolbar-button:focus-visible, .frame-navigation-link:focus-visible, .frame-navigation-trigger:focus-visible, .frame-menubar-trigger:focus-visible, .frame-tree-item:focus-visible, .frame-stepper-trigger:focus-visible, .frame-splitter-handle:focus-visible.                                          | `.frame-toolbar-button:focus-visible, .frame-navigation-link:focus-visible, .frame-navigation-trigger:focus-visible, .frame-menubar-trigger:focus-visible, .frame-tree-item:focus-visible, .frame-stepper-trigger:focus-visible, .frame-splitter-handle:focus-visible` |
| `--frame-disabled-opacity` | `frame.disabled.opacity` | `0.5`                                      | Opacity for .frame-tabs-trigger:disabled, .frame-toolbar-button:disabled, .frame-menubar-trigger:disabled, .frame-navigation-trigger:disabled, [aria-disabled='true'].frame-navigation-link, .frame-tree-item[data-disabled], .frame-stepper-item[data-disabled].                                                          | `.frame-tabs-trigger:disabled, .frame-toolbar-button:disabled, .frame-menubar-trigger:disabled, .frame-navigation-trigger:disabled, [aria-disabled='true'].frame-navigation-link, .frame-tree-item[data-disabled], .frame-stepper-item[data-disabled]`                 |
| `--frame-control-radius`   | `frame.control.radius`   | `var(--frame-radius-medium)`               | Corner radius for .frame-stepper-trigger.                                                                                                                                                                                                                                                                                  | `.frame-stepper-trigger`                                                                                                                                                                                                                                               |
| `--frame-radius-medium`    | `frame.radius.medium`    | `4px`                                      | Medium shared corner radius used by ordinary controls.                                                                                                                                                                                                                                                                     | `.frame-stepper-trigger`                                                                                                                                                                                                                                               |
| `--frame-control-border`   | `frame.control.border`   | `#555`                                     | Border for .frame-stepper-indicator.                                                                                                                                                                                                                                                                                       | `.frame-stepper-indicator`                                                                                                                                                                                                                                             |
| `--frame-accent`           | `frame.accent`           | `#007acc`                                  | Foreground for .frame-stepper-item[data-state='active'] .frame-stepper-indicator, .frame-stepper-item[data-state='completed'] .frame-stepper-indicator.                                                                                                                                                                    | `.frame-stepper-item[data-state='active'] .frame-stepper-indicator, .frame-stepper-item[data-state='completed'] .frame-stepper-indicator`                                                                                                                              |
| `--frame-muted`            | `frame.muted`            | `#888`                                     | Foreground for .frame-stepper-description.                                                                                                                                                                                                                                                                                 | `.frame-stepper-description`                                                                                                                                                                                                                                           |
| `--frame-control-border`   | `frame.control.border`   | `#555`                                     | Background for .frame-stepper-separator.                                                                                                                                                                                                                                                                                   | `.frame-stepper-separator`                                                                                                                                                                                                                                             |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->
