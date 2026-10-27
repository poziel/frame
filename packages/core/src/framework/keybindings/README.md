# Keybindings

`Keybindings` owns shortcut override hydration, serialization, persistence, and
its shared preference page. `CommandKeybindings` owns reactive override storage,
normalization, registered defaults, and atomic replacement.
`CommandShortcutResolver` evaluates shortcut contexts and finds the first
eligible matching command in registration order.

`CommandRegistry` retains its public binding methods as delegates and supplies
live command definitions and execution gates to these instance-owned classes.
Disposing the registry clears its binding overrides. No binding state is shared
between Frame instances.

`../shortcuts/` owns keyboard event routing and pure shortcut parsing, matching,
and capture. `../preferences/` owns shared document and presentation models.
