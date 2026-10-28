# Tabs

A themed tabs powered by Reka UI.

## Features

### Switch project sections

Keep related views in one place. Arrow keys move between tabs and reveal the corresponding content.

<!-- frame:example id="general-tabs.task-0" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameTabs } from '@frame/core';
const demoItems = [
  {
    "value": "overview",
    "label": "Overview",
    "content": "Project overview and recent changes."
  },
  {
    "value": "activity",
    "label": "Activity",
    "content": "Recent activity in this project."
  }
];
</script>
<template>
<FrameTabs :items="demoItems" :default-value="&quot;overview&quot;" :label="&quot;Project sections&quot;" />
</template>
```

### Require explicit activation

Manual activation lets users move focus through tabs before Enter or Space selects a more expensive view.

<!-- frame:example id="general-tabs.task-1" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameTabs } from '@frame/core';
const demoItems = [
  {
    "value": "overview",
    "label": "Overview",
    "content": "Project overview and recent changes."
  },
  {
    "value": "activity",
    "label": "Activity",
    "content": "Recent activity in this project."
  }
];
</script>
<template>
<FrameTabs :items="demoItems" :default-value="&quot;overview&quot;" :activation-mode="&quot;manual&quot;" :label="&quot;Project sections&quot;" />
</template>
```

## APIs

<!-- frame:generated api="general-tabs" -->

### FrameTabs

Source: `packages/core/src/components/navigation/FrameTabs.vue`

#### Properties

