# Views, sidebars, and panels

Register your Vue content with Frame, then ask Frame to open it. Examples below assume `frame` already exists and the named Vue components are imported by the host.

```ts
const removeProjects = frame.registerSidePanel({
  id: 'myapp.projects', label: 'Projects',
  component: ProjectSidebar, props: { projectId: 'project-1' },
});
const removeInspector = frame.registerSecondaryTab({
  id: 'myapp.inspector', label: 'Inspector', component: InspectorView,
});
const removeOutput = frame.registerBottomTab({
  id: 'myapp.output', label: 'Output', component: OutputView,
});

frame.openSidePanel('myapp.projects');
frame.openSecondaryPanel('myapp.inspector');
frame.openBottomPanel('myapp.output');
```

These convenience methods register in the primary, secondary, and bottom regions respectively. The general form is `frame.registerView(definition, region)`, where `region` is `'primary'`, `'secondary'`, or `'bottom'`.

## Definition fields

| Field | Purpose |
| --- | --- |
| `id` | Required unique view ID; use an application prefix |
| `label` | Required display name |
| `component` | Vue content component; optional for a group with children |
| `props` | Properties passed to the content component |
| `icon` | Vue icon component, rather than a string icon name |
| `badge` | String or number for the view selector |
| `actions` | Header actions: `{ id, label, icon?, run, disabled? }` |
| `padded` | Whether the view gets built-in content padding |
| `draggable` | Set `false` to prevent dragging |
| `movable` | Set `false` to prevent moving the view |
| `collapsed` | Initial collapsed state for a grouped section |
| `visible` | Initial content visibility; hiding does not unregister |
| `children` | Nested view definitions rendered as sections |
| `showInRail` | Primary view-bar item visibility preference; defaults to shown |

Each view must supply exactly one of `component` or `children`; combining both is rejected. Pass a component reference, not a component name string or an already mounted element. Keep domain state and backend access in host components/stores.

```ts
const removeTools = frame.registerSidePanel({
  id: 'myapp.tools', label: 'Tools',
  children: [
    { id: 'myapp.search', label: 'Search', component: SearchView },
    { id: 'myapp.filters', label: 'Filters', component: FiltersView,
      collapsed: true },
  ],
});
```

## Open, hide, move, and remove

`frame.openView(id)` reveals a registered view in its current region and expands its ancestors. Prefer it for actions that must keep working after a user moves a view. `openSidePanel`, `openSecondaryPanel`, and `openBottomPanel` target a specific region.

```ts
frame.openView('myapp.output');
frame.setViewVisible('myapp.output', false);
frame.moveView('myapp.output', 'secondary');
frame.openView('myapp.output');
```

Use `closeSidePanel()`, `closeSecondaryPanel()`, or `closeBottomPanel()` to close the corresponding presentation. View components remain mounted while hidden, inactive, or moved within the shell. Unregistering removes their presentation and unmounts content. Closing a view region does not dispose a host-owned controller or backend connection.

Duplicate IDs are rejected. Unregister functions are safe to call repeatedly and cannot remove a newer registration with the same ID. Removing the selected view repairs selection; empty regions have a drop placeholder rather than application demo content.

Registrations also create searchable commands, removed with the registration. Use `frame.getViewCommand(id)` rather than constructing generated IDs. See [commands](commands.md), [view bars](view-bars.md), and [layout](../configuration/layout.md).

## Fixed top and bottom content

Leaf views and grouped views can add `top` and `bottom` slots. Each accepts `{ component, props?, padded? }`. These regions stay outside the automatic middle scrollbar. The existing `component` (or `children`) supplies the middle; `padded` controls its padding independently. Slot padding defaults to the standard view padding; set `padded: false` on either slot to remove it. Views without fixed slots retain their current layout.

```ts
frame.registerSidePanel({
  id: 'myapp.timeline', label: 'Timeline',
  component: FrameList, padded: false,
  top: { component: TimelineFilter, padded: false },
  bottom: { component: PlaybackControls },
});
```

Header actions can provide `menu` items and an `onSelect(item)` handler. A checked item uses `checked: true`; update checked state from your application setting to implement a single selection. Menus remain available when an action moves into the header overflow.
