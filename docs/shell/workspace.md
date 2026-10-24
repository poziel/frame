# Workspace panes and Banner



The workspace starts as a single pane. Splitting is optional: users can right-click a pane to split left/right/up/down, or run `Workspace: Split â€¦` in Quick actions. Each split can contain more splits. Dividers resize with pointer dragging or arrow keys; Home or double-click resets a split to 50/50. Closing a pane collapses its branch and retains the surviving panes. The last pane cannot be closed. Pane dividers never show three-dot grips.



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



Only one banner may be registered at once. Customize Layout and Quick actions provide visibility and alignment controls. Alignment has the same physical meaning as the bottom panel: `left` extends over the left sidebar, `right` over the right sidebar, `center` spans only the workspace, and `justify` extends over both sidebars. The view bar remains full height and is excluded from the banner. Banner and bottom-panel alignment are independent, including when the primary sidebar swaps sides. Zen temporarily hides the banner and restores its previous visibility on exit. Banner component state survives hiding and alignment changes.



Examples assume the named components and host callbacks are imported or defined. See [getting started](../guides/getting-started.md) for an initial shell.



## Optional workspace tabs



Tabs are opt-in per pane. Frame owns selection, ordering, permissions, and presentation; applications supply document components and data. User creation, closing, and movement are disabled independently by default. Pane creation stays enabled by default for compatibility.



```ts

const frame = createFrame({ workspace: {

  allowPaneCreation: true,

  maxPanes: 4, // integer 1 through 20; default 20

  newPaneMode: 'plain', // or 'tabs'; does not create a tab automatically

  tabs: { allowCreate: true, allowClose: true, allowMove: true,

    lastTab: 'allow-empty' }, // default 'keep-one'

} });

const w = frame.workspace;

w.setPaneMode(w.initialPaneId, 'tabs');

const unregister = w.registerTab(w.initialPaneId, {

  id: 'preview', title: 'Preview', icon: 'file-media',

  component: ImagePreview, props: { image },

});

```



`splitWorkspace()` creates an empty pane on the right. Explicit left/right/up/down directions remain supported. Splitting never moves a tab. All split paths enforce pane creation permission and the limit; `canSplit()` supports host controls. A blocked legacy split throws before mutation. The final pane cannot close.



| Workspace API | Behavior |

| --- | --- |

| `configure(options)` | Merge runtime configuration; reject invalid pane limits. Lowering the limit preserves current panes. |

| `setPaneMode(paneId, 'plain' \| 'tabs')` | Convert an empty pane; reject replacing host content or removing populated tab mode. |

| `configurePaneTabs(paneId, options)` | Set per-pane presentation, callbacks, and last-tab policy; local permissions only restrict global permissions. |

| `tabOptions(paneId)` | Read effective options for a pane. |

| `registerTab(paneId, definition)` | Explicit host registration, independent of user creation permission; return idempotent host cleanup. Duplicate IDs throw. |

| `updateTab(id, patch)` | Update title, icon, component/props, restrictions, or presentation. |

| `activateTab(id)` | Select a tab and make its pane the active workspace target. |

| `requestTab(paneId?, source?)` | Asynchronous user creation through the host factory or the default empty New tab factory. |

| `closeTabs(ids, source?)` | Atomic guarded user closing; enforce permissions, pin protection, and last-tab policy. |

| `setTabPinned(id, pinned)` | Group pinned tabs first. Unpin before ordinary closing. |

| `moveTab(id, paneId, index?, source?)` | Transfer or reorder without remounting. Index is measured after removing the moved tab from the destination list. |

| `moveTabToNewPane(id, direction, source?)` | Explicit create-and-transfer action; requires both creation and movement permissions. |

| `requestClosePane(paneId?, source?)` | Guarded asynchronous pane closure. Legacy synchronous `closeWorkspacePane` refuses populated tabbed panes. |

| `onDidChange(listener)` | Subscribe to registration, update, activation, close, pin, move, reset, and guarded pane-removal events; return unsubscribe. |



`tabs` and `activeTabs` are readonly computed refs. `canCreateTab`, `canCloseTab`, and `canMoveTab` expose operation availability. Results are `{ ok: true, value }` or `{ ok: false, reason }`, with reasons `disabled`, `missing`, `limit`, `cancelled`, `stale`, `disposed`, `conflict`, or `invalid`. Invalid workspace configuration and registration throw.



Moving into an empty plain pane converts it to tabs. A host component or slot counts as content even when its DOM is empty; moving cannot overwrite it. Moving between existing panes does not require pane-creation permission. Empty source panes remain open. When closing removes a pane's final tab, Frame closes that pane if another pane remains; the final pane returns to plain mode and shows its default workspace content. The keep-one policy still prevents final-tab closure. Closing an active tab selects its next surviving neighbor, then the previous neighbor.



### Host callbacks and rendering



```ts

w.configure({ tabs: {

  create: async ({ signal }) => {

    const document = await collectDocumentOptions({ signal });

    if (!document) return undefined;

    return { id: document.id, title: document.name,

      component: DocumentView, props: { document } };

  },

  beforeClose: async ({ tabIds, signal }) => confirmClose(tabIds, signal),

} });

```



