# Sidebar activity bars

Primary and secondary sidebars share the same selector, context menu, view header, and action overflow behavior. The primary bar defaults to the outside edge; the secondary defaults to the top. Default follows the sidebar when the two sides are swapped.

| Behavior | Default (vertical) | Top or bottom (horizontal) |
| --- | --- | --- |
| Click the active view again | Hide the sidebar content; leave the bar available | Keep the view open |
| Hide the sidebar or use its shortcut | Leave the bar available | Hide its bar together with content |
| Hide only the activity bar | Keep sidebar content visible | Keep sidebar content visible |
| Display choices | Icons only | Icons, text, or icons and text |

Activity-bar visibility is an independent preference. Opening a sidebar never overrides a deliberately hidden bar. Horizontal text preferences are retained when switching to Default, which renders icons only. Text display changes are rejected while Default is selected.

Horizontal bars replace selectors that do not fit with **More Views**. Selecting an overflow entry opens that view. Keyboard navigation can reach the same view set. View actions live beside the active view title, with **More View Actions** when that row becomes narrow. Both bars provide per-item visibility, badges, movement, position, size, and display context menus.

Customize Layout lists **Primary Activity Bar**, **Secondary Activity Bar**, **Primary Side Bar**, and **Secondary Side Bar** independently.

## Public API

The existing primary APIs keep their names. Secondary configuration extends the existing secondaryBar controller.

```ts
const frame = createFrame({
  activity: { position: 'default', display: 'icons', size: 'default' },
  secondaryBar: { position: 'top', display: 'both', size: 'default' },
});

frame.activity.setPosition('top');
frame.activity.setDisplay('both');
frame.secondaryBar.setPosition('bottom');
frame.secondaryBar.setDisplay('text');

// Selector activation follows the orientation-dependent toggle policy.
frame.selectSideView('project.files');
frame.selectSecondaryView('project.outline');

// Explicit open and close calls remain independent of selector activation.
frame.openSidePanel('project.files');
frame.closeSidePanel();
frame.openSecondaryPanel('project.outline');
frame.closeSecondaryPanel();

// Hiding the bar does not close its sidebar; its last position is retained.
frame.activity.setPosition('hidden');
frame.layout.secondaryActivityBarVisible = false;
```

Primary item APIs use `{ kind: 'view' | 'action', id }`; secondary item APIs keep their existing string IDs. Registrations, per-instance state, disposal, and view content remain in the existing Frame controllers.
