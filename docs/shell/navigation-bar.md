# Navigation bar

Use the navigation bar for application actions, links, dropdowns, and separators. Enable its initial presentation with `createFrame({ navigationBar: true })`, or pass an options object. This is independent of `navigation: true`, which enables Back/Forward history.

```ts
const removeHome = frame.registerNavigationItem({
  id: 'myapp.home', type: 'link', label: 'Home', href: '/home',
  onNavigate: href => { void router.push(href); },
});

const removeTools = frame.registerNavigationItem({
  id: 'myapp.navigation-tools', type: 'dropdown', label: 'Tools',
  items: [
    { id: 'myapp.open-output', type: 'action', label: 'Show output',
      run: () => frame.openView('myapp.output') },
    { id: 'myapp.tools-divider', type: 'separator' },
    { id: 'myapp.help', type: 'link', label: 'Help', href: '/help' },
  ],
});
```

The example's router is host-owned. Without `onNavigate`, links use browser navigation. A navigation item never creates a sidebar or workspace component automatically.

## Item fields

Every item has required `id` and `type`, plus optional `visible` and `draggable`. IDs must be unique across the entire navigation tree. `draggable: false` prevents root item reordering.

All non-separator items require `label` and accept `icon` (Vue component), `badge` (string/number), and `disabled`.

| `type` | Additional fields |
| --- | --- |
| `'action'` | Required `run(): void \| Promise<void>`; optional `active` boolean or callback |
| `'link'` | Required `href`; optional `target`, `rel`, `onNavigate(href)`, and `active` boolean or callback |
| `'dropdown'` | Required `items: readonly NavigationItem[]`; supports nesting |
| `'separator'` | Optional `label`; no action, badge, or content component |

Mixed item fields and duplicate IDs are rejected. Dropdown registration reserves its descendants and returns one cleanup function for the tree.

## Runtime control

```ts
frame.navigationBar.setPosition('left');
frame.navigationBar.setDisplay('both');
frame.navigationBar.setSize('compact');
frame.navigationBar.setVisible(true);
frame.navigationBar.setItemVisible('myapp.help', false);
frame.navigationBar.setBadge('myapp.home', 2);
frame.navigationBar.moveItem('myapp.home'); // Move root item to the end.
```

`setJustification('left' | 'center' | 'right')` sets alignment. Use `activate(id)` to invoke an enabled action/link through the controller and `setBadgeVisible(id, boolean)` for badges. `moveItem(id, beforeId?)` reorders roots; nested items are not independently transferred. Hidden/disabled ancestors prevent activation of their descendants. Action failures are reported through Frame's status/log handling.

Call the returned unregister function when the owning contribution is removed. Hiding the bar preserves its registrations and item preferences. See [creation options](../configuration/frame-options.md#navigation-bar).


## Collapsing and separators

With a vertical bar configured as `display: 'both'`, the bottom button and context menu toggle `frame.navigationBar.setCollapsed(boolean)`. `collapsed` is independent of `display`; `effectiveDisplay` becomes icons while collapsed. Other docking/display modes retain their normal presentation and the saved collapsed state. Use the initial `collapsed` option to start collapsed. The context option is disabled outside vertical icons-and-text mode.

Set `navigationBar.allowAddSeparator: true` to allow the context menu to create separators. `addSeparator(beforeId?)` uses the same permission. User-created separators are removable. Registered separators allow removal only with `allowRemove: true`; `removeSeparator(id)` enforces that permission. A host's registration disposer always removes its own contribution. Top-level bar separators remain visible at boundaries so added separators can always be managed.

Vertical labels use `--frame-navigation-label-gap` (12px by default) and `--frame-navigation-label-end-padding` (16px). Both follow the small-spacing token. Collapse restores the normal icon-only spacing without changing compact/default sizing.


Dragging items uses a shared icon-and-label preview and centered insertion marker. Separators show the same insertion marker without an item preview. The cursor stays normal over a separator and changes to a closed hand only after dragging starts. Escape, pointer cancellation, and window blur cancel the gesture and clear the cursor/overlays.

Bar context menus share edit-action ordering. Empty space starts with **Add Separator**, when permitted. Separator menus offer **Delete Separator**, when permitted, then **Move Earlier** and **Move Later**; separators never appear in visibility checklists. View/navigation items offer hide, badge, and ordering actions before the bar-specific settings.
