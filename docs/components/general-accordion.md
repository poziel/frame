# Accordion

A themed accordion powered by Reka UI.

## Features

### Organize project preferences

Expand a section to review its settings. Collapsible single mode keeps one topic visible at a time.

<!-- frame:example id="general-accordion.task-0" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameAccordion } from '@frame/core';
const demoItems = [
  {
    "value": "profile",
    "title": "Profile",
    "description": "Manage the name shown in your workspace."
  },
  {
    "value": "security",
    "title": "Security",
    "description": "Review access and sign-in preferences."
  }
];
const demoCollapsible = true;
</script>
<template>
<FrameAccordion :items="demoItems" :type="&quot;single&quot;" :collapsible="demoCollapsible" :default-value="&quot;profile&quot;" />
</template>
```

### Compare several sections

Multiple mode keeps both topics expanded so users can compare the information without switching back and forth.

<!-- frame:example id="general-accordion.task-1" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameAccordion } from '@frame/core';
const demoItems = [
  {
    "value": "profile",
    "title": "Profile",
    "description": "Manage the name shown in your workspace."
  },
  {
    "value": "security",
    "title": "Security",
    "description": "Review access and sign-in preferences."
  }
];
const demoDefaultValue = [
  "profile",
  "security"
];
</script>
<template>
<FrameAccordion :items="demoItems" :type="&quot;multiple&quot;" :default-value="demoDefaultValue" />
</template>
```

## APIs

<!-- frame:generated api="general-accordion" -->

### FrameAccordion

Source: `packages/core/src/components/layout/FrameAccordion.vue`

#### Properties

