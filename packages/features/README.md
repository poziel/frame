# @frame/features

Renamed from `@frame/extras`. Update package dependencies/imports, stylesheet imports, and the build command to `bun run build:features`. Local native hosts must update their terminal plugin path from `packages/extras/tauri` to `packages/features/tauri`. Existing standalone component/controller exports are retained; `.use()` and typed feature factories remain proposed APIs.

Optional ready-made features for Frame applications. Core never imports Features. Features has peer dependencies on @frame/core and Vue, and does not register anything merely by being imported.

```vue
<script setup lang="ts">
import { onBeforeUnmount } from 'vue';
import { createFrame, FrameShell } from '@frame/core';
import { createNotificationHistory, NotificationPanel, NotificationIndicator } from '@frame/features';
import '@frame/core/style.css';
import '@frame/features/style.css';
const frame = createFrame();
const history = createNotificationHistory(frame, { limit: 200 });
onBeforeUnmount(() => { history.dispose(); frame.dispose(); });
</script>
<template>
  <FrameShell :frame="frame">
    <template #overlays><NotificationPanel :frame="frame" :history="history" :bottom="38" /></template>
    <template #status-actions><NotificationIndicator :history="history" /></template>
  </FrameShell>
</template>
```

The panel keeps a bounded in-memory history of notifications emitted after subscription. Expiring or dismissing a core notification does not delete history. Clearing history does not dismiss active messages. No bell, history, commands, or panel are installed by core. The application may register its own command using `history.toggle` and should dispose the history on unmount. Panel `bottom` is a pixel offset; adapt it when changing status-bar visibility or density.

Build core first with `bun run build:library`, then run `bun run build:features`. Both are private workspace packages; nothing is published.

## Code editor

`CodeEditor` is a standalone Monaco surface. Use it in any sized container, with or without Frame Shell. It uses `@shikijs/monaco` and the same lazy Shiki engine, grammars and `CodeBlockTheme` palette as Core's `FrameCodeBlock`. Monaco itself loads on first mount and stays out of Core.

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { CodeEditor, createCodeEditor, type CodeEditorOptions } from '@frame/features';
import { CodeBlockTheme } from '@frame/core';
import '@frame/features/style.css';

const code = ref('const answer = 42;');
const editor = createCodeEditor(); // Optional: access this surface from application code.
const options: CodeEditorOptions = {
  fontSize: 14, tabSize: 2, insertSpaces: true,
  wordWrap: 'on', minimap: { enabled: false }, folding: true,
};
</script>
<template>
  <CodeEditor v-model="code" :editor="editor" language="typescript"
    :theme="CodeBlockTheme.DarkPlus" :read-only="false"
    :options="options" label="Application source" style="height: 400px" />
