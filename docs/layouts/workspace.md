# Workspace

Display application content in a single pane, split work areas, or optional document tabs. Frame coordinates selection, layout, permissions, and component lifetime while the application owns document data and save behavior.

## Features

The workspace starts with one plain pane. The default `FrameShell` slot belongs to that initial pane; registered components or the `workspace-pane` slot provide other content. Splitting preserves existing components and resizable dividers separate panes. The final pane cannot be closed.

Document tabs are opt-in per pane. User creation, closing, and movement are separately disabled by default; explicit host registration is independent of those user permissions. Tabs retain their component instance while inactive or transferred. Closing or unregistering unmounts content.

The host can supply creation and close callbacks, dirty state, and welcome commands. Pending asynchronous transactions are cancelled when invalidated by reset, configuration changes, or disposal. The Playground owns an independent Frame instance and resets when you leave this page.

## APIs

```ts
import {createFrame} from '@frame/core';
import DocumentView from './DocumentView.vue';

const frame = createFrame({
  workspace: {
    allowPaneCreation: true,
    maxPanes: 4,
    tabs: {
      allowCreate: true,
      allowClose: true,
      allowMove: true,
      lastTab: 'allow-empty',
    },
  },
});
const workspace = frame.workspace;
workspace.setPaneMode(workspace.initialPaneId, 'tabs');
const remove = workspace.registerTab(workspace.initialPaneId, {
  id: 'app.readme',
  title: 'README',
  component: DocumentView,
});
const right = frame.splitWorkspace('right');
workspace.moveTab('app.readme', right);

// Explicit host cleanup bypasses user close guards:
remove();
// Dispose when the shell owner ends:
frame.dispose();
```

Render this stable root with `FrameShell`. For plain panes, use `frame.setWorkspacePane(paneId, {label, component, props})`. `frame.workspace.activePane.value` identifies the focused command target.

`requestTab(paneId)` runs guarded asynchronous user creation. `closeTabs(ids)` runs user close permissions and callbacks; use this for ordinary closing rather than the registration disposer. `requestClosePane(paneId)` handles populated tabbed panes. `moveTab` reorders/transfers without remounting; splitting does not automatically move tabs.

An empty pane can change mode with `setPaneMode`; existing host content cannot be overwritten. `configure` and `configurePaneTabs` control runtime options, with per-pane permissions only restricting global permissions. Tabs expose typed success/failure results; check them before assuming an operation occurred.

See [workspace contracts](../shell/workspace.md) for callbacks, dirty-state tracking, pinning, keyboard interaction, and result reasons, plus [creation defaults](../configuration/frame-options.md#workspace).

## Styling

Tab presentation supports icons, text, or both and optional close controls. `workspace.tabs.showSingleTab` keeps the strip visible for a single tab; otherwise it is hidden without changing document lifetime or close permissions.

Use `workspace-tab`, `workspace-tab-empty`, and `workspace-tab-actions` slots to customize labels, empty content, and actions. Application document content uses shared [theme variables](../styling/theme-variables.md). Use [layout APIs](../configuration/layout.md) for density and centered layout; keep document data and styles inside application views.
