# Commands and quick input

Register application actions so keyboard shortcuts, menus, buttons, and Quick actions invoke the same behavior. Examples assume a stable `frame` instance and host-owned Vue refs/components.

```ts
const removeCommand = frame.commands.register({
  id: 'myapp.show-output', label: 'My app: Show output',
  detail: 'Open application output', group: 'View', shortcut: 'Ctrl+Alt+O',
  enabled: () => canShowOutput.value,
  run: () => frame.openView('myapp.output'),
});
await frame.commands.execute('myapp.show-output');
```

Required fields are `id`, `label`, and `run`; optional fields include `feature`, `available`, `enabled`, `visible`, `detail`, `group`, `icon`, `shortcut`, and `quickInput`. The default feature is `application`. `run` can return void or a promise. Read reactive dependencies inside predicates to keep presentation current. IDs must be unique; reserve `frame.` for Frame. Registration returns an unregister function.

## Availability, usability, and visibility

`available`, `enabled`, and `visible` accept booleans or predicates. An unavailable command is hidden everywhere and cannot execute. A disabled command remains visible but cannot execute. A hidden command can still execute if available and enabled. Setting `quickInput: false` hides only its picker entry.

```ts
frame.commands.disable('myapp.save'); // Visible but disabled.
frame.commands.enable('myapp.save');  // Still respects its enabled predicate.
frame.commands.setAvailable('myapp.save', false); // Hidden and execution blocked.
frame.features.setAvailable('documents', false); // All commands owned by documents.
```

Execution checks the owning feature, command availability, and enabled condition every time, including calls through retained registry command objects. Restoring a feature does not override individual command restrictions. Inspect with `get(id)`, `list()`, `items.value`, `isAvailable(id)`, `isEnabled(id)`, and `isVisible(id)`. `frame.resolveMenuItems(items)` recursively applies command state to menu trees; shell menus and Frame menu wrappers inside a shell use it automatically. Hosts building their own command buttons should use the same queries.

## Prefix categories

Commands appear in global application quick input by default (`quickInput` omitted or `true`). Register a category before assigning its prefix:

```ts
const removeCategory = frame.commands.categories.register({
  prefix: '!', label: 'Artwork actions', placeholder: 'Search artwork actions…',
});
frame.commands.register({
  id: 'myapp.inspect', feature: 'artwork', label: 'Inspect artwork',
  quickInput: '!', run: inspectArtwork,
});
frame.openQuickInput('!');
```

Prefixes are single non-alphanumeric, non-whitespace Unicode characters. Duplicates are rejected. Frame reserves `>` for system commands. `quickInput: '>'` selects it explicitly; legacy `scope: 'frame'` also selects it when no explicit category is supplied. Other categories remain application categories. Registration returns cleanup; `categories.get(prefix)` and `categories.list()` inspect them. Removing a category hides its picker entries while preserving command registration and other access.

Type a registered prefix followed by Space or Tab to enter its category. Backspace at the start returns to global input. Custom quick picks treat prefixes literally.

`frame.registerCommand()` and `frame.executeCommand()` remain compatibility aliases; prefer the grouped API. `frame.commands.value` remains a compatibility accessor for `frame.commands.items.value`.

`executeCommand` checks availability and catches action errors, reporting them through status and the bounded session log. Commands default to `scope: 'application'` and appear in application quick input. Set `scope: 'frame'` for shell or extension controls in Frame commands. Set `quickInput: false` to retain API/menu/shortcut access while hiding the command from both pickers. Application commands with `group: 'View'` join the default View menu. A custom menu tree must supply its own items.

## Shortcuts

Use Ctrl, Shift, and/or Alt separated by `+`, plus a key. Ctrl also accepts Command on macOS. Ctrl+P opens application quick input. Ctrl+Shift+P opens Frame commands with the `>` operator. Ctrl+T creates a workspace tab when creation is enabled in the active pane. Ctrl+B toggles the primary sidebar; Ctrl+J toggles the panel.

Built-in commands register when `createFrame()` runs; the mounted `FrameShell` installs keyboard routing. Application registration can happen before mounting. `frame.openQuickInput()` opens application choices; `frame.openCommands()` (or `frame.openQuickInput('frame')`) opens Frame commands. Typing `>` followed by Space or Tab switches application input to Frame commands. Backspace at the start of the query removes the displayed operator and returns to application choices. Arrow keys navigate, Enter runs the selected enabled choice, and Escape closes.

