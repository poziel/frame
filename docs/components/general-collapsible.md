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

| CSS variable                            | Theme path                            | Default expression                        | Purpose                                                                                                      | Context                             |
| --------------------------------------- | ------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------- |
| `--frame-font-body`                     | `frame.font.body`                     | No declared default; supplied by context. | Primary font family inherited by shell content and ordinary controls.                                        | `.frame-layout-text`                |
| `--frame-font-size-body`                | `frame.font.size.body`                | No declared default; supplied by context. | Base text size inherited by shell content and ordinary controls.                                             | `.frame-layout-text`                |
| `--frame-text`                          | `frame.text`                          | No declared default; supplied by context. | Primary foreground for readable text and icons across shell and application content.                         | `.frame-layout-text`                |
| `--frame-disclosure-background`         | `frame.disclosure.background`         | `var(--frame-surface)`                    | Resting surface shared by accordion and collapsible triggers.                                                | `.frame-disclosure-trigger`         |
| `--frame-gap`                           | `frame.gap`                           | No declared default; supplied by context. | Standard space between related content items and control children.                                           | `.frame-disclosure-trigger`         |
| `--frame-surface`                       | `frame.surface`                       | No declared default; supplied by context. | Neutral raised surface behind grouped content and control compositions.                                      | `.frame-disclosure-trigger`         |
| `--frame-content-padding`               | `frame.content.padding`               | No declared default; supplied by context. | Standard inset around content in panels, disclosures, and application surfaces.                              | `.frame-disclosure-trigger`         |
| `--frame-disclosure-hover`              | `frame.disclosure.hover`              | `var(--frame-menu-hover)`                 | Pointer hover surface shared by disclosure triggers.                                                         | `.frame-disclosure-trigger:hover`   |
| `--frame-menu-hover`                    | `frame.menu.hover`                    | No declared default; supplied by context. | Neutral hover and highlight fill for ordinary menu rows.                                                     | `.frame-disclosure-trigger:hover`   |
| `--frame-accent`                        | `frame.accent`                        | No declared default; supplied by context. | Shared interaction color for keyboard focus, active actions, and accent-filled controls.                     | `.frame-layout-focus:focus-visible` |
| `--frame-disclosure-content-background` | `frame.disclosure.content.background` | `var(--frame-canvas)`                     | Surface behind expanded disclosure content.                                                                  | `.frame-disclosure-content`         |
| `--frame-content-padding`               | `frame.content.padding`               | No declared default; supplied by context. | Standard inset around content in panels, disclosures, and application surfaces.                              | `.frame-disclosure-content`         |
| `--frame-canvas`                        | `frame.canvas`                        | No declared default; supplied by context. | Content canvas background used by workspace panes and recessed content.                                      | `.frame-disclosure-content`         |
| `--frame-line`                          | `frame.line`                          | No declared default; supplied by context. | Neutral divider color for content boundaries, tracks, and structural separators.                             | `.frame-collapsible`                |
| `--frame-control-radius`                | `frame.control.radius`                | No declared default; supplied by context. | Shared corner radius of buttons and ordinary controls; text-entry surfaces may use the input radius instead. | `.frame-collapsible`                |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->
