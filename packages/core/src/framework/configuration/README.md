# Configuration implementation

This folder contains shared Frame configuration contracts and the objects that
own feature, host, module, and notification lifecycles. Public contracts live
beside their owning services and controls; there is no catch-all types module.

| Object or file                | Responsibility                                                                                      |
| ----------------------------- | --------------------------------------------------------------------------------------------------- |
| `Feature`                     | One feature's availability and state subscriptions                                                  |
| `FeatureRegistry`             | Per-Frame feature lookup, dependency checks, and lifecycle                                          |
| `HostController` in `host.ts` | Per-Frame host coordination; retains explicit file/external adapters and owns its window controller |
| `HostWindowController`        | Native state subscription, capability checks, window operations, and browser fullscreen observation |
| `BrowserHost`                 | Default browser adapter, composed from lazy file and URL services                                   |
| `BrowserHostFiles`            | Temporary file-picker input and per-request listener cleanup                                        |
| `BrowserHostExternal`         | Validated browser URL opening                                                                       |
| `externalUrl.ts`              | Pure portable URL protocol validation, shared with native adapters                                  |
| `ModuleRegistry`              | Module ID/key reservations, capability publication, and reverse-order cleanup                       |
| `Notifier`                    | Explicit callback delivery with subscription IDs                                                    |
| `StateObserver`               | Internal bridge from reactive owner state to notifier delivery                                      |
| `useWindowControls`           | Vue lifecycle and computed presentation of the existing host controller                             |

## Host ownership

`createFrame()` constructs a `HostController`, available as `frame.host`.
It creates its own `HostWindowController`, available as `frame.host.window`.
The controller's `state` and `error` are the same readonly projections exposed
by the window controller, rather than independent copies.

Native observation subscribes before the initial state read. A newer native
event prevents an older asynchronous read from overwriting state. Disposal
releases subscriptions even when subscription setup completes late, and never
closes or disposes the application's host services.

Browser construction does no DOM work. File selection and URL opening happen
only when requested. Browser fullscreen observation starts when a mounted shell
attaches its document. Reattaching the same document is idempotent; switching
documents removes the previous listener.

Applications can continue implementing the structural `FrameHost`, `HostWindow`,
`HostFiles`, and `HostExternal` interfaces with objects or their own classes.
`createBrowserHost()` remains a public convenience factory backed by
`BrowserHost`. Custom adapters do not silently inherit browser services.

## Module ownership

`Frame.use(descriptor)` delegates to its internal `ModuleRegistry`. Descriptors
remain typed interfaces so optional modules can supply ordinary objects.
Installing the same descriptor twice is harmless; conflicting IDs, existing
Frame properties, and keys reserved by an in-progress installer are rejected.

The registry publishes a capability only after installation succeeds. If Frame
disposal occurs during installation, the newly returned resources are released.
Normal disposal releases installed modules in reverse order, removes their
capability properties, and continues after individual cleanup errors before
reporting those failures together. Core does not import module implementations.

## Why window controls remain a function

`useWindowControls(frame)` is a Vue composable called during component setup.
It registers document attachment with `onMounted` and creates computed values
for maximized, fullscreen, and fullscreen availability. Its returned operations
are already bound to the existing window controller.

It owns no second window controller or application state. Unmounting a consumer
does not dispose the host; the Frame owns that lifecycle. Its documented
`WindowControls` interface describes the component-facing projection.

Existing specialized controllers are combined with shell presentation through
`../views/withPresentation.ts`. Feature and presentation imports target their
owning implementation files directly.

## Contract ownership

| Contract                                              | Owning file                                                           |
| ----------------------------------------------------- | --------------------------------------------------------------------- |
| `FrameOptions`                                        | `../frame.ts`                                                         |
| `ActivityEntry`                                       | `activityLog.ts`                                                      |
| Banner definitions                                    | `../workspace/workspaceBanner.ts`                                     |
| Navigation history snapshot                           | `../views/shellNavigation.ts`                                         |
| Active picker request                                 | `../commands/quickInputController.ts`                                 |
| `CommandOptions`                                      | `../commands/command.ts`                                              |
| View definitions, content slots, regions, and actions | `../views/shellViewContainer.ts`                                      |
| Toolbar actions and feature bridges                   | `../views/toolbar.ts`                                                 |
| Navigation adapter options                            | `../views/navigation.ts`                                              |
| Notification options and live snapshots               | `../views/notifications.ts`                                           |
| Workspace panes and layout nodes                      | `../workspace/workspaceTypes.ts`                                      |
| Field definitions, values, and custom-control props   | `../settings/setting.ts`                                              |
| Settings sections                                     | `../settings/settings.ts`                                             |
| Picker items and options                              | `../../components/framework/quickPick.ts`                             |
| Modal options and definitions                         | `../../components/framework/modal.ts`                                 |
| Menu items                                            | `../../components/navigation/generalMenu.ts`                          |
| Runtime select base and its union type                | `../../components/forms/shared/selectItem.ts`                         |
| Runtime select option and separator classes           | `../../components/forms/shared/selectOption.ts`, `selectSeparator.ts` |

Internal imports target these owning files directly. Cross-domain contracts use
`import type` so type dependencies do not load another service's implementation.
The package root remains the public export surface; consumer import names and
plain-object registration contracts remain unchanged.