</template>
```

No props are required. Supply a height on the component or its parent; the surface otherwise fills its parent. Props:

| Prop | Default | Meaning |
| --- | --- | --- |
| `modelValue` / `v-model` | Empty source | Code string; changes emit `update:modelValue`. Without a binding, local edits remain in the mounted model. |
| `editor` | Internal controller | Optional `CodeEditorController`. A controller attaches to one mounted surface at a time. |
| `language` | `plaintext` | Shiki language ID or alias. Unknown names fall back to plain text. |
| `theme` | `CodeBlockTheme.DarkPlus` | Shares the Code Block enum, including light and dark themes. |
| `readOnly` | `options.readOnly` or `false` | Direct override that blocks user editing. Host code updates still work. |
| `options` | See below | Typed `CodeEditorOptions` object; supports Monaco construction and text model options. |
| `label` | `options.ariaLabel` or `Code editor` | Accessible editor name. |
| `autofocus` | `false` | Focus once initial loading completes. |

Direct props take precedence over nested options. `value`, `model`, `language` and `theme` are excluded from `CodeEditorOptions` because the component manages them. Defaults enable automatic layout, use 14px text, disable the minimap and scrolling beyond the last line, and disable semantic highlighting so TextMate colors stay consistent with Code Block. Other Monaco defaults apply. Options are applied as reactive patches: set a previous option to its desired default explicitly when reverting it. Monaco construction-only settings require remounting. Passing options does not require constructing a class.

Configuration includes fonts and ligatures, indentation, line numbers, wrapping, minimap, folding, sticky scroll, rulers, scrollbar, cursor, bracket pairs, suggestions, hover, accessibility, whitespace and other native Monaco editor settings. Arbitrary Shiki languages receive syntax highlighting; completion, diagnostics and formatting require a corresponding Monaco language provider. The bundled Monaco distribution includes JavaScript/TypeScript, JSON, CSS and HTML services. No files are read or saved automatically, and no remote language server or CDN is started.

Events: `ready(controller)`, `update:modelValue(code)`, `change(code, MonacoContentEvent)`, `selection(MonacoSelectionEvent)`, `focus()`, `blur()`, and `error(cause)`. Loading has a status message; initialization failures display an alert and emit `error`.

Controller methods: `focus()`, `undo()`, `redo()`, `find()`, `replaceCode(code)`, `format()`, `runAction(id)` and `layout()`. Boolean methods return false when unavailable; formatting/actions return `Promise<boolean>` and reject if a provider throws. `replaceCode` creates an undoable whole-document edit and works in read-only mode. `instance.value` exposes the current `IStandaloneCodeEditor` for native selections, markers, decorations, commands and model access. Keep Monaco resources you create yourself under application ownership and dispose them yourself. The component owns its own model, listeners and editor and disposes them on unmount. Text bound through `v-model` survives remounting; model undo history and selection do not. The controller detaches on unmount and can be reused. Do not call its internal `attach` method from application code.

Monaco themes and token providers are shared across Monaco instances: changing one editor's theme changes all mounted Monaco editors. Code Block can use a separate theme. Host options can re-enable semantic highlighting, which may change colors compared with Code Block.

The component uses the installed Monaco ESM package and local worker assets. Use a bundler that handles Monaco's module workers (the Docs app uses Vite), and serve the resulting worker files with the application. Monaco 0.57 supplies worker factories; no `MonacoEnvironment` override is needed in the Vite example. If your app already configures `MonacoEnvironment`, its worker factory takes precedence and must support the editor and enabled language services. Other bundlers and desktop webviews have not been browser-verified here.

Verification: `bun test tests/code-editor.test.ts tests/code-block.test.ts`, `bun run build:library`, `bun run build:features`, `bun run check:consumer`, and, with the Docs server running, `uv run --with playwright python tests/code-editor-browser.py`. The Docs component catalog includes a Code editor example with live Code Block output.

## Desktop terminal

`Terminal` is a terminal surface without a toolbar. `TerminalView` adds shell selection, sessions, a sidebar, side-by-side splits, rename, session colors, search and clear. `createTerminalView` puts those actions in Frame's existing view header. All terminal code, dependencies and the native plugin belong to Features; Core has no terminal dependency.

In the host's `src-tauri/Cargo.toml`, opt into the bundled native crate (adjust the path for your application):

```toml
[dependencies]
tauri-plugin-frame-terminal = { path = "../../features/tauri" }
```

Register `.plugin(tauri_plugin_frame_terminal::init())` on the Tauri builder, and add `"frame-terminal:default"` to the local window's capability permissions. For HTTP links, register `tauri-plugin-opener` and grant its `opener:default` permission too. Grant terminal permissions only to trusted local application content: they allow launching interactive shells with the application's user privileges.

```ts
import { createTerminal, createTerminalView } from '@frame/features';
import '@frame/features/style.css';

// Keep this controller in the application owner, outside a disposable view.
const terminal = createTerminal({ cwd: 'D:\\projects' });
const removeView = frame.registerView(createTerminalView({
  id: 'app.terminal', frame, terminal,
}), 'bottom');
frame.openView('app.terminal');

