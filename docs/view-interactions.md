# Host-controlled workbench interactions

Frame suppresses the browser context menu while a shell is mounted. It does not install content actions. Wrap any host content in the exported `ContextMenu`, pass `FrameMenuItem[]`, and handle `select`. Menus support nested items, separators, checked/disabled states, shortcuts, viewport fitting, arrow navigation, Escape, and focus restoration. The optional `visibility: true` menu-item property displays the reusable `VisibilityIndicator` eye on hover/focus.

FrameMenu keeps its anchor, pointer position, item definitions, and select/close events. Its floating menu now uses Reka DropdownMenu primitives for keyboard navigation, label typeahead, disabled entries, checked items, nested submenus, and dismissal. Frame supplies the menu styling, shared button rows, and portal boundary for each shell instance. Escape and selection return focus to the anchor; clicking another control leaves focus with that control.

Both FrameMenu and ContextMenu accept `itemAlignment: "left" | "center" | "right"` (default `"left"`). It controls the menu label alignment, including nested submenus. The menu retains its checkmark, shortcut, and submenu-arrow columns. This is separate from where the floating menu is positioned.

```vue
<ContextMenu :items="[{ id: 'inspect', label: 'Inspect' }]" @select="inspect($event.id)">
  <article tabindex="0">Your content</article>
</ContextMenu>
```

Only Customize layout is initially shown in the title bar (native window controls remain). Right-click it to enable the three region toggles or host toolbar contributions. `frame.registerToolbarAction({ id, label, icon?, run, visible? })` returns an unregister function. Host actions default to hidden and are independently selectable in this menu.

All view registrations accept `icon`, `label`, `actions`, `padded`, `draggable`, and `movable`. Action definitions are `{ id, label, icon?, run, disabled? }`. Primary headers and the active secondary/bottom tab display their actions. `padded: false` opts out of default padding. View IDs must be unique across all three regions because a view retains its identity when moved.

Drag an activity icon or a tab at least five pixels, then drop over a region or before another tab/icon. Drop on the body of the primary, secondary, or bottom region to append. The shell keeps each view mounted and moves its DOM container, preserving local component state. The original auto-generated command follows the view; unregistering a moved view removes its content and command.

For keyboard movement, focus a tab or activity button. Alt+Up/Down reorders within its region. Alt+Shift+Left moves to primary, Alt+Shift+Right to secondary, and Alt+Shift+Down to bottom. `frame.moveView(id, region, beforeId?)` offers the same host API and returns whether the policy allows it.

Policies are mutable through `frame.interaction`: `dragging` disables all view movement, and `primary`, `secondary`, `bottom` disable movement into/out of those regions. Per-view `draggable: false` prevents all movement; `movable: false` permits local reorder but prevents crossing regions. These policies apply to pointer, keyboard, and `moveView` calls.

## Views and nested views

Each registered view has exactly one content mode: `component` for custom content, or `children` for nested views. `ViewDefinition` describes either a custom component or a collection of child views. Use `registerView(definition, region)` or the existing `registerSidePanel`, `registerSecondaryTab`, and `registerBottomTab` methods. The region is `primary`, `secondary`, or `bottom`.

```ts
frame.registerView({
  id: "project", label: "Project", children: [
    { id: "assets", label: "Assets", component: AssetList, padded: false },
    { id: "details", label: "Details", component: Details, actions: detailActions, collapsed: true },
    { id: "tools", label: "Tools", children: [] },
  ],
}, "primary");
```

Nested views render as accordion rows with their own actions and optional padding. Drag a row into the activity rail or a tabbed region to promote it; drop a root view into a collection to create an accordion. Nested collections can themselves contain collections. All view IDs are globally unique. The registry rejects cycles and drops into plain component views. The final accordion has no bottom separator or resize sash, whether open or closed.

