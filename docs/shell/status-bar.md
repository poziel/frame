# Status bar

The status bar has left and right contribution areas and one centered status message. Register text or buttons; set the center message through the status controller.

```ts
const removeConnection = frame.status.register({
  id: 'myapp.connection', kind: 'text', label: 'Connection',
  text: 'Connected', side: 'left', order: 10,
});
const removeSync = frame.status.register({
  id: 'myapp.sync', kind: 'button', label: 'Sync', text: 'Sync',
  side: 'right', badge: 2,
  run: () => { void frame.executeCommand('myapp.sync-command'); },
});

frame.status.set('Ready');
const dismiss = frame.status.show('Saved', { severity: 'success', duration: 3000 });
```

Register the referenced sync command in your application. The returned `dismiss()` ends that temporary message early; a newer message supersedes an older dismiss callback.

## Contribution fields

| Field | Purpose |
| --- | --- |
| `id`, `kind`, `label` | Required identity, `'text'` or `'button'`, and accessible/context-menu name |
| `text` | Visible text |
| `icon` | Frame icon name or Vue component |
| `tooltip` | Hover/focus description |
| `shortcut`, `expanded`, `controls` | Optional shortcut hint and expanded/controlled-region accessibility state |
| `side` | `'left'` (default) or `'right'` |
| `order` | Lower values first within the side; registration order breaks ties |
| `visible`, `badge` | Initial visibility and optional string/number badge |
| `available` | Callback for availability independent of the user's visibility preference |
| `showInStatusBar` | Callback for movable presentations that may belong elsewhere |
| `onMove` | Callback receiving the new side |
| `run`, `menu`, `disabled` | Button-only callback, menu factory returning `FrameMenuItem[]`, and disabled state |

Text items cannot have button behavior. Duplicate/empty IDs are rejected. Registration returns an idempotent unregister function.

## Updates and visibility

```ts
frame.status.update('myapp.connection', { text: 'Offline', tooltip: 'Reconnect required' });
frame.status.move('myapp.sync', 'left');
frame.status.setVisible('myapp.sync', false);
frame.status.setBadgeVisible('myapp.sync', false);
frame.status.setBarVisible(true);
```

`update` accepts `label`, `text`, `tooltip`, `icon`, `badge`, and button `disabled`. `activate(id)` invokes an available, enabled registered button. Hiding an item or the bar preserves registration.

`set(text)` updates the persistent center status. `show(text, options)` temporarily replaces it; defaults are severity `'info'` and 4000 ms. Supported severities are `'info'`, `'success'`, `'warning'`, and `'error'`. Duration zero keeps the temporary message until dismissed or replaced. It must be finite and non-negative. `clear()` clears both messages. Disposal cancels timers and clears contributions.

Use `status-leading-actions` or `status-actions` slots only for custom content that cannot use the standard registration model. Slot content does not automatically gain item visibility, badges, or side controls. See [initial status options](../configuration/frame-options.md#status).

## Separators

Frame's toolbar buttons can also render here using the shared [button placement API](menus-and-toolbar.md#move-buttons-between-title-and-status-bars). Their icons, command state and shortcuts remain Frame-owned. `resetItemPosition(id)` clears a moved-side override and restores a contribution's configured side without changing its visibility.

Set `status: { allowAddSeparator: true }` to offer Add Separator in the context menu.
Register an initial separator with `frame.status.registerSeparator({ id: 'document-frame', before: 'frame', allowRemove: true })`; the returned function unregisters it. `before` anchors it to an item and follows that item's side and visibility. Omit `before` to append to the left section. Separators do not enter the center message area.

The controller also exposes `separators`, `addSeparator(before?)`, `moveSeparator(id, before?)`, and `removeSeparator(id)`. Removal through the API or context menu requires `allowRemove: true`. Separators support dragging and Move Earlier/Move Later context actions. Initial definitions may be supplied through `status.separators`.

Set `status.allowMove: false` to prevent item side moves and separator repositioning. The permission is enforced by controller calls, drag handles, and context-menu actions; adding and deleting separators remain independently configurable.
`status.allowMove: false` also disables user separator creation, even when `allowAddSeparator` is true. Host `registerSeparator` contributions remain supported.
