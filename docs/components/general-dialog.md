# Dialog

A themed dialog powered by Reka UI.

## Features

### Review project details

Open a focused dialog without replacing the current workspace. Closing returns focus to its trigger.

<!-- frame:example id="general-dialog.task-0" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameDialog } from '@frame/core';

</script>
<template>
<FrameDialog :title="&quot;Project details&quot;" :description="&quot;Review the project before continuing.&quot;" :trigger-label="&quot;Review project&quot;">
  <template #default><span v-text="&quot;Project: Design system. Target: Desktop.&quot;" /></template>
</FrameDialog>
</template>
```

### Inspect a non-modal view

A non-modal dialog lets the surrounding application remain available while the user reviews supporting information.

<!-- frame:example id="general-dialog.task-1" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameDialog } from '@frame/core';
const demoModal = false;
</script>
<template>
<FrameDialog :title="&quot;Reference details&quot;" :description="&quot;Supporting information for the current task.&quot;" :trigger-label="&quot;Open reference&quot;" :modal="demoModal">
  <template #default><span v-text="&quot;Reference notes supplied by the host.&quot;" /></template>
</FrameDialog>
</template>
```

## APIs

<!-- frame:generated api="general-dialog" -->

### FrameDialog

Source: `packages/core/src/components/overlays/FrameDialog.vue`

#### Properties

