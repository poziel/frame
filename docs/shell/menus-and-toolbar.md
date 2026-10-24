# Menu bar and title toolbar

The menu bar groups commands. The toolbar exposes frequently used actions as buttons. Both belong to `FrameShell`; host applications contribute definitions rather than mounting a second title bar.

## Application menus

`FrameShell` generates View, Layout, and Window menus by default. Pass `menuItems` to replace the complete tree:

```vue
<script setup lang="ts">
import { onBeforeUnmount } from 'vue';
import { createFrame, FrameShell, type FrameMenuItem } from '@frame/core';
import '@frame/core/style.css';

const frame = createFrame();
frame.registerCommand({
  id: 'myapp.refresh', label: 'Refresh',
  run: () => { frame.status.set('Refresh requested'); },
});
const menuItems: FrameMenuItem[] = [
  { id: 'myapp.application-menu', label: 'Application', children: [
    { id: 'myapp.refresh-item', label: 'Refresh', command: 'myapp.refresh' },
    { id: 'myapp.menu-divider', type: 'separator' },
    { id: 'myapp.commands-item', label: 'Quick actions', command: 'frame.commands' },
  ] },
];
onBeforeUnmount(() => frame.dispose());
</script>

<template>
  <FrameShell :frame="frame" :menu-items="menuItems" title-text="My application" />
</template>
```

An item requires `id` and `label`. Optional fields are `type: 'item'`, `command`, `shortcut`, `disabled`, `checked`, `visibility`, and `children`. A separator uses `{ id, type: 'separator' }`. Nested `children` use the same type. `command` names a registered command; a displayed `shortcut` does not register a keyboard binding on its own. Put the binding on the command definition.

There is no arbitrary `run` field on `FrameMenuItem`. Checkbox state belongs to the host; use a computed tree if checked/disabled fields depend on reactive state. Selection routes through `frame.executeCommand`.

Set `frame.layout.menuBarVisible = false` to hide the menu bar. The same menu tree is offered by the primary view bar's menu button when that bar is available. Replacing the menu tree does not unregister built-in commands.

## Toolbar actions

```ts
const removeRefresh = frame.registerToolbarAction({
  id: 'myapp.refresh-toolbar', label: 'Refresh', visible: true,
  run: () => { void frame.executeCommand('myapp.refresh'); },
});
```

| Field | Purpose |
| --- | --- |
| `id`, `label`, `run` | Required identity, accessible label, and callback |
| `icon` | Optional Vue icon component |
| `disabled` | Disable invocation |
| `visible` | Pin on title bar; defaults to `false` (available in overflow) |
| `feature` | Optional `{ label, enabled, setEnabled }` contract for availability separate from pinning |
| `showInToolbar` | Optional callback controlling whether this presentation belongs in the title bar |
| `placement` | Optional `{ area: 'titleBar' }` or `{ area: 'statusBar', side?: 'left' \| 'right', order?: number }`; defaults to title bar |
| `showInStatusBar`, `onPlacementChange` | Advanced integration for features that already own a status presentation: suppress the automatic mirror and synchronize their existing presentation with placement changes/reset |

Use `frame.toolbar.setActionVisible(id, boolean)` to pin/unpin an action. Use `setActionEnabled(id, boolean)` only for actions supplying the `feature` contract. Hiding a pin leaves an available action in More Actions; disabling its feature removes its active presentation.

Built-in controls use `frame.toolbar.setVisible(control, boolean)`. Control names and defaults are documented in [configuration](../configuration/frame-options.md#toolbar). Unregister an action with its returned cleanup function.

For only the primary-sidebar layout toggle, initialize with:

```ts
const frame = createFrame({
  toolbar: { customize: false, primary: true, bottom: false, secondary: false },
  features: { panel: false, secondarySidebar: false },
});
```

Hidden built-in layout buttons do not populate More Actions. Customize Layout remains available through `frame.executeCommand('frame.layout.customize')` and Quick actions. The title-bar context menu cannot hide Customize Layout individually; hosts control it through `toolbar.customize` or `frame.toolbar.setVisible('customize', false)`. Setting `layoutControls: false` hides the entire group. Feature availability is separate: omit the `features` restrictions above to keep those containers available.

Set `toolbar: { contextMenu: false }` to suppress the title-bar customization context menu, including on layout buttons. Normal button clicks and application menu-bar context menus are unaffected. This option defaults to `true` and is exposed as `frame.toolbar.contextMenuEnabled`.

## Move buttons between title and status bars

Placement is independent of visibility. Frame keeps the existing command, icon, disabled/expanded state and shortcut when a button moves; applications do not recreate the button. Defaults remain in the title bar.

```ts
const frame = createFrame({
  toolbar: {
    primary: true,
    placements: {
      primary: { area: 'statusBar', side: 'left', order: -100 },
    },
  },
});

frame.toolbar.setPlacement('primary', { area: 'titleBar' });
frame.toolbar.setPlacement('bottom', { area: 'statusBar', side: 'right' });
console.log(frame.toolbar.getPlacement('primary'));

const removeRefresh = frame.registerToolbarAction({
  id: 'myapp.refresh', label: 'Refresh', visible: true,
  placement: { area: 'statusBar', side: 'left', order: 10 },
  run: () => { /* Refresh application data. */ },
});
frame.toolbar.setPlacement('action:myapp.refresh', { area: 'titleBar' });
```

Built-in button IDs are `customize`, `primary`, `bottom` and `secondary`. Registered actions use `action:<id>` so a custom action named `primary` does not collide with the built-in control. `commandCenter` and `layoutControls` are aggregate title-bar controls, not movable buttons. Native window controls retain their host-managed placement.

Status placements default to the left with order zero. Lower `order` values appear earlier, sharing the ordering scale of ordinary status contributions. Built-in status IDs are `frame.toolbar.<button>`; custom action IDs are `frame.toolbar.action:<id>`. `setPlacement` returns false for unknown IDs, invalid destinations or disposed controllers. Initial configuration can name actions that register later.

Use `setVisible`/`setActionVisible` to enable the button presentation; selecting a placement does not automatically pin a hidden control. Status-item visibility is an additional preference. `layoutControls: false` hides the title-bar group, while moved status controls follow their own visibility and the status bar's visibility. Moved actions do not also appear in the title-bar overflow.

Right-click a title-bar button to move it to either status side. Status context menus offer Move to Title Bar and Move to Left/Right when `status.allowMove` permits movement. Status-side moves update the toolbar placement. `resetLayout()` restores initial placements; hiding or remounting a shell preserves them. Unregistering an action removes its status presentation and runtime placement; `dispose()` releases bindings and state.
