# Menubar

A themed menubar powered by Reka UI.

## Features

### Offer application commands

Menu headings organize application actions. Selection emits an action for the host to execute.

<!-- frame:example id="general-menubar.task-0" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameMenubar } from '@frame/core';
const demoItems = [
  {
    "value": "file",
    "label": "File",
    "items": [
      {
        "id": "new",
        "label": "New file",
        "shortcut": "Ctrl+N"
      },
      {
        "id": "save",
        "label": "Save project",
        "shortcut": "Ctrl+S"
      },
      {
        "id": "remote",
        "label": "Publish remotely",
        "disabled": true
      }
    ]
  },
  {
    "value": "view",
    "label": "View",
    "items": [
      {
        "id": "zoom",
        "label": "Reset zoom"
      }
    ]
  }
];
</script>
<template>
<FrameMenubar :items="demoItems" :label="&quot;Application menu&quot;" />
</template>
```

### Expose edit actions

Shortcuts explain alternate ways to invoke a command; the host remains responsible for registering those shortcuts.

<!-- frame:example id="general-menubar.task-1" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameMenubar } from '@frame/core';
const demoItems = [
  {
    "value": "edit",
    "label": "Edit",
    "items": [
      {
        "id": "undo",
        "label": "Undo",
        "shortcut": "Ctrl+Z"
      },
      {
        "id": "redo",
        "label": "Redo",
        "shortcut": "Ctrl+Y"
      }
    ]
  }
];
</script>
<template>
<FrameMenubar :items="demoItems" :label="&quot;Edit menu&quot;" />
</template>
```

## APIs

<!-- frame:generated api="general-menubar" -->

### FrameMenubar

Source: `packages/core/src/components/navigation/FrameMenubar.vue`

#### Properties

| Name             | Type                                    | Default  | Description                                                                                                                                             |
| ---------------- | --------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `modelValue`     | `string \| undefined`                   | Omitted  | The controlled value of the menu to open. Can be used as `v-model`.                                                                                     |
| `defaultValue`   | `string \| undefined`                   | Omitted  | The value of the menu that should be open when initially rendered. Use when you do not need to control the value state.                                 |
| `dir`            | `Direction \| undefined`                | Omitted  | The reading direction of the combobox when applicable. If omitted, inherits globally from `ConfigProvider` or assumes LTR (left-to-right) reading mode. |
| `loop`           | `boolean \| undefined`                  | false    | When `true`, keyboard navigation will loop from last item to first, and vice versa.                                                                     |
| `items`          | `FrameMenubarItem[] \| undefined`       | Omitted  | Items rendered by the built-in composition; a default slot replaces that composition.                                                                   |
| `menus`          | `readonly FrameMenuItem[] \| undefined` | Omitted  | Command-backed menu tree; takes precedence over the simpler items collection.                                                                           |
| `label`          | `string \| undefined`                   | Omitted  | Accessible name for this component and its built-in control or region.                                                                                  |
| `maxVisible`     | `number \| undefined`                   | Infinity | Maximum visible menu groups before overflow; defaults to no count limit.                                                                                |
| `availableWidth` | `number \| undefined`                   | Omitted  | Available width in pixels used to move overflowing groups into the overflow menu.                                                                       |
| `popupLabel`     | `string \| undefined`                   | Omitted  | Accessible label for the overflow menu presentation.                                                                                                    |

#### Events

| Name                | Parameters                 | Return type | Description                                                          |
| ------------------- | -------------------------- | ----------- | -------------------------------------------------------------------- |
| `update:modelValue` | `value: string`            | `void`      | Emitted when user interaction requests a new controlled value.       |
| `action`            | `item: FrameMenubarAction` | `void`      | Emitted when a built-in menubar item action is selected.             |
| `execute`           | `id: string`               | `void`      | Emitted with the command ID for a selected command-backed menu item. |

#### Slots

| Name      | Parameters                                                                                                                                            | Return type  | Description                                                  |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ------------------------------------------------------------ |
| `default` | `None`                                                                                                                                                | `VNodeChild` | Replaces all built-in menu groups and overflow presentation. |
| `content` | `{ menu: { value: string; label: string; disabled?: boolean \| undefined; action?: FrameMenuItem \| undefined; items: readonly FrameMenuItem[]; }; }` | `VNodeChild` | Additional content for one opened menu group.                |

#### Exposed API

No declared entries.

<!-- /frame:generated -->

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="general-menubar" -->

