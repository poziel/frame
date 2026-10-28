# Tree

A themed tree powered by Reka UI. This Reka primitive is Alpha.

## Features

### Explore project files

Expand folders and navigate files using the tree keyboard controls. The host owns the hierarchy and file contents.

<!-- frame:example id="general-tree.task-0" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameTree } from '@frame/core';
const demoItems = [
  {
    "id": "src",
    "label": "Source",
    "children": [
      {
        "id": "index",
        "label": "index.ts"
      },
      {
        "id": "app",
        "label": "App.vue"
      }
    ]
  },
  {
    "id": "readme",
    "label": "README.md"
  }
];
const demoDefaultExpanded = [
  "src"
];
</script>
<template>
<FrameTree :items="demoItems" :label="&quot;Project files&quot;" :default-expanded="demoDefaultExpanded" />
</template>
```

### Select several resources

Multiple selection supports operations on several resources without turning the tree into a flat list.

<!-- frame:example id="general-tree.task-1" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameTree } from '@frame/core';
const demoItems = [
  {
    "id": "src",
    "label": "Source",
    "children": [
      {
        "id": "index",
        "label": "index.ts"
      },
      {
        "id": "app",
        "label": "App.vue"
      }
    ]
  }
];
const demoMultiple = true;
const demoDefaultExpanded = [
  "src"
];
</script>
<template>
<FrameTree :items="demoItems" :multiple="demoMultiple" :label="&quot;Resources to export&quot;" :default-expanded="demoDefaultExpanded" />
</template>
```

## APIs

<!-- frame:generated api="general-tree" -->

### FrameTree

Source: `packages/core/src/components/data-display/FrameTree.vue`

#### Properties