| Name            | Type                                | Default    | Description                                                                                                                                                                                          |
| --------------- | ----------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `items`         | `FrameAccordionItem[] \| undefined` | Omitted    | Sections rendered by the built-in trigger and content composition. A default slot replaces this composition.                                                                                         |
| `collapsible`   | `boolean \| undefined`              | false      | When type is "single", allows closing content when clicking trigger for an open item. When type is "multiple", this prop has no effect. defaultValue: false                                          |
| `disabled`      | `boolean \| undefined`              | false      | When `true`, prevents the user from interacting with the accordion and all its items defaultValue: false                                                                                             |
| `dir`           | `Direction \| undefined`            | "ltr"      | The reading direction of the accordion when applicable. If omitted, assumes LTR (left-to-right) reading mode. defaultValue: "ltr"                                                                    |
| `orientation`   | `DataOrientation \| undefined`      | "vertical" | The orientation of the accordion. defaultValue: "vertical"                                                                                                                                           |
| `unmountOnHide` | `boolean \| undefined`              | false      | When `true`, the element will be unmounted on closed state. defaultValue: `true`                                                                                                                     |
| `asChild`       | `boolean \| undefined`              | false      | Change the default rendered element for the one passed as a child, merging their props and behavior. Read our [Composition](https://www.reka-ui.com/docs/guides/composition) guide for more details. |
| `as`            | `Component \| AsTag \| undefined`   | "div"      | The element or component this component should render as. Can be overwritten by `asChild`. defaultValue: "div"                                                                                       |
| `type`          | `SingleOrMultipleType \| undefined` | Omitted    | Determines whether a "single" or "multiple" items can be selected at a time. This prop will overwrite the inferred type from `modelValue` and `defaultValue`.                                        |
| `modelValue`    | `string \| string[] \| undefined`   | Omitted    | The controlled value of the active item(s). Use this when you need to control the state of the items. Can be binded with `v-model`                                                                   |
| `defaultValue`  | `string \| string[] \| undefined`   | Omitted    | The default active value of the item(s). Use when you do not need to control the state of the item(s).                                                                                               |

#### Events

| Name                | Parameters                               | Return type | Description                                                     |
| ------------------- | ---------------------------------------- | ----------- | --------------------------------------------------------------- |
| `update:modelValue` | `value: string \| string[] \| undefined` | `void`      | Event handler called when the expanded state of an item changes |

#### Slots

| Name      | Parameters                                                           | Return type  | Description                                                                      |
| --------- | -------------------------------------------------------------------- | ------------ | -------------------------------------------------------------------------------- |
| `default` | `{ modelValue: AcceptableValue \| AcceptableValue[] \| undefined; }` | `VNodeChild` | Replaces the built-in item composition with application-owned accordion content. |
| `trigger` | `{ item: FrameAccordionItem; }`                                      | `VNodeChild` | Trigger text for one built-in item; defaults to its title.                       |
| `content` | `{ item: FrameAccordionItem; }`                                      | `VNodeChild` | Body content for one built-in item; defaults to its description.                 |

#### Exposed API

No declared entries.

<!-- /frame:generated -->

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="general-accordion" -->

| CSS variable                            | Theme path                            | Default expression                        | Purpose                                                                                                      | Context                                         |
| --------------------------------------- | ------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------- |
| `--frame-font-body`                     | `frame.font.body`                     | No declared default; supplied by context. | Primary font family inherited by shell content and ordinary controls.                                        | `.frame-layout-text`                            |
| `--frame-font-size-body`                | `frame.font.size.body`                | No declared default; supplied by context. | Base text size inherited by shell content and ordinary controls.                                             | `.frame-layout-text`                            |
| `--frame-text`                          | `frame.text`                          | No declared default; supplied by context. | Primary foreground for readable text and icons across shell and application content.                         | `.frame-layout-text`                            |
| `--frame-disclosure-background`         | `frame.disclosure.background`         | `var(--frame-surface)`                    | Resting surface shared by accordion and collapsible triggers.                                                | `.frame-disclosure-trigger`                     |
| `--frame-gap`                           | `frame.gap`                           | No declared default; supplied by context. | Standard space between related content items and control children.                                           | `.frame-disclosure-trigger`                     |
| `--frame-surface`                       | `frame.surface`                       | No declared default; supplied by context. | Neutral raised surface behind grouped content and control compositions.                                      | `.frame-disclosure-trigger`                     |
| `--frame-content-padding`               | `frame.content.padding`               | No declared default; supplied by context. | Standard inset around content in panels, disclosures, and application surfaces.                              | `.frame-disclosure-trigger`                     |
| `--frame-disclosure-hover`              | `frame.disclosure.hover`              | `var(--frame-menu-hover)`                 | Pointer hover surface shared by disclosure triggers.                                                         | `.frame-disclosure-trigger:hover`               |
| `--frame-menu-hover`                    | `frame.menu.hover`                    | No declared default; supplied by context. | Neutral hover and highlight fill for ordinary menu rows.                                                     | `.frame-disclosure-trigger:hover`               |
| `--frame-accent`                        | `frame.accent`                        | No declared default; supplied by context. | Shared interaction color for keyboard focus, active actions, and accent-filled controls.                     | `.frame-layout-focus:focus-visible`             |
| `--frame-disclosure-content-background` | `frame.disclosure.content.background` | `var(--frame-canvas)`                     | Surface behind expanded disclosure content.                                                                  | `.frame-disclosure-content`                     |
| `--frame-content-padding`               | `frame.content.padding`               | No declared default; supplied by context. | Standard inset around content in panels, disclosures, and application surfaces.                              | `.frame-disclosure-content`                     |
| `--frame-canvas`                        | `frame.canvas`                        | No declared default; supplied by context. | Content canvas background used by workspace panes and recessed content.                                      | `.frame-disclosure-content`                     |
| `--frame-accordion-border`              | `frame.accordion.border`              | `var(--frame-line)`                       | Border color around the accordion and between its sections.                                                  | `.frame-accordion`                              |
| `--frame-line`                          | `frame.line`                          | No declared default; supplied by context. | Neutral divider color for content boundaries, tracks, and structural separators.                             | `.frame-accordion`                              |
| `--frame-control-radius`                | `frame.control.radius`                | No declared default; supplied by context. | Shared corner radius of buttons and ordinary controls; text-entry surfaces may use the input radius instead. | `.frame-accordion`                              |
| `--frame-accordion-border`              | `frame.accordion.border`              | `var(--frame-line)`                       | Border color around the accordion and between its sections.                                                  | `.frame-accordion-item + .frame-accordion-item` |
| `--frame-line`                          | `frame.line`                          | No declared default; supplied by context. | Neutral divider color for content boundaries, tracks, and structural separators.                             | `.frame-accordion-item + .frame-accordion-item` |
| `--frame-duration`                      | `frame.duration`                      | No declared default; supplied by context. | Shared duration for control and shell presentation transitions.                                              | `.frame-accordion-chevron`                      |
| `--frame-ease`                          | `frame.ease`                          | No declared default; supplied by context. | Shared timing curve for control and shell presentation transitions.                                          | `.frame-accordion-chevron`                      |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->
