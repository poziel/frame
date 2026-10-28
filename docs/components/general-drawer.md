# Drawer

A themed drawer powered by Reka UI. This Reka primitive is Alpha.

## Features

### Review details beside a workspace

A drawer presents related content in an overlay while preserving the underlying view.

<!-- frame:example id="general-drawer.task-0" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameDrawer } from '@frame/core';

</script>
<template>
<FrameDrawer :title="&quot;Project activity&quot;" :description="&quot;Recent changes in this workspace.&quot;" :trigger-label="&quot;Show activity&quot;">
  <template #default><span v-text="&quot;Design reviewed. Changes saved. Build ready.&quot;" /></template>
</FrameDrawer>
</template>
```

### Inspect contextual information

A dedicated drawer can hold supporting information without creating another workspace pane.

<!-- frame:example id="general-drawer.task-1" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameDrawer } from '@frame/core';

</script>
<template>
<FrameDrawer :title="&quot;Export details&quot;" :description="&quot;Review output options before exporting.&quot;" :trigger-label="&quot;Show export details&quot;">
  <template #default><span v-text="&quot;Format: archive. Include: source and assets.&quot;" /></template>
</FrameDrawer>
</template>
```

## APIs

<!-- frame:generated api="general-drawer" -->

### FrameDrawer

Source: `packages/core/src/components/overlays/FrameDrawer.vue`

#### Properties

| Name                     | Type                                   | Default  | Description                                                                                                                                                                                                            |
| ------------------------ | -------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `defaultOpen`            | `boolean \| undefined`                 | false    | Initial open state when open is uncontrolled. defaultValue: false                                                                                                                                                      |
| `defaultSnapPoint`       | `DrawerSnapPoint \| null \| undefined` | Omitted  | Initial uncontrolled snap point; omission lets the drawer choose its normal starting position.                                                                                                                         |
| `title`                  | `string`                               | Required | Visible heading and accessible title of the overlay.                                                                                                                                                                   |
| `description`            | `string \| undefined`                  | Omitted  | Supporting text associated with the overlay title.                                                                                                                                                                     |
| `triggerLabel`           | `string \| undefined`                  | Omitted  | Text for the built-in trigger when no trigger slot is supplied.                                                                                                                                                        |
| `contentProps`           | `DrawerContentProps \| undefined`      | Omitted  | Properties forwarded to the overlay content primitive, separate from root state.                                                                                                                                       |
| `confirmLabel`           | `string \| undefined`                  | Omitted  | Reserved confirmation label; the current close-only footer does not render it.                                                                                                                                         |
| `open`                   | `boolean \| undefined`                 | false    | v-model:open                                                                                                                                                                                                           |
| `modal`                  | `DrawerModal \| undefined`             | false    | Modality of the drawer. - `true` (default): modal with focus trap, scroll lock, and outside-press dismiss - `'trap-focus'`: traps focus but allows outside pointer events (non-modal side panels) - `false`: non-modal |
| `swipeDirection`         | `SwipeDirection$1 \| undefined`        | Omitted  | Direction to swipe to dismiss.                                                                                                                                                                                         |
| `snapPoints`             | `DrawerSnapPoint[] \| undefined`       | Omitted  | Preset snap positions (fractions 0-1, pixels >1, or '148px'/'30rem' strings)                                                                                                                                           |
| `snapPoint`              | `DrawerSnapPoint \| null \| undefined` | Omitted  | v-model:snapPoint                                                                                                                                                                                                      |
| `snapToSequentialPoints` | `boolean \| undefined`                 | false    | When true, snaps to the next sequential snap point (one step at a time). When false, snaps to the nearest snap point by distance.                                                                                      |

#### Events

| Name                  | Parameters                                            | Return type | Description                                                                                                                                                                               |
| --------------------- | ----------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `update:open`         | `value: boolean, details: DrawerOpenChangeDetails`    | `void`      | Requests an open-state change with cancellable cause details.                                                                                                                             |
| `escapeKeyDown`       | `event: KeyboardEvent`                                | `void`      | Event handler called when the escape key is down. Can be prevented.                                                                                                                       |
| `pointerDownOutside`  | `event: PointerDownOutsideEvent`                      | `void`      | Event handler called when a `pointerdown` event happens outside of the `DismissableLayer`. Can be prevented.                                                                              |
| `focusOutside`        | `event: FocusOutsideEvent`                            | `void`      | Event handler called when the focus moves outside of the `DismissableLayer`. Can be prevented.                                                                                            |
| `interactOutside`     | `event: PointerDownOutsideEvent \| FocusOutsideEvent` | `void`      | Event handler called when an interaction happens outside the `DismissableLayer`. Specifically, when a `pointerdown` event happens outside or focus moves outside of it. Can be prevented. |
| `openAutoFocus`       | `event: Event`                                        | `void`      | Before the drawer receives initial focus; preventDefault overrides automatic focusing.                                                                                                    |
| `closeAutoFocus`      | `event: Event`                                        | `void`      | Before focus returns after closing; preventDefault overrides automatic restoration.                                                                                                       |
| `confirm`             | `None`                                                | `void`      | Reserved confirmation event; the built-in close-only footer does not emit it.                                                                                                             |
| `update:openComplete` | `value: boolean`                                      | `void`      | Reports completion of the opening or closing transition.                                                                                                                                  |
| `update:snapPoint`    | `value: DrawerSnapPoint \| null`                      | `void`      | Requests a new active snap point after drawer movement.                                                                                                                                   |

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

<!-- frame:generated styles="general-drawer" -->

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
