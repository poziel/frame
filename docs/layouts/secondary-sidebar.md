# Secondary sidebar

Provide contextual inspectors and supporting tools opposite the primary sidebar. Register Vue content once and let the root Frame instance coordinate selection, visibility, placement, and lifecycle.

## Features

The content region and its view bar have separate responsibilities: views contain application UI, and the view bar selects those registered views. Registering a view supplies its selector; do not register a second navigation action just to create a view-bar item.

Set `frame.layout.primarySide` to swap the primary sidebar and its selector; the secondary sidebar occupies the opposite side. Each sidebar view bar supports default, top, bottom, or hidden placement. View-bar placement changes the selector without recreating application content.

Views preserve their Vue component state while hidden, inactive, or moved. Closing the region hides presentation; unregistering removes the contribution and unmounts content. Application-owned document and backend resources keep their own lifecycle.

Use `features` to disable a capability when it must be unavailable. Hiding a bar or closing a region preserves its registrations and is a presentation preference. The Playground uses an independent Frame instance, so its changes reset when you leave this page.

## APIs

The host imports its own `ToolView` component, creates a stable root, and renders it through `FrameShell`:

```ts
import {createFrame} from '@frame/core';
import ToolView from './ToolView.vue';

const frame = createFrame({
  features: {secondarySidebar: true},
  secondaryViewBar: {display: 'both', allowAddSeparator: true},
});
frame.layout.secondaryWidth = 240;
const remove = frame.registerView({
  id: 'app.tools',
  label: 'Tools',
  component: ToolView,
}, 'secondary');

frame.openView('app.tools');
frame.secondaryViewBar.setPosition('bottom');
frame.layout.primarySide = 'left';
frame.secondaryViewBar.setSize('compact');
frame.secondarySidebar.toggle();

// When the contribution ends:
remove();
// When the owning shell ends:
frame.dispose();
```

`openView(id)` finds the view's current region after movement. `setViewVisible(id, false)` hides its content without unregistering; `moveView(id, 'secondary')` changes its region. Duplicate view IDs are rejected. Keep and call registration disposers when features end before the root is disposed.

The view-bar controller supports `setDisplay('icons')`, `setSize('compact')`, `setBadge(id, value)`, `setBadgeVisible(id, value)`, and `close()`. Use `resetPresentation()` to restore presentation without recreating application views. Registered separators have their own cleanup; user creation requires `allowAddSeparator`.

See [views](../shell/views.md), [view bars](../shell/view-bars.md), and [creation options](../configuration/frame-options.md#view-bars-and-panel) for definitions, initial hidden lists, defaults, and separator behavior.

## Styling

Use the root layout/controller APIs for region sizing and selector presentation. Theme variables control the shared shell surface and typography. Application content can use the same `--frame-*` variables for [colors, spacing, and typography](../styling/theme-variables.md).

View definitions support `padded: false` for edge-to-edge content, `titleColor` for a reactive heading accent, and optional fixed `top`/`bottom` components outside the middle scrollbar. Keep application CSS scoped to that content. [Layout density and sizing](../configuration/layout.md) explain compact mode, resize handles, responsive overlays, and retained preferred dimensions.