// At application teardown, not when the view is hidden:
// removeView(); await terminal.dispose();
```

For a simple surface in any sized container:

```vue
<Terminal :terminal="terminal" profile="pwsh" style="height: 320px" />
```

Omit `profile` to use the detected preferred shell. Pass a profile ID or its exact display name. `await terminal.detectProfiles()` returns installed shells with executable paths and a default flag. Windows detection prefers PowerShell 7, then Windows PowerShell, Command Prompt, Git Bash and configured WSL. This detects installed shells; it does not import Windows Terminal settings, saved profiles or custom executables. macOS/Linux detection and PTY support are included but untested on those platforms.

Use `const session = await terminal.create('cmd')` and `<Terminal :terminal="terminal" :session-id="session.id" />` to reattach without spawning a second process. A simple terminal can also create its own controller; its `ready(controller, sessionId)` event exposes ownership. Keep that controller if you need to reattach or close it later. Changing `profile` or `cwd` after mount does not replace an existing shell.

`TerminalView` accepts `terminal`, `toolbar` (default true), `sidebar` (initial selector visibility, default true), `autoStart` (default true), and `sessionLayout` (`'sidebar'` by default, or `'tabs'`). `createTerminalView` accepts `id`, `frame`, `terminal`, optional `label`, `autoStart`, and `sessionLayout`. For example, `createTerminalView({ id: 'app.terminal', frame, terminal, sessionLayout: 'tabs' })` puts the session selector above the terminal panes. The options dropdown switches between sidebar and tabs. Its Show terminal sidebar / Show terminal tabs checkbox controls the selected layout; both stay hidden when only one session is open, even when enabled.

The header uses Frame's standard tooltips and anchored dropdown; its profile picker uses Quick input. Right-click a session (or press Shift+F10 while its button is focused) to rename it or change its color. Split creates an independent process next to the active session; connected sidebar lines identify sessions in the same split group. Selection tracks terminal focus, and choosing a session focuses that shell. Tabs support Left/Right and Home/End navigation. The close action overlays a session only on hover or keyboard focus, without reserving space. Separate split terminals returns sessions to individual groups.

Drag the vertical dividers to resize adjacent terminal panes or the sidebar. Resize handles support arrow keys; double-click or Home resets pane widths or the sidebar width. Pane proportions and the sidebar's preferred width survive parent resizing within the mounted view. Give the parent a defined height (or a constrained flex/grid area); the terminal fills that height and updates the shell's row/column dimensions as its container changes. Frame-managed terminal views fill the panel content automatically.

Ctrl+Shift+C copies selected output; Ctrl+Shift+V and normal paste events paste into the shell. Ctrl+C remains the interrupt key. Ctrl+F searches the active terminal buffer; Enter/Shift+Enter find the next/previous match. Clear clears the active screen and scrollback without killing its shell. Ctrl+click opens HTTP/HTTPS links through the host opener; other URI schemes are ignored. The fixed terminal font and dark palette have no user settings in this version.

Hiding, moving, or unmounting a surface keeps its shell and terminal buffer alive. Explicit session close and controller disposal terminate processes; native window/application teardown cleans up its sessions. Nothing persists across application restarts. Scrollback is limited to 5,000 lines; output received before the first surface attaches is capped at 1 MiB. Browser use shows a desktop-only error, and no server is started. `TerminalBackend` is an adapter interface for future transports; this release includes only the Tauri backend.

Verification: `bun test tests/terminal.test.ts`, `cargo test --manifest-path packages/features/tauri/Cargo.toml`, and, with the Docs dev server running, `uv run --with playwright python tests/terminal-browser.py` and `uv run --with playwright python tests/terminal-layout-browser.py`. Browser UI checks use an in-memory adapter; Cargo tests run real native PTYs on the test machine.

## AI chat

`AIChat` is a chat room with a multiline composer, local file/folder attachments, ordered thinking and message parts, stop, copy, forge, and reversible prompt editing. It does not connect to an AI service or start one.

```vue
<script setup lang="ts">
import { onBeforeUnmount } from 'vue';
import { AIChat, createAIChat, type ChatMessage } from '@frame/features';
import '@frame/core/style.css';
import '@frame/features/style.css';

