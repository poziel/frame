# Shell customization

Presentation preferences belong to each Frame instance. Hiding an activity does not unregister its view or dispose its content. Applications can set defaults and use the same API as shell context menus.

```ts
const frame = createFrame({
  navigation: true,
  toolbar: { primary: true, bottom: true, secondary: false },
  activity: {
    position: 'top',
    size: 'compact',
    hidden: [{ kind: 'view', id: 'app.details' }],
    hiddenBadges: [{ kind: 'view', id: 'app.details' }],
  },
});

frame.registerSidePanel({ id: 'app.details', label: 'Details', badge: 3, component: Details });
frame.activity.setVisible({ kind: 'view', id: 'app.details' }, true);
frame.activity.setBadge({ kind: 'view', id: 'app.details' }, 7);
frame.activity.setBadgeVisible({ kind: 'view', id: 'app.details' }, false);
frame.activity.setPosition('bottom');
frame.activity.setSize('default');
frame.activity.movePrimarySide('right');
frame.toolbar.setVisible('secondary', true);
frame.toolbar.setVisible('commandCenter', false);

frame.registerToolbarAction({ id: 'app.share', label: 'Share', icon: ShareIcon, run: share });
frame.toolbar.setActionVisible('app.share', true);
```

Activity keys distinguish views from actions even when their registration IDs are the same. The activity context menu offers a targeted Hide action and Hide Badge/Show Badge, followed by checked entries for every registered primary activity contribution. Blank activity-bar space offers the complete checked list. Hiding the selected primary activity selects another visible primary view, or closes the primary sidebar when none remain. Explicitly opening a hidden primary view through the Frame API reveals its activity item again. Badges are supplied by the host; Frame does not infer notification counts from domain data.

Right-click the title bar outside the application menu and window controls to configure Customize Layout, adjacent sidebar/panel buttons, Menu Bar, Command Center, Layout Controls, and registered toolbar actions. A targeted button additionally offers Hide. The title-bar menu remains available when its controls are hidden. These choices survive shell remounts. `resetLayout()` restores toolbar control defaults from the initial configuration; registered custom actions retain their own visibility.

Back and Forward visibility is configured in Customize Layout immediately after Status Bar. Workspace context menus contain workspace operations such as splitting and closing panes. Navigation history remains independent of whether the arrows are visible.

Activity preferences are cleared when the corresponding registration is removed, and all activity/toolbar state is released on Frame disposal. Cross-session persistence remains the host application's policy.

## Activity bar position and size

Position and size are separate per-instance preferences. Configure them through `activity.position` and `activity.size`, or change them through `frame.activity` after creation.

| Setting | Values | Behavior |
| --- | --- | --- |
| Position | `default`, `top`, `bottom`, `hidden` | Choose the normal vertical rail, a horizontal strip at the top or bottom of the primary sidebar, or hide the bar. |
| Size | `default`, `compact` | Choose the activity item size independently of its position. |

The default vertical rail follows the primary sidebar side. Top and bottom strips stay on that primary edge when sidebar content is closed; changing position does not open a view or reserve an empty full-height sidebar.

Activity size is also independent of `frame.layout.density`: compact activity items do not change sidebar, panel, or workspace density. Changing position preserves the chosen activity size.

```ts
frame.activity.setPosition('top');
frame.activity.setSize('compact');

frame.activity.setPosition('hidden');
// The last non-hidden position is retained.
frame.layout.activityBarVisible = true;

const position = frame.activity.position.value;
const size = frame.activity.size.value;
```

The `hidden` position uses the same `layout.activityBarVisible` state as Customize Layout. Hiding the bar does not close, unregister, or dispose its views. Selecting a non-hidden position shows the bar again. `resetLayout()` restores the configured initial activity position and size; it does not unregister contributions. Setter methods return `false` for invalid values or a disposed Frame instance.

## Moving activities and views

`frame.activity.movePrimarySide('left' | 'right')` moves the primary sidebar and its activity presentation together. It changes shell placement without moving individual view registrations to another container.

Use the existing view APIs when moving one view between the primary sidebar, secondary sidebar, and bottom panel:

```ts
if (frame.canMoveView('app.details', 'secondary')) {
  frame.moveView('app.details', 'secondary');
}
```

Move To menu actions use these same APIs. They respect the view's `movable` and `draggable` policies and the enabled interaction regions; a rejected move returns `false`. Moving a view reuses its registered component and state rather than creating a second view.

Customize Layout also exposes Activity Bar Position and Activity Bar Size immediately above Primary Side Bar Position. These choices use the same instance APIs and stay synchronized with the activity-bar context menu.

Quick Input / Panel Position in Customize Layout controls `frame.layout.quickInputPosition` (`top` or `center`). FrameQuickInput and FrameQuickPanel inherit that position when rendered inside the provided Frame tree. An explicit component `position` prop overrides it; standalone components default to the top.