| Name             | Type                                   | Default    | Description                                                                                                                                                                                          |
| ---------------- | -------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `defaultValue`   | `StringOrNumber \| undefined`          | Omitted    | The value of the tab that should be active when initially rendered. Use when you do not need to control the state of the tabs                                                                        |
| `orientation`    | `DataOrientation \| undefined`         | horizontal | The orientation the tabs are laid out. Mainly so arrow navigation is done accordingly (left & right vs. up & down) defaultValue: horizontal                                                          |
| `dir`            | `Direction \| undefined`               | Omitted    | The reading direction of the combobox when applicable. <br> If omitted, inherits globally from `ConfigProvider` or assumes LTR (left-to-right) reading mode.                                         |
| `activationMode` | `"automatic" \| "manual" \| undefined` | automatic  | Whether a tab is activated automatically (on focus) or manually (on click). defaultValue: automatic                                                                                                  |
| `modelValue`     | `StringOrNumber \| undefined`          | Omitted    | The controlled value of the tab to activate. Can be bind as `v-model`.                                                                                                                               |
| `unmountOnHide`  | `boolean \| undefined`                 | false      | When `true`, the element will be unmounted on closed state. defaultValue: `true`                                                                                                                     |
| `asChild`        | `boolean \| undefined`                 | false      | Change the default rendered element for the one passed as a child, merging their props and behavior. Read our [Composition](https://www.reka-ui.com/docs/guides/composition) guide for more details. |
| `as`             | `Component \| AsTag \| undefined`      | "div"      | The element or component this component should render as. Can be overwritten by `asChild`. defaultValue: "div"                                                                                       |
| `items`          | `FrameTabItem[] \| undefined`          | Omitted    | Items rendered by the built-in composition; a default slot replaces that composition.                                                                                                                |
| `label`          | `string \| undefined`                  | Omitted    | Accessible name for this component and its built-in control or region.                                                                                                                               |

#### Events

| Name                | Parameters                | Return type | Description                                 |
| ------------------- | ------------------------- | ----------- | ------------------------------------------- |
| `update:modelValue` | `payload: StringOrNumber` | `void`      | Event handler called when the value changes |

#### Slots

| Name      | Parameters                                       | Return type  | Description                                        |
| --------- | ------------------------------------------------ | ------------ | -------------------------------------------------- |
| `default` | `{ modelValue: string \| number \| undefined; }` | `VNodeChild` | Replaces the built-in tab triggers and panels.     |
| `trigger` | `{ item: FrameTabItem; }`                        | `VNodeChild` | Replaces a configured tab's trigger text and icon. |
| `content` | `{ item: FrameTabItem; }`                        | `VNodeChild` | Replaces a configured tab's fallback panel text.   |

#### Exposed API

No declared entries.

<!-- /frame:generated -->

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="general-tabs" -->

| CSS variable                               | Theme path                               | Default expression              | Purpose                                                                                                                                                                                                                                                           | Context                                                                                                                                                                                                                                                |
| ------------------------------------------ | ---------------------------------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `--frame-font-body`                        | `frame.font.body`                        | `sans-serif`                    | Font family for .frame-tabs, .frame-stepper, .frame-toolbar, .frame-tree, .frame-splitter, .frame-navigation-menu, .frame-menubar.                                                                                                                                | `.frame-tabs, .frame-stepper, .frame-toolbar, .frame-tree, .frame-splitter, .frame-navigation-menu, .frame-menubar`                                                                                                                                    |
| `--frame-font-size-body`                   | `frame.font.size.body`                   | `13px`                          | Text size for .frame-tabs, .frame-stepper, .frame-toolbar, .frame-tree, .frame-splitter, .frame-navigation-menu, .frame-menubar.                                                                                                                                  | `.frame-tabs, .frame-stepper, .frame-toolbar, .frame-tree, .frame-splitter, .frame-navigation-menu, .frame-menubar`                                                                                                                                    |
| `--frame-control-text`                     | `frame.control.text`                     | `var(--frame-text)`             | Foreground for .frame-tabs, .frame-stepper, .frame-toolbar, .frame-tree, .frame-splitter, .frame-navigation-menu, .frame-menubar.                                                                                                                                 | `.frame-tabs, .frame-stepper, .frame-toolbar, .frame-tree, .frame-splitter, .frame-navigation-menu, .frame-menubar`                                                                                                                                    |
| `--frame-text`                             | `frame.text`                             | `#cccccc`                       | Primary foreground for readable text and icons across shell and application content.                                                                                                                                                                              | `.frame-tabs, .frame-stepper, .frame-toolbar, .frame-tree, .frame-splitter, .frame-navigation-menu, .frame-menubar`                                                                                                                                    |
| `--frame-disabled-opacity`                 | `frame.disabled.opacity`                 | `0.5`                           | Opacity for .frame-tabs-trigger:disabled, .frame-toolbar-button:disabled, .frame-menubar-trigger:disabled, .frame-navigation-trigger:disabled, [aria-disabled='true'].frame-navigation-link, .frame-tree-item[data-disabled], .frame-stepper-item[data-disabled]. | `.frame-tabs-trigger:disabled, .frame-toolbar-button:disabled, .frame-menubar-trigger:disabled, .frame-navigation-trigger:disabled, [aria-disabled='true'].frame-navigation-link, .frame-tree-item[data-disabled], .frame-stepper-item[data-disabled]` |
| `--frame-tabs-gap`                         | `frame.tabs.gap`                         | `20px`                          | Space between tab triggers.                                                                                                                                                                                                                                       | `.frame-tabs > .frame-tabs-list`                                                                                                                                                                                                                       |
| `--frame-tabs-list-padding`                | `frame.tabs.list.padding`                | `0`                             | Inset around the tab trigger list.                                                                                                                                                                                                                                | `.frame-tabs > .frame-tabs-list`                                                                                                                                                                                                                       |
| `--frame-tabs-list-border`                 | `frame.tabs.list.border`                 | `1px solid var(--frame-line)`   | Baseline border along the tab trigger list.                                                                                                                                                                                                                       | `.frame-tabs > .frame-tabs-list`                                                                                                                                                                                                                       |
| `--frame-line`                             | `frame.line`                             | `#2b2b2b`                       | Neutral divider color for content boundaries, tracks, and structural separators.                                                                                                                                                                                  | `.frame-tabs > .frame-tabs-list`                                                                                                                                                                                                                       |
| `--frame-tabs-trigger-min-height`          | `frame.tabs.trigger.min.height`          | `30px`                          | Minimum height of a tab trigger.                                                                                                                                                                                                                                  | `.frame-tabs .frame-tabs-trigger`                                                                                                                                                                                                                      |
| `--frame-tabs-trigger-padding`             | `frame.tabs.trigger.padding`             | `12px 0`                        | Internal spacing of a horizontal tab trigger.                                                                                                                                                                                                                     | `.frame-tabs .frame-tabs-trigger`                                                                                                                                                                                                                      |
| `--frame-tabs-indicator-width`             | `frame.tabs.indicator.width`             | `2px`                           | Thickness of the selected-tab underline or side indicator.                                                                                                                                                                                                        | `.frame-tabs .frame-tabs-trigger`                                                                                                                                                                                                                      |
| `--frame-tabs-trigger-border-radius`       | `frame.tabs.trigger.border.radius`       | `0`                             | Corner radius of a tab trigger.                                                                                                                                                                                                                                   | `.frame-tabs .frame-tabs-trigger`                                                                                                                                                                                                                      |
| `--frame-tabs-trigger-background`          | `frame.tabs.trigger.background`          | `transparent`                   | Resting surface of a tab trigger.                                                                                                                                                                                                                                 | `.frame-tabs .frame-tabs-trigger`                                                                                                                                                                                                                      |
| `--frame-tabs-trigger-color`               | `frame.tabs.trigger.color`               | `var(--frame-text)`             | Resting foreground of a tab trigger.                                                                                                                                                                                                                              | `.frame-tabs .frame-tabs-trigger`                                                                                                                                                                                                                      |
| `--frame-text`                             | `frame.text`                             | `#cccccc`                       | Primary foreground for readable text and icons across shell and application content.                                                                                                                                                                              | `.frame-tabs .frame-tabs-trigger`                                                                                                                                                                                                                      |
| `--frame-tabs-trigger-hover-background`    | `frame.tabs.trigger.hover.background`    | `transparent`                   | Pointer hover surface of an enabled tab trigger.                                                                                                                                                                                                                  | `.frame-tabs .frame-tabs-trigger:hover:not(:disabled)`                                                                                                                                                                                                 |
| `--frame-tabs-trigger-hover-color`         | `frame.tabs.trigger.hover.color`         | `var(--frame-text)`             | Pointer hover foreground of an enabled tab trigger.                                                                                                                                                                                                               | `.frame-tabs .frame-tabs-trigger:hover:not(:disabled)`                                                                                                                                                                                                 |
| `--frame-text`                             | `frame.text`                             | `#cccccc`                       | Primary foreground for readable text and icons across shell and application content.                                                                                                                                                                              | `.frame-tabs .frame-tabs-trigger:hover:not(:disabled)`                                                                                                                                                                                                 |
| `--frame-tabs-trigger-selected-background` | `frame.tabs.trigger.selected.background` | `transparent`                   | Surface of the selected tab trigger.                                                                                                                                                                                                                              | `.frame-tabs .frame-tabs-trigger[data-state='active']`                                                                                                                                                                                                 |
| `--frame-tabs-trigger-selected-color`      | `frame.tabs.trigger.selected.color`      | `var(--frame-text)`             | Foreground of the selected tab trigger.                                                                                                                                                                                                                           | `.frame-tabs .frame-tabs-trigger[data-state='active']`                                                                                                                                                                                                 |
| `--frame-tabs-indicator-color`             | `frame.tabs.indicator.color`             | `var(--frame-accent)`           | Color of the selected-tab underline or side indicator.                                                                                                                                                                                                            | `.frame-tabs .frame-tabs-trigger[data-state='active']`                                                                                                                                                                                                 |
| `--frame-text`                             | `frame.text`                             | `#cccccc`                       | Primary foreground for readable text and icons across shell and application content.                                                                                                                                                                              | `.frame-tabs .frame-tabs-trigger[data-state='active']`                                                                                                                                                                                                 |
| `--frame-accent`                           | `frame.accent`                           | `#0078d4`                       | Shared interaction color for keyboard focus, active actions, and accent-filled controls.                                                                                                                                                                          | `.frame-tabs .frame-tabs-trigger[data-state='active']`                                                                                                                                                                                                 |
| `--frame-tabs-trigger-focus-outline`       | `frame.tabs.trigger.focus.outline`       | `1px solid var(--frame-accent)` | Keyboard focus outline around a tab trigger.                                                                                                                                                                                                                      | `.frame-tabs .frame-tabs-trigger:focus-visible`                                                                                                                                                                                                        |
| `--frame-tabs-trigger-outline-offset`      | `frame.tabs.trigger.outline.offset`      | `-2px`                          | Offset between the tab trigger and its keyboard focus outline.                                                                                                                                                                                                    | `.frame-tabs .frame-tabs-trigger:focus-visible`                                                                                                                                                                                                        |
| `--frame-accent`                           | `frame.accent`                           | `#0078d4`                       | Shared interaction color for keyboard focus, active actions, and accent-filled controls.                                                                                                                                                                          | `.frame-tabs .frame-tabs-trigger:focus-visible`                                                                                                                                                                                                        |
| `--frame-tabs-content-padding`             | `frame.tabs.content.padding`             | `16px 0`                        | Internal spacing of the selected tab content.                                                                                                                                                                                                                     | `.frame-tabs > .frame-tabs-content`                                                                                                                                                                                                                    |
| `--frame-tabs-list-border`                 | `frame.tabs.list.border`                 | `1px solid var(--frame-line)`   | Baseline border along the tab trigger list.                                                                                                                                                                                                                       | `.frame-tabs[data-orientation='vertical'] > .frame-tabs-list`                                                                                                                                                                                          |
| `--frame-line`                             | `frame.line`                             | `#2b2b2b`                       | Neutral divider color for content boundaries, tracks, and structural separators.                                                                                                                                                                                  | `.frame-tabs[data-orientation='vertical'] > .frame-tabs-list`                                                                                                                                                                                          |
| `--frame-tabs-indicator-width`             | `frame.tabs.indicator.width`             | `2px`                           | Thickness of the selected-tab underline or side indicator.                                                                                                                                                                                                        | `.frame-tabs[data-orientation='vertical'] .frame-tabs-trigger`                                                                                                                                                                                         |
| `--frame-tabs-vertical-trigger-padding`    | `frame.tabs.vertical.trigger.padding`    | `8px 12px`                      | Internal spacing of a vertical tab trigger.                                                                                                                                                                                                                       | `.frame-tabs[data-orientation='vertical'] .frame-tabs-trigger`                                                                                                                                                                                         |
| `--frame-tabs-indicator-color`             | `frame.tabs.indicator.color`             | `var(--frame-accent)`           | Color of the selected-tab underline or side indicator.                                                                                                                                                                                                            | `.frame-tabs[data-orientation='vertical']   .frame-tabs-trigger[data-state='active']`                                                                                                                                                                  |
| `--frame-accent`                           | `frame.accent`                           | `#0078d4`                       | Shared interaction color for keyboard focus, active actions, and accent-filled controls.                                                                                                                                                                          | `.frame-tabs[data-orientation='vertical']   .frame-tabs-trigger[data-state='active']`                                                                                                                                                                  |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->