| Name            | Type                              | Default  | Description                                                                                                                                                                                                                           |
| --------------- | --------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`         | `string`                          | Required | Visible heading and accessible title of the overlay.                                                                                                                                                                                  |
| `hideTitle`     | `boolean \| undefined`            | false    | Visually hides the title while retaining its accessible dialog name.                                                                                                                                                                  |
| `footer`        | `boolean \| undefined`            | false    | Controls the default footer; false removes the footer and its actions slot.                                                                                                                                                           |
| `description`   | `string \| undefined`             | Omitted  | Supporting text associated with the overlay title.                                                                                                                                                                                    |
| `triggerLabel`  | `string \| undefined`             | Omitted  | Text for the built-in trigger when no trigger slot is supplied.                                                                                                                                                                       |
| `contentProps`  | `DialogContentProps \| undefined` | Omitted  | Properties forwarded to the overlay content primitive, separate from root state.                                                                                                                                                      |
| `confirmLabel`  | `string \| undefined`             | Omitted  | Reserved confirmation label; the current close-only footer does not render it.                                                                                                                                                        |
| `open`          | `boolean \| undefined`            | false    | The controlled open state of the dialog. Can be binded as `v-model:open`.                                                                                                                                                             |
| `defaultOpen`   | `boolean \| undefined`            | false    | The open state of the dialog when it is initially rendered. Use when you do not need to control its open state.                                                                                                                       |
| `modal`         | `boolean \| undefined`            | false    | The modality of the dialog When set to `true`, <br> interaction with outside elements will be disabled and only dialog content will be visible to screen readers.                                                                     |
| `unmountOnHide` | `boolean \| undefined`            | false    | When set to `false`, the dialog content will not be unmounted when closed, but instead hidden with CSS. <br> Useful for SEO or when you want to improve performance by not remounting the component on every open. defaultValue: true |

#### Events

| Name                 | Parameters                                            | Return type | Description                                                                                                                                                                               |
| -------------------- | ----------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `update:open`        | `value: boolean`                                      | `void`      | Event handler called when the open state of the dialog changes.                                                                                                                           |
| `escapeKeyDown`      | `event: KeyboardEvent`                                | `void`      | Event handler called when the escape key is down. Can be prevented.                                                                                                                       |
| `pointerDownOutside` | `event: PointerDownOutsideEvent`                      | `void`      | Event handler called when a `pointerdown` event happens outside of the `DismissableLayer`. Can be prevented.                                                                              |
| `focusOutside`       | `event: FocusOutsideEvent`                            | `void`      | Event handler called when the focus moves outside of the `DismissableLayer`. Can be prevented.                                                                                            |
| `interactOutside`    | `event: PointerDownOutsideEvent \| FocusOutsideEvent` | `void`      | Event handler called when an interaction happens outside the `DismissableLayer`. Specifically, when a `pointerdown` event happens outside or focus moves outside of it. Can be prevented. |
| `openAutoFocus`      | `event: Event`                                        | `void`      | Event handler called when auto-focusing on open. Can be prevented.                                                                                                                        |
| `closeAutoFocus`     | `event: Event`                                        | `void`      | Event handler called when auto-focusing on close. Can be prevented.                                                                                                                       |
| `confirm`            | `None`                                                | `void`      | Reserved confirmation event; the built-in close-only footer does not emit it.                                                                                                             |

#### Slots

| Name      | Parameters | Return type  | Description                                                               |
| --------- | ---------- | ------------ | ------------------------------------------------------------------------- |
| `trigger` | `None`     | `VNodeChild` | Element that opens this overlay; defaults to the built-in trigger button. |
| `default` | `None`     | `VNodeChild` | Body content below the title and optional description.                    |
| `actions` | `None`     | `VNodeChild` | Replaces the built-in footer actions.                                     |

#### Exposed API

No declared entries.

<!-- /frame:generated -->

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="general-dialog" -->

| CSS variable                      | Theme path                      | Default expression                                                                 | Purpose                                                                                                      | Context                               |
| --------------------------------- | ------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------- |
| `--frame-menu-border`             | `frame.menu.border`             | No declared default; supplied by context.                                          | Border color around floating menus, independently overridable from control borders.                          | `.frame-advanced-popup`               |
| `--frame-control-radius`          | `frame.control.radius`          | No declared default; supplied by context.                                          | Shared corner radius of buttons and ordinary controls; text-entry surfaces may use the input radius instead. | `.frame-advanced-popup`               |
| `--frame-menu-background`         | `frame.menu.background`         | No declared default; supplied by context.                                          | Surface behind floating menu containers, following the shared overlay background.                            | `.frame-advanced-popup`               |
| `--frame-text`                    | `frame.text`                    | No declared default; supplied by context.                                          | Primary foreground for readable text and icons across shell and application content.                         | `.frame-advanced-popup`               |
| `--frame-overlay-shadow`          | `frame.overlay.shadow`          | No declared default; supplied by context.                                          | Elevation shadow separating floating overlays from underlying content.                                       | `.frame-advanced-popup`               |
| `--frame-font-body`               | `frame.font.body`               | No declared default; supplied by context.                                          | Primary font family inherited by shell content and ordinary controls.                                        | `.frame-advanced-popup`               |
| `--frame-font-size-body`          | `frame.font.size.body`          | No declared default; supplied by context.                                          | Base text size inherited by shell content and ordinary controls.                                             | `.frame-advanced-popup`               |
| `--frame-control-text`            | `frame.control.text`            | `var(--frame-foreground)`                                                          | Foreground for .frame-general-button.                                                                        | `.frame-general-button`               |
| `--frame-control-background`      | `frame.control.background`      | `var(--frame-background)`                                                          | Background for .frame-general-button.                                                                        | `.frame-general-button`               |
| `--frame-control-border`          | `frame.control.border`          | `var(--frame-border)`                                                              | Border for .frame-general-button.                                                                            | `.frame-general-button`               |
| `--frame-radius`                  | `frame.radius`                  | `var(--frame-radius-medium)`                                                       | Corner radius for .frame-general-button.                                                                     | `.frame-general-button`               |
| `--frame-foreground`              | `frame.foreground`              | No declared default; supplied by context.                                          | foreground used by color in .frame-general-button.                                                           | `.frame-general-button`               |
| `--frame-background`              | `frame.background`              | No declared default; supplied by context.                                          | background used by background in .frame-general-button.                                                      | `.frame-general-button`               |
| `--frame-border`                  | `frame.border`                  | No declared default; supplied by context.                                          | border used by border in .frame-general-button.                                                              | `.frame-general-button`               |
| `--frame-radius-medium`           | `frame.radius.medium`           | No declared default; supplied by context.                                          | Medium shared corner radius used by ordinary controls.                                                       | `.frame-general-button`               |
| `--frame-focus-border`            | `frame.focus.border`            | `var(--frame-accent)`                                                              | Outline for .frame-general-button:focus-visible.                                                             | `.frame-general-button:focus-visible` |
| `--frame-accent`                  | `frame.accent`                  | No declared default; supplied by context.                                          | Shared interaction color for keyboard focus, active actions, and accent-filled controls.                     | `.frame-general-button:focus-visible` |
| `--frame-dialog-backdrop`         | `frame.dialog.backdrop`         | `#0006`                                                                            | Background for .frame-general-backdrop.                                                                      | `.frame-general-backdrop`             |
| `--frame-general-background`      | `frame.general.background`      | `var(     --frame-overlay-background   )`                                          | Background for .frame-general-surface.                                                                       | `.frame-general-surface`              |
| `--frame-foreground`              | `frame.foreground`              | `#eee`                                                                             | Foreground for .frame-general-surface.                                                                       | `.frame-general-surface`              |
| `--frame-control-text`            | `frame.control.text`            | `var(     --frame-foreground,     #eee   )`                                        | Foreground for .frame-general-surface.                                                                       | `.frame-general-surface`              |
| `--frame-general-foreground`      | `frame.general.foreground`      | `var(     --frame-control-text,     var(     --frame-foreground,     #eee   )   )` | Foreground for .frame-general-surface.                                                                       | `.frame-general-surface`              |
| `--frame-border`                  | `frame.border`                  | `#555`                                                                             | Border for .frame-general-surface.                                                                           | `.frame-general-surface`              |
| `--frame-control-border`          | `frame.control.border`          | `var(     --frame-border,     #555   )`                                            | Border for .frame-general-surface.                                                                           | `.frame-general-surface`              |
| `--frame-general-border`          | `frame.general.border`          | `var(     --frame-control-border,     var(     --frame-border,     #555   )   )`   | Border for .frame-general-surface.                                                                           | `.frame-general-surface`              |
| `--frame-radius`                  | `frame.radius`                  | `var(--frame-radius-medium)`                                                       | Corner radius for .frame-general-surface.                                                                    | `.frame-general-surface`              |
| `--frame-general-radius`          | `frame.general.radius`          | `var(     --frame-radius,     var(--frame-radius-medium)   )`                      | Corner radius for .frame-general-surface.                                                                    | `.frame-general-surface`              |
| `--frame-general-shadow`          | `frame.general.shadow`          | `0 8px 24px #0004`                                                                 | Elevation shadow for .frame-general-surface.                                                                 | `.frame-general-surface`              |
| `--frame-overlay-background`      | `frame.overlay.background`      | No declared default; supplied by context.                                          | Shared translucent fill for floating surfaces over the application canvas.                                   | `.frame-general-surface`              |
| `--frame-radius-medium`           | `frame.radius.medium`           | No declared default; supplied by context.                                          | Medium shared corner radius used by ordinary controls.                                                       | `.frame-general-surface`              |
| `--frame-description-foreground`  | `frame.description.foreground`  | `var(--frame-foreground)`                                                          | Foreground for .frame-general-description.                                                                   | `.frame-general-description`          |
| `--frame-foreground`              | `frame.foreground`              | No declared default; supplied by context.                                          | foreground used by color in .frame-general-description.                                                      | `.frame-general-description`          |
| `--frame-overlay-backdrop-filter` | `frame.overlay.backdrop.filter` | No declared default; supplied by context.                                          | Blur and saturation treatment behind shared translucent floating surfaces.                                   | `.frame-overlay-surface`              |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->