const chat = createAIChat({
  async respond(request, response) {
    const thinking = response.thinking('Reading the prompt…');
    // Connect your backend here; use request.signal for cancellation.
    response.updateThinking(thinking, 'Ready to reply.');
    response.finishThinking(thinking);
    response.message(`You wrote: ${request.prompt}`);
    response.message('Multiple messages belong to the same generation.');
    response.complete();
  },
});
function forge(messages: ChatMessage[]) {
  // Open a new host-owned conversation initialized with this snapshot.
  console.log(messages);
}
onBeforeUnmount(() => chat.dispose());
</script>
<template><div style="height: 600px"><AIChat :chat="chat" @forge="forge" /></div></template>
```

`respond(request, writer)` receives a snapshot of the conversation through the latest user prompt, attachments, and an abort signal. Return a promise covering the whole generation. Writer calls append parts in order; `append(id, text)` streams text into an existing message part. `complete()` closes unfinished thinking, records the generation duration, and ignores late events. Returning from the responder also completes the generation. Thrown errors are displayed inline; Stop aborts the signal and ignores subsequent writes. Dispose the controller when its owning conversation closes; unmounting a room alone does not stop a host-owned conversation.

`chat.state` exposes `messages`, `draft`, `attachments`, `busy`, and `rewindId`. Initial `messages` can be passed to `createAIChat`. Messages contain ordered `ChatPart` objects (`message` or `thinking`) plus timestamps, attachments, and completion status. Thinking text is provider-supplied display content; the component does not invent it. Plain text is rendered safely without interpreting HTML.

`rewind(id)` previews editing a user message, retaining its replies until Send commits the replacement. Cancel with the same rewind button, the composer X, Escape, or `cancelRewind()`; the previous draft and attachments are restored. `fork(id)` returns an independent prefix snapshot ending at an assistant response. The `forge(messages, source)` event lets the host open it; the room does not manage sessions. The docs demo opens the forged snapshot in the same room.

While rewinding, the composer shows a single-line preview of the original prompt. Click it to scroll back to that message; editing the draft does not change the preview. Message actions fade in on hover or keyboard focus and stay available on touch devices. Consecutive thinking parts share one compact muted accordion; consecutive message parts share one text block with paragraph spacing. Grouping affects only presentation, preserving the original part IDs and order for streaming updates.

| Prop / event / slot | Behavior |
| --- | --- |
| `chat` | Required `AIChatController` from `createAIChat` |
| `label`, `placeholder` | Accessible room label and composer placeholder |
| `userAlignment`, `assistantAlignment` | Independently choose `left` or `right`; defaults: right / left |
| `attachmentActions` / `attachmentAction` | Extra `FrameMenuItem` actions / selected item event; reserve IDs beginning `chat-` |
| `speechEnabled` / `speech` | Host-supplied speech input; disabled by default. Write recognized text into `chat.state.draft` |
| `copy` | Emitted with the message after successful clipboard copy |
| `message-actions` | Slot receiving `{ message }` for additional actions |
| `composer-actions`, `empty` | Slots for additional composer controls and empty conversation content |

The plus menu uses browser file and folder pickers. Selected `File` objects remain in memory on attachments; no automatic upload or persistence occurs. Folder selection depends on browser support and exposes selected file paths relative to that folder. Hosts can provide native adapters through custom attachment actions. Enter sends, Shift+Enter adds a line, and IME composition does not submit. The waiting border respects reduced motion. The room scrolls with new content when near the bottom and offers a jump action when reading earlier messages.

Run `bun run dev`, then open **Components → Features → AI chat** for the local streaming mock server. It returns a random sentence and a second message after simulated thinking. The endpoint also runs with `bun run preview`; static hosting needs its own backend. No AI credentials are used.

Future candidates are terminal and file explorer features. Applications must supply process, model-provider, and filesystem adapters; Features should not start services or configure credentials.
