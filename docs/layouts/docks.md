# Docks

Attach application-owned Vue content to a shell edge. Docks suit tool strips and contextual controls that must follow a workspace, sidebar, view bar, panel, navigation bar, or status bar.

## Features

A dock registration is independent of sidebar and panel view registrations. The anchor determines what it follows; its edge is a physical top, right, bottom, or left edge.

Inside placement reserves space inside the anchor, outside placement reserves adjacent space, and overlay placement floats inside without reserving space. Hidden anchors retain attachments; unavailable features suppress their docks. Hiding, moving, or changing dock appearance preserves its component state. Removing a registration ends its presentation lifecycle.

Frame owns placement and cleanup of registered presentations. Application components retain responsibility for domain data, connections, and persistence. The Playground has an isolated Frame instance and resets when you leave this page.

## APIs

```ts
import {createFrame} from '@frame/core';
import ToolStrip from './ToolStrip.vue';

const frame = createFrame();
const remove = frame.docks.register({
  id: 'app.tools',
  label: 'Document tools',
  component: ToolStrip,
  anchor: 'workspace',
  edge: 'bottom',
  placement: 'outside',
  padding: 'normal',
});
frame.docks.update('app.tools', {
  anchor: 'primarySidebar',
  edge: 'top',
});
frame.docks.hide('app.tools');
frame.docks.show('app.tools');

// When the contribution ends:
remove();
// When the owning shell ends:
frame.dispose();
```

Pass the stable root to `FrameShell`; descendants can obtain it through `useFrame()`. `get(id)` reads a dock, `items.value` exposes normalized reactive registrations, and `resolve(id)` reports effective availability, visibility, and region. `setVisible`, `toggle`, and `remove` provide explicit runtime control.

Optional `props` pass host data to the component. `order` sorts docks sharing a location; positive `width` and `height` override automatic dimensions. Outside docks respect the protected sidebar/view-bar pair. Top/bottom docks own corners when perpendicular docks share an anchor.

See [dock registration and runtime contracts](../shell/docks.md) for all anchors, placement sizing, and lifecycle rules.

## Styling

`appearance: 'padded'` provides the themed surface and padding. `basic` keeps the surface without padding, while `none` removes the background, border, radius, shadow, and padding. Use `placement: 'overlay', appearance: 'none'` for a floating toolbar.

`padding` accepts `normal`, `small`, or `none`; theme spacing determines the inset. Compact shell density removes the placement gap and rounding. Overlays fit within anchor bounds, with transparent surrounding lanes passing input through. Use shared [theme variables](../styling/theme-variables.md) inside dock content and [layout](../configuration/layout.md) for density and responsive bounds.
