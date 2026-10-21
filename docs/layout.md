# Layout controls

The title-bar Customize Layout button opens a persistent, keyboard-accessible settings panel. Changes apply immediately and the panel stays open. Its reset button restores the default layout and exits fullscreen; Escape or the close button dismisses it.

All layout preferences are session-only. They are exposed as the typed `frame.layout` object; hosts can set initial values immediately after `createFrame()` and can read or change them later. No app business state is stored in these settings.

## Visibility

- **Menu Bar** shows application menu groups in the title bar. When hidden, the same menu tree is available from the first button in the activity rail.
- **Activity Bar** hides the rail without hiding an open primary sidebar.
- **Primary Side Bar** toggles the currently selected primary view (Ctrl+B).
- **Secondary Side Bar** toggles the tabbed secondary region (Ctrl+Alt+B).
- **Panel** toggles the tabbed bottom region (Ctrl+J).
- **Banner** shows host-owned content above the workspace when a banner has been registered.
- **Status Bar** removes or restores the bottom status area.

If both the menu bar and activity rail are hidden, use Customize Layout or Quick actions to restore them. These controls remain available in the title bar. Ctrl+P, Ctrl+Shift+P, and Ctrl+T open Quick actions even when the search button is hidden.

## Placement

`primarySide` is `left` or `right`. The activity rail moves with the primary sidebar; the secondary sidebar always occupies the opposite side. Title-bar sidebar icons mirror their physical positions.

`panelAlignment` determines which *physical* sidebar the bottom panel extends beneath:

| Alignment | Under left sidebar | Under right sidebar |
| --- | --- | --- |
| `left` | Yes | No |
| `right` | No | Yes |
| `center` | No | No |
| `justify` | Yes | Yes |

The outer activity rail remains full height. The panel does not cover it. These physical meanings stay the same after swapping the primary sidebar to the right.

`quickInputPosition` is `top` or `center` and applies to commands, application quick picks, and Customize Layout. At the top, the shared surface starts 6px from the window edge. Center places it in the middle of the viewport.

`density` is `default` or `compact`. Default uses inset rounded containers and small gaps. Compact removes gaps and outer padding, uses square corners, and retains separators. It does not change the color theme.

## Modes

- **Full Screen** uses Tauri's native fullscreen API, or the browser Fullscreen API in web previews. F11 toggles it. Browser fullscreen covers the document so portalled menus and tooltips remain visible. Native hosts must grant `core:window:allow-set-fullscreen`.
- **Zen Mode** snapshots the visibility settings and centered-layout state, hides the surrounding work areas, and enables centered content. The title bar retains quick input, layout, and window controls for recovery. Turning centering off does not leave Zen Mode. Exiting Zen Mode restores the snapshot. Escape exits Zen when no quick-input surface is open.
- **Centered Layout** constrains workspace content between two adjustable gutters. It does not resize or center the sidebars or bottom panel. `centeredRatio` defaults to 0.7.

Fullscreen is independent of Zen Mode. Zen does not force the operating-system window into fullscreen.

## Resizing

Drag the primary-sidebar edge, secondary-sidebar edge, or top edge of the bottom panel. Centered content has a draggable gutter on each side, adjusting its width symmetrically.

Every resize handle is focusable and has a separator role and current/minimum/maximum values. Arrow keys resize it (10px for panels, 0.02 of workspace width for centered gutters). Double-click or Home restores its default size. Escape during a drag cancels that drag.

Preferred dimensions are kept in `primaryWidth`, `secondaryWidth`, and `panelHeight`. Window resizing clamps the displayed dimensions without overwriting preferences. Sidebars use overlay placement below 760px so the canvas retains usable space. When both overlay sidebars are open, the secondary region is drawn above the primary region.

## Host-owned secondary tabs

The secondary region uses the same tabbed-panel component as the bottom panel. Tabs preserve their component state while hidden or switching tabs.

```ts
const unregister = frame.registerSecondaryTab({
  id: "artoria.details",
  label: "Details",
  component: DetailsPanel,
});
frame.openSecondaryPanel("artoria.details");
// On teardown:
unregister();
```

Each registration generates a searchable `frame.secondary.<id>` command. Removing the selected tab falls back to another tab; removing the last tab keeps an open region visible with its drop message. The demo supplies Sample and Session views. Frame does not register fallback views: an empty view region displays “Drag a view here to display.”

The layout commands are also registered in Quick actions, including visibility toggles, placement, density, centering, Zen, fullscreen, and resetting the layout. For app-side control use `frame.setZenMode(boolean)`, `frame.resetLayout()`, and the existing panel methods. `resetLayout()` resets preferences only; the shell's `frame.layout.reset` command also exits fullscreen.


Default density uses 34px title and status bars; compact keeps a 24px status bar. Centered layout starts at 90% of the available workspace width and remains symmetrically resizable. Grip dots appear only on the primary, secondary, and bottom outer sashes in default density.

See [Workspace panes and Banner](workspace.md) for splitting, pane content, and the banner's independent `bannerAlignment`, `bannerHeight`, and `bannerVisible` settings. A banner is always custom content, never a drop destination for view menus.

## Overlay boundary

Every application overlay stays within its owning shell's workbench body: below the title bar and above the visible status bar. The shell measures this rectangle rather than assuming fixed bar heights. Resizing, compact density, hiding the status bar, and embedding the shell away from the window origin update the boundary automatically.

Menus and submenus, context menus, selects, tooltips, modal surfaces and backdrops, quick input, layout customization, notifications, drag previews, and overlay scrollbars use the same boundary. Oversized menus and selects scroll within the available space. A clipped overlay host also prevents shadows and backdrops from painting over either bar. Menus, selects, and tooltips can appear above a modal without escaping this boundary.

Custom application overlays belong in the shell's `overlays` slot. Its `bounds` value is an `OverlayBounds` rectangle (`left`, `top`, `width`, `height`) in viewport coordinates; its `target` is the shell's clipped overlay host. Slot content is hosted there automatically. If a custom component teleports its own popup, pass this `target` to it instead of teleporting to `body`.

```vue
<FrameShell :frame="frame">
  <template #overlays="{ bounds, target }">
    <MyOverlay :bounds="bounds" :teleport-target="target" />
  </template>
</FrameShell>
```

Standalone Frame controls without a shell retain viewport-based placement. Use `FrameSelect` for application dropdowns; native browser/operating-system dropdowns do not use the shell's positioning system.
