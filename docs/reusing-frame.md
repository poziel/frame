# Reusing Frame

The public source entry point is `src/frame/index.ts`. Frame can be built as a private local package with `bun run build:library`; see [Library and theme boundaries](library-and-themes.md). It adds no component or icon dependencies.

Create one stable Frame instance per shell. Application components live outside the shell and register themselves with that instance:

```vue
<script setup lang="ts">
import { onBeforeUnmount } from "vue";
import { createFrame, FrameShell } from "./frame";
import MySidebar from "./MySidebar.vue";
import MyOutput from "./MyOutput.vue";

const frame = createFrame();
const removeSidebar = frame.registerSidePanel({
  id: "myapp.overview",
  label: "Overview",
  component: MySidebar,
});
const removeTab = frame.registerBottomTab({
  id: "myapp.output",
  label: "Output",
  component: MyOutput,
});
const removeCommand = frame.registerCommand({
  id: "myapp.show-output",
  label: "My app: Show output",
  shortcut: "Ctrl+Alt+O",
  run: () => frame.openBottomPanel("myapp.output"),
});
onBeforeUnmount(() => {
  removeCommand(); removeTab(); removeSidebar();
  frame.dispose();
});
</script>

<template>
  <FrameShell :frame="frame">
    <div class="my-canvas">Application workspace</div>
  </FrameShell>
</template>
```

Omit the default slot to use the quiet welcome canvas. `App.vue` and `src/examples/` contain a working host example, including dynamic additions and removal.

## Commands

`registerCommand({ id, label, detail?, shortcut?, group?, enabled?, run })` returns a function that unregisters that contribution. IDs must be unique; duplicates throw. Reserve the `frame.` prefix for shell-generated commands. Use an application prefix for your own IDs.

`run` can be synchronous or asynchronous. Exceptions are caught by `executeCommand(id)` and reported in the status message and bounded session log. `enabled()` is evaluated reactively; unavailable commands are shown disabled and cannot run. Commands should read any reactive state they depend on inside `enabled`.

`shortcut` supports a key with `Ctrl`, `Shift`, and/or `Alt`, separated by `+`. `Ctrl` also accepts Command on macOS. Ctrl+P, Ctrl+Shift+P, and Ctrl+T are reserved for Quick actions. A `group` of `View` includes the action in the application menu; all registered commands are searchable in Quick actions.

Built-in actions cover showing, closing, and toggling panels, resetting the layout, showing quick actions, and minimizing, maximizing/restoring, or closing the native window. Native-only actions are disabled in browser previews. Layout shortcuts are Ctrl+B and Ctrl+J.

## Side panels and bottom tabs

Both registration APIs accept `{ id, label, component, props? }` and return an unregister function. Side panels additionally accept an optional Vue `icon` component and `showInRail` (default true). Without an icon, the rail displays the first letter of the label.

Registering a side panel automatically adds `frame.side.<id>` to Quick actions and the application menu. Registering a tab adds `frame.tab.<id>` to Quick actions. Unregistering also removes these generated commands. Registering does not automatically open the UI; call `openSidePanel(id)` or `openBottomPanel(id)`.

Removing a selected side panel closes its container and selects a remaining view for the next opening. Removing a selected bottom tab selects a remaining tab; removing the last tab hides the panel. Disposers are safe to call more than once and cannot remove a newer registration that reused an ID.

Bottom tabs support arrow-key, Home, and End navigation with proper tab/tabpanel associations. Tab components remain mounted while switching tabs or hiding the panel, preserving local state until unregistered. Side-panel components can unmount when the sidebar closes; retain durable view state in your app's store or Frame-scoped services.

Use `useFrame()` inside any component rendered by the shell to access that instance. State is session-only. Call `record(message)` to append output to the Session tab (up to 100 entries).

## Custom quick picks

The same quick-input component can display arbitrary application choices. File handling is not involved.

```ts
const choice = await frame.showQuickPick([
  { id: "draft", label: "Draft", detail: "Work in progress", value: 1 },
  { id: "review", label: "Review", detail: "Ready for feedback", value: 2 },
], { title: "Choose a stage", placeholder: "Type a stage…" });

if (choice) console.log(choice.value);
```

The result retains the caller's item type. Escape, an outside click, replacement by another picker, or `frame.dispose()` resolves the promise to `undefined`. Disabled items cannot be chosen. Each request starts with a fresh query. The command picker reads the live command registry, so additions and removals appear while it is open.

## Components and tooltips

`FrameShell`, `FrameMenu`, `ActivityRail`, `SidePanel`, `BottomPanel`, `QuickInput`, and `FrameTooltip` are exported for composition. For source imports, `FrameShell` includes the shell stylesheet. For the built library, import `@frame/core/style.css` explicitly. When using individual source components, import `src/style.css` yourself.

Tooltips share the shell palette, appear after 400ms on hover or immediately on keyboard focus, and dismiss with Escape. They are positioned within the viewport and rendered above containers using Teleport. Use the slot's `describedby` value for an accessible association. Do not also add a native `title` attribute:

```vue
<FrameTooltip text="Show output" shortcut="Ctrl+J" v-slot="{ describedby }">
  <button :aria-describedby="describedby" @click="showOutput">Output</button>
</FrameTooltip>
```

All scroll areas inherit thin themed scrollbars. The bottom panel has its own rounded container, a horizontal tab strip, and independent scrolling for each tab's content.


See [View interactions](view-interactions.md) for movable views, per-view actions, padding, accordion sections, context menus, and configurable toolbar actions.
