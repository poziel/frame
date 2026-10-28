# Scroll Area

A themed scroll area powered by Reka UI.

## Features

### Read a bounded activity feed

Keep a long activity list in its own scrollable region. Focus the viewport and use the keyboard to read further.

<!-- frame:example id="general-scroll-area.task-0" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameScrollArea } from '@frame/core';

</script>
<template>
<FrameScrollArea :viewport-label="&quot;Recent project activity&quot;"><pre style="margin: 0; font: inherit; white-space: pre;" v-text="&quot;Recent activity\n\nProject created\n\nDesign reviewed\n\nChanges saved\n\nBuild queued\n\nBuild completed\n\nExport ready\n\nReview requested\n\nFeedback received\n\nRevision saved\n\nProject published&quot;" /></FrameScrollArea>
</template>
```

### Browse a horizontal timeline

Horizontal scrolling keeps a wide sequence accessible without expanding the surrounding view.

<!-- frame:example id="general-scroll-area.task-1" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameScrollArea } from '@frame/core';

</script>
<template>
<FrameScrollArea :orientation="&quot;horizontal&quot;" :viewport-label="&quot;Release timeline&quot;"><pre style="margin: 0; font: inherit; white-space: pre;" v-text="&quot;Planning → Research → Design → Prototyping → Implementation → Code review → Accessibility review → Integration testing → Packaging → Release candidate → Acceptance → Documentation → Release → Follow-up → Maintenance&quot;" /></FrameScrollArea>
</template>
```

## APIs

<!-- frame:generated api="general-scroll-area" -->

### FrameScrollArea

Source: `packages/core/src/components/layout/FrameScrollArea.vue`

#### Properties

| Name              | Type                                                | Default    | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ----------------- | --------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `orientation`     | `"both" \| "vertical" \| "horizontal" \| undefined` | "vertical" | Axes with custom scrollbars.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `viewportLabel`   | `string \| undefined`                               | Omitted    | Accessible name for the keyboard-focusable scrolling region.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `type`            | `ScrollType \| undefined`                           | Omitted    | Describes the nature of scrollbar visibility, similar to how the scrollbar preferences in MacOS control visibility of native scrollbars. `auto` - means that scrollbars are visible when content is overflowing on the corresponding orientation. <br> `always` - means that scrollbars are always visible regardless of whether the content is overflowing.<br> `scroll` - means that scrollbars are visible when the user is scrolling along its corresponding orientation.<br> `hover` - when the user is scrolling along its corresponding orientation and when the user is hovering over the scroll area.<br> `glimpse` - a hybrid approach that briefly shows scrollbars when the user enters the scroll area, then hides them until further interaction. |
| `dir`             | `Direction$2 \| undefined`                          | Omitted    | The reading direction of the combobox when applicable. <br> If omitted, inherits globally from `ConfigProvider` or assumes LTR (left-to-right) reading mode.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `scrollHideDelay` | `number \| undefined`                               | Omitted    | If type is set to either `scroll` or `hover`, this prop determines the length of time, in milliseconds, <br> before the scrollbars are hidden after the user stops interacting with scrollbars.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `asChild`         | `boolean \| undefined`                              | false      | Change the default rendered element for the one passed as a child, merging their props and behavior. Read our [Composition](https://www.reka-ui.com/docs/guides/composition) guide for more details.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `as`              | `Component \| AsTag \| undefined`                   | "div"      | The element or component this component should render as. Can be overwritten by `asChild`. defaultValue: "div"                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

#### Events

No declared entries.

#### Slots

| Name      | Parameters | Return type  | Description                                                |
| --------- | ---------- | ------------ | ---------------------------------------------------------- |
| `default` | `None`     | `VNodeChild` | Scrollable content inside the keyboard-focusable viewport. |

#### Exposed API

No declared entries.

<!-- /frame:generated -->

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="general-scroll-area" -->

| CSS variable                   | Theme path                   | Default expression           | Purpose                                                                                                      | Context                                                                                                                                                               |
| ------------------------------ | ---------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--frame-font-body`            | `frame.font.body`            | `"Segoe UI", sans-serif`     | Primary font family inherited by shell content and ordinary controls.                                        | `.frame-accordion, .frame-collapsible, .frame-pagination, .frame-avatar, .frame-scroll-area`                                                                          |
| `--frame-font-size-body`       | `frame.font.size.body`       | `12px`                       | Base text size inherited by shell content and ordinary controls.                                             | `.frame-accordion, .frame-collapsible, .frame-pagination, .frame-avatar, .frame-scroll-area`                                                                          |
| `--frame-text`                 | `frame.text`                 | `#cccccc`                    | Primary foreground for readable text and icons across shell and application content.                         | `.frame-accordion, .frame-collapsible, .frame-pagination, .frame-avatar, .frame-scroll-area`                                                                          |
| `--frame-accent`               | `frame.accent`               | `#0078d4`                    | Shared interaction color for keyboard focus, active actions, and accent-filled controls.                     | `.frame-accordion-trigger:focus-visible, .frame-collapsible-trigger:focus-visible, .frame-pagination-button:focus-visible, .frame-scroll-area-viewport:focus-visible` |
| `--frame-scroll-area-height`   | `frame.scroll.area.height`   | `200px`                      | Preferred height of the scrollable content area.                                                             | `.frame-scroll-area`                                                                                                                                                  |
| `--frame-scrollbar-background` | `frame.scrollbar.background` | `transparent`                | Surface behind the scrollbar thumb and at the corner.                                                        | `.frame-scroll-area-scrollbar`                                                                                                                                        |
| `--frame-scrollbar-thumb`      | `frame.scrollbar.thumb`      | `var(--frame-muted)`         | Fill of the draggable scrollbar thumb.                                                                       | `.frame-scroll-area-thumb`                                                                                                                                            |
| `--frame-control-radius`       | `frame.control.radius`       | `var(--frame-radius-medium)` | Shared corner radius of buttons and ordinary controls; text-entry surfaces may use the input radius instead. | `.frame-scroll-area-thumb`                                                                                                                                            |
| `--frame-muted`                | `frame.muted`                | `#8e9496`                    | Secondary foreground for descriptions, hints, and visually subordinate content.                              | `.frame-scroll-area-thumb`                                                                                                                                            |
| `--frame-scrollbar-background` | `frame.scrollbar.background` | `transparent`                | Surface behind the scrollbar thumb and at the corner.                                                        | `.frame-scroll-area-corner`                                                                                                                                           |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->