| CSS variable                              | Theme path                              | Default expression                   | Purpose                                                                                                                            | Context                                                                                                             |
| ----------------------------------------- | --------------------------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `--frame-menubar-min-width`               | `frame.menubar.min.width`               | `0`                                  | Minimum width for .frame-menubar.                                                                                                  | `.frame-menubar`                                                                                                    |
| `--frame-menubar-button-color`            | `frame.menubar.button.color`            | `#a9a9a9`                            | Foreground for .frame-menubar button.                                                                                              | `.frame-menubar button`                                                                                             |
| `--frame-menubar-button-height`           | `frame.menubar.button.height`           | `25px`                               | Height for .frame-menubar button.                                                                                                  | `.frame-menubar button`                                                                                             |
| `--frame-menubar-button-padding`          | `frame.menubar.button.padding`          | `0 8px`                              | Internal spacing for .frame-menubar button.                                                                                        | `.frame-menubar button`                                                                                             |
| `--frame-menubar-button-border-radius`    | `frame.menubar.button.border.radius`    | `var(     --frame-radius-medium   )` | Corner radius for .frame-menubar button.                                                                                           | `.frame-menubar button`                                                                                             |
| `--frame-menubar-button-font-size`        | `frame.menubar.button.font.size`        | `12px`                               | Text size for .frame-menubar button.                                                                                               | `.frame-menubar button`                                                                                             |
| `--frame-radius-medium`                   | `frame.radius.medium`                   | `4px`                                | Medium shared corner radius used by ordinary controls.                                                                             | `.frame-menubar button`                                                                                             |
| `--frame-menubar-button-hover-background` | `frame.menubar.button.hover.background` | `#ffffff0b`                          | Background for .frame-menubar button:hover, .frame-menubar button.active.                                                          | `.frame-menubar button:hover, .frame-menubar button.active`                                                         |
| `--frame-menubar-button-height`           | `frame.menubar.button.height`           | `25px`                               | Height for .frame-menubar .menubar-groups > button, .frame-menubar > button.                                                       | `.frame-menubar .menubar-groups > button, .frame-menubar > button`                                                  |
| `--frame-menubar-button-padding`          | `frame.menubar.button.padding`          | `0 8px`                              | Internal spacing for .frame-menubar .menubar-groups > button, .frame-menubar > button.                                             | `.frame-menubar .menubar-groups > button, .frame-menubar > button`                                                  |
| `--frame-menubar-button-color`            | `frame.menubar.button.color`            | `#a9a9a9`                            | Foreground for .frame-menubar .menubar-groups > button, .frame-menubar > button.                                                   | `.frame-menubar .menubar-groups > button, .frame-menubar > button`                                                  |
| `--frame-menubar-button-font-size`        | `frame.menubar.button.font.size`        | `12px`                               | Text size for .frame-menubar .menubar-groups > button, .frame-menubar > button.                                                    | `.frame-menubar .menubar-groups > button, .frame-menubar > button`                                                  |
| `--frame-menubar-button-hover-background` | `frame.menubar.button.hover.background` | `#ffffff0b`                          | Background for .frame-menubar button[data-state='open'].                                                                           | `.frame-menubar button[data-state='open']`                                                                          |
| `--frame-font-body`                       | `frame.font.body`                       | `sans-serif`                         | Font family for .frame-tabs, .frame-stepper, .frame-toolbar, .frame-tree, .frame-splitter, .frame-navigation-menu, .frame-menubar. | `.frame-tabs, .frame-stepper, .frame-toolbar, .frame-tree, .frame-splitter, .frame-navigation-menu, .frame-menubar` |
| `--frame-font-size-body`                  | `frame.font.size.body`                  | `13px`                               | Text size for .frame-tabs, .frame-stepper, .frame-toolbar, .frame-tree, .frame-splitter, .frame-navigation-menu, .frame-menubar.   | `.frame-tabs, .frame-stepper, .frame-toolbar, .frame-tree, .frame-splitter, .frame-navigation-menu, .frame-menubar` |
| `--frame-control-text`                    | `frame.control.text`                    | `var(--frame-text)`                  | Foreground for .frame-tabs, .frame-stepper, .frame-toolbar, .frame-tree, .frame-splitter, .frame-navigation-menu, .frame-menubar.  | `.frame-tabs, .frame-stepper, .frame-toolbar, .frame-tree, .frame-splitter, .frame-navigation-menu, .frame-menubar` |
| `--frame-text`                            | `frame.text`                            | `#cccccc`                            | Primary foreground for readable text and icons across shell and application content.                                               | `.frame-tabs, .frame-stepper, .frame-toolbar, .frame-tree, .frame-splitter, .frame-navigation-menu, .frame-menubar` |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->
