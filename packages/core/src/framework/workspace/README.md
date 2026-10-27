# Workspace implementation

A Frame owns one `Workspace`. Applications use its existing pane and tab methods;
Vue components render its refs without keeping a second layout or selection
store. Each stateful implementation lives in its own file.

| Class or file                               | Responsibility                                                                                                                        |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `Workspace` in `workspace.ts`               | Pane content registrations, split geometry, focus, plain/tab modes, policy configuration, and tab-operation delegation                |
| `WorkspaceTabs` in `workspaceTabs.ts`       | Immutable tab snapshots, selections, registration ownership, async creation and close guards, dirty confirmations, and drag revisions |
| `WorkspaceTabMenu` in `workspaceTabMenu.ts` | Context-menu entries and selection routed through existing pane/tab operations                                                        |
| `workspaceTypes.ts`                         | Host definitions, options, operation contexts, result types, change events, and confirmation contracts                                |

## Geometry and content

The split tree (`root`) describes geometry. A separate pane registry preserves
component identity while splits resize or surviving branches collapse. The
original pane retains its default-slot identity. Mounted plain content claims
ownership through `registerPaneContent`; conversion to tabs cannot replace an
application-owned component or mounted slot.

`WorkspaceTabsHost` gives the tab controller explicit pane services. Tabs do not
own a second split tree. `Workspace` exposes the same tab operations by delegation,
so host calls, commands, context menus, and the UI use the same checks.

## Immutable tabs and registration ownership

Tab definitions remain application-supplied data. Registered tab snapshots are
frozen, and updates, pinning, or moves replace snapshots without replacing the
original registration token. A cleanup returned by `registerTab` still targets
its original registration after updates or transfers and cannot remove a later
tab that reuses the same ID.

Host registration is independent of user creation permissions. User close and
move operations combine global policies, pane-local restrictions, per-tab flags,
pin state, and last-tab rules. Content components and backend resources stay
owned by the application.

## Asynchronous operations and cleanup

The tab controller owns a mutation revision and the abort controllers for pending
factories and guards. A request commits only if its starting revision and
permissions remain valid. Policy changes, reset, disposal, and conflicting
mutations cancel or invalidate pending work, including callbacks that ignore
their abort signal.

Dirty tabs are confirmed through the existing shared close-confirmation model.
Bulk close validates the complete set before committing. Closing a populated
pane uses the same tab guards before collapsing its geometry branch.

Controller methods handed to callbacks remain bound to their owning instance.
`dispose()` cancels pending work and releases owned registrations and listeners;
it does not dispose application services or components outside Frame's lifecycle.

The small success/failure and cancellation helpers remain pure functions.
There are no compatibility factories or duplicate workspace implementations.
