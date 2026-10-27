# Docks

Docks attach application-owned Vue content to a shell region. Use `frame.docks` for tool strips, contextual controls, or other arbitrary content that needs to follow an anchor. Each registration is independent; sidebar and panel views keep their existing lifecycle.

Open `#/docks` in the documentation application for an interactive playground with registration, placement, anchor visibility, availability, density, and movement controls. Its sample input and counter demonstrate retained component state.

```ts
import { createFrame } from '@frame/core';
import ToolStrip from './ToolStrip.vue';

const frame = createFrame();
const unregister = frame.docks.register({
  id: 'editor.tools',
  label: 'Editor tools',
  component: ToolStrip,
  props: { documentId: 'draft' },
  anchor: 'workspace',
  edge: 'bottom',
  placement: 'outside',
  padding: 'normal',
});

frame.docks.update('editor.tools', { anchor: 'primarySidebar', edge: 'top' });
frame.docks.hide('editor.tools');
frame.docks.show('editor.tools');
unregister(); // Call when the owning feature or component is disposed.
```

## Registration

| Field | Meaning |
| --- | --- |
| `id`, `label` | Unique registration ID and accessible description |
| `component`, `props?` | Vue component and optional application props |
| `anchor` | `workspace`, `primarySidebar`, `secondarySidebar`, `panel`, `primaryViewBar`, `secondaryViewBar`, `panelViewBar`, `navigationBar`, or `statusBar` |
| `edge` | Physical `top`, `right`, `bottom`, or `left` edge of the anchor |
| `placement` | `inside` reserves space within the anchor; `outside` reserves adjacent layout space; `overlay` floats inside the anchor without reserving space |
| `appearance?` | `padded` (default) preserves the themed surface and padding; `basic` keeps the surface without padding; `none` removes the background, border, radius, shadow, and padding |
| `padding?` | `normal` (default), `small`, or `none` |
| `width?`, `height?` | Explicit positive pixel dimensions; omit for automatic sizing |
| `visible?` | Initial presentation visibility; defaults to `true` |
| `order?` | Ordering among docks sharing a location; defaults to `0` |

Outside top/bottom docks default to the anchor’s full width and content height. Outside left/right docks default to its full height and content width. Explicit dimensions override these defaults. Outside docks around a sidebar respect the sidebar and its view bar as a protected pair, so a dock does not separate the selector from its content.

Inside docks share an internal layout with the anchor's content. They shift and resize that content instead of covering it, keeping its scrollbar in the remaining content area. Sidebar and panel preferred content sizes are retained when the available window space allows. In default density docks use the shell’s `--frame-spacing-small` inset and themed rounding. Compact density removes the gap and rounding. Padding independently controls the content inset. Application content should use shared `--frame-*` theme tokens.

When perpendicular docks share an anchor, top and bottom docks own the corners:
they span across adjacent left/right docks, which occupy the height between them.
This fills corner gaps without overlapping content. Explicit width or height
overrides can intentionally produce a shorter dock.
The default theme defines small spacing as 4px and normal spacing as 10px. Docks
read those tokens rather than fixing the values, so application themes can change
them. `padding: 'none'` removes the dock's content padding without changing its
placement gap.

## Runtime controls and lifecycle

`frame.docks.items.value` exposes normalized reactive entries. `get(id)` reads an entry; `update(id, patch)` edits an existing registration and returns whether it exists. `remove(id)` or the unregister function removes it. `setVisible(id, value)`, `show(id)`, `hide(id)`, and `toggle(id)` control presentation independently of other docks.

`resolve(id)` reports `{ available, visible, region }` for inspecting the effective attachment. A hidden anchor collapses while retaining the attachment. Disabling its feature suppresses its docks. Moving an anchor moves the attachment with it; edges remain physical edges. Hiding, showing, or moving a dock retains its Vue component identity and local state. Removing it ends that registration’s lifecycle.

Keep unregister functions in the owning component or feature and call them during cleanup. `frame.dispose()` also releases Frame-owned registrations. Domain data and persistence remain the application’s responsibility.


## Floating content

Use `placement: 'overlay', appearance: 'none'` for a floating toolbar. Overlay docks remain inside the anchor's content bounds and reserve no layout space. Their content-sized hit area accepts input; transparent surrounding lanes pass input through. Top/bottom overlays center horizontally; left/right overlays center vertically. They retain the normal small edge inset, fit within available space, and scroll when their content is too large. A hidden anchor hides its overlay rather than relocating it outside; disabled anchors suppress it. Switching placements and appearances retains component state. `padding` applies to the `padded` appearance; `basic` and `none` use zero padding.
