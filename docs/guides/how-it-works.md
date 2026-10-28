# How Frame works

One root `Frame` instance coordinates a shell. `FrameShell` renders it, while application components contribute content and use its public controllers.

## One instance and one lifecycle

Create an instance once for each shell, usually in the host's Vue setup. `FrameShell` provides that instance to descendants through `useFrame()`. UI actions and application API calls use the same registration, command, layout, workspace, and service behavior.

Frame delegates to focused controllers. `frame.workspace` coordinates panes and tabs; `frame.layout` holds layout preferences; `frame.status` manages status contributions. Keep domain data and backend access in application components and services rather than creating a parallel shell store.

Call `frame.dispose()` when the owning application shell ends. Keep registration disposers when a contribution may end sooner. Application-owned resources, such as backend connections, require application cleanup.

## Content and placement

A view definition supplies a Vue component, metadata, and optional props. `frame.registerView(definition, region)` registers it in `primary`, `secondary`, or `bottom`. `frame.openView(id)` reveals it in its current region, even after a move. Workspace panes use `frame.setWorkspacePane`; document tabs use `frame.workspace.registerTab`.

Hiding a region preserves its registered content. Unregistering ends the presentation and unmounts its component. Disposing a host-owned controller or backend remains a separate decision.

See [views](../shell/views.md), [workspace](../shell/workspace.md), and [layout](../configuration/layout.md) for complete contracts.

## Packages follow responsibility

| Entry point                       | Responsibility                                                                                        |
| --------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `@frame/core`                     | Root instance, shell, shared services, and reusable controls                                          |
| `@frame/core/modules/*`           | Optional editor, chat, terminal, viewer, and notification-history implementations shipped inside Core |
| `@frame/themes`                   | Optional theme presets                                                                                |
| `@frame/tailwind`                 | Optional build integration whose generated utilities reference runtime theme variables                |
| `@frame/tauri`, `@frame/electron` | Explicit native host adapters                                                                         |

Core's main entry does not import optional modules or documentation examples. Module imports do not authenticate, send AI requests, or start processes. The host explicitly creates and activates resources with its own adapters.

## Installed capabilities

The typed chained `frame.use(moduleDescriptor)` installer and `editorModule` are implemented. Installing the editor descriptor also enables settings JSON editing. A descriptor declares its own capability key; callers do not supply aliases.

Other module descriptors and a Frame-owned chat factory remain architectural targets. Use each current module's documented explicit creation contract until its descriptor is implemented. Creating a chat and registering a shell view are separate responsibilities; chat creation must not implicitly create a sidebar.

See [optional modules](../../packages/core/src/modules/README.md) and [package boundaries](../reference/packages.md).

## One theme across the interface

The shell, controls, and application content can share `--frame-*` variables for colors, typography, spacing, radii, shadows, and motion. Tailwind is optional build tooling. It is configured by the host build and is not installed with `frame.use()`.

Use [theme variables](../styling/theme-variables.md) for application styling and [creation options](../configuration/frame-options.md) for instance configuration. Continue with [getting started](getting-started.md) to mount a shell.
