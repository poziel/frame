# Hover Card

A themed hover card powered by Reka UI.

## Features

### Preview a collaborator

A hover card reveals supplementary profile information on hover or keyboard focus.

<!-- frame:example id="general-hover-card.task-0" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameHoverCard } from '@frame/core';

</script>
<template>
<FrameHoverCard :trigger-label="&quot;Jane Doe&quot;">
  <template #default><span v-text="&quot;Jane Doe · Designer · Working on the component library.&quot;" /></template>
</FrameHoverCard>
</template>
```

### Preview a linked project

Show a small amount of context before the user chooses whether to open another destination.

<!-- frame:example id="general-hover-card.task-1" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameHoverCard } from '@frame/core';

</script>
<template>
<FrameHoverCard :trigger-label="&quot;Design system&quot;">
  <template #default><span v-text="&quot;Shared project · 12 contributors · Updated today.&quot;" /></template>
</FrameHoverCard>
</template>
```

## APIs

<!-- frame:generated api="general-hover-card" -->

### FrameHoverCard

Source: `packages/core/src/components/overlays/FrameHoverCard.vue`

#### Properties

| Name           | Type                                 | Default | Description                                                                                                                                                       |
| -------------- | ------------------------------------ | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `triggerLabel` | `string \| undefined`                | Omitted | Text for the built-in trigger when no trigger slot is supplied.                                                                                                   |
| `contentProps` | `HoverCardContentProps \| undefined` | Omitted | Properties forwarded to the overlay content primitive, separate from root state.                                                                                  |
| `defaultOpen`  | `boolean \| undefined`               | false   | The open state of the hover card when it is initially rendered. Use when you do not need to control its open state.                                               |
| `open`         | `boolean \| undefined`               | false   | The controlled open state of the hover card. Can be binded as `v-model:open`.                                                                                     |
| `openDelay`    | `number \| undefined`                | Omitted | The duration from when the mouse enters the trigger until the hover card opens.                                                                                   |
| `closeDelay`   | `number \| undefined`                | Omitted | The duration from when the mouse leaves the trigger or content until the hover card closes.                                                                       |
| `enableTouch`  | `boolean \| undefined`               | false   | When `true`, tapping the trigger on touch devices toggles the hover card open/closed. By default touch interactions are ignored to match pointer hover semantics. |

#### Events

| Name          | Parameters       | Return type | Description                                                         |
| ------------- | ---------------- | ----------- | ------------------------------------------------------------------- |
| `update:open` | `value: boolean` | `void`      | Event handler called when the open state of the hover card changes. |

#### Slots

| Name      | Parameters | Return type  | Description                                                             |
| --------- | ---------- | ------------ | ----------------------------------------------------------------------- |
| `trigger` | `None`     | `VNodeChild` | Element that opens this popup; defaults to the built-in trigger button. |
| `default` | `None`     | `VNodeChild` | Content inside the popup surface.                                       |

#### Exposed API

No declared entries.

<!-- /frame:generated -->

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="general-hover-card" -->

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
