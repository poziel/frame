# Menu bar and toolbar

Expose application commands in menus and place frequent actions in the title bar. Frame coordinates command execution and toolbar presentation; the host supplies the menu tree and application behavior.

## Features

Pass `FrameMenuItem[]` through `FrameShell`'s `menu-items` prop to replace the application menu tree. A menu leaf names a registered command. Checked and disabled menu state can follow host-owned reactive values.

Hiding the menu bar retains the same tree in the primary view-bar menu button when that bar is available. Toolbar actions have independent pinning, availability, and placement. An unpinned available action remains in More Actions; an unavailable feature is suppressed.

Toolbar buttons can move between the title bar and either status side without recreating their command or state. Each shell owns its registrations and preferences. The Playground has its own Frame instance and resets when you leave this page.

## APIs

```vue
<script setup lang="ts">
import {onBeforeUnmount} from 'vue';
import {createFrame, FrameShell, type FrameMenuItem} from '@frame/core';
import '@frame/core/style.css';

const frame = createFrame({toolbar: {customize: true}});
const removeCommand = frame.registerCommand({
  id: 'app.refresh',
  label: 'Refresh',
  run: () => frame.status.set('Refresh requested'),
});
const removeAction = frame.registerToolbarAction({
  id: 'app.refresh-button',
  label: 'Refresh',
  visible: true,
  run: () => { void frame.executeCommand('app.refresh'); },
});
const menuItems: FrameMenuItem[] = [{
  id: 'app.file',
  label: 'File',
  children: [{id: 'app.refresh-item', label: 'Refresh', command: 'app.refresh'}],
}];

onBeforeUnmount(() => {
  removeAction();
  removeCommand();
  frame.dispose();
});
</script>

<template>
  <FrameShell :frame="frame" :menu-items="menuItems" />
</template>
```

`FrameMenuItem` uses `command`, rather than an arbitrary `run` callback. A displayed menu shortcut does not register a keybinding; configure the command's shortcut. Separators use `{id, type: 'separator'}`.

Use `frame.menuBar.toggle()` or `frame.layout.menuBarVisible` for menu visibility. Toolbar APIs include `setActionVisible(id, value)` and `setPlacement('action:app.refresh-button', {area: 'statusBar', side: 'right'})`. Built-in placement IDs are `customize`, `primary`, `bottom`, and `secondary`. Feature availability remains distinct from hiding a toolbar control.

See [menus and toolbar](../shell/menus-and-toolbar.md) for all action fields, context-menu options, feature contracts, and placement cleanup. [Creation options](../configuration/frame-options.md#toolbar) list built-in defaults.

## Styling

Toolbar icons are Vue components and use the shell's theme. Use toolbar configuration and placement APIs for layout, and `FrameShell`'s `title-text`, `appIcon`, and `appName` props for application branding.

Menus use Frame's shell overlay host, so portal positioning and theme follow the owning shell. Use [theme variables](../styling/theme-variables.md) for shared appearance and [layout density](../configuration/layout.md) for shell spacing.
