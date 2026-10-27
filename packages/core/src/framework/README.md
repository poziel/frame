# Framework behavior

This folder owns application coordination, contracts, state, and lifecycle.
`frame.ts` contains the root `Frame` class; `useFrame.ts` owns Vue injection. Focused TypeScript implementations and
their contracts live in these domains:

| Folder           | Responsibility                                                                                                                                                   |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `commands/`      | Command registration, discovery, menus, and built-in actions.                                                                                                    |
| `configuration/` | Shared application options, host integration, module installation, and lifecycle hooks.                                                                          |
| `features/`      | Feature availability, live feature objects, and feature lifecycle gates.                                                                                         |
| `keybindings/`   | Shortcut assignment storage, normalization, resolution, hydration, and persistence.                                                                              |
| `preferences/`   | Shared preference documents, forms, search, and presentation.                                                                                                    |
| `layout/`        | Layout state, docking, geometry, and shared bar/drag behavior.                                                                                                   |
| `permissions/`   | Permission contracts, registration, state, and enforcement coordination.                                                                                         |
| `shortcuts/`     | Keyboard-event routing between shells and stateless shortcut parsing, matching, and capture.                                                                     |
| `settings/`      | Settings registration, documents, storage integration, commands, and presentation state.                                                                         |
| `views/`         | View registration and presentation state, navigation, bars, panels, status, and transient notifications. These are TypeScript services, not rendered view files. |
| `workspace/`     | Workspace state, tabs, navigation history integration, and workspace contracts.                                                                                  |

Vue presentation lives in `../components/framework/`. Independent controls and
their private behavior belong in `../components/`. Shared theme infrastructure
belongs in `../themes/`; optional capabilities belong in `../modules/`.

The public Core entry is `../index.ts`. Preserve per-instance state isolation,
registration cleanup, disposal contracts, and consistency between UI actions and
host API calls. Keep component-only helpers beside their component group. New
files should enter the owning domain rather than accumulate at this root. Stateful services use classes; pure helpers, Vue composables, and convenience
constructors remain functions.

Construct a root with `new Frame(options)`, then render it through `FrameShell`.
`createFrame(options)` is a convenience function returning the same class. The
class declares service properties and owns the coordination methods; it does not
wrap a second application object or forward to an older factory implementation.
Services keep their focused implementations and are isolated per root instance.

## Root coordination and service ownership

`Frame` constructs and connects the services, exposes bound convenience methods,
and disposes installed modules before shell resources. Its public methods delegate
to the same owners used by shell interactions; it does not keep parallel state.

| Responsibility                                                    | Owner                                                         |
| ----------------------------------------------------------------- | ------------------------------------------------------------- |
| View registration, hierarchy, movement, selection, retained hosts | `views/viewRegistry.ts`                                       |
| Resource-derived command definitions and contextual view labels   | `commands/resourceCommands.ts`                                |
| Command execution, visibility, permissions, and menu projection   | `commands/commandRegistry.ts`                                 |
| Picker requests, replacement, acceptance, cancellation            | `commands/quickInputController.ts`                            |
| Command-backed navigation contributions                           | `commands/navigationCommands.ts`                              |
| Feature-gated layout, Zen snapshots, layout restoration           | `layout/shellLayout.ts`                                       |
| Workspace and view navigation capture and restoration             | `views/shellNavigation.ts`                                    |
| Settings and shortcut editor presentation requests                | `preferences/preferenceLauncher.ts` (one instance per editor) |
| Modal stacking and transient-interaction cancellation             | `views/modalRegistry.ts`                                      |
| Workspace banner registration and visibility                      | `workspace/workspaceBanner.ts`                                |
| Toolbar action contributions and command/status integration       | `views/toolbarContributions.ts`                               |
| Manage menu and its status contribution                           | `views/manageMenu.ts`                                         |
| Bounded session messages                                          | `configuration/activityLog.ts`                                |

Service dependency interfaces declare only their required peers. Getters in the
composition root defer access where services refer to one another during setup;
constructors must not eagerly read a peer that has not been connected yet.
Service-owned observers use detached scopes so stopping a caller's Vue scope does
not disable a live Frame. `dispose()` stops those observers and releases owned
registrations. Public types live beside the service that owns their meaning.
