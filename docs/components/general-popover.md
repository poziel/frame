# Popover

A themed popover powered by Reka UI.

## Features

### Inspect a compact summary

A popover anchors supplementary information to the control that opened it and dismisses with Escape.

<!-- frame:example id="general-popover.task-0" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FramePopover } from '@frame/core';

</script>
<template>
<FramePopover :trigger-label="&quot;Project summary&quot;">
  <template #default><span v-text="&quot;Design system · 12 files · Saved just now&quot;" /></template>
</FramePopover>
</template>
```

### Show contextual help

Short contextual guidance stays close to the related action instead of taking over the page.

<!-- frame:example id="general-popover.task-1" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FramePopover } from '@frame/core';

</script>
<template>
<FramePopover :trigger-label="&quot;About exporting&quot;">
  <template #default><span v-text="&quot;Exports include the current saved project state.&quot;" /></template>
</FramePopover>
</template>
```

## APIs

<!-- frame:generated api="general-popover" -->

### FramePopover

Source: `packages/core/src/components/overlays/FramePopover.vue`

#### Properties

| Name           | Type                               | Default | Description                                                                                                                                                                       |
| -------------- | ---------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `triggerLabel` | `string \| undefined`              | Omitted | Text for the built-in trigger when no trigger slot is supplied.                                                                                                                   |
| `contentProps` | `PopoverContentProps \| undefined` | Omitted | Properties forwarded to the overlay content primitive, separate from root state.                                                                                                  |
| `defaultOpen`  | `boolean \| undefined`             | false   | The open state of the popover when it is initially rendered. Use when you do not need to control its open state.                                                                  |
| `open`         | `boolean \| undefined`             | false   | The controlled open state of the popover.                                                                                                                                         |
| `modal`        | `boolean \| undefined`             | false   | The modality of the popover. When set to true, interaction with outside elements will be disabled and only popover content will be visible to screen readers. defaultValue: false |

#### Events

| Name                 | Parameters                                            | Return type | Description                                                                                                                                                                               |
| -------------------- | ----------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `update:open`        | `value: boolean`                                      | `void`      | Event handler called when the open state of the popover changes.                                                                                                                          |
| `escapeKeyDown`      | `event: KeyboardEvent`                                | `void`      | Event handler called when the escape key is down. Can be prevented.                                                                                                                       |
| `pointerDownOutside` | `event: PointerDownOutsideEvent`                      | `void`      | Event handler called when a `pointerdown` event happens outside of the `DismissableLayer`. Can be prevented.                                                                              |
| `focusOutside`       | `event: FocusOutsideEvent`                            | `void`      | Event handler called when the focus moves outside of the `DismissableLayer`. Can be prevented.                                                                                            |
| `interactOutside`    | `event: PointerDownOutsideEvent \| FocusOutsideEvent` | `void`      | Event handler called when an interaction happens outside the `DismissableLayer`. Specifically, when a `pointerdown` event happens outside or focus moves outside of it. Can be prevented. |
| `openAutoFocus`      | `event: Event`                                        | `void`      | Event handler called when auto-focusing on open. Can be prevented.                                                                                                                        |
| `closeAutoFocus`     | `event: Event`                                        | `void`      | Event handler called when auto-focusing on close. Can be prevented.                                                                                                                       |

#### Slots

| Name      | Parameters | Return type  | Description                                                             |
| --------- | ---------- | ------------ | ----------------------------------------------------------------------- |
| `trigger` | `None`     | `VNodeChild` | Element that opens this popup; defaults to the built-in trigger button. |
| `default` | `None`     | `VNodeChild` | Content inside the popup surface.                                       |
| `close`   | `None`     | `VNodeChild` | Replaces the label inside the popup's close button.                     |

#### Exposed API

No declared entries.

<!-- /frame:generated -->

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="general-popover" -->

