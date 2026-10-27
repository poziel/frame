# Settings implementation

Settings belong to one Frame instance. The host supplies field definitions,
domain callbacks, and optional file/clipboard access. The controller coordinates
validation, values, serialization, commands, and cleanup.

| Class or file                                     | Owns                                                                                    | Example                           |
| ------------------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------- |
| `Settings` in `settings.ts`                       | Section registration, field lookup, override documents, hydration and serialized writes | `frame.settings.set(id, value)`   |
| `Setting` in `setting.ts`                         | Operations on one exact field registration                                              | `frame.settings.get(id)?.reset()` |
| `SettingsCommands` in `settingsCommands.ts`       | Field reset and copy command registrations and their watcher                            | The field row's More Actions menu |
| `SettingsFileStorage` in `settingsFileStorage.ts` | Reading and writing one host-authorized file handle                                     | `new SettingsFileStorage(handle)` |
| `settingsTypes.ts`                                | Host storage, clipboard, editor, and copy contracts                                     | A native storage adapter          |

## Item and controller operations

`Settings.get(id)` returns the same `Setting` handle for the lifetime of a field
registration. The handle exposes `id`, `definition`, `value`, `active`, and
`modified`, plus `set(value)`, `reset()`, and `copy(format)`.

```ts
const size = frame.settings.get('editor.fontSize');
size?.set(18);
frame.settings.set('editor.fontSize', 18); // Same validation and write path.
size?.reset();
await frame.settings.flush();
```

An old handle cannot modify a replacement registration, even if the application
reuses the same definition object and ID. Unregistering the section invalidates
its handles. Disposing Settings invalidates all remaining handles and releases
owned observers; it does not dispose host services.

Sections and field definitions remain data supplied by applications. Custom
controls receive the existing definition contract. They do not have to construct
framework classes or adopt a second domain model.

## Values and persistence

Effective reads prefer a host `getValue` callback, then controller fallback
values, then the registered default. Both item and controller edits use one
validation path and invoke `onChange` before updating fallback values. Host
business side effects remain the host's responsibility.

Unknown scalar overrides survive until their plugin registers. Local edits win
against an initial read that finishes later. JSON replacement validates all
known changes before invoking callbacks. Persistence remains override-only,
with ordered writes, visible errors, and explicit `load()` and `flush()`.

Lookup uses maps, the section projection is computed, and JSON serialization
collects effective overrides once per call. Command bindings observe section
registration rather than creating a watcher for every field. A detached Vue
scope keeps controller-owned observers independent of temporary caller scopes.
These are implementation properties, not benchmark claims.

## Shared preference infrastructure

Settings delegates form/JSON mode, search, editor registration, and draft state
to the existing `PreferencePage`. Settings and keyboard shortcuts continue to
share the preference document and modal/tab presentation infrastructure under
`../preferences/`. The shell imports that presentation directly; the old
settings-specific re-export files are removed.

`createSettingsFileStorage(handle)` remains a public convenience factory and
returns a `SettingsFileStorage` instance. Both forms are lazy: construction does
not read a file, request permission, or open a writable stream.
