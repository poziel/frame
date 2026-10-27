# Layout implementation

Layout belongs to the owning Frame. Applications supply contributions and
preferences; the shell measures and renders them. Geometry helpers do not change
preferred dimensions to make a smaller viewport fit.

| Class                                               | Responsibility                                                            | Example                                              |
| --------------------------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------- |
| `Layout` in `layout.ts`                             | Session layout preferences and instance geometry operations               | `frame.layout.geometry(width, height)`               |
| `DockRegistry` in `docks.ts`                        | Dock registration, placement resolution, retained hosts, and measurements | `frame.docks.update(id, patch)`                      |
| `BarSeparators` in `barSeparators.ts`               | Presentation-only separator registration and editing permissions          | A view bar's Add Separator action                    |
| `BarDrag` in `barDrag.ts`                           | Bar-item drag preview and insertion targeting                             | Reordering a navigation item                         |
| `PointerDrag` in `pointerDrag.ts`                   | One pointer gesture, activation threshold, listeners, and cleanup         | Shared gesture behavior for views and separators     |
| `DragClickSuppression` in `dragClickSuppression.ts` | Temporary compatibility-click suppression after a drag                    | Preventing an accidental click when dropping an item |

## State and public contracts

Frame creates a reactive `Layout` behind its existing feature guards. Public
preference fields remain mutable through that same object. `geometry()` and
`maximizedBounds()` calculate results without mutating preferences. Layout reset,
Zen transitions, feature restrictions, and commands remain coordinated by Frame;
the model does not create a parallel layout store.

`DockRegistry` retains the existing `frame.docks` methods and immutable dock
snapshots. Registering returns a cleanup for that exact registration. Updates
validate before replacing a snapshot. Hiding is independent of unregistering;
host tracking lets the renderer preserve contributed component identity across
moves. Frame disposal clears dock registrations and measurements.

View-bar and status APIs explicitly delegate separator operations instead of
spreading a controller instance. This preserves their existing public methods
and computed values without exposing controller storage. Bound methods remain
usable as retained callbacks.

## Drag lifecycle

`BarDrag` owns a preview and a cancellable `PointerDrag`. Call its bound `cancel`
when the owning component unmounts. A pointer session ignores other pointer IDs,
activates after five pixels, refreshes hit testing on scrolling and resizing,
and releases listeners on completion, Escape, cancellation, blur, or replacement.
Starting a new gesture cancels only the session in the same workbench.

`DragClickSuppression` briefly outlives an active drag so the release-generated
click cannot activate content. It releases itself after that click, a release
cleanup timer, a new gesture, or focus loss. Each independently owned class has
its own file.

## Pure helpers

The folder also contains stateless geometry, hit-testing, icon, and menu helpers:
`layoutGeometry`, `maximizedRegionBounds`, `panelCoverage`, `clamp`, the functions
in `barInsertion.ts`, `regionIcon`, and `barContextActions`. They remain functions
so plain layout snapshots and independent callers can use them without creating
controllers. `defaultLayout()` creates an independent default preference model.
`barTypes.ts` contains data-only types. These do not need static-only classes.
