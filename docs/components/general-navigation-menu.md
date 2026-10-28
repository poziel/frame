# Navigation Menu

A themed navigation menu powered by Reka UI.

## Features

### Browse documentation sections

A navigation menu groups links by topic. The host supplies destinations and owns routing.

<!-- frame:example id="general-navigation-menu.task-0" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameNavigationMenu } from '@frame/core';
const demoItems = [
  {
    "value": "guides",
    "label": "Guides",
    "children": [
      {
        "value": "start",
        "label": "Getting started",
        "href": "#start"
      },
      {
        "value": "themes",
        "label": "Themes",
        "href": "#themes"
      }
    ]
  },
  {
    "value": "reference",
    "label": "Reference",
    "href": "#reference"
  }
];
</script>
<template>
<FrameNavigationMenu :items="demoItems" :label="&quot;Documentation navigation&quot;" />
</template>
```

### Group workspace destinations

Use distinct navigation groups when a product offers several destinations within each area.

<!-- frame:example id="general-navigation-menu.task-1" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameNavigationMenu } from '@frame/core';
const demoItems = [
  {
    "value": "project",
    "label": "Project",
    "children": [
      {
        "value": "overview",
        "label": "Overview",
        "href": "#overview"
      },
      {
        "value": "activity",
        "label": "Activity",
        "href": "#activity"
      }
    ]
  }
];
</script>
<template>
<FrameNavigationMenu :items="demoItems" :label="&quot;Workspace navigation&quot;" />
</template>
```

## APIs

<!-- frame:generated api="general-navigation-menu" -->

### FrameNavigationMenu

Source: `packages/core/src/components/navigation/FrameNavigationMenu.vue`

#### Properties

