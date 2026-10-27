# Application settings

Applications register sections and scalar fields with `frame.settings.register`.
Use `frame.openSettings()` (Ctrl+comma) for the settings window. If a workspace pane is tabbed or empty and unowned, the window offers **Open Settings in Editor
Tab**. `frame.openSettingsInTab()` uses that same action and returns false when
tabs or Settings are unavailable. Reopening activates the existing tab rather
than creating a duplicate. User tab creation permissions do not control this
Frame-owned registration.

Hovering or focusing a field highlights its row with a complete focus outline.
A separate vertical bar outside its leading border identifies values different
from the registered default. Hovering or focusing an unchanged field never
creates a bar. `--frame-settings-modified-gap` controls the space between the
indicator and outline (default 4px). The outline also stays active while focus
is in an owned dropdown or menu rendered through a portal. The
row's **More Actions** menu is available on every field, by mouse or keyboard:
Reset Setting, Copy Setting ID, Copy Setting as JSON, and Copy Setting as URL.
Copies use the effective value, including a host's `getValue` callback.

Provide a `description` for every setting and section. Field descriptions and
selected-option explanations appear between the label and control. The optional
properties remain compatible with older registrations; Frame does not invent
application-specific descriptions.

Each setting can provide a custom `component` and `props`. Frame retains its
label, description, modification bar, actions, validation, and persistence.
The component receives `SettingComponentProps` (`setting`, `modelValue`,
`inputId`, `disabled`) and an `aria-describedby` attribute. Emit
`update:modelValue` to change the value through the settings controller.
A custom control can compose a `FrameFieldGroup` with a select and a related
button in its suffix slot, keeping actions such as “Test provider” beside the
value they apply to. Ordinary visual controls remain usable without a Frame.

## JSON persistence

Frame now owns serialization and automatic write scheduling. The host owns the
file location and access adapter. Configure it explicitly:

```ts
const frame = createFrame({ settings: {
  storage: {
    read: () => applicationFiles.readSettings(), // string or undefined if missing
    write: json => applicationFiles.writeSettings(json),
  },
  // Optional native integration:
  writeClipboard: text => applicationClipboard.writeText(text),
  url: id => `myapp://settings/${encodeURIComponent(id)}`,
} });
```

The adapter should write `settings.json` in the host application's user
configuration directory, using its own file permissions and atomic file-write
policy. No path is inferred by Core. Without a storage adapter, settings remain
session-only; Core does not silently create files or choose browser permissions.
For a browser file handle already selected and authorized by the user, use
`createSettingsFileStorage(handle)`. Creating that adapter performs no I/O.

The file is a flat JSON object containing only non-default values. Returning to
a default removes that key. Reads start when the configured Frame is created;
`await frame.settings.load()` waits for hydration. Edits made while loading win
over the incoming values. Unknown scalar keys are retained for contributions
registered later. Unregistering a contribution retains its user overrides.
Values support the existing string, boolean, and finite-number settings model.

```ts
frame.settings.getOverrides();
frame.settings.toJSON();
frame.settings.applyJSON('{"editor.fontSize": 18}');
await frame.settings.flush();
```

`applyJSON` replaces the override object: omitted known settings reset to their
defaults. Syntax, value types, constraints, and disabled fields are checked
before applying changes. Host `onChange` callbacks remain responsible for their
own business side effects. Writes are serialized, failures are exposed through
`settings.error.value`, and invalid file reads do not overwrite the file. Call
`flush()` before tearing down the application to await pending writes. Frame
disposal cancels further scheduling; it does not dispose host file services.

## Optional JSON editor

```ts
import { createFrame } from '@frame/core';
import { editorModule } from '@frame/core/modules/editor';
const frame = createFrame().use(editorModule);
frame.openSettingsJSON();
// Module registrations are released by frame.dispose().
```

Registering `editorModule` automatically adds the **Open Settings (JSON)** action. It switches an existing settings modal or tab in place; no second dialog or editor tab is created. The modal keeps its position, dimensions, and maximized state. Its title becomes `settings.json`. Without an existing settings presentation, Frame uses a tab when available, otherwise a modal.

The header offers **Save** followed by **Open Settings (UI)** to return to normal settings. Other header actions stay to the left of the separator before the maximize control. The editor has no separate filename/Save toolbar. Save is disabled until the draft changes and while a save is pending. **Ctrl+S** (or **Cmd+S**) saves from the editor. Switching back discards unsaved edits; typing alone never changes effective settings or schedules a file write.

The editor shows only overrides and applies valid edits through the same settings controller. Save writes through the configured storage adapter. Invalid JSON or stale drafts show an error without overwriting current settings. Return to normal settings and reopen JSON to refresh a stale draft.

Host APIs share the same state: `frame.settings.mode.value` is `'form'` or `'json'`; `frame.settings.json` exposes `draft`, `dirty`, `saving`, `error`, and `save()`. Use `frame.openSettingsJSON()` to open or switch to JSON and `frame.settings.showForm()` to return to the form in its current presentation. Standalone `<CodeEditor>` and `frame.editor.create()` remain independently usable. Monaco is loaded when its surface opens, not when the module is registered.

Hosts can supply another editor with
`frame.settings.registerEditor({ component, props })`; the component can use
`useFrame()` to access serialization, validation, and persistence.

## Setting links and styling

`frame.openSetting(id)` selects a field's section and opens Settings. The default
copied URL uses the current application URL with `#frame-setting=<encoded-id>`;
hosts can route that fragment to `openSetting` or provide their own `settings.url`
function for native schemes. Clipboard defaults to the browser clipboard API.

Rows use shared theme colors and expose `--frame-settings-field-hover-background`,
`--frame-settings-modified-border`, `--frame-settings-field-padding`, and
`--frame-settings-field-gap`. Standard controls remain independently usable;
the settings row menu and presentation belong to the Frame shell.

## Shared preference presentation

Settings and Keyboard Shortcuts use the same form/search/JSON page model and
header actions. `openSettingsInTab()` can convert an empty, unowned plain pane
to tabs; artwork is not required. `openSettingsInModal()` moves it back. Search
text, the JSON draft, and mode survive moves between modal and tab. Moving a
page does not save its draft. Use `settings.search.value` to control search.

Set `visible: false` on a setting to keep it out of the form but include it in
JSON persistence. Set `persist: false` for contextual controls that should not
be saved or reset by the global configuration file.

## Live setting objects

`frame.settings` is a `Settings` instance. Existing section registration and
controller methods remain available. Use `get(id)` for operations on a single
registered field:

```ts
const size = frame.settings.get('editor.fontSize');
size?.set(18);
size?.reset();
await size?.copy('json');
```

The returned `Setting` has `value`, `modified`, `active`, and `definition`
properties. It remains the same object until its registration ends. Retained
objects cannot edit a later registration with the same ID. Controller methods
such as `set(id, value)` and `reset(id)` delegate to those same objects.

`SettingsFileStorage` is also available as a class for host-selected file
handles; `createSettingsFileStorage` remains available with the same behavior.
See the [settings implementation guide](../../packages/core/src/framework/settings/README.md)
for ownership, lifecycle, and shared preference infrastructure.
