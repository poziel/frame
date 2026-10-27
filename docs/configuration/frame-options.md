# Configuring Frame

Pass initial behavior to `new Frame(options)`. `createFrame(options)` remains a convenience function returning a `Frame` instance. Render that instance with `FrameShell`. Layout preferences and renderer props are separate from creation options; there is no single catch-all shell configuration object.

```ts
import { Frame, type FrameOptions } from '@frame/core';

const options = {
  settings: false,
  notifications: true,
  navigation: true,
  navigationBar: { position: 'top', display: 'both' },
  primaryViewBar: { display: 'icons' },
  panel: { position: 'bottom', alignment: 'center' },
  status: { message: 'Ready' },
  workspace: { allowPaneCreation: false },
} satisfies FrameOptions;

const frame = new Frame(options);
frame.layout.density = 'compact';
```

## All creation options

`features` accepts a map of feature IDs to initial availability. A `false` entry excludes that feature from presentation and blocks its commands and presentation APIs. This is different from hiding a bar through a layout preference.

```ts
const frame = createFrame({ features: { secondarySidebar: false, panel: false } });
frame.secondarySidebar.enable(); // Available again, still closed.
frame.secondarySidebar.open();
frame.panel.disable();
frame.features.setAvailable('secondarySidebar', false);
```

Built-in feature IDs are `primarySidebar`, `secondarySidebar`, `panel`, `primaryViewBar`, `secondaryViewBar`, `panelViewBar`, `menuBar`, `navigationBar`, `statusBar`, `navigation`, `settings`, `notifications`, `banner`, `theme`, `workspace`, and `shell`. Applications may also use their own IDs on commands. Each view bar depends on its content container: disabling a sidebar or panel makes its associated view bar unavailable too. Disabling only the bar leaves its content container available. Explicit bar restrictions survive restoring the parent.

`primarySidebar`, `secondarySidebar`, and `panel` implement the shared `ViewContainerController`: `register(view)`, `views.value`, `open(id?)`, `select(id)`, `close()`, `toggle()`, `available`, `visible.value`, `setAvailable(boolean)`, `enable()`, and `disable()`. View bars and `menuBar` share the presentation methods and availability contract. Specialized view-bar and panel methods remain available. Closing preserves availability and registrations; disabling retains registrations, closes the presentation, and blocks reopening. Enabling never opens it automatically. Visibility refs preserve the existing reactive controller convention.

Commands belong to one feature. A command can provide a feature resolver when ownership changes, as Frame's generated view commands do when a view moves between containers.

All fields are optional. Defaults below come from the current controllers.

| Option                 | Default                       | Purpose                                                                                                                                                                   |
| ---------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `host`                 | Browser defaults              | Explicit `FrameHost` services; see [host integration](../guides/hosts.md).                                                                                                |
| `settings`             | `true`                        | Enable Settings, or provide `{ storage, url, writeClipboard }` for JSON persistence and host integration. Supply your own sections. See [settings](../shell/settings.md). |
| `theme`                | omitted: inherit document CSS | Initial validated theme definition. Runtime: `frame.theme.set`, `reset`, `current`, and `attach`; see [themes](../styling/theme-variables.md).                            |
| `notifications`        | `true`                        | Render transient notifications. This switch controls presentation; it does not prevent the notification service from accepting messages.                                  |
| `navigation`           | `false`                       | Enable in-memory Back/Forward history and title-bar arrows. This is separate from the navigation bar.                                                                     |
| `manageButtonPosition` | `'bottom'`                    | Place Manage in the status bar; `'top'` puts it in the title bar.                                                                                                         |
| `navigationBar`        | omitted: hidden               | `true` shows it with defaults; `false` starts hidden; an options object configures it.                                                                                    |
| `primaryViewBar`       | see below                     | Primary-sidebar view selector.                                                                                                                                            |
| `secondaryViewBar`     | see below                     | Secondary-sidebar view selector.                                                                                                                                          |
| `panelViewBar`         | see below                     | Panel view selector.                                                                                                                                                      |
| `panel`                | see below                     | Panel docking and alignment.                                                                                                                                              |
| `toolbar`              | see below                     | Title-bar control visibility.                                                                                                                                             |
| `status`               | see below                     | Status bar and initial message.                                                                                                                                           |
| `workspace`            | see below                     | Pane and tab permissions and defaults.                                                                                                                                    |

## Navigation bar

`navigationBar` accepts a boolean or the following object. An object starts visible unless `visible: false` is supplied. Starting hidden does not prohibit later showing or registering items.

| Field           | Values / default                                   |
| --------------- | -------------------------------------------------- |
| `visible`       | Boolean; `true` for an object                      |
| `position`      | `'top'` (default), `'bottom'`, `'left'`, `'right'` |
| `justification` | `'left'` (default), `'center'`, `'right'`          |
| `display`       | `'icons'` (default), `'text'`, `'both'`            |
| `size`          | `'default'` (default), `'compact'`                 |
| `hidden`        | Initially hidden item IDs; default `[]`            |
| `hiddenBadges`  | Initially hidden badge IDs; default `[]`           |

