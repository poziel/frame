# Collapsible

A themed collapsible powered by Reka UI.

## Features

### Reveal advanced details

Keep optional project details out of the main reading flow until the user asks for them.

<!-- frame:example id="general-collapsible.task-0" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameCollapsible } from '@frame/core';

</script>
<template>
<FrameCollapsible :label="&quot;Advanced project details&quot;">
  <template #default><span v-text="&quot;Project location: /workspace/design-system&quot;" /></template>
</FrameCollapsible>
</template>
```

### Review expanded details

Start with the details expanded when they are relevant to the current task; users can collapse them again.

<!-- frame:example id="general-collapsible.task-1" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameCollapsible } from '@frame/core';
const demoDefaultOpen = true;
</script>
<template>
<FrameCollapsible :label="&quot;Build details&quot;" :default-open="demoDefaultOpen">
  <template #default><span v-text="&quot;Target: desktop. Output: application bundle.&quot;" /></template>
</FrameCollapsible>
</template>
```

## APIs

<!-- frame:generated api="general-collapsible" -->

### FrameCollapsible

Source: `packages/core/src/components/layout/FrameCollapsible.vue`

#### Properties

| Name            | Type                              | Default | Description                                                                                                                                                                                          |
| --------------- | --------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `label`         | `string \| undefined`             | Omitted | Accessible visible text for the built-in disclosure trigger. The trigger slot can replace it.                                                                                                        |
| `defaultOpen`   | `boolean \| undefined`            | false   | The open state of the collapsible when it is initially rendered. <br> Use when you do not need to control its open state.                                                                            |
| `open`          | `boolean \| undefined`            | false   | The controlled open state of the collapsible. Can be binded with `v-model`.                                                                                                                          |
| `disabled`      | `boolean \| undefined`            | false   | When `true`, prevents the user from interacting with the collapsible.                                                                                                                                |
| `unmountOnHide` | `boolean \| undefined`            | false   | When `true`, the element will be unmounted on closed state.                                                                                                                                          |
| `asChild`       | `boolean \| undefined`            | false   | Change the default rendered element for the one passed as a child, merging their props and behavior. Read our [Composition](https://www.reka-ui.com/docs/guides/composition) guide for more details. |
| `as`            | `Component \| AsTag \| undefined` | "div"   | The element or component this component should render as. Can be overwritten by `asChild`. defaultValue: "div"                                                                                       |

#### Events

| Name          | Parameters       | Return type | Description                                                          |
| ------------- | ---------------- | ----------- | -------------------------------------------------------------------- |
| `update:open` | `value: boolean` | `void`      | Event handler called when the open state of the collapsible changes. |

#### Slots

| Name      | Parameters           | Return type  | Description                                       |
| --------- | -------------------- | ------------ | ------------------------------------------------- |
| `default` | `{ open: boolean; }` | `VNodeChild` | Disclosure body with the current expanded state.  |
| `trigger` | `{ open: boolean; }` | `VNodeChild` | Replaces the built-in disclosure trigger content. |

#### Exposed API

No declared entries.

<!-- /frame:generated -->

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="general-collapsible" -->

| CSS variable                            | Theme path                            | Default expression                      | Purpose                                                                                                      | Context                                                                                                                                                               |
| --------------------------------------- | ------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--frame-font-body`                     | `frame.font.body`                     | `"Segoe UI", sans-serif`                | Primary font family inherited by shell content and ordinary controls.                                        | `.frame-accordion, .frame-collapsible, .frame-pagination, .frame-avatar, .frame-scroll-area`                                                                          |
| `--frame-font-size-body`                | `frame.font.size.body`                | `12px`                                  | Base text size inherited by shell content and ordinary controls.                                             | `.frame-accordion, .frame-collapsible, .frame-pagination, .frame-avatar, .frame-scroll-area`                                                                          |
| `--frame-text`                          | `frame.text`                          | `#cccccc`                               | Primary foreground for readable text and icons across shell and application content.                         | `.frame-accordion, .frame-collapsible, .frame-pagination, .frame-avatar, .frame-scroll-area`                                                                          |
| `--frame-disclosure-background`         | `frame.disclosure.background`         | `var(--frame-surface)`                  | Resting surface shared by accordion and collapsible triggers.                                                | `.frame-accordion-trigger, .frame-collapsible-trigger`                                                                                                                |
| `--frame-gap`                           | `frame.gap`                           | `calc(var(--frame-spacing-unit) * 1.5)` | Standard space between related content items and control children.                                           | `.frame-accordion-trigger, .frame-collapsible-trigger`                                                                                                                |
| `--frame-surface`                       | `frame.surface`                       | `#181818`                               | Neutral raised surface behind grouped content and control compositions.                                      | `.frame-accordion-trigger, .frame-collapsible-trigger`                                                                                                                |
| `--frame-content-padding`               | `frame.content.padding`               | `calc(var(--frame-spacing-unit) * 3)`   | Standard inset around content in panels, disclosures, and application surfaces.                              | `.frame-accordion-trigger, .frame-collapsible-trigger`                                                                                                                |
| `--frame-disclosure-hover`              | `frame.disclosure.hover`              | `var(--frame-menu-hover)`               | Pointer hover surface shared by disclosure triggers.                                                         | `.frame-accordion-trigger:hover, .frame-collapsible-trigger:hover`                                                                                                    |
| `--frame-menu-hover`                    | `frame.menu.hover`                    | `#303336`                               | Neutral hover and highlight fill for ordinary menu rows.                                                     | `.frame-accordion-trigger:hover, .frame-collapsible-trigger:hover`                                                                                                    |
| `--frame-accent`                        | `frame.accent`                        | `#0078d4`                               | Shared interaction color for keyboard focus, active actions, and accent-filled controls.                     | `.frame-accordion-trigger:focus-visible, .frame-collapsible-trigger:focus-visible, .frame-pagination-button:focus-visible, .frame-scroll-area-viewport:focus-visible` |
| `--frame-disclosure-content-background` | `frame.disclosure.content.background` | `var(--frame-canvas)`                   | Surface behind expanded disclosure content.                                                                  | `.frame-accordion-body, .frame-collapsible-content`                                                                                                                   |
| `--frame-content-padding`               | `frame.content.padding`               | `calc(var(--frame-spacing-unit) * 3)`   | Standard inset around content in panels, disclosures, and application surfaces.                              | `.frame-accordion-body, .frame-collapsible-content`                                                                                                                   |
| `--frame-canvas`                        | `frame.canvas`                        | `#101112`                               | Content canvas background used by workspace panes and recessed content.                                      | `.frame-accordion-body, .frame-collapsible-content`                                                                                                                   |
| `--frame-line`                          | `frame.line`                          | `#2b2b2b`                               | Neutral divider color for content boundaries, tracks, and structural separators.                             | `.frame-collapsible`                                                                                                                                                  |
| `--frame-control-radius`                | `frame.control.radius`                | `var(--frame-radius-medium)`            | Shared corner radius of buttons and ordinary controls; text-entry surfaces may use the input radius instead. | `.frame-collapsible`                                                                                                                                                  |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->