| CSS variable                      | Theme path                      | Default expression                                                                 | Purpose                                                                                                                                                                     | Context                                                                                                                                                                                                                                                                                                                                                  |
| --------------------------------- | ------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--frame-overlay-backdrop-filter` | `frame.overlay.backdrop.filter` | `blur(10px) saturate(110%)`                                                        | Blur and saturation treatment behind shared translucent floating surfaces.                                                                                                  | `:is(   .frame-menu,   .frame-select-popup,   .palette,   .frame-modal,   .frame-date-popover,   .frame-color-picker-popover,   .frame-advanced-popup,   .frame-general-dialog,   .frame-general-popup,   .frame-general-menu,   .frame-general-toast,   .frame-navigation-content,   .frame-menubar-content,   .frame-tooltip,   .frame-notification )` |
| `--frame-control-text`            | `frame.control.text`            | `var(--frame-foreground)`                                                          | Foreground for .frame-general-button.                                                                                                                                       | `.frame-general-button`                                                                                                                                                                                                                                                                                                                                  |
| `--frame-control-background`      | `frame.control.background`      | `var(--frame-background)`                                                          | Background for .frame-general-button.                                                                                                                                       | `.frame-general-button`                                                                                                                                                                                                                                                                                                                                  |
| `--frame-control-border`          | `frame.control.border`          | `var(--frame-border)`                                                              | Border for .frame-general-button.                                                                                                                                           | `.frame-general-button`                                                                                                                                                                                                                                                                                                                                  |
| `--frame-radius`                  | `frame.radius`                  | `var(--frame-radius-medium)`                                                       | Corner radius for .frame-general-button.                                                                                                                                    | `.frame-general-button`                                                                                                                                                                                                                                                                                                                                  |
| `--frame-foreground`              | `frame.foreground`              | No declared default; supplied by context.                                          | Inherited host foreground alias used when the ordinary control text override is unavailable.                                                                                | `.frame-general-button`                                                                                                                                                                                                                                                                                                                                  |
| `--frame-background`              | `frame.background`              | No declared default; supplied by context.                                          | Inherited host background alias used when the ordinary control background override is unavailable.                                                                          | `.frame-general-button`                                                                                                                                                                                                                                                                                                                                  |
| `--frame-border`                  | `frame.border`                  | No declared default; supplied by context.                                          | Inherited host border-color alias used when the ordinary control border override is unavailable.                                                                            | `.frame-general-button`                                                                                                                                                                                                                                                                                                                                  |
| `--frame-radius-medium`           | `frame.radius.medium`           | `4px`                                                                              | Medium shared corner radius used by ordinary controls.                                                                                                                      | `.frame-general-button`                                                                                                                                                                                                                                                                                                                                  |
| `--frame-focus-border`            | `frame.focus.border`            | `var(--frame-accent)`                                                              | Outline for .frame-general-button:focus-visible.                                                                                                                            | `.frame-general-button:focus-visible`                                                                                                                                                                                                                                                                                                                    |
| `--frame-accent`                  | `frame.accent`                  | `#0078d4`                                                                          | Shared interaction color for keyboard focus, active actions, and accent-filled controls.                                                                                    | `.frame-general-button:focus-visible`                                                                                                                                                                                                                                                                                                                    |
| `--frame-general-background`      | `frame.general.background`      | `var(     --frame-overlay-background   )`                                          | Background for .frame-general-dialog,.frame-general-popup,.frame-general-menu,.frame-general-toast.                                                                         | `.frame-general-dialog, .frame-general-popup, .frame-general-menu, .frame-general-toast`                                                                                                                                                                                                                                                                 |
| `--frame-foreground`              | `frame.foreground`              | `#eee`                                                                             | Foreground for .frame-general-dialog,.frame-general-popup,.frame-general-menu,.frame-general-toast. Used when --frame-general-foreground and --frame-control-text is unset. | `.frame-general-dialog, .frame-general-popup, .frame-general-menu, .frame-general-toast`                                                                                                                                                                                                                                                                 |
| `--frame-control-text`            | `frame.control.text`            | `var(     --frame-foreground,     #eee   )`                                        | Foreground for .frame-general-dialog,.frame-general-popup,.frame-general-menu,.frame-general-toast. Used when --frame-general-foreground is unset.                          | `.frame-general-dialog, .frame-general-popup, .frame-general-menu, .frame-general-toast`                                                                                                                                                                                                                                                                 |
| `--frame-general-foreground`      | `frame.general.foreground`      | `var(     --frame-control-text,     var(     --frame-foreground,     #eee   )   )` | Foreground for .frame-general-dialog,.frame-general-popup,.frame-general-menu,.frame-general-toast.                                                                         | `.frame-general-dialog, .frame-general-popup, .frame-general-menu, .frame-general-toast`                                                                                                                                                                                                                                                                 |
| `--frame-border`                  | `frame.border`                  | `#555`                                                                             | Border for .frame-general-dialog,.frame-general-popup,.frame-general-menu,.frame-general-toast. Used when --frame-general-border and --frame-control-border is unset.       | `.frame-general-dialog, .frame-general-popup, .frame-general-menu, .frame-general-toast`                                                                                                                                                                                                                                                                 |
| `--frame-control-border`          | `frame.control.border`          | `var(     --frame-border,     #555   )`                                            | Border for .frame-general-dialog,.frame-general-popup,.frame-general-menu,.frame-general-toast. Used when --frame-general-border is unset.                                  | `.frame-general-dialog, .frame-general-popup, .frame-general-menu, .frame-general-toast`                                                                                                                                                                                                                                                                 |
| `--frame-general-border`          | `frame.general.border`          | `var(     --frame-control-border,     var(     --frame-border,     #555   )   )`   | Border for .frame-general-dialog,.frame-general-popup,.frame-general-menu,.frame-general-toast.                                                                             | `.frame-general-dialog, .frame-general-popup, .frame-general-menu, .frame-general-toast`                                                                                                                                                                                                                                                                 |
| `--frame-radius`                  | `frame.radius`                  | `var(--frame-radius-medium)`                                                       | Corner radius for .frame-general-dialog,.frame-general-popup,.frame-general-menu,.frame-general-toast. Used when --frame-general-radius is unset.                           | `.frame-general-dialog, .frame-general-popup, .frame-general-menu, .frame-general-toast`                                                                                                                                                                                                                                                                 |
| `--frame-general-radius`          | `frame.general.radius`          | `var(     --frame-radius,     var(--frame-radius-medium)   )`                      | Corner radius for .frame-general-dialog,.frame-general-popup,.frame-general-menu,.frame-general-toast.                                                                      | `.frame-general-dialog, .frame-general-popup, .frame-general-menu, .frame-general-toast`                                                                                                                                                                                                                                                                 |
| `--frame-general-shadow`          | `frame.general.shadow`          | `0 8px 24px #0004`                                                                 | Elevation shadow for .frame-general-dialog,.frame-general-popup,.frame-general-menu,.frame-general-toast.                                                                   | `.frame-general-dialog, .frame-general-popup, .frame-general-menu, .frame-general-toast`                                                                                                                                                                                                                                                                 |
| `--frame-overlay-background`      | `frame.overlay.background`      | `color-mix(in srgb, var(--frame-overlay-surface) 83%, transparent)`                | Shared translucent fill for floating surfaces over the application canvas.                                                                                                  | `.frame-general-dialog, .frame-general-popup, .frame-general-menu, .frame-general-toast`                                                                                                                                                                                                                                                                 |
| `--frame-radius-medium`           | `frame.radius.medium`           | `4px`                                                                              | Medium shared corner radius used by ordinary controls.                                                                                                                      | `.frame-general-dialog, .frame-general-popup, .frame-general-menu, .frame-general-toast`                                                                                                                                                                                                                                                                 |
| `--frame-control-background`      | `frame.control.background`      | `#202020`                                                                          | SVG fill for .frame-general-arrow. Used when --frame-general-background is unset.                                                                                           | `.frame-general-arrow`                                                                                                                                                                                                                                                                                                                                   |
| `--frame-general-background`      | `frame.general.background`      | `var(     --frame-control-background,     #202020   )`                             | SVG fill for .frame-general-arrow.                                                                                                                                          | `.frame-general-arrow`                                                                                                                                                                                                                                                                                                                                   |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->