| Name                | Type                                                                  | Default | Description                                                                                                                                                                                          |
| ------------------- | --------------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `multiple`          | `boolean \| undefined`                                                | false   | Whether multiple options can be selected or not.                                                                                                                                                     |
| `modelValue`        | `FrameTreeItem \| FrameTreeItem[] \| undefined`                       | Omitted | The controlled value of the tree. Can be binded with `v-model`.                                                                                                                                      |
| `disabled`          | `boolean \| undefined`                                                | false   | When `true`, prevents the user from interacting with tree                                                                                                                                            |
| `defaultValue`      | `FrameTreeItem \| FrameTreeItem[] \| undefined`                       | Omitted | The value of the tree when initially rendered. Use when you do not need to control the state of the tree                                                                                             |
| `asChild`           | `boolean \| undefined`                                                | false   | Change the default rendered element for the one passed as a child, merging their props and behavior. Read our [Composition](https://www.reka-ui.com/docs/guides/composition) guide for more details. |
| `as`                | `Component \| AsTag \| undefined`                                     | "div"   | The element or component this component should render as. Can be overwritten by `asChild`. defaultValue: "div"                                                                                       |
| `dir`               | `Direction \| undefined`                                              | Omitted | The reading direction of the listbox when applicable. <br> If omitted, inherits globally from `ConfigProvider` or assumes LTR (left-to-right) reading mode.                                          |
| `items`             | `FrameTreeItem[] \| undefined`                                        | Omitted | List of items                                                                                                                                                                                        |
| `loop`              | `boolean \| undefined`                                                | false   | When `true`, keyboard navigation will loop from last item to first, and vice versa.                                                                                                                  |
| `selectionBehavior` | `"replace" \| "toggle" \| undefined`                                  | Omitted | How multiple selection should behave in the collection.                                                                                                                                              |
| `expanded`          | `string[] \| undefined`                                               | Omitted | The controlled value of the expanded item. Can be binded with `v-model`.                                                                                                                             |
| `defaultExpanded`   | `string[] \| undefined`                                               | Omitted | The value of the expanded tree when initially rendered. Use when you do not need to control the state of the expanded tree                                                                           |
| `getChildren`       | `((val: FrameTreeItem) => FrameTreeItem[] \| undefined) \| undefined` | Omitted | This function is passed the index of each item and should return a list of children for that item                                                                                                    |
| `propagateSelect`   | `boolean \| undefined`                                                | false   | When `true`, selecting parent will select the descendants. Requires `multiple` to be `true`.                                                                                                         |
| `bubbleSelect`      | `boolean \| undefined`                                                | false   | When `true`, selecting children will update the parent state. Requires `multiple` to be `true`.                                                                                                      |
| `getKey`            | `((item: FrameTreeItem) => string) \| undefined`                      | Omitted | Stable identity of one tree item; defaults to its id.                                                                                                                                                |
| `label`             | `string \| undefined`                                                 | Omitted | Accessible name of the tree.                                                                                                                                                                         |

#### Events

| Name                | Parameters                              | Return type | Description                                                         |
| ------------------- | --------------------------------------- | ----------- | ------------------------------------------------------------------- |
| `update:modelValue` | `val: FrameTreeItem \| FrameTreeItem[]` | `void`      | Requests the selected tree item or items after selection changes.   |
| `update:expanded`   | `val: string[]`                         | `void`      | Requests the keys of expanded tree items after an expansion change. |

#### Slots

| Name      | Parameters                                                                                                                                                                                 | Return type  | Description                                                                                   |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------ | --------------------------------------------------------------------------------------------- |
| `default` | `{ flattenItems: FlattenedItem<FrameTreeItem>[]; modelValue: FrameTreeItem \| FrameTreeItem[]; expanded: string[]; }`                                                                      | `VNodeChild` | Replaces the built-in flattened tree composition, with current selection and expansion state. |
| `item`    | `{ isExpanded: boolean; isSelected: boolean; isIndeterminate: boolean \| undefined; isDisabled: boolean; handleToggle: () => void; handleSelect: () => void; } & { item: FrameTreeItem; }` | `VNodeChild` | Replaces one row body while preserving its tree-item selection and expansion handlers.        |

#### Exposed API

No declared entries.

<!-- /frame:generated -->

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="general-tree" -->

| CSS variable                   | Theme path                   | Default expression                         | Purpose                                                                                                                                                                                                                                                           | Context                                                                                                                                                                                                                                              |
| ------------------------------ | ---------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--frame-font-body`            | `frame.font.body`            | `sans-serif`                               | Font family for .frame-navigation-text.                                                                                                                                                                                                                           | `.frame-navigation-text`                                                                                                                                                                                                                             |
| `--frame-font-size-body`       | `frame.font.size.body`       | `13px`                                     | Text size for .frame-navigation-text.                                                                                                                                                                                                                             | `.frame-navigation-text`                                                                                                                                                                                                                             |
| `--frame-control-text`         | `frame.control.text`         | `var(--frame-text)`                        | Foreground for .frame-navigation-text.                                                                                                                                                                                                                            | `.frame-navigation-text`                                                                                                                                                                                                                             |
| `--frame-text`                 | `frame.text`                 | No declared default; supplied by context.  | Primary foreground for readable text and icons across shell and application content.                                                                                                                                                                              | `.frame-navigation-text`                                                                                                                                                                                                                             |
| `--frame-hover-background`     | `frame.hover.background`     | `rgba(127, 127, 127, 0.12)`                | Background for .frame-toolbar-button:hover, .frame-navigation-trigger:hover, .frame-navigation-link:hover, .frame-menubar-trigger:hover, .frame-menubar-item[data-highlighted], .frame-tree-item:hover.                                                           | `.frame-toolbar-button:hover, .frame-navigation-trigger:hover, .frame-navigation-link:hover, .frame-menubar-trigger:hover, .frame-menubar-item[data-highlighted], .frame-tree-item:hover`                                                            |
| `--frame-accent`               | `frame.accent`               | `#007acc`                                  | Foreground for .frame-menubar-trigger[data-state='open'], .frame-navigation-trigger[data-state='open'], .frame-tree-item[data-selected].                                                                                                                          | `.frame-menubar-trigger[data-state=open], .frame-navigation-trigger[data-state=open], .frame-tree-item[data-selected]`                                                                                                                               |
| `--frame-selection-background` | `frame.selection.background` | `rgba(0, 122, 204, 0.15)`                  | Background for .frame-menubar-trigger[data-state='open'], .frame-navigation-trigger[data-state='open'], .frame-tree-item[data-selected].                                                                                                                          | `.frame-menubar-trigger[data-state=open], .frame-navigation-trigger[data-state=open], .frame-tree-item[data-selected]`                                                                                                                               |
| `--frame-accent`               | `frame.accent`               | `#007acc`                                  | Foreground for .frame-navigation-focus:focus-visible.                                                                                                                                                                                                             | `.frame-navigation-focus:focus-visible`                                                                                                                                                                                                              |
| `--frame-focus-border`         | `frame.focus.border`         | `var(     --frame-accent,     #007acc   )` | Outline for .frame-navigation-focus:focus-visible.                                                                                                                                                                                                                | `.frame-navigation-focus:focus-visible`                                                                                                                                                                                                              |
| `--frame-disabled-opacity`     | `frame.disabled.opacity`     | `0.5`                                      | Opacity for .frame-tabs-trigger:disabled, .frame-toolbar-button:disabled, .frame-menubar-trigger:disabled, .frame-navigation-trigger:disabled, [aria-disabled='true'].frame-navigation-link, .frame-tree-item[data-disabled], .frame-stepper-item[data-disabled]. | `.frame-tabs-trigger:disabled, .frame-toolbar-button:disabled, .frame-menubar-trigger:disabled, .frame-navigation-trigger:disabled, [aria-disabled=true].frame-navigation-link, .frame-tree-item[data-disabled], .frame-stepper-item[data-disabled]` |
| `--frame-control-radius`       | `frame.control.radius`       | `var(--frame-radius-medium)`               | Corner radius for .frame-tree-item.                                                                                                                                                                                                                               | `.frame-tree-item`                                                                                                                                                                                                                                   |
| `--frame-radius-medium`        | `frame.radius.medium`        | No declared default; supplied by context.  | Medium shared corner radius used by ordinary controls.                                                                                                                                                                                                            | `.frame-tree-item`                                                                                                                                                                                                                                   |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->
