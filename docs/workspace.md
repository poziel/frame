# Workspace panes and Banner

The workspace starts as a single pane. Splitting is optional: users can right-click a pane to split left/right/up/down, or run `Workspace: Split …` in Quick actions. Each split can contain more splits. Dividers resize with pointer dragging or arrow keys; Home or double-click resets a split to 50/50. Closing a pane collapses its branch and retains the surviving panes. The last pane cannot be closed. Pane dividers never show three-dot grips.

The original default `FrameShell` slot belongs to the initial pane. Its component instance survives splitting and resizing. Closing that pane deliberately removes its content. New panes use the `workspace-pane` slot, or a registered component supplied through the API:

```ts
const id = frame.splitWorkspace("right");
frame.setWorkspacePane(id, { label: "Image preview", component: ImagePreview, props: { image } });
frame.splitWorkspace("down", id, { label: "Notes", component: Notes });
frame.closeWorkspacePane(id);
```

```vue
<FrameShell :frame="frame">
  <MainContent />
  <template #workspace-pane="{ pane }"><CustomContent :pane-id="pane.id" /></template>
</FrameShell>
```

Clicking or focusing a pane makes it the command target. `frame.workspace` exposes `panes`, `root`, and `activePane` refs plus `focus(id)` and `resize(splitId, ratio)`. Splitting keeps the original pane's component mounted; separate pane components have independent state. Host context menus inside a pane take precedence over the pane menu.

## Banner

The Banner is a host-owned content region above the workspace. It is hidden by default and has no tab bar, view dragging, or resize grip. It can contain any Vue component, including host-owned dismiss buttons or actions.

```ts
const remove = frame.registerBanner({ id: "review", label: "Review", component: ReviewBanner });
frame.layout.bannerHeight = 100;
frame.layout.bannerAlignment = "justify";
frame.openBanner();
frame.closeBanner();
remove();
```

Only one banner may be registered at once. Customize Layout and Quick actions provide visibility and alignment controls. Alignment has the same physical meaning as the bottom panel: `left` extends over the left sidebar, `right` over the right sidebar, `center` spans only the workspace, and `justify` extends over both sidebars. The activity rail remains full height and is excluded from the banner. Banner and bottom-panel alignment are independent, including when the primary sidebar swaps sides. Zen temporarily hides the banner and restores its previous visibility on exit. Banner component state survives hiding and alignment changes.

The demo's `Demo: Show banner` command opens an example. Its regular workspace starts unsplit; split it from the pane context menu or Quick actions to try independent notes panes.
