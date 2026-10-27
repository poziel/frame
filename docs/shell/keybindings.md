# Keyboard shortcuts

Open the built-in editor with `frame.openKeybindings()`, the Manage menu's
**Keyboard Shortcuts** entry, or the `frame.keybindings` command. Embed the same
editor with `<FrameKeybindings />` beneath a `FrameShell` provider.

The default shortcut is Ctrl+Shift+comma, adding Shift to Settings' Ctrl+comma.

The editor lists registered commands, including commands without a shortcut.
Search matches command labels, IDs, details, shortcuts, activation labels, and sources.
The When column shows `whenLabel`, `customCondition` for an unlabeled predicate,
or `true` for a command without an extra shortcut restriction. Built-in commands
provide named conditions such as `panelAvailable` and
`workspaceAvailable && workspaceCanCreateTab`. The displayed context and
keyboard dispatch use `frame.commands.getShortcutCondition(id)`; its `active`
value also respects feature availability, permissions, and enabled state.
Commands without a shortcut leave the binding column empty. Use the left-side
Add/Edit action, or double-click anywhere on a row, to record a new combination.
Focus a row and press Enter for keyboard access. Press Enter again to save or Escape to cancel. Remove clears an
assignment; Reset restores its registered default.

There are three row actions: Add/Edit, Remove, and Reset to Default. Reset is
shown only when a user override exists. Actions share one flex row at the left;
the keybinding column contains only keycaps. Action and keycap colors remain
themeable through `--frame-keybindings-action-*` and `--frame-keycap-*` tokens.

Duplicate assignments are allowed. The capture dialog warns about other
assignments regardless of whether their commands are currently enabled. Its
**Show matches** link cancels the edit, closes the dialog, and searches for the
exact combination using `key:ctrl+s` syntax.

```ts
frame.commands.register({
  id: 'editor.save', label: 'Save document', source: 'Editor',
  shortcut: 'Ctrl+S',
  when: () => editorHasFocus.value,
  whenLabel: 'editorHasFocus',
  enabled: () => canSave.value,
  run: () => saveDocument(),
});

frame.commands.setKeybinding('editor.save', 'Ctrl+Shift+S');
frame.commands.setKeybinding('editor.save', null); // Remove the assignment.
frame.commands.resetKeybinding('editor.save'); // Restore Ctrl+S.
const overrides = frame.commands.getKeybindings();
```

The capture dialog has an accessible hidden title and no footer. The recorded
combination uses [FrameKeycap](../components/keycap.md), also used by the list.
Only a conflict adds text below the keys, as a link to the exact-binding search.
`whenLabel` is descriptive metadata; it is never evaluated as code.

`when` restricts keyboard activation. `enabled` and feature availability still
gate all command execution. If multiple commands match and are enabled in the
current context, the first registered command wins; Frame never runs all
conflicting commands on one key press. Context predicates are host code, not
evaluated expression strings. Existing Ctrl/Cmd/Meta/Mod aliases retain Frame's
cross-platform primary-modifier behavior.

Settings and Keyboard Shortcuts share the same preference page lifecycle: a search
bar, modal/tab controls, and optional JSON editing. Empty workspace panes can host
either page. Their search text and JSON drafts remain separate.

```ts
const frame = createFrame({
  keybindings: { storage: {
    read: () => files.read('keybindings.json'),
    write: json => files.write('keybindings.json', json),
  } },
}).use(editorModule);
frame.openKeybindingsInTab();
frame.openKeybindingsInModal();
frame.openKeybindingsJSON();
await frame.keybindings.flush();
```

The host chooses the file location. Without a storage adapter, overrides stay in
memory. The JSON object maps command IDs to shortcut strings or `null` to remove
an assignment; omitted overrides restore command defaults. Unknown IDs survive
until their commands register. Invalid files remain untouched. Edits made during
loading win over incoming values. Errors appear in `frame.keybindings.error`.
`frame.keybindings.search`, `mode`, and `json` expose the same page API as Settings.
JSON drafts require Save or Ctrl/Cmd+S; returning to the form discards draft edits.
Feature disposal releases both the page and its persistence watcher.
