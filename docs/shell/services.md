# Banners, modals, settings, and notifications

These services present host-owned content through the same Frame instance. Examples assume the referenced Vue components and host callbacks are imported or defined in your application.

## Banner

```ts
const removeBanner = frame.registerBanner({
  id: 'myapp.notice', label: 'Notice', component: NoticeBanner,
  props: { message: 'Review your changes' },
});
frame.openBanner();
```

One banner may be registered. Fields are required `id`, `label`, `component`, and optional `props`. Use `closeBanner()` and `toggleBanner()` for presentation, or the registration cleanup to remove it. Configure `frame.layout.bannerHeight` and `bannerAlignment`; hiding retains content. See [workspace banner](workspace.md#banner).

## Modal

```ts
const modal = frame.openModal({
  id: 'myapp.properties', title: 'Properties', component: PropertiesView,
  props: { documentId: 'document-1' }, width: 640, height: 480,
});
// When the task completes:
modal.close();
```

Required fields: `id`, `title`, and `component`. Optional fields: `props`, `icon` (Vue component), `actions` (view header actions), `width`, `height`, and `maximized`. Opening an existing ID brings its current definition forward; it does not replace its props/component. Use `closeModal(id)` to close a named modal or `closeModal()` for the topmost one. These are shell-local presentations, not native windows.

## Settings

```ts
const removePreferences = frame.registerSettingsSection({
  id: 'myapp.preferences', title: 'Application',
  settings: [{
    id: 'myapp.autosave', label: 'Autosave', type: 'checkbox', default: true,
    onChange: value => { saveAutosavePreference(Boolean(value)); },
  }],
});
frame.openSettings();
```

Enable Settings with `settings: true` (the default). A section requires `id` and `title`, and accepts `description`, `settings`, and nested `children` sections. A setting requires `id`, `label`, `type`, and `default`. Types are `'text'`, `'textarea'`, `'number'`, `'checkbox'`, `'select'`, `'range'`, and `'color'`.

Optional setting fields are `description`, `placeholder`, `min`, `max`, `step`, `options` (select items), `disabled`, `getValue`, and `onChange`. Values are strings, numbers, or booleans. `getValue` reads host-owned state and `onChange` updates it; persistence remains a host decision. Return the registration cleanup when removing an application's settings contribution.

## Notifications

```ts
frame.notify({
  title: 'Export complete', severity: 'success',
  details: 'Your file is ready.', duration: 5000,
  action: { label: 'Open', run: () => openExport() },
});
```

`title` is required. Optional fields are `id`, `severity`, `details`, `source`, `priority`, `duration`, and `action: { label, run }`. Severity is `'info'`, `'success'`, `'warning'`, or `'error'`. Notifications expire after five seconds by default; zero duration keeps one until explicitly dismissed. `notifications: false` disables their Shell presentation, not the underlying service.

Notification history is optional and belongs to [Features](../../packages/features/README.md). Core does not install a history panel or bell automatically.

## Custom overlays

Use `FrameShell`'s `overlays` slot for custom floating content. It receives `{ bounds, target }`. Content is hosted within the shell's measured overlay boundary. If your component teleports its own popup, use `target` rather than `document.body`. See [overlay boundaries](../configuration/layout.md#overlay-boundary).