Shortcuts are captured across the owning shell and its portals, including menus, status bar, sidebars, and quick input. With multiple shells, the most recently focused or clicked shell handles shortcuts; unmounting releases its registration. Focus in unrelated host content is left to the host. Extension shortcuts use the same registration and enabled checks in either picker mode. Ctrl+P and Ctrl+Shift+P are reserved picker shortcuts.

```ts
const removeExtensionCommand = frame.registerCommand({
  id: 'myextension.preferences', label: 'My extension: Preferences',
  scope: 'frame', shortcut: 'Ctrl+Shift+Y',
  run: () => openExtensionPreferences(),
});
// Dispose the contribution when the extension is removed.
removeExtensionCommand();
```

Frame commands include layout, registered views, workspace tab activation, settings, and window controls. View choices use `View: <name>` and show their registered icon. Duplicate names add `(Primary sidebar)`, `(Secondary sidebar)`, or `(Panel)`; duplicates within one region additionally include the parent path and stable view ID. These labels follow view movement and unregistering without changing command IDs. Literal, case-insensitive search matches in labels and descriptions render bold in the accent color; hovered and keyboard-selected choices keep the bold text in their inherited foreground color. Native minimize, maximize/restore, and close are disabled in a browser; full screen depends on platform support. Theme commands use only themes explicitly registered with `frame.theme.register(theme)` plus the Frame default reset. Core does not load a theme collection automatically.

## Custom choices

```ts
const choice = await frame.showQuickPick([
  { id: 'draft', label: 'Draft', detail: 'Work in progress', value: 1 },
  { id: 'review', label: 'Review', detail: 'Ready for feedback', value: 2 },
], { title: 'Choose a stage', placeholder: 'Type a stage' });
if (choice) console.log(choice.value);
```

Items require `id` and `label`, accept `detail`, `icon` (a bundled icon name or Vue component), `shortcut`, and `disabled`, and retain additional typed host data in the result. Options are `title` and `placeholder`. Disabled items cannot be selected. An item shortcut accepts that choice while its picker is open; it takes precedence over a registered command with the same shortcut. Custom quick picks treat `>` as ordinary filter text and do not switch modes. Escape, outside dismissal, replacement by another picker, or disposal resolves to `undefined`.

## Navigation history

Enable `createFrame({ navigation: true })` to track workspace content changes and opened views. Use `frame.navigation.back()`, `forward()`, and `clear()`. `canGoBack` and `canGoForward` are reactive boolean getters. Group synchronous changes with `navigation.record(() => { /* navigate */ })`.

History does not undo domain edits or pane geometry and does not replace the host router. `frame.layout.navigationVisible` hides arrows while preserving history. Disabling `frame.features.navigation` clears it. The separate [navigation bar](navigation-bar.md) holds application actions and links.

## Cleanup and logging

`frame.record(message)` appends to `frame.state.entries`, an in-memory log bounded to 100 entries. It does not create a Session view; render one yourself if needed.

Call unregister functions when removing individual contributions, and `frame.dispose()` when destroying the owning shell. Host-created services and subscriptions retain their own cleanup responsibilities.

## Run custom code after a command

`frame.commands.hook` observes commands without replacing their handlers.
It runs after the handler resolves without throwing, whether execution came from
a shortcut, menu, quick input, retained command reference or `commands.execute`.

```ts
const unsubscribe = frame.commands.hook('myapp.save', async event => {
  await refreshApplicationData();
  console.log(event.id, event.label);
});
const stopObserving = frame.commands.hook(event => {
  console.log('Completed:', event.id);
});
unsubscribe();
stopObserving();
```

The event is an immutable `{ id, label }` value. Listeners run in registration
order and may return a promise; `execute` waits for them. A listener failure is
reported through Frame's command error handling without preventing later listeners.
Unknown, unavailable, disabled and throwing commands do not emit completion events.
A resolved handler can still have cancelled a domain operation (for example, an
unsaved-document dialog); check the resulting state before taking follow-up action.
Direct controller API calls are observed through that controller's own events,
rather than being represented as command executions.

Subscriptions are instance-owned and can target command IDs that register later.
The returned cleanup is idempotent. Disposal removes subscriptions and prevents
delivery after pending commands finish; listeners removed during delivery are skipped.
