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

## Notifications (core)

```ts
const notification = frame.notify({
  title: "Project saved", severity: "success",
  details: "All changes are saved.", source: "Editor", duration: 5000,
  action: { label: "Open settings", run: () => frame.openSettings() },
});
notification.close();
```

Frame shows notifications in the bottom-left of its shell, above the status bar. Severity is info (default), success, warning, or error. Duration defaults to 5000 milliseconds; zero stays until dismissed. Hover and keyboard focus independently pause the remaining timer. Notifications do not steal focus and use a polite live region. Action callbacks may return promises; duplicate activation is blocked while running, success closes the message, and failure displays an error notification.

Use `frame.notifications.dismiss(id)` or `clear()` for active messages. IDs must be unique among active messages. Frame disposal clears timers and subscriptions. `subscribe(listener)` receives future notifications and returns an unsubscribe function; this is how optional features collect events.

## Notification history (Extras)

The notification panel and bell are supplied by @frame/extras. Core does not render or register them. Create a history store before emitting notifications, mount NotificationPanel in FrameShell's overlays slot and NotificationIndicator in status-actions, and dispose the history on host unmount. The panel owns visibility and a bounded history (200 entries by default), independently of notification expiry and dismissal. Clearing history leaves active notifications alone.

See [Frame Extras](../packages/extras/README.md) for a complete composition example and [package boundaries](package-boundaries.md) for migration details and future feature candidates.
