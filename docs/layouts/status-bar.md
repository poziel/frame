# Status bar

Show text and actions at the left and right edges of the footer, with one text-only status message in the center. Register contributions through the root instance to retain visibility and placement control.

## Features

A status contribution is text or a button. Buttons may invoke actions or menus; text items carry information without action behavior. The center displays a persistent message or a temporary message with severity and duration.

Item visibility, bar visibility, availability, and side are separate preferences. Hiding the bar preserves contributions. Disposal clears contributions and message timers; domain resources remain application-owned.

Toolbar buttons can also use status placement through the [shared placement API](../shell/menus-and-toolbar.md#move-buttons-between-title-and-status-bars). The Playground uses an isolated Frame instance and resets when you leave this page.

## APIs

```ts
import {createFrame} from '@frame/core';

const frame = createFrame({status: {allowMove: true}});
const remove = frame.status.register({
  id: 'app.connection',
  kind: 'text',
  label: 'Connection',
  text: 'Connected',
  side: 'left',
  order: 10,
});
frame.status.set('Ready');
const dismiss = frame.status.show('Saved', {
  severity: 'success',
  duration: 3000,
});

frame.status.update('app.connection', {text: 'Offline'});
frame.status.move('app.connection', 'right');
frame.status.setBarVisible(true);

// When this contribution ends:
dismiss();
remove();
// When the owning shell ends:
frame.dispose();
```

Render `FrameShell` with the stable instance. Status buttons use `kind: 'button'` and a `run` callback. `activate(id)` invokes an available enabled button. `setVisible(id, value)` controls item visibility and `setBadgeVisible(id, value)` controls its badge. `clear()` clears persistent and temporary messages.

A temporary message defaults to info severity and 4000 ms. Duration zero keeps it until dismissed or replaced. A newer message supersedes an older dismiss callback. `status.allowMove: false` blocks user side moves and separator repositioning; host separator registration remains available.

See [status contributions](../shell/status-bar.md) and [creation options](../configuration/frame-options.md#status) for fields, ordering, and separators.

## Styling

Use Frame's status text, icon, badge, severity, and theme presentation rather than styling internal footer nodes. Keep the central message short and text-only. The left and right sections accept registered controls with accessible labels.

Use the `status-leading-actions` or `status-actions` slots only when custom content cannot use registration; slot content does not automatically gain the registered item's visibility and side controls. Shared [theme variables](../styling/theme-variables.md) and [density](../configuration/layout.md) determine shell appearance.