Runtime: `frame.navigationBar.setVisible`, `setPosition`, `setJustification`, `setDisplay`, and `setSize`. See [navigation items](../shell/navigation-bar.md).

## View bars and panel

| Field          | Primary view bar                                                  | Secondary view bar                           | Panel view bar                          |
| -------------- | ----------------------------------------------------------------- | -------------------------------------------- | --------------------------------------- |
| `position`     | `'default'`, `'top'`, `'bottom'`, `'hidden'`; default `'default'` | Same values; default `'top'`                 | Not supported; follows the panel        |
| `visible`      | Use `position: 'hidden'`                                          | Use `position: 'hidden'`                     | Boolean; default `true`                 |
| `display`      | `'icons'` (default), `'text'`, `'both'`                           | Same values; default `'both'`                | Same values; default `'both'`           |
| `size`         | `'default'` or `'compact'`; default `'default'`                   | Same                                         | Same                                    |
| `hidden`       | Initially hidden view item IDs; default `[]`                      | Initially hidden root view IDs; default `[]` | Initially hidden view IDs; default `[]` |
| `hiddenBadges` | Initially hidden badge IDs; default `[]`                          | Same                                         | Same                                    |

`'default'` means the vertical bar beside the associated sidebar. `'top'` and `'bottom'` place it horizontally with that sidebar. Hiding a bar is not the same as closing its sidebar or unregistering its views.

`panel.position` accepts `'bottom'` (default), `'top'`, `'left'`, or `'right'`. `panel.alignment` accepts `'center'` (default), `'left'`, `'right'`, or `'justify'` and affects horizontal docking. It does not open the panel.

Runtime: use `frame.primaryViewBar`, `frame.secondaryViewBar`, `frame.panelViewBar`, and `frame.panel`; see [view bars](../shell/view-bars.md) and [layout](layout.md).

## Toolbar

