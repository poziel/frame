# Terminal module

Public entry: `@frame/core/modules/terminal`. The host supplies process execution;
importing the module and constructing controllers start no process.

| File                                | Responsibility                                                                                                       |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `controllers/terminal.ts`           | `TerminalSessionController`, the structural `TerminalController` API, and the `createTerminal()` convenience factory |
| `types/terminalTypes.ts`            | Backend, event, profile, session, and creation contracts                                                             |
| `services/xterm/terminalSurface.ts` | One retained `TerminalSurface` renderer and the controller/session surface cache                                     |
| `integrations/terminalView.ts`      | Explicit Frame view definition and toolbar action integration                                                        |
| `components/`                       | Vue session management and renderer presentation                                                                     |
| `styles/index.css`                  | Module presentation styles; xterm keeps its engine stylesheet import                                                 |

## Ownership and lifecycle

`TerminalSessionController` owns reactive session metadata, split groups,
selection, subscriptions, replay buffers, and pending process creation. Public
state is exposed through readonly Vue refs. Public methods remain bound when
passed as callbacks. `createTerminal(options)` returns the same class-backed
structural API; hosts may continue supplying compatible controller objects.

Profile discovery is explicit and cached, with failed reads retried on demand.
Creation preserves events delivered before the backend returns a process ID.
Disposal waits for pending creation, closes late processes, and attempts to close
every retained session. A failed close leaves its session available for retry.
The backend adapter itself remains host-owned.

`terminalSurface(controller, id)` lazily reuses one `TerminalSurface` per
controller/session pair. The surface owns xterm, addons, input and resize queues,
the output subscription, its DOM element, and its current host observer.
Detaching a Vue presentation preserves the renderer, output, and scrollback.
Closing the session emits `closed`, disposing the renderer and its cache entry.
Unmounting a presentation and closing its process remain distinct operations.

Supporting contracts are re-exported from the previous controller path to
preserve existing imports. Public module imports and factories remain unchanged.
See the [shared module structure](../README.md#shared-module-structure).
