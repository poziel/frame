# View bars

View bars are selectors for registered views. Register content through [view registration](views.md); there is no separate button registration for a view bar. Put application actions and links in the [navigation bar](navigation-bar.md) or [toolbar](menus-and-toolbar.md).

| Region | Registration | Presentation controller |
| --- | --- | --- |
| Primary sidebar | `registerSidePanel` | `frame.primaryViewBar` |
| Secondary sidebar | `registerSecondaryTab` | `frame.secondaryViewBar` |
| Panel | `registerBottomTab` | `frame.panelViewBar` |

```ts
frame.primaryViewBar.setDisplay('both');
frame.primaryViewBar.setPosition('top');
frame.primaryViewBar.setSize('compact');
frame.primaryViewBar.setBadge('myapp.projects', 3);
frame.primaryViewBar.setBadgeVisible('myapp.projects', true);
```

All three controllers support `setDisplay('icons' | 'text' | 'both')`, `setSize('default' | 'compact')`, `setVisible(id, boolean)`, `setBadge(id, stringOrNumber)`, and `setBadgeVisible(id, boolean)`. Omit the badge argument to clear an overridden badge. Their `items` computed refs expose current item presentation.

Primary and secondary controllers support `setPosition('default' | 'top' | 'bottom' | 'hidden')`. Default is vertical beside the sidebar; top/bottom place the bar horizontally with it. Primary defaults to vertical/icons; secondary defaults to top/both. `frame.primaryViewBar.movePrimarySide('right')` swaps the primary sidebar side; `frame.secondaryViewBar.moveSide('left')` controls the same paired arrangement from the secondary perspective.

The panel view bar follows panel docking. Hide that selector using `frame.panelViewBar.setBarVisible(false)`. Move the panel itself with `frame.panel.setPosition('right')`.

Hiding an entire bar keeps its content region and registrations separate. Item visibility is also distinct from removal: primary item visibility is a selector preference; secondary/panel item visibility uses registered view visibility. Use `frame.openView(id)` to reveal a view in its current location.

For initial `hidden`/`hiddenBadges` lists and all defaults, see [configuration](../configuration/frame-options.md#view-bars-and-panel). Presentation resets use each controller's `resetPresentation()`; they do not recreate application content.


## Separators

Each view-bar options object accepts `allowAddSeparator` (default false) and an initial `separators` array. Separators are bar-local presentation items, with no view content, selection, or activation.

```ts
const remove = frame.primaryViewBar.registerSeparator({
  id: 'tools-divider', before: 'myapp.projects', allowRemove: true,
});
frame.primaryViewBar.moveSeparator('tools-divider', 'myapp.search');
remove(); // Valid even after moving; repeat calls are harmless.
```

All three bars expose `separators`, `registerSeparator`, `moveSeparator`, `addSeparator(beforeViewId?)`, and `removeSeparator(id)`. User addition requires the bar's `allowAddSeparator`; user removal requires that separator's `allowRemove` (default false). Context menus expose only permitted actions. User-created separators set `allowRemove: true`. Host registration and its disposer do not require user-edit permissions. Omit `before` to place a separator at the end. Separators can be dragged within their bar; they remain with that bar when an associated view moves elsewhere. Bar text does not become selected while dragging items or separators.


Dragging items uses a shared icon-and-label preview and centered insertion marker. Separators show the same insertion marker without an item preview. The cursor stays normal over a separator and changes to a closed hand only after dragging starts. Escape, pointer cancellation, and window blur cancel the gesture and clear the cursor/overlays.

Bar context menus share edit-action ordering. Empty space starts with **Add Separator**, when permitted. Separator menus offer **Delete Separator**, when permitted, then **Move Earlier** and **Move Later**; separators never appear in visibility checklists. View/navigation items offer hide, badge, and ordering actions before the bar-specific settings.

## Lock size and display

Primary and secondary view-bar options accept `allowSizeChange` and `allowDisplayChange` (both default to `true`). Set either to `false` to keep the configured value, reject controller changes to other values, and hide the corresponding context-menu, layout-customizer, and command-picker choices. Position and visibility remain configurable.

```ts
createFrame({ primaryViewBar: {
  position: 'top', size: 'compact', display: 'icons',
  allowSizeChange: false, allowDisplayChange: false,
} });
```
