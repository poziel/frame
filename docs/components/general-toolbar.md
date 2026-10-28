# Toolbar

A themed toolbar powered by Reka UI.

## Features

### Group document actions

A toolbar groups related commands and supplies keyboard navigation. The host handles the selected action.

<!-- frame:example id="general-toolbar.task-0" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameToolbar } from '@frame/core';
const demoItems = [
  {
    "id": "save",
    "label": "Save",
    "icon": "save"
  },
  {
    "id": "export",
    "label": "Export",
    "icon": "export"
  }
];
</script>
<template>
<FrameToolbar :items="demoItems" :label="&quot;Document actions&quot;" />
</template>
```

### Divide action groups

A separator makes different groups of commands easier to scan while unavailable actions stay visible.

<!-- frame:example id="general-toolbar.task-1" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameToolbar } from '@frame/core';
const demoItems = [
  {
    "id": "save",
    "label": "Save",
    "icon": "save"
  },
  {
    "id": "sep",
    "label": "",
    "separator": true
  },
  {
    "id": "publish",
    "label": "Publish",
    "disabled": true
  }
];
</script>
<template>
<FrameToolbar :items="demoItems" :label="&quot;Document actions&quot;" />
</template>
```

## APIs

<!-- frame:generated api="general-toolbar" -->

### FrameToolbar

Source: `packages/core/src/components/actions/FrameToolbar.vue`

#### Properties

| Name          | Type                              | Default | Description                                                                                                                                                                                          |
| ------------- | --------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `orientation` | `DataOrientation \| undefined`    | Omitted | The orientation of the toolbar                                                                                                                                                                       |
| `dir`         | `Direction \| undefined`          | Omitted | The reading direction of the combobox when applicable. <br> If omitted, inherits globally from `ConfigProvider` or assumes LTR (left-to-right) reading mode.                                         |
| `loop`        | `boolean \| undefined`            | false   | When `true`, keyboard navigation will loop from last tab to first, and vice versa.                                                                                                                   |
| `asChild`     | `boolean \| undefined`            | false   | Change the default rendered element for the one passed as a child, merging their props and behavior. Read our [Composition](https://www.reka-ui.com/docs/guides/composition) guide for more details. |
| `as`          | `Component \| AsTag \| undefined` | "div"   | The element or component this component should render as. Can be overwritten by `asChild`. defaultValue: "div"                                                                                       |
| `items`       | `FrameToolbarItem[] \| undefined` | Omitted | Toolbar actions, links, and separators rendered when the default slot is absent.                                                                                                                     |
| `label`       | `string \| undefined`             | Omitted | Accessible name of the toolbar.                                                                                                                                                                      |

#### Events

| Name     | Parameters               | Return type | Description                           |
| -------- | ------------------------ | ----------- | ------------------------------------- |
| `action` | `item: FrameToolbarItem` | `void`      | The application action was activated. |

#### Slots

| Name      | Parameters | Return type  | Description                                      |
| --------- | ---------- | ------------ | ------------------------------------------------ |
| `default` | `None`     | `VNodeChild` | Replaces the built-in toolbar items composition. |

#### Exposed API

No declared entries.

<!-- /frame:generated -->

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="general-toolbar" -->

| CSS variable               | Theme path               | Default expression                         | Purpose                                                                                                                                                                                                                                                           | Context                                                                                                                                                                                                                                              |
| -------------------------- | ------------------------ | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--frame-control-radius`   | `frame.control.radius`   | `var(--frame-radius-medium)`               | Corner radius for .frame-navigation-control.                                                                                                                                                                                                                      | `.frame-navigation-control`                                                                                                                                                                                                                          |
| `--frame-radius-medium`    | `frame.radius.medium`    | No declared default; supplied by context.  | Medium shared corner radius used by ordinary controls.                                                                                                                                                                                                            | `.frame-navigation-control`                                                                                                                                                                                                                          |
| `--frame-font-body`        | `frame.font.body`        | `sans-serif`                               | Font family for .frame-navigation-text.                                                                                                                                                                                                                           | `.frame-navigation-text`                                                                                                                                                                                                                             |
| `--frame-font-size-body`   | `frame.font.size.body`   | `13px`                                     | Text size for .frame-navigation-text.                                                                                                                                                                                                                             | `.frame-navigation-text`                                                                                                                                                                                                                             |
| `--frame-control-text`     | `frame.control.text`     | `var(--frame-text)`                        | Foreground for .frame-navigation-text.                                                                                                                                                                                                                            | `.frame-navigation-text`                                                                                                                                                                                                                             |
| `--frame-text`             | `frame.text`             | No declared default; supplied by context.  | Primary foreground for readable text and icons across shell and application content.                                                                                                                                                                              | `.frame-navigation-text`                                                                                                                                                                                                                             |
| `--frame-hover-background` | `frame.hover.background` | `rgba(127, 127, 127, 0.12)`                | Background for .frame-toolbar-button:hover, .frame-navigation-trigger:hover, .frame-navigation-link:hover, .frame-menubar-trigger:hover, .frame-menubar-item[data-highlighted], .frame-tree-item:hover.                                                           | `.frame-toolbar-button:hover, .frame-navigation-trigger:hover, .frame-navigation-link:hover, .frame-menubar-trigger:hover, .frame-menubar-item[data-highlighted], .frame-tree-item:hover`                                                            |
| `--frame-accent`           | `frame.accent`           | `#007acc`                                  | Foreground for .frame-navigation-focus:focus-visible.                                                                                                                                                                                                             | `.frame-navigation-focus:focus-visible`                                                                                                                                                                                                              |
| `--frame-focus-border`     | `frame.focus.border`     | `var(     --frame-accent,     #007acc   )` | Outline for .frame-navigation-focus:focus-visible.                                                                                                                                                                                                                | `.frame-navigation-focus:focus-visible`                                                                                                                                                                                                              |
| `--frame-disabled-opacity` | `frame.disabled.opacity` | `0.5`                                      | Opacity for .frame-tabs-trigger:disabled, .frame-toolbar-button:disabled, .frame-menubar-trigger:disabled, .frame-navigation-trigger:disabled, [aria-disabled='true'].frame-navigation-link, .frame-tree-item[data-disabled], .frame-stepper-item[data-disabled]. | `.frame-tabs-trigger:disabled, .frame-toolbar-button:disabled, .frame-menubar-trigger:disabled, .frame-navigation-trigger:disabled, [aria-disabled=true].frame-navigation-link, .frame-tree-item[data-disabled], .frame-stepper-item[data-disabled]` |
| `--frame-control-border`   | `frame.control.border`   | `#555`                                     | Background for .frame-toolbar-separator.                                                                                                                                                                                                                          | `.frame-toolbar-separator`                                                                                                                                                                                                                           |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->
