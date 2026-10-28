# Alert Dialog

A themed alert dialog powered by Reka UI.

## Features

### Confirm a destructive action

An alert dialog requires an explicit decision before the host performs a destructive operation.

<!-- frame:example id="general-alert-dialog.task-0" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameAlertDialog } from '@frame/core';

</script>
<template>
<FrameAlertDialog :title="&quot;Delete this draft?&quot;" :description="&quot;Deleting the draft cannot be undone.&quot;" :trigger-label="&quot;Delete draft&quot;" :confirm-label="&quot;Delete draft&quot;" />
</template>
```

### Confirm replacing a file

Explain the consequence before allowing an existing file to be replaced. Confirmation only emits intent to the host.

<!-- frame:example id="general-alert-dialog.task-1" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameAlertDialog } from '@frame/core';

</script>
<template>
<FrameAlertDialog :title="&quot;Replace existing export?&quot;" :description="&quot;A file with this name already exists.&quot;" :trigger-label="&quot;Replace export&quot;" :confirm-label="&quot;Replace file&quot;" />
</template>
```

## APIs

<!-- frame:generated api="general-alert-dialog" -->

### FrameAlertDialog

Source: `packages/core/src/components/overlays/FrameAlertDialog.vue`

#### Properties

| Name            | Type                                   | Default  | Description                                                                                                                                                                                                                           |
| --------------- | -------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`         | `string`                               | Required | Visible heading and accessible title of the overlay.                                                                                                                                                                                  |
| `description`   | `string \| undefined`                  | Omitted  | Supporting text associated with the overlay title.                                                                                                                                                                                    |
| `triggerLabel`  | `string \| undefined`                  | Omitted  | Text for the built-in trigger when no trigger slot is supplied.                                                                                                                                                                       |
| `contentProps`  | `AlertDialogContentProps \| undefined` | Omitted  | Properties forwarded to the overlay content primitive, separate from root state.                                                                                                                                                      |
| `confirmLabel`  | `string \| undefined`                  | Omitted  | Text for the default confirmation action, when that action is rendered.                                                                                                                                                               |
| `open`          | `boolean \| undefined`                 | false    | The controlled open state of the dialog. Can be binded as `v-model:open`.                                                                                                                                                             |
| `defaultOpen`   | `boolean \| undefined`                 | false    | The open state of the dialog when it is initially rendered. Use when you do not need to control its open state.                                                                                                                       |
| `unmountOnHide` | `boolean \| undefined`                 | false    | When set to `false`, the dialog content will not be unmounted when closed, but instead hidden with CSS. <br> Useful for SEO or when you want to improve performance by not remounting the component on every open. defaultValue: true |

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
| `confirm`            | `None`                                                | `void`      | Emitted when the built-in confirmation action is activated.                                                                                                                               |

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

<!-- frame:generated styles="general-alert-dialog" -->

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