Callbacks receive `paneId`, `tabIds`, `source`, and an `AbortSignal`. Cancellation inserts no placeholder. Changed configuration, reset, disposal, or intervening tab mutations invalidate pending transactions; thrown callbacks cancel without committing. Bulk close validates all candidates before removal. Registration cleanup is explicit host disposal and bypasses user close guards; use `closeTabs` for guarded closing. Host-owned backend/document resources remain caller-owned.



Tabs accept `showIcon`, `showTitle`, `showClose`, `closable`, and `movable` overrides. Global/per-pane `display` selects `icons`, `text`, or `both` (default). The tab context menu offers the same display choices. `showIcons`, `showTitles`, and `showClose` provide further presentation control. Close buttons use FrameIconButton and appear on the selected tab, on hover, or on keyboard focus. In icon-only mode the close control replaces the icon in the same fixed-width space. Hidden visual titles retain accessible names. Icons accept a Frame icon name or Vue component. Pinning replaces the close button with an unpin button, and bulk menu operations skip pinned tabs. `tabs.contextMenu(context, defaults)` customizes existing `FrameMenuItem` definitions; custom command items invoke registered Frame commands.



```vue

<FrameShell :frame="frame">

  <template #workspace-tab="{ tab, active }"><span>{{ tab.title }}</span></template>

  <template #workspace-tab-empty="{ pane }"><EmptyDocument :pane-id="pane.id" /></template>

  <template #workspace-tab-actions="{ pane }">

    <button @click="frame.workspace.requestTab(pane.id)">New tab</button>

  </template>

</FrameShell>

```



The tab slot customizes the tab label; component content comes from the tab definition. Components remain mounted while inactive or transferred and unmount on close/unregister. Navigation restores surviving tab selections without resurrecting closed tabs or reversing transfers. Frame disposal releases owned presentations, pending operations, and subscriptions.



### User interactions



Enabled creation supports Ctrl+T and double-clicking unused strip space. Enabled closing supports X, Ctrl+W, and middle-click. Shortcuts target the focused Frame workspace, respect host-prevented events, and do not run behind a Frame modal, Quick actions, or layout customization. Tabs support arrow-key navigation. Movement enables same-Frame drag reordering and transfer into eligible panes, with strip insertion markers and highlighted pane destinations. Overflowing tabs are grouped under More Tabs, keeping the selected tab visible. Each closable overflow row exposes a close control on hover; closing it does not select the tab or dismiss the menu while overflow remains. Tabbed panes do not show a separate Close pane button.



The context menu offers Close, Close others, Close to the right/left, Close all, Pin/Unpin, directional empty-pane splits, and explicit move destinations. Menu/API operations provide alternatives to dragging.


See [creation options](../configuration/frame-options.md#workspace) for defaults and [shell contributions](README.md) for choosing workspace tabs versus sidebar/panel views.

Tabs without a content component show the centered, non-selectable Frame workspace logo by default. Supplying a component replaces that fallback.

When the final pane shows the default blank workspace, enabled tab creation also supports double-clicking anywhere on that page. Frame changes it to tab mode only after creation succeeds; disabled permissions, occupied host content, and cancelled creation leave the page unchanged. Overflow close controls share the full highlighted item row.

## Shared welcome page

Empty panes show the Frame logo. Applications can offer registered commands beneath it without replacing the welcome page:

```ts
createFrame({ workspace: {
  allowPaneCreation: false,
  welcome: { commands: ['myapp.open', 'myapp.new'] },
  tabs: { allowCreate: true, allowClose: true, lastTab: 'allow-empty' },
} });
```

Each action uses its registered label and optional shortcut, renders as a ghost button, follows command visibility/enabled state, and executes through the owning Frame command controller. Custom pane and empty-tab slots still override this default. Disabling pane creation hides splitting and move-to-new-pane choices. With one pane, its pane context menu and pane commands are hidden; document tabs remain available. Existing panes can still be closed and used as tab-move destinations.

## Optional tab change state

Tabs have no change-state behavior unless `workspace.tabs.trackChanges` is enabled. The host reports actual edits with `workspace.updateTab(id, { dirty: true })` and successful saves with `{ dirty: false }`. Preview changes need not count as edits. Frame renders a dirty dot in the close-button space, reveals the close control on hover or keyboard focus, and guards dirty tab/pane closure with its themed Cancel / Close without saving dialog. All close paths share this guard, including shortcuts, middle-click and bulk menus.

`frame.workspace.confirmUnsavedChanges(tabIds)` offers the same confirmation without closing tabs, for application-exit handling. It resolves false on cancellation or disposal. A headless host can respond through `workspace.closeConfirmation.value?.respond(discard)`; FrameShell handles that presentation automatically. Pending confirmations cancel when their workspace operation becomes stale.

The tab strip is hidden when a pane contains only one tab. Set `workspace.tabs.showSingleTab: true` to keep it visible. The hidden strip does not unmount the document or change its close permissions; commands such as Close active tab still work.
