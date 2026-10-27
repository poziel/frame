# Command implementation

This folder contains command objects and the adapters that connect them to
menus, shell APIs, keyboard input, and the Command Center. Those adapters serve
different entry points into the same command system; they are not additional
command groups.

## Responsibility map

| File                                  | Responsibility                                              | Example                                         |
| ------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------- |
| `command.ts`                          | One live command and its operations                         | Execute or disable Save                         |
| `commandRegistry.ts`                  | The per-Frame command collection and shared execution rules | Register Save, find it by ID, dispatch it       |
| `commandPrefixes.ts`                  | Prefix-based discovery modes in the root picker             | `>` selects Frame commands                      |
| `contextMenuCommands.ts`              | Connect a shell context menu to registered commands         | A panel's Hide or Move action                   |
| `builtinCommands.ts`                  | Register the actions Frame supplies                         | Toggle panel, open settings, change bar display |
| `shellCommandBindings.ts`             | Route shell presentation API calls through commands         | `panel.setPosition('left')`                     |
| `commandCenter.ts`                    | Coordinate the root picker and nested choice screens        | Change background, then select White            |
| `../shortcuts/shellShortcutRouter.ts` | Choose which mounted shell receives a keyboard event        | Two Frame shells on one document                |
| `../shortcuts/shortcuts.ts`           | Pure shortcut matching, normalization, and capture          | Compare an event with `Ctrl+Shift+P`            |

## Command and CommandRegistry

`Command` is the instance for one action: its ID, label, callback, current
availability, enabled state, and state subscriptions. Its operations include
execution, state changes, and unregistering. Retained command references still
use the registry's execution rules; retaining a reference does not bypass a
disabled command or unavailable feature.

`CommandRegistry` is the owning list, available as `frame.commands`. It manages
registration and lookup, command discovery, shared execution checks, shortcut
overrides and dispatch, successful-execution listeners, and disposal. Its
convenience methods address commands by ID. It is the shared authority used by
the entry points below.

## CommandPrefixes: picker prefixes

These categories select which commands are listed when typing in the root
picker. They do not own commands or provide a group enable/disable operation.
The built-in `>` category represents Frame commands. Applications can register
another symbol, such as `!`, and assign commands to that discovery category
through their `quickInput` registration option. Register definitions through
`frame.commands.prefixes.register(...)`.

For example, `!` could select artwork commands while the ordinary application
list shows general commands. Each category provides a prefix, label, and
optional placeholder. Removing a category changes discovery; it does not
unregister its commands. This is distinct from feature availability and command
ID namespaces.

## ContextMenuCommands: context-menu integration

This is an internal adapter for actual menus attached to shell contributions,
such as workspace tabs, view bars, and status items. It is not a picker
category, command group, or Command Center submenu.

For example, a panel context menu can contain Hide, Display icons, and Move to
primary sidebar. `ContextMenuCommands.bind()` walks those entries:

1. Keep separators and explicit command references.
2. Reuse a matching built-in command where one exists.
3. Register remaining actions under a contribution-specific command ID, with
   `quickInput: false` so those contextual actions do not clutter root discovery.
4. Resolve menu presentation through the command system, including disabled
   state and feature availability.

Rebinding updates the actions used by existing registrations and unregisters
entries that disappeared. `dispose()` removes registrations owned by this menu;
it does not remove the built-in commands it reused.

## BuiltinCommands and ShellCommandBindings

`BuiltinCommands.install()` registers the commands Frame supplies. These are
ordinary commands with IDs, labels, feature ownership, context conditions, and
callbacks. Examples include opening settings, toggling a panel, and changing a
view bar's display mode.

`ShellCommandBindings.connect()` connects existing shell APIs to those commands.
Here, presentation means shell visibility, placement, display mode, and size.
It does not mean formatting a command's label or rendering picker rows.

For example, the public call `frame.panel.setPosition('left')` is routed through
`frame.layout.panel.position.left`. Disabling that command therefore also
blocks the public setter, as it blocks execution from a menu or shortcut.

Initialization order matters: built-in installation captures the original
controller operations first; presentation routing then replaces the public
methods with guarded entry points. The command callback invokes the captured
operation rather than calling its routed public method recursively. This is
an internal wiring adapter, not another command collection.

## CommandCenter, QuickPick, and nested choices

`CommandCenter` coordinates command selection using the existing Frame-owned
picker service. It holds a reference to `CommandRegistry`; the registry owns the
commands. Opening without an argument delegates to the existing root command
experience. Registered nested selections are handled by this controller.

QuickPick is the reusable selection surface/service. It displays rows, handles
search and selection, and returns a choice. Command Center supplies
command-specific entries, execution, restrictions, and navigation on top of it.
They are not two independent command lists.

### Nested submenus

A submenu is one set of choices displayed in the same picker. It has its own
entries and picker options, without creating a browser route or workspace tab. For example:

```text
Root command list
  Change background…
    Checkerboard
    Transparent
    Black
    White
```

The background choices constitute a picker submenu. A choice can itself contain
`items`, opening another level. The controller adds Back for child levels.

`CommandCenterSubmenuOptions` is the definition supplied to
`frame.commandCenter.register(...)`: an `id`, `label`, mixed `items`, optional
feature/permission/context restrictions, and picker options such as
`searchable: false`. Registration creates one discoverable command that opens
this choice screen. Entries can reference registered commands or be local
choices, structural rows, and nested choices. A local choice does not
automatically become a registered command.

`SubmenuState` is private navigation bookkeeping for a visit to one choice screen.
It contains its definition plus the current search text and highlighted item
ID. A stack of those records lets Back restore the parent selection and search
instead of starting over. It is temporary navigation state, not application
domain data or another public model to register.

The same submenu terminology is used in the public options and internal
navigation state.

## ShellShortcutRouter versus shortcut matching

`ShellShortcutRouter` routes keyboard events between mounted Frame shells, not
between command IDs. Consider an application with two shells and a portaled
menu. Both shells share the document, so independently handling every keydown
could execute the same shortcut twice or send it to the wrong shell.

The router shares one set of document listeners. Focus and pointer input record
the active shell; each shell's ownership predicate includes its portal content.
Eligible key events go to that shell's keyboard handler. Events targeting host
controls outside all shells are left alone. With one shell, eligible document
events can fall back to that shell.

The shell handler and command registry then determine what the shortcut does
and whether execution is allowed. The router itself does not parse shortcuts,
look up commands, or navigate the Command Center. Registration returns cleanup;
the final removal releases document listeners.

`../shortcuts/shortcuts.ts` contains stateless helpers: `normalizeShortcut` gives equivalent
spellings a canonical form, `matchesShortcut` compares a keyboard event with a
shortcut, and `shortcutFromEvent` captures a usable binding while excluding
composition and modifier-only input. They remain functions because they own no
state or lifecycle.

## Imports

Import internal implementations and types from their owning files. Consumers
use the public package root. The removed `commands.ts` file was a compatibility
re-export barrel, not the command system's controller or collection.
