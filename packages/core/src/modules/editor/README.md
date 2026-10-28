# Editor module

Public entry: `@frame/core/modules/editor`. Standalone editors require no Frame.
Importing the module, installing `editorModule`, and creating a controller load
no Monaco engine and create no model or editor widget.

| File                                                  | Responsibility                                                                            |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `controllers/codeEditor.ts`                           | `EditorController`, the existing `createCodeEditor()` factory, and pure option resolution |
| `types/codeEditorTypes.ts`                            | Structural controller, component props, and Monaco option contracts                       |
| `controllers/editorSurface.ts`                        | One mounted widget, model, event subscriptions, and asynchronous syntax revisions         |
| `services/monaco/codeEditorRuntime.ts`                | `CodeEditorRuntime`, shared lazy engine loading, and language alias bookkeeping           |
| `services/monaco/preparedCodeEditor.ts`               | One syntax preparation and explicit Shiki-to-Monaco activation                            |
| `components/CodeEditor.vue`                           | Vue props, watchers, events, mount/unmount, and loading/error presentation                |
| `integrations/`                                       | Typed module installation and settings JSON editor integration                            |
| `integrations/settings/settingsEditorRegistration.ts` | Paired JSON editor registrations, partial-install rollback, and idempotent cleanup        |
| `components/CodeEditor.vue`                           | Editor presentation styles                                                                |

## Ownership and callbacks

`EditorController` lends imperative operations to one attached Monaco widget.
It exposes a readonly reactive reference and bound methods, so callers can pass
operations as callbacks. Attachment returns an idempotent release; stale cleanup
cannot detach a newer widget. Releasing a controller does not dispose Monaco.
Host replacements use model edit operations and undo boundaries, including when
user editing is read-only.

`EditorSurface` owns the widget and model and releases them on unmount. It also
owns subscriptions, controlled-value synchronization, controller handoff, and a
revision counter that rejects stale syntax results. Vue keeps its own lifecycle
and watchers; the controller does not require a component or Frame instance.

`CodeEditorRuntime` owns one lazy Monaco import promise and Shiki language IDs.
The module-level runtime preserves the existing shared-engine behavior and
allows failed imports to retry. `prepare()` returns a `PreparedCodeEditor`
without activating it. After checking its revision, a surface activates that
request, preserving canonical language services and the shared Shiki palette.
Construction and preparation never transfer ownership of models to the runtime.

Public factories, component exports, and structural contracts remain unchanged.
The prior controller path re-exports shared types for existing imports. Pure
option resolution remains a function because it owns no state or lifecycle.
See the [shared module structure](../README.md#shared-module-structure).

```ts
import {EditorController, createCodeEditor} from '@frame/core/modules/editor';

const editor = new EditorController();
const equivalent = createCodeEditor();
// Pass either controller as CodeEditor's editor prop.
const focus = editor.focus; // Bound operations can be passed independently.
```
