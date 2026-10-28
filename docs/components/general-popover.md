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
| `--frame-control-background`      | `frame.control.background`      | `#202020`                                                                          | SVG fill for .frame-general-arrow.                                                                           | `.frame-general-arrow`                |
| `--frame-general-background`      | `frame.general.background`      | `var(     --frame-control-background,     #202020   )`                             | SVG fill for .frame-general-arrow.                                                                           | `.frame-general-arrow`                |
| `--frame-overlay-backdrop-filter` | `frame.overlay.backdrop.filter` | No declared default; supplied by context.                                          | Blur and saturation treatment behind shared translucent floating surfaces.                                   | `.frame-overlay-surface`              |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->
