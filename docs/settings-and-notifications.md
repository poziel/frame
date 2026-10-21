# Settings and notifications

Both features are enabled by default. Disable them independently with `createFrame({ settings: false, notifications: false })`, or change `frame.features.settings` / `frame.features.notifications` at runtime.

## Settings

A gear button is pinned to the bottom of the activity bar. Its default menu contains Settings. Replace `frame.manageMenuItems.value` with any FrameMenuItem list; items reference registered commands. The built-in `frame.settings` command and Ctrl+, open the standard movable/resizable modal, with maximize, restore, close, and Escape support. `frame.openSettings()` is also available when a FrameShell is mounted.

```ts
const unregister = frame.registerSettingsSection({
  id: "editor", title: "Editor",
  settings: [{
    id: "editor.autosave", label: "Autosave", type: "checkbox", default: true,
    onChange: value => { preferences.autosave = Boolean(value); },
    getValue: () => preferences.autosave,
  }],
  children: [{ id: "editor.font", title: "Font", settings: [
    { id: "editor.size", label: "Font size", type: "number", default: 14, min: 8, max: 40 },
  ] }],
});
```

Section IDs and setting IDs must each be globally unique in a Frame instance. Registrations return an idempotent disposer. Settings support text, textarea, checkbox, number, range, color, and select. Select options accept value, label, and optional description. All controls accept descriptions and disabled state; numeric controls accept min/max/step. FrameSettings and SettingControl are exported for reuse.

Read `frame.settings.values`, or use `frame.settings.set(id, value)` and `reset(id)`. Validation rejects invalid numeric bounds, value types, and unlisted select values. Optional getValue reads a reactive application-owned preference so changes made elsewhere stay synchronized. onChange applies/persists edits in the host; Frame does not write preferences to disk or browser storage automatically.

## Notifications

```ts
const notification = frame.notify({
  title: "Project saved", severity: "success",
  details: "All changes are saved.", source: "Editor", priority: "Normal", show: true,
});
notification.close();
```

Severity is info (default), success, warning, or error. Notifications remain until dismissed; they do not disappear on a timer. show opens the center; otherwise the bell indicates pending notifications. Newest notifications appear first. IDs may be supplied, but must be unique while present.

Use the status-bar bell or `frame.notifications.state.open` to show/hide the center. `frame.notifications.dismiss(id)` clears one; `clear()` clears all. The center supports expandable details, double-click expansion, Enter/Space expansion, and Escape to hide it. Buttons appear on hover or focus. Clear-all and hide are supplied; no mute control is displayed. Frame owns the presentation and in-memory list; the application owns notification generation and any persistence.
