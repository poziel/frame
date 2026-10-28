# Splitter

A themed splitter powered by Reka UI.

## Features

### Resize explorer and editor

Drag or use the resize handle keyboard controls to choose how much space each application-owned pane receives.

<!-- frame:example id="general-splitter.task-0" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameSplitter } from '@frame/core';
const demoPanels = [
  {
    "id": "explorer",
    "label": "Explorer",
    "defaultSize": 35,
    "minSize": 20
  },
  {
    "id": "editor",
    "label": "Editor",
    "defaultSize": 65,
    "minSize": 30
  }
];
</script>
<template>
<FrameSplitter :direction="&quot;horizontal&quot;" :label="&quot;Project panes&quot;" :panels="demoPanels" />
</template>
```

### Stack a preview above its output

Vertical direction shares the available height between two resizable content panes.

<!-- frame:example id="general-splitter.task-1" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameSplitter } from '@frame/core';
const demoPanels = [
  {
    "id": "preview",
    "label": "Preview",
    "defaultSize": 60
  },
  {
    "id": "output",
    "label": "Output",
    "defaultSize": 40
  }
];
</script>
<template>
<FrameSplitter :direction="&quot;vertical&quot;" :label="&quot;Preview and output&quot;" :panels="demoPanels" />
</template>
```

## APIs

<!-- frame:generated api="general-splitter" -->

### FrameSplitter

Source: `packages/core/src/components/layout/FrameSplitter.vue`

#### Properties

| Name               | Type                              | Default  | Description                                                                                                                                                                                          |
| ------------------ | --------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`               | `string \| null \| undefined`     | Omitted  | Group id; falls back to `useId` when not provided.                                                                                                                                                   |
| `autoSaveId`       | `string \| null \| undefined`     | Omitted  | Unique id used to auto-save group arrangement via `localStorage`.                                                                                                                                    |
| `direction`        | `Direction$1`                     | Required | The group orientation of splitter.                                                                                                                                                                   |
| `keyboardResizeBy` | `number \| null \| undefined`     | Omitted  | Step size when arrow key was pressed.                                                                                                                                                                |
| `storage`          | `PanelGroupStorage \| undefined`  | Omitted  | Custom storage API; defaults to localStorage                                                                                                                                                         |
| `asChild`          | `boolean \| undefined`            | false    | Change the default rendered element for the one passed as a child, merging their props and behavior. Read our [Composition](https://www.reka-ui.com/docs/guides/composition) guide for more details. |
| `as`               | `Component \| AsTag \| undefined` | "div"    | The element or component this component should render as. Can be overwritten by `asChild`. defaultValue: "div"                                                                                       |
| `panels`           | `FrameSplitPanel[] \| undefined`  | Omitted  | Panels rendered by the default composition, including their sizing constraints.                                                                                                                      |
| `label`            | `string \| undefined`             | Omitted  | Accessible name for this component and its built-in control or region.                                                                                                                               |

#### Events

| Name     | Parameters      | Return type | Description                                    |
| -------- | --------------- | ----------- | ---------------------------------------------- |
| `layout` | `val: number[]` | `void`      | Event handler called when group layout changes |

#### Slots

| Name      | Parameters                                   | Return type  | Description                                                    |
| --------- | -------------------------------------------- | ------------ | -------------------------------------------------------------- |
| `default` | `None`                                       | `VNodeChild` | Replaces the automatic panel and resize-handle composition.    |
| `panel`   | `{ panel: FrameSplitPanel; index: number; }` | `VNodeChild` | Content for one configured panel, with its position in panels. |

#### Exposed API

No declared entries.

<!-- /frame:generated -->

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="general-splitter" -->

| CSS variable             | Theme path             | Default expression                         | Purpose                                                                                 | Context                                                                 |
| ------------------------ | ---------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `--frame-font-body`      | `frame.font.body`      | `sans-serif`                               | Font family for .frame-navigation-text.                                                 | `.frame-navigation-text`                                                |
| `--frame-font-size-body` | `frame.font.size.body` | `13px`                                     | Text size for .frame-navigation-text.                                                   | `.frame-navigation-text`                                                |
| `--frame-control-text`   | `frame.control.text`   | `var(--frame-text)`                        | Foreground for .frame-navigation-text.                                                  | `.frame-navigation-text`                                                |
| `--frame-text`           | `frame.text`           | No declared default; supplied by context.  | Primary foreground for readable text and icons across shell and application content.    | `.frame-navigation-text`                                                |
| `--frame-accent`         | `frame.accent`         | `#007acc`                                  | Foreground for .frame-navigation-focus:focus-visible.                                   | `.frame-navigation-focus:focus-visible`                                 |
| `--frame-focus-border`   | `frame.focus.border`   | `var(     --frame-accent,     #007acc   )` | Outline for .frame-navigation-focus:focus-visible.                                      | `.frame-navigation-focus:focus-visible`                                 |
| `--frame-control-border` | `frame.control.border` | `#555`                                     | Background for .frame-splitter-handle.                                                  | `.frame-splitter-handle`                                                |
| `--frame-control-radius` | `frame.control.radius` | `var(--frame-radius-medium)`               | Corner radius for .frame-splitter-handle.                                               | `.frame-splitter-handle`                                                |
| `--frame-radius-medium`  | `frame.radius.medium`  | No declared default; supplied by context.  | Medium shared corner radius used by ordinary controls.                                  | `.frame-splitter-handle`                                                |
| `--frame-accent`         | `frame.accent`         | `#007acc`                                  | Foreground for .frame-splitter-handle[data-state='drag'], .frame-splitter-handle:hover. | `.frame-splitter-handle[data-state=drag], .frame-splitter-handle:hover` |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->
