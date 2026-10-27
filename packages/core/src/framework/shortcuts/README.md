# Keyboard shortcuts

`ShellShortcutRouter` owns document listeners and routes keyboard events to the
active Frame shell, including its portals. It shares listeners across shells
and releases them when the final registered owner is removed.

`shortcuts.ts` contains stateless helpers for canonical shortcut spelling,
keyboard-event matching, and binding capture. These helpers require no Frame.

Command-specific bindings, overrides, conflict discovery, and guarded execution
remain owned by `CommandRegistry` in `../commands/`. Routing a keyboard event
and deciding whether a command may execute are separate responsibilities.
