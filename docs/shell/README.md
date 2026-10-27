# What can you contribute to a Frame?

Start with a stable `frame` from `createFrame()`. Register contributions during the owning component or feature's setup. Most registrations return an unregister function; keep it for removing that contribution independently of the whole shell.

| Shell area | What belongs there | Entry point |
| --- | --- | --- |
| Primary sidebar | Project tree, collections, main tools | `frame.registerSidePanel(definition)` |
| Secondary sidebar | Inspector, details, contextual tools | `frame.registerSecondaryTab(definition)` |
| Panel | Output, logs, terminal or other supporting content | `frame.registerBottomTab(definition)` |
| View bars | Selectors for the registered views above | Populated by view registration; configure the corresponding view-bar controller |
| Navigation bar | Actions, links, dropdowns, separators | `frame.registerNavigationItem(item)` |
| Menu bar | Grouped command menus | `FrameShell`'s `menuItems` prop |
| Title toolbar | Frequently used action buttons | `frame.registerToolbarAction(action)` |
| Status bar | Left/right text or buttons; center status message | `frame.status.register(item)`, `set`, `show` |
| Workspace | Main screens, documents, split panes, tabs | Shell slots, `setWorkspacePane`, `frame.workspace` |
| Docks | Arbitrary content attached inside or outside a shell edge | `frame.docks.register(definition)` |
| Banner | Notice or custom component above the workspace | `frame.registerBanner(definition)` |
| Modal | Secondary task or form | `frame.openModal(definition)` |
| Settings | Application configuration fields | `frame.registerSettingsSection(section)` |
| Notifications | Transient messages and actions | `frame.notify(options)` |

A navigation item is not a view: it invokes an action or navigation. A view bar does not accept arbitrary application buttons; its items represent views. The content selected by a view bar lives in a sidebar or panel. Workspace tabs are a separate document presentation from panel views.

Registering content makes it available. Opening reveals it. Hiding preserves its registration. Unregistering removes it. `frame.dispose()` clears Frame-owned resources; host services need their own cleanup. Use `useFrame()` inside descendants of `FrameShell` to access the enclosing instance.

Read [views](views.md), [view bars](view-bars.md), [navigation](navigation-bar.md), [menus and toolbar](menus-and-toolbar.md), [status](status-bar.md), [workspace](workspace.md), [docks](docks.md), or [services](services.md) for the corresponding input fields and examples.

- [HSV color areas](color-area.md): composed rectangle, wheel, and circle controls.

- [Scrub field](scrub-field.md): draggable numeric tool controls with direct editing.

- [Control tooltips](../components/control-tooltips.md): optional descriptions and rich tooltip slots shared by controls.
- [Reorder lists and drag previews](reorder-list.md): list interaction and the shared drag surface.
