# Shell view controllers

This folder owns shell presentation behavior. The root Frame creates and
coordinates these instances; Vue components render their reactive projections.
Applications keep using the existing Frame registration and controller APIs.

| Class                | Responsibility                                                                         |
| -------------------- | -------------------------------------------------------------------------------------- |
| `Navigation`         | Captured navigation history, host adapters, Back/Forward, and synchronous transactions |
| `NavigationItems`    | Action/link/dropdown registrations, activation, visibility, badges, and root order     |
| `NavigationBar`      | Navigation-item presentation, placement, collapse, display, and separators             |
| `PrimaryViewBar`     | Primary bar visibility, display/size locks, badges, and separators                     |
| `SecondaryViewBar`   | Secondary bar presentation and placement opposite the primary side                     |
| `PanelViewBar`       | Panel selector presentation, visibility preferences, badges, and separators            |
| `Panel`              | Docking and alignment through the existing Layout instance                             |
| `ShellPresentation`  | Feature availability and open/close/toggle behavior shared by shell surfaces           |
| `ShellViewContainer` | Shell presentation plus registration and selection of retained views                   |
| `Status`             | Status registrations, side/badge preferences, persistent text, and temporary messages  |
| `StatusMenu`         | Context-menu entries and edits for current status contributions                        |
| `Toolbar`            | Toolbar control visibility and application-action title/status placement               |
| `ToolbarStatus`      | Status registrations and placement observers for existing toolbar controls/actions     |
| `Notifications`      | Transient notification registrations, timer pauses, actions, and delivery listeners    |
| `ViewDrag`           | Pointer-session preview, hover reveal, cancellation, and delegated view moves          |

## Ownership and composition

Content registration, feature availability, and presentation visibility remain
distinct. Hiding a view does not unregister it. Bar controllers read current
registrations and write the existing Layout state; they do not create parallel
view registries or layout stores.

`withPresentation` composes specialized bar operations onto the existing
`ShellPresentation` or `ShellViewContainer`. An internal symbol lists the public
members to copy. Composition preserves method and getter descriptors, excludes
private controller storage, and gates mutating operations through feature
availability. The returned object remains the same shell presentation instance.

Methods used as callbacks are bound to their owning instance. Built-in commands
capture those public operations before shell command bindings replace the
public setters, preserving one execution path and avoiding recursive dispatch.

## Cleanup

Returned registration cleanups address their original registration, so stale
cleanup cannot remove a replacement with the same ID. Controller disposal
releases owned registrations, timers, or gesture resources. Toolbar status
bindings own placement watchers and release both watchers and status entries.
Host navigation adapters and application-owned services are not disposed here.

`Notifications.subscribe` retains its existing notification-delivery contract,
including callback cleanup. This refactor does not migrate it to another event
API or change notification-history ownership.

## Pure helpers

Pure helpers remain functions: `fitViewSizes` distributes preferred dimensions,
`insertionBefore` calculates an insertion boundary, `normalizeNavigationItems`
removes ineffective separators, and `validToolbarPlacement` checks placement
data. `withPresentation` is a stateless composition operation. These functions
need no artificial class instance or independent lifecycle.