`moveView(id, region, beforeId?, parentViewId?)` supports nesting programmatically. `getViewChildren(id)`, `getViewParent(id)`, and `viewRegion(id)` describe the current tree. `openView(id)` opens the containing region and expands the view's ancestors. `movable: false` also prevents changing parents, while still allowing reordering inside the current parent. Global and region movement policies also cover nested views.

A registration owns all views in its declared subtree, even after individual views move out. Disposing that registration removes its owned views wherever they are. Independently registered views subsequently dropped into the collection are rehomed as roots when the collection unregisters.

`ViewSections` renders the registered child views automatically inside the shell. The standalone `PanelSections` component remains available for purely presentational sections; use registered `children` for views that should move. Accordion dividers and centered/workspace dividers never show grip dots. Only the outer primary, secondary, and bottom region sashes show them at default density; compact density hides all grip dots.

Resize sashes support pointer dragging, arrow keys, Home/double-click reset, and Escape to cancel a resize.

The sample app registers collections, people, inspector, activity, tools, quick picks, toolbar actions, and a contextual working note. All sample state and layout customization is session-local. The save action demonstrates a host command and records an event; it does not persist a document.

The supplied `assets/frame.svg` is the source for the title-bar mark, canvas watermark, favicon, demo, and generated Tauri icons. From packages/docs, regenerate desktop icons with `bun run tauri icon ../../assets/frame.svg`.


## Drag feedback and view regions

Primary sidebar, secondary sidebar, and bottom panel are collectively **view regions**. Each empty region displays exactly “Drag a view here to display.” Empty regions can be opened using their normal visibility controls. Moving or unregistering the last view keeps an already-open region available as a drop destination. Frame registers no implicit fallback content; hosts own all registered views.

Dragging shows the view's icon (or initial) and title beside the cursor. A blue insertion bar indicates the exact before/after position in an activity list, tab list, or accordion collection. A shaded rectangle indicates dropping into an empty area or collection. Invalid destinations, including cycles and locked views, receive no drop marker. Escape, pointer cancellation, or window blur cancels the drag and removes feedback.

Hovering another activity, tab, or accordion for 600ms activates/expands it without ending the drag. Approaching a closed region at the left, right, or bottom edge reveals it after 350ms. A fast drop on a valid edge also opens the region and inserts the view. Existing global, region, and view-specific movement policies still apply.

The preferred public names are now `registerView`, `openView`, `viewState`, `ViewDefinition`, and `Banner` (`registerBanner`, `openBanner`, `closeBanner`, `toggleBanner`, and `frame.banner`). The earlier menu and workspace-banner API names remain compatibility aliases. Context menus and title-bar menus retain their normal menu terminology.

See [Modals](modals.md) for host-owned draggable properties dialogs.

Collection subviews share the full available height. Collapsed headers remain visible; open views shrink proportionally when necessary, with a 60px content minimum when space permits. Preferred heights survive collapse and window resizing. Resizing a separator transfers height between the adjacent open views; double-clicking restores equal proportions. In extremely short regions content can shrink below 60px so opening another view remains possible.

Frame uses arrowless overlay scrollbars in its workbench, menus, and modals. Hovering a scrollable element reveals a 12px transparent track with an 8px thumb; leaving hides it. The overlay never reserves content width or height. Native wheel, touch, and keyboard scrolling remain available, and the thumb supports dragging and track clicks. Both axes are supported.

## Shared Reka menus

The shell title bar renders FrameMenubar with Reka Menubar interaction. FrameDropdownMenu and FrameContextMenu use the corresponding Reka families. Their popup surfaces, recursive rows, checkbox/visibility indicators, shortcuts, alignment, theme variables, and overlay boundaries share Frame presentation. NavigationMenu remains a separate navigation-link primitive.

FrameMenu.vue and the custom MenuBar.vue have been removed. The public FrameMenu export is a deprecated compatibility alias for the anchored popup contract; new code should use FrameDropdownMenu. ContextMenu remains a thin compatibility wrapper around FrameContextMenu. Installing these replacements does not register or execute host commands; shell command selections continue through Frame's existing command execution path.