Individual layout buttons and registered toolbar actions can also use the status
bar. Configure `toolbar.placements`, or call `frame.toolbar.setPlacement` at
runtime. See [button placement](../shell/menus-and-toolbar.md#move-buttons-between-title-and-status-bars).

Each field is a boolean controlling title-bar presentation:

| Field            | Default | Purpose                                                              |
| ---------------- | ------- | -------------------------------------------------------------------- |
| `customize`      | `true`  | Customize Layout button                                              |
| `primary`        | `false` | Primary sidebar toggle                                               |
| `bottom`         | `false` | Panel toggle                                                         |
| `secondary`      | `false` | Secondary sidebar toggle                                             |
| `commandCenter`  | `true`  | Center title/search area                                             |
| `layoutControls` | `true`  | Layout controls group                                                |
| `contextMenu`    | `true`  | Allow the title-bar customization right-click menu (creation option) |

Runtime: `frame.toolbar.setVisible(control, visible)`. Hiding a button does not disable its command. See [menus and toolbar](../shell/menus-and-toolbar.md).

## Status

| Field          | Default   | Purpose                              |
| -------------- | --------- | ------------------------------------ |
| `visible`      | `true`    | Show the bar                         |
| `message`      | `'Ready'` | Persistent center text               |
| `hidden`       | `[]`      | Initially hidden registered item IDs |
| `hiddenBadges` | `[]`      | Initially hidden badges              |

Runtime: `frame.status.setBarVisible`, `set`, `show`, and item methods. See [status bar](../shell/status-bar.md).

## Workspace

| Field               | Default   | Purpose                                                                      |
| ------------------- | --------- | ---------------------------------------------------------------------------- |
| `allowPaneCreation` | `true`    | Permit splitting; all split paths enforce it                                 |
| `maxPanes`          | `20`      | Integer from 1 through 20; lowering it preserves existing panes              |
| `newPaneMode`       | `'plain'` | `'plain'` or `'tabs'` for new empty panes; does not convert the initial pane |
| `tabs`              | See below | Global tab permissions, presentation, and callbacks                          |

The initial pane is plain. Convert an empty initial pane with `frame.workspace.setPaneMode(frame.workspace.initialPaneId, 'tabs')`.

| `workspace.tabs` field           | Default                | Purpose                                                                       |
| -------------------------------- | ---------------------- | ----------------------------------------------------------------------------- |
| `allowCreate`                    | `false`                | Permit user tab creation through the factory                                  |
| `allowClose`                     | `false`                | Permit guarded user closing                                                   |
| `allowMove`                      | `false`                | Permit reordering and transfers                                               |
| `lastTab`                        | `'keep-one'`           | Or `'allow-empty'`; policy for ordinary closing                               |
| `showIcons`                      | `true`                 | Default tab icon presentation                                                 |
| `showTitles`                     | `true`                 | Default tab title presentation                                                |
| `showClose`                      | `true`                 | Default close-control presentation; permissions still apply                   |
| `create(context)`                | Built-in empty New tab | Return a `WorkspaceTabDefinition`, a promise of one, or `undefined` to cancel |
| `beforeClose(context)`           | No callback            | Return boolean or promise of boolean to approve/cancel a guarded close        |
| `contextMenu(context, defaults)` | Built-in menu          | Return the `FrameMenuItem[]` to display                                       |

Creation/close callbacks receive `{ paneId, tabIds, source, signal }`. The menu callback receives `{ paneId, tabId }` and the default menu array. Runtime: `workspace.configure(options)` and `configurePaneTabs(paneId, options)`. Per-pane permissions can restrict global permissions, not broaden them. Explicit host registration and its cleanup bypass user creation/closing policies. See [workspace](../shell/workspace.md).

## FrameShell props and slots

| Prop         | Default                           | Purpose                                                  |
| ------------ | --------------------------------- | -------------------------------------------------------- |
| `frame`      | Required                          | Stable instance to render and provide                    |
| `titleText`  | `'Frame (Workspace)'`             | Text in the title/search area                            |
| `showSearch` | `true`                            | Search button; `false` displays a plain title            |
| `menuItems`  | Generated View/Layout/Window tree | Replace the full application menu with `FrameMenuItem[]` |

Slots: default content for the initial workspace pane; `workspace-pane` with `{ pane }`; `workspace-tab` with `{ tab, active }`; `workspace-tab-empty` and `workspace-tab-actions` with `{ pane }`; `status-leading-actions` and `status-actions` for custom footer content; `overlays` with `{ bounds, target }` for shell-bounded overlays. Prefer registered status items for standard footer buttons/text so visibility and placement remain coordinated.

## Visibility, permissions, and lifetime

Use [layout](layout.md) for preferences such as menu visibility, sidebar side, dimensions, and density. Set these after creation. They are not additional `FrameOptions` fields.

Presentation switches do not all disable underlying services. `navigationBar: false` starts a hidden bar; it is not an unavailable capability. Workspace permissions enforce operations. `settings` gates opening Settings; `notifications` gates the notification renderer. Do not infer a stronger permission boundary from a hidden control.

All configuration is per Frame instance and session-only unless the host implements persistence. Dispose the instance when its owning shell is destroyed.

## Application branding

Pass an optional Vue component as `FrameShell`'s `appIcon` prop and an accessible name as `appName`. Omitted props retain Frame's default mark and name. These are renderer props, separate from `createFrame` options.

## Modal defaults

Set `modal` on `createFrame` for per-instance defaults. Each `openModal` definition can override them, including `false` and zero:

```ts
const frame = createFrame({ modal: { width: 480, height: 280, contentPadding: 16 } });
frame.openModal({
  id: 'edit', title: 'Edit details', component: EditForm,
  draggable: false, resizable: false, maximizable: false,
  footer: EditActions, footerProps: { onSave: save, onCancel: () => frame.closeModal('edit') },
});
```

`width` and `height` are initial pixel dimensions fitted to the shell bounds. When omitted, the existing responsive size is retained (80% of available space, capped at 960 by 640). `draggable`, `resizable`, and `maximizable` default to true. Disabling maximize removes the button and title-bar double-click behavior. Movement and resize restrictions apply to pointer and Alt+Arrow / Alt+Shift+Arrow gestures respectively.

`contentPadding` accepts pixels or a CSS padding shorthand. Set it to `0` for edge-to-edge content. Omitted padding uses `--frame-modal-content-padding` (default `0`, preserving existing layouts). The optional footer component is mounted in a separate, right-aligned bottom bar with the same background as the title bar; it receives `footerProps`. No footer space is reserved when omitted. Its contents and save/cancel behavior belong to the application. Direct `FrameModal` consumers use the `footer` slot instead.

Both `FrameModal` and `FrameDialog` use Reka Dialog primitives. `FrameModal` is the Frame-coordinated, shell-bounded window with stacking, movement, resizing, and instance API control. `FrameDialog` is a standalone trigger/open-state-controlled dialog for local interactions. Use `FrameAlertDialog` for an explicit confirmation decision. These presentations share underlying primitives but have distinct ownership contracts.
`minHeight` sets a modal minimum height in pixels (default 160), including pointer and keyboard resizing. Shell bounds take precedence on smaller windows. For example, use `{ height: 300, minHeight: 300 }` for a compact form that users can enlarge.

### Host-owned Back/Forward

Pass a `NavigationOptions` adapter instead of `navigation: true` to route the existing title-bar arrows and `frame.navigation.back` / `frame.navigation.forward` commands to domain history. Reactive predicates determine enabled states. Shell destinations are not recorded in this mode. Disabling the navigation feature still blocks actions.

```ts
createFrame({ navigation: {
  back: () => editor.undo(), forward: () => editor.redo(),
  canGoBack: () => editor.canUndo, canGoForward: () => editor.canRedo,
} });
```