| Name                       | Type                                 | Default | Description                                                                                                                                                                                          |
| -------------------------- | ------------------------------------ | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `modelValue`               | `string \| undefined`                | Omitted | The controlled value of the menu item to activate. Can be used as `v-model`.                                                                                                                         |
| `defaultValue`             | `string \| undefined`                | Omitted | The value of the menu item that should be active when initially rendered. Use when you do not need to control the value state.                                                                       |
| `dir`                      | `Direction$3 \| undefined`           | Omitted | The reading direction of the combobox when applicable. If omitted, inherits globally from `ConfigProvider` or assumes LTR (left-to-right) reading mode.                                              |
| `orientation`              | `Orientation \| undefined`           | Omitted | The orientation of the menu.                                                                                                                                                                         |
| `delayDuration`            | `number \| undefined`                | 200     | The duration from when the pointer enters the trigger until the tooltip gets opened. defaultValue: 200                                                                                               |
| `skipDelayDuration`        | `number \| undefined`                | 300     | How much time a user has to enter another trigger without incurring a delay again. defaultValue: 300                                                                                                 |
| `disableClickTrigger`      | `boolean \| undefined`               | false   | If `true`, menu cannot be open by click on trigger defaultValue: false                                                                                                                               |
| `disableHoverTrigger`      | `boolean \| undefined`               | false   | If `true`, menu cannot be open by hover on trigger defaultValue: false                                                                                                                               |
| `disablePointerLeaveClose` | `boolean \| undefined`               | false   | If `true`, menu will not close during pointer leave event defaultValue: false                                                                                                                        |
| `unmountOnHide`            | `boolean \| undefined`               | false   | When `true`, the element will be unmounted on closed state. defaultValue: `true`                                                                                                                     |
| `asChild`                  | `boolean \| undefined`               | false   | Change the default rendered element for the one passed as a child, merging their props and behavior. Read our [Composition](https://www.reka-ui.com/docs/guides/composition) guide for more details. |
| `as`                       | `Component \| AsTag \| undefined`    | "div"   | The element or component this component should render as. Can be overwritten by `asChild`. defaultValue: "div"                                                                                       |
| `items`                    | `FrameNavigationItem[] \| undefined` | Omitted | Items rendered by the built-in composition; a default slot replaces that composition.                                                                                                                |
| `label`                    | `string \| undefined`                | Omitted | Accessible name for this component and its built-in control or region.                                                                                                                               |

#### Events

| Name                | Parameters      | Return type | Description                                  |
| ------------------- | --------------- | ----------- | -------------------------------------------- |
| `update:modelValue` | `value: string` | `void`      | Event handler called when the value changes. |

#### Slots

| Name      | Parameters                       | Return type  | Description                                   |
| --------- | -------------------------------- | ------------ | --------------------------------------------- |
| `default` | `None`                           | `VNodeChild` | Replaces the built-in navigation list.        |
| `content` | `{ item: FrameNavigationItem; }` | `VNodeChild` | Replaces one submenu's generated child links. |

#### Exposed API

No declared entries.

<!-- /frame:generated -->

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="general-navigation-menu" -->

| CSS variable                      | Theme path                      | Default expression                                     | Purpose                                                                                                                                                                                                                                                           | Context                                                                                                                                                                                                                                              |
| --------------------------------- | ------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--frame-control-border`          | `frame.control.border`          | `#555`                                                 | Background for .frame-navigation-surface.                                                                                                                                                                                                                         | `.frame-navigation-surface`                                                                                                                                                                                                                          |
| `--frame-control-radius`          | `frame.control.radius`          | `var(--frame-radius-medium)`                           | Corner radius for .frame-navigation-surface.                                                                                                                                                                                                                      | `.frame-navigation-surface`                                                                                                                                                                                                                          |
| `--frame-control-background`      | `frame.control.background`      | `#252526`                                              | Background for .frame-navigation-surface.                                                                                                                                                                                                                         | `.frame-navigation-surface`                                                                                                                                                                                                                          |
| `--frame-menu-background`         | `frame.menu.background`         | `var(     --frame-control-background,     #252526   )` | Background for .frame-navigation-surface.                                                                                                                                                                                                                         | `.frame-navigation-surface`                                                                                                                                                                                                                          |
| `--frame-control-text`            | `frame.control.text`            | `var(--frame-text)`                                    | Foreground for .frame-navigation-surface.                                                                                                                                                                                                                         | `.frame-navigation-surface`                                                                                                                                                                                                                          |
| `--frame-overlay-shadow`          | `frame.overlay.shadow`          | `0 6px 18px rgba(0, 0, 0, 0.2)`                        | Elevation shadow for .frame-navigation-surface.                                                                                                                                                                                                                   | `.frame-navigation-surface`                                                                                                                                                                                                                          |
| `--frame-radius-medium`           | `frame.radius.medium`           | No declared default; supplied by context.              | Medium shared corner radius used by ordinary controls.                                                                                                                                                                                                            | `.frame-navigation-surface`                                                                                                                                                                                                                          |
| `--frame-text`                    | `frame.text`                    | No declared default; supplied by context.              | Primary foreground for readable text and icons across shell and application content.                                                                                                                                                                              | `.frame-navigation-surface`                                                                                                                                                                                                                          |
| `--frame-control-radius`          | `frame.control.radius`          | `var(--frame-radius-medium)`                           | Corner radius for .frame-navigation-control.                                                                                                                                                                                                                      | `.frame-navigation-control`                                                                                                                                                                                                                          |
| `--frame-radius-medium`           | `frame.radius.medium`           | No declared default; supplied by context.              | Medium shared corner radius used by ordinary controls.                                                                                                                                                                                                            | `.frame-navigation-control`                                                                                                                                                                                                                          |
| `--frame-font-body`               | `frame.font.body`               | `sans-serif`                                           | Font family for .frame-navigation-text.                                                                                                                                                                                                                           | `.frame-navigation-text`                                                                                                                                                                                                                             |
| `--frame-font-size-body`          | `frame.font.size.body`          | `13px`                                                 | Text size for .frame-navigation-text.                                                                                                                                                                                                                             | `.frame-navigation-text`                                                                                                                                                                                                                             |
| `--frame-control-text`            | `frame.control.text`            | `var(--frame-text)`                                    | Foreground for .frame-navigation-text.                                                                                                                                                                                                                            | `.frame-navigation-text`                                                                                                                                                                                                                             |
| `--frame-text`                    | `frame.text`                    | No declared default; supplied by context.              | Primary foreground for readable text and icons across shell and application content.                                                                                                                                                                              | `.frame-navigation-text`                                                                                                                                                                                                                             |
| `--frame-hover-background`        | `frame.hover.background`        | `rgba(127, 127, 127, 0.12)`                            | Background for .frame-toolbar-button:hover, .frame-navigation-trigger:hover, .frame-navigation-link:hover, .frame-menubar-trigger:hover, .frame-menubar-item[data-highlighted], .frame-tree-item:hover.                                                           | `.frame-toolbar-button:hover, .frame-navigation-trigger:hover, .frame-navigation-link:hover, .frame-menubar-trigger:hover, .frame-menubar-item[data-highlighted], .frame-tree-item:hover`                                                            |
| `--frame-accent`                  | `frame.accent`                  | `#007acc`                                              | Foreground for .frame-menubar-trigger[data-state='open'], .frame-navigation-trigger[data-state='open'], .frame-tree-item[data-selected].                                                                                                                          | `.frame-menubar-trigger[data-state=open], .frame-navigation-trigger[data-state=open], .frame-tree-item[data-selected]`                                                                                                                               |
| `--frame-selection-background`    | `frame.selection.background`    | `rgba(0, 122, 204, 0.15)`                              | Background for .frame-menubar-trigger[data-state='open'], .frame-navigation-trigger[data-state='open'], .frame-tree-item[data-selected].                                                                                                                          | `.frame-menubar-trigger[data-state=open], .frame-navigation-trigger[data-state=open], .frame-tree-item[data-selected]`                                                                                                                               |
| `--frame-accent`                  | `frame.accent`                  | `#007acc`                                              | Foreground for .frame-navigation-focus:focus-visible.                                                                                                                                                                                                             | `.frame-navigation-focus:focus-visible`                                                                                                                                                                                                              |
| `--frame-focus-border`            | `frame.focus.border`            | `var(     --frame-accent,     #007acc   )`             | Outline for .frame-navigation-focus:focus-visible.                                                                                                                                                                                                                | `.frame-navigation-focus:focus-visible`                                                                                                                                                                                                              |
| `--frame-disabled-opacity`        | `frame.disabled.opacity`        | `0.5`                                                  | Opacity for .frame-tabs-trigger:disabled, .frame-toolbar-button:disabled, .frame-menubar-trigger:disabled, .frame-navigation-trigger:disabled, [aria-disabled='true'].frame-navigation-link, .frame-tree-item[data-disabled], .frame-stepper-item[data-disabled]. | `.frame-tabs-trigger:disabled, .frame-toolbar-button:disabled, .frame-menubar-trigger:disabled, .frame-navigation-trigger:disabled, [aria-disabled=true].frame-navigation-link, .frame-tree-item[data-disabled], .frame-stepper-item[data-disabled]` |
| `--frame-overlay-backdrop-filter` | `frame.overlay.backdrop.filter` | No declared default; supplied by context.              | Blur and saturation treatment behind shared translucent floating surfaces.                                                                                                                                                                                        | `.frame-overlay-surface`                                                                                                                                                                                                                             |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->
