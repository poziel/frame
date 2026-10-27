# Core modules

Optional modules ship in the same `@frame/core` package. Import only the modules your application uses. Each module owns its components, controllers, styles, and backend interfaces. Module entry points import their styles automatically. Monaco, PDF.js, and xterm are automatic package dependencies; no separate engine installation is required. The main `@frame/core` entry does not import modules. Monaco and PDF support load lazily when their surfaces are used.

## Shared module structure

Every module uses the same root organization. Keep its root limited to the
public entry point, a local guide, and the responsibility folders below:

```text
<module>/
  index.ts
  README.md
  components/
  controllers/
  services/
  integrations/
  types/
  styles/
    index.css
```

| Location        | Responsibility                                                                               |
| --------------- | -------------------------------------------------------------------------------------------- |
| `index.ts`      | Supported public exports and the module's `styles/index.css` import                          |
| `README.md`     | Module-specific file map, ownership, and integration notes                                   |
| `components/`   | Vue surfaces and their private visual parts                                                  |
| `controllers/`  | Stateful behavior and owned lifecycle, whether currently implemented as factories or classes |
| `services/`     | Supporting operations such as engines, transports, parsing, and detection                    |
| `integrations/` | Connections to Frame capabilities, views, settings, or other shell contributions             |
| `types/`        | Contracts shared across module responsibilities and ambient declarations                     |
| `styles/`       | Module-owned CSS; `index.css` is the common stylesheet entry                                 |

These are the standard root folder names for future modules. Create a folder
when it has a meaningful responsibility; do not add empty directories or invent
controllers and integrations merely to fill the template. Modules may use
different subfolders within these roots. A small interface used by one class
stays beside that class. Existing mixed implementation/type files remain intact
until a dedicated refactor separates them.

Current module organization:

- [Chat](chat/README.md): conversation/history controllers, conversation and
  content components, agent services, content processing, and view integration.
- [Editor](editor/README.md): editor controller and component, Monaco services,
  module installation, and settings-editor integration.
- [Notifications](notifications/README.md): history controller and presentation
  components, with optional toolbar/status registrations owned by a separate
  shell-binding integration.
- [Terminal](terminal/README.md): session controller, terminal components, xterm
  services, and Frame view integration.
- [Viewer](viewer/README.md): viewer components, format renderers, detection
  services, and ambient types. It currently needs no independent controller.

### Module boundaries and change rules

Applications import `@frame/core/modules/<name>`, never internal folder paths.
Keep those public import paths, export names, and stylesheet side effects stable
when reorganizing implementations. Internal code and repository tests should
point directly to the owning files instead of adding compatibility barrels at
the old locations. The main Core entry must not import optional modules.

Keep engine loading, backend adapters, and caller-owned resources within their
existing lifecycle boundaries. Moving a module must not start requests,
authentication, processes, or view registration during import. Only editor
currently supplies a typed module descriptor; placing code in `integrations/`
does not imply that another descriptor exists.

For a file-organization pass, move implementations and update references without
changing behavior or converting factories to classes. Apply the
[coding standards](../../../../docs/contributing/coding-standards/README.md)
when editing code. Then regenerate source-linked documentation with
`bun run docs:contracts`, build with `bun run build:library`, and run relevant
module tests, `bun run check:consumer`, and `bun run check:modules`. Update paths
in documentation extraction and tests along with imports. Verify lazy engine
loading and module isolation after changes to runtime or stylesheet paths.

## Public module imports

| Module                               | Public import                       |
| ------------------------------------ | ----------------------------------- |
| Code editor and settings JSON editor | `@frame/core/modules/editor`        |
| Terminal                             | `@frame/core/modules/terminal`      |
| File viewer                          | `@frame/core/modules/viewer`        |
| AI chat and agent adapters           | `@frame/core/modules/chat`          |
| Notification history                 | `@frame/core/modules/notifications` |

Imports register no views and start no requests or processes. Applications explicitly create controllers, mount components, supply backend adapters, and dispose owned resources. `createFrame().use(editorModule)` installs the editor capability on that instance and automatically enables settings JSON editing. Reusing the same descriptor is idempotent; disposal cleans up its registrations. Other module descriptors and Frame-owned chat factories remain future work. Build all modules with `bun run build:library`.

Native integrations can pass
`allowRewind`, `allowFork`, and `allowAttachments` as `false` to `AIChat` or
`AIConversation` to hide unsupported conversation actions. `AIPrompt` accepts
`allowAttachments` independently. These options default to `true`.

`AIChat` and `AIConversation` accept `emptyMessage` to customize their initial
text; an `empty` slot takes precedence for richer content. Omit the prop for
"Start a conversation." or pass an empty string to hide the text. The working
composer border uses `--frame-chat-composer-busy-color` (default: `--frame-accent`)
and `--frame-chat-composer-busy-highlight` (default: a lighter mix of that color).
The same color override applies when reduced motion is enabled.

```vue
<script setup lang="ts">
import { onBeforeUnmount } from 'vue';
import { createFrame, FrameShell } from '@frame/core';
import { createNotificationHistory, NotificationPanel } from '@frame/core/modules/notifications';
import '@frame/core/style.css';

const frame = createFrame();
const history = createNotificationHistory(frame, { limit: 200, statusBar: true });
onBeforeUnmount(() => { history.dispose(); frame.dispose(); });
</script>
<template>
  <FrameShell :frame="frame">
    <template #overlays><NotificationPanel :frame="frame" :history="history" /></template>
  </FrameShell>
</template>
```

The panel keeps a bounded in-memory history of notifications emitted after subscription. Expiring or dismissing a core notification does not delete history. Clearing history does not dismiss active messages. No bell, history, commands, or panel are installed by core. The application may register its own command using `history.toggle` and should dispose the history on unmount. The panel’s position button selects Bottom Right, Bottom Left, or Top Right. `history.setPosition(position)` exposes the same behavior to the host; initial position, availability, and pinning can be set with `indicatorPosition`, `indicatorEnabled`, and `indicatorPinned` options. Top Right contributes a registered toolbar action: its Notification Center feature toggle controls availability, while the Notifications checkbox pins or unpins the action. An unpinned action stays in More Actions. Moving the icon preserves history and its pin preference. `history.setEnabled(false)` closes the panel without deleting history; disposal removes the subscription and all installed presentations.

With `statusBar: true`, `history.statusItemId` identifies a registered status button. Its context menu shares item visibility, badge visibility, and left/right moves with other Frame status items. The badge shows the current history count, and moving sides updates the panel corner. Do not also mount NotificationIndicator when opting into this registration. For existing standalone indicator consumers, omit `statusBar` (default false) and keep mounting NotificationIndicator in the footer slots.

Panel `bottom` is an 8px inset by default, relative to Frame’s overlay boundary, which already excludes the status bar. Do not add the status-bar height again. Empty history renders only the header. Override `--frame-notification-center-header-background` and `--frame-notification-center-header-min-height` to theme the header separately from the notification rows.

Build Core and every module with `bun run build:library`. Core is a private workspace package; nothing is published.

## AI chat, views, and conversation history

`AIPrompt` is the standalone composer. `AIConversation` displays one conversation and uses that same composer. `AIHistory` displays conversations and a composer that starts a new one. `AIChat` combines conversation and history, while `createAIChat` creates the state for one conversation. `createAIChatHistory({ applicationId, scope: 'application', createChat })` creates an empty in-memory store; `createChat` supplies a fresh owned chat controller on each explicit `history.create()` call. The history store disposes its created chats on removal/disposal. Switching conversations preserves their messages, drafts, and running turns. Persistence and importing provider sessions remain application responsibilities. `setScope('all')` shows all conversations already in this store; it does not discover external agent sessions.

`AIChat` accepts either `chat` or `history`. With history, narrow containers switch between history and chat, while containers at least 720px wide display history alongside the conversation. Sending from the history composer creates a conversation. Without history, it displays the supplied chat alone.

```ts
import { createAIChat, createAIChatHistory, createAIChatView } from '@frame/core/modules/chat';
const history = createAIChatHistory({
  applicationId: 'pixloom',
  createChat: () => createAIChat({ respond }), // Application-owned responder.
});
const remove = frame.secondarySidebar.register(createAIChatView({ id: 'assistant', history }));
frame.secondarySidebar.open('assistant');
// Remove presentation independently from conversation ownership:
remove();
if (!frame.secondarySidebar.views.value.length) frame.secondarySidebar.close();
history.dispose();
```

History has no New conversation button or inline delete icons: submitting its prompt creates the conversation. Rows expose Rename, Pin/Unpin, Archive/Restore, and Delete through a right-click or Shift+F10 context menu. The same operations are available as `history.rename`, `pin`, `archive`, and `remove`. Archived conversations are retained; View archived conversations makes them available again. `AIHistory.contextActions` and `AIChat.historyActions` add host actions, reported through their action events. `AIView` and `AIChatHistory` remain compatibility aliases for `AIChat` and `AIHistory`.

`createAIChatView` returns a `ViewDefinition`; it does not register or open a sidebar. The host chooses a container and owns cleanup. Removing the view does not dispose caller-owned chat/history. No import, constructor, or view creation starts requests or authentication.

In the docs, open **Modules → AI → Prompt, Conversation, History, or Assistant**. Each uses the shared Features/API/Theming/Interactive demo page. The complete chat demo registers in the docs application's secondary sidebar and removes itself when leaving the demo. API signatures, controller members, template structure, classes, and consumed theme variables are regenerated by `bun run docs:contracts`.

## Universal viewer

Run `bun run dev`, then open **Modules → Universal file viewer → Interactive demo** in the documentation website. Choose a local file or try the text, code, SVG, two-page PDF, and unsupported-file samples. The demo includes inline and fullscreen previews and does not upload selected files.

`UniversalViewer` presents a portable file preview in a fullscreen modal with a dark blurred backdrop. It is controlled through `v-model:open` and restores focus on close. `UniversalViewerContent` renders the same preview inside any sized container without requiring a Frame instance. Import Extras styles as usual.

```vue
<script setup lang="ts">
import { ref, shallowRef } from 'vue';
import { UniversalViewer, type ViewerFile } from '@frame/core/modules/viewer';
const open = ref(false);
const file = shallowRef<ViewerFile>();
function preview(source: File) {
  file.value = { source };
  open.value = true;
}
</script>
<template>
  <input type="file" aria-label="Choose a document" @change="event => { const selected = (event.target as HTMLInputElement).files?.[0]; if (selected) preview(selected); }" />
  <UniversalViewer v-model:open="open" :file="file" />
</template>
```

`ViewerFile.source` accepts `File`, `Blob`, URL strings, or `URL` objects. Optional `name`, `mimeType`, and `language` provide metadata for extensionless URLs and blobs. URLs use browser fetch/CORS rules; the host can fetch authenticated resources itself and supply a Blob. Filesystem access stays with the host. Imports and closed dialogs load no files or PDF workers.

Images and videos use the browser's supported formats and codecs. SVG opens as an image with a highlighted XML source toggle; SVG/HTML are never inserted into the DOM as executable markup. Programming files reuse Core's `FrameCodeBlock`. Plain text is selectable; unknown UTF-8 text gets a conservative fallback. Office formats and other binary files show an unsupported message. The `error` event reports loading and rendering failures.

PDF.js loads lazily with a bundled inline worker (no CDN or external service). The reader provides previous/next page navigation and 25–300% zoom. This first pass renders PDF pages to canvas: text selection, search, annotations, password entry, and full screen-reader document text are not included. Encrypted PDFs report an error. Hosts with a strict CSP must allow blob workers. Specialized PDFs requiring external CMaps, standard font assets, or WASM decoders may need additional asset integration.

The content component accepts `maxBytes` (default 100 MiB); fetched responses are bounded while streaming. Requests abort and owned object URLs/workers are released on replacement or unmount. Closing the fullscreen viewer unmounts its content and stops video. Use `target` to choose a portal host. Themes use `--frame-*` tokens plus `--frame-viewer-backdrop`, `--frame-viewer-blur`, and `--frame-viewer-z-index`.

## Registering the editor

```ts
import { createFrame } from '@frame/core';
import { editorModule, CodeEditor } from '@frame/core/modules/editor';

const frame = createFrame().use(editorModule);
const controller = frame.editor.create(); // Optional; creates no Monaco surface.
```

Use `<CodeEditor>` independently or bind its optional `editor` prop to the controller. Module registration automatically makes JSON editing available to settings. No extra settings installer is required.

## Code editor

`CodeEditor` is a standalone Monaco surface. Use it in any sized container, with or without Frame Shell. It uses `@shikijs/monaco` and the same lazy Shiki engine, grammars and `CodeBlockTheme` palette as Core's `FrameCodeBlock`. Monaco itself loads on first mount and stays out of the main Core entry.

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { CodeEditor, createCodeEditor, type CodeEditorOptions } from '@frame/core/modules/editor';
import { CodeBlockTheme } from '@frame/core';


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

| Prop                     | Default                              | Meaning                                                                                                    |
| ------------------------ | ------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `modelValue` / `v-model` | Empty source                         | Code string; changes emit `update:modelValue`. Without a binding, local edits remain in the mounted model. |
| `editor`                 | Internal controller                  | Optional `CodeEditorController`. A controller attaches to one mounted surface at a time.                   |
| `language`               | `plaintext`                          | Shiki language ID or alias. Unknown names fall back to plain text.                                         |
| `theme`                  | `CodeBlockTheme.DarkPlus`            | Shares the Code Block enum, including light and dark themes.                                               |
| `readOnly`               | `options.readOnly` or `false`        | Direct override that blocks user editing. Host code updates still work.                                    |
| `options`                | See below                            | Typed `CodeEditorOptions` object; supports Monaco construction and text model options.                     |
| `label`                  | `options.ariaLabel` or `Code editor` | Accessible editor name.                                                                                    |
| `autofocus`              | `false`                              | Focus once initial loading completes.                                                                      |

Direct props take precedence over nested options. `value`, `model`, `language` and `theme` are excluded from `CodeEditorOptions` because the component manages them. Defaults enable automatic layout, use 14px text, disable the minimap and scrolling beyond the last line, and disable semantic highlighting so TextMate colors stay consistent with Code Block. Other Monaco defaults apply. Options are applied as reactive patches: set a previous option to its desired default explicitly when reverting it. Monaco construction-only settings require remounting. Passing options does not require constructing a class.

Configuration includes fonts and ligatures, indentation, line numbers, wrapping, minimap, folding, sticky scroll, rulers, scrollbar, cursor, bracket pairs, suggestions, hover, accessibility, whitespace and other native Monaco editor settings. Arbitrary Shiki languages receive syntax highlighting; completion, diagnostics and formatting require a corresponding Monaco language provider. The bundled Monaco distribution includes JavaScript/TypeScript, JSON, CSS and HTML services. No files are read or saved automatically, and no remote language server or CDN is started.

Events: `ready(controller)`, `update:modelValue(code)`, `change(code, MonacoContentEvent)`, `selection(MonacoSelectionEvent)`, `focus()`, `blur()`, and `error(cause)`. Loading has a status message; initialization failures display an alert and emit `error`.

Controller methods: `focus()`, `undo()`, `redo()`, `find()`, `replaceCode(code)`, `format()`, `runAction(id)` and `layout()`. Boolean methods return false when unavailable; formatting/actions return `Promise<boolean>` and reject if a provider throws. `replaceCode` creates an undoable whole-document edit and works in read-only mode. `instance.value` exposes the current `IStandaloneCodeEditor` for native selections, markers, decorations, commands and model access. Keep Monaco resources you create yourself under application ownership and dispose them yourself. The component owns its own model, listeners and editor and disposes them on unmount. Text bound through `v-model` survives remounting; model undo history and selection do not. The controller detaches on unmount and can be reused. Do not call its internal `attach` method from application code.

Monaco themes and token providers are shared across Monaco instances: changing one editor's theme changes all mounted Monaco editors. Code Block can use a separate theme. Host options can re-enable semantic highlighting, which may change colors compared with Code Block.

The component uses the installed Monaco ESM package and local worker assets. Use a bundler that handles Monaco's module workers (the Docs app uses Vite), and serve the resulting worker files with the application. Monaco 0.57 supplies worker factories; no `MonacoEnvironment` override is needed in the Vite example. If your app already configures `MonacoEnvironment`, its worker factory takes precedence and must support the editor and enabled language services. Other bundlers and desktop webviews have not been browser-verified here.

Verification: `bun test tests/code-editor.test.ts tests/code-block.test.ts`, `bun run build:library`, `bun run check:consumer`, and, with the Docs server running, `uv run --with playwright python tests/code-editor-browser.py`. The Docs component catalog includes a Code editor example with live Code Block output.

## Terminal

`Terminal` renders xterm.js; `TerminalView` and `createTerminalView` add session management and shell presentation. Features contains no native runtime or Rust implementation.

Supply an explicit `TerminalBackend` to `createTerminal({ backend })`, and pass that controller to `<Terminal :terminal="terminal" />`. A backend implements `profiles`, `spawn`, `write`, `resize`, and `close`. It may execute through a local native companion, Node.js, or a remote service. There is no automatic Tauri fallback.

```ts
const terminal = createTerminal({
  backend, // Application-owned TerminalBackend
  openUrl: frame.host.external?.openUrl,
});
frame.registerView(createTerminalView({ id: 'terminal', frame, terminal }), 'bottom');
```

The host owns controller disposal. Hiding/moving a view retains sessions; closing a session terminates it through the backend. Call `await terminal.dispose()` on host teardown. Frame does not dispose externally supplied backend services.

The browser Docs example supplies a simulated backend with help, echo, and clear commands. It never executes operating-system commands. The extracted Rust PTY plugin and Tauri terminal transport are maintained in the separate Frame Native companion, outside this workspace.

Migration: supply `backend` explicitly, supply a controller to `Terminal`, update native crate paths to the companion, and route terminal links through the host adapter when needed.

Verification: `bun test tests/terminal.test.ts`, `bun run build:library`, and the browser terminal suites.

## AI chat

`AIConversation` is one chat room with a shared `AIPrompt` composer, local file/folder attachments, ordered responses and activity, approval and question cards, stop, copy, forge, and reversible prompt editing. It does not connect to an AI service or start one.

```vue
<script setup lang="ts">
import { onBeforeUnmount } from 'vue';
import { AIConversation, createAIChat, type ChatMessage } from '@frame/core/modules/chat';
import '@frame/core/style.css';


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
<template><div style="height: 600px"><AIConversation :chat="chat" @forge="forge" /></div></template>
```

`respond(request, writer)` receives a snapshot of the conversation through the latest user prompt, attachments, and an abort signal. Return a promise covering the whole generation. Writer calls append parts in order; `append(id, text)` streams text into an existing message part. `complete()` returns `true` when it finishes the turn, or `false` while user requests remain pending or the writer is inactive. It closes unfinished thinking and activities, records the duration, and ignores late events. Returning from the responder also completes the generation once all interactions are settled. Thrown errors and `writer.fail(message)` display inline; Stop aborts the signal and ignores subsequent writes. `send()` settles on completion, failure or stop even if a responder ignores cancellation. Dispose the controller when its owner is destroyed; disposal permanently blocks sending. Unmounting a room alone does not stop a host-owned conversation. `chat.clear()` stops work and clears the transcript, draft and attachments while retaining a reusable controller.

`chat.state` exposes `messages`, `draft`, `attachments`, `busy`, and `rewindId`. Initial `messages` can be passed to `createAIChat`. Messages contain ordered `ChatPart` objects (`message`, `thinking`, `commentary`, `activityGroup`, `activity`, `approval`, `question`, or `artifact`) plus timestamps, attachments, and completion status. Thinking text is provider-supplied display content; the component does not invent it. Plain text is rendered safely without interpreting HTML. Copy includes only answer text, excluding activities, reasoning, requests and artifacts.

### Rich responses and user input

| Writer method                                                     | Behavior                                                                                                                        |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `message(text, { phase? }?)`                                      | Adds answer text; phase defaults to `final`. Use `intermediate` for a message that belongs to the work history                  |
| `commentary(text)`                                                | Adds progress text distinct from answer text; returns a part ID                                                                 |
| `activityGroup({ label })`                                        | Creates a named group in this turn and returns its ID                                                                           |
| `activity({ label, text?, output?, outputLanguage?, groupId? })`  | Starts a timed activity with optional named-group membership and returns its ID                                                 |
| `updateActivity(id, { label?, text?, output?, outputLanguage? })` | Replaces supplied fields on a running activity; append output in the adapter if needed                                          |
| `finishActivity(id, status?)`                                     | Ends an activity with `completed` (default) or `failed`                                                                         |
| `requestApproval({ text, detail? })`                              | Returns `{ id, result }`; await `result` for `{ status: 'answered', decision: 'allow' \| 'deny' }` or `{ status: 'cancelled' }` |
| `askQuestions({ text?, questions })`                              | Returns `{ id, result }`; await a structured answer or cancellation                                                             |
| `artifact({ name, url, kind, mimeType?, size?, text? })`          | Adds an image/file card; `size` is optional bytes and `text` is a caption                                                       |
| `fail(message)`                                                   | Fails the turn, closes active work and cancels pending interactions                                                             |

Approval is permission to perform an action. Questions gather preferences or other input, with no implied permission. A `ChatQuestion` has `id`, `text`, `choices: { id, label, description? }[]`, and optional `multiple`, `required`, `allowCustom` flags. Defaults are single selection, required, no custom answer. IDs must be unique within their request/question. An empty choices list is valid when custom answers are enabled (or the question is optional).

```ts
const chat = createAIChat({
  async respond(request, writer) {
    const question = writer.askQuestions({ questions: [{
      id: 'format', text: 'Which export format?',
      choices: [{ id: 'png', label: 'PNG' }, { id: 'gif', label: 'GIF' }],
      allowCustom: true,
    }] });
    const result = await question.result;
    if (result.status === 'cancelled' || request.signal.aborted) return;
    // result.answers: [{ questionId, choiceIds, customText? }]
    writer.message('Thanks for choosing an export format.');
  },
});
```

Single selection treats custom text as an alternative to a named choice. Multiple selection allows custom text alongside named choices. Submission is explicit; no option is automatically answered. Optional unanswered questions return an empty `choiceIds` array. Host integrations use `chat.resolveApproval(id, decision)`, `chat.answerQuestions(id, answers)`, and `chat.cancelInteraction(id)`; these are the same validated paths the UI uses, returning `false` for invalid, duplicate, stale or wrong-controller submissions. Unknown choices, duplicate IDs, and missing required answers never settle the request. Multiple requests can be pending independently. Stop, failure, clear and disposal settle outstanding promises as cancelled; the transcript retains resolved/cancelled cards until cleared. Answer snapshots and request schemas are copied independently.

The host owns artifact URLs, authorization, and persistence. Keep a URL valid as long as any conversation or fork uses it; revoke object URLs only after removing those presentations. The component renders HTTP(S), blob URLs, and base64 PNG/JPEG/GIF/WebP/AVIF image data. Executable schemes and raw local file paths are not links. A native adapter must expose local files through an authorized asset transport. No automatic saving, downloading or uploading occurs.

Each artifact card shows an image thumbnail or file icon, name, type and supplied size. Open uses the existing universal viewer content in a Frame dialog, with keyboard focus restored on close. Files load only when explicitly opened. Download saves the requested name; HTTP(S) sources are fetched into an owned Blob first so cross-origin links cannot replace the app. Preview/download follow browser CORS rules and have a 100 MB fetch limit. Failed downloads report an inline error; pending downloads and owned URLs are cleaned up on source change or unmount.

`rewind(id)` previews editing a user message, retaining its replies until Send commits the replacement. Cancel with the same rewind button, the composer X, Escape, or `cancelRewind()`; the previous draft and attachments are restored. `fork(id)` returns an independent prefix snapshot ending at an assistant response. The `forge(messages, source)` event lets the host open it; the room does not manage sessions. The docs demo opens the forged snapshot in the same room.

Each assistant turn begins with **Working for …** and an expanded work timeline containing thoughts, commentary, intermediate messages, activities and requests. Successful completion automatically collapses this history under **Worked for …**. Final messages and delivered artifacts stay visible below it. Click or keyboard-activate the summary to reopen the work; stopped and failed turns remain expanded with an explicit outcome. Completion does not invent a final answer when the provider supplies none.

When a turn has no retained work (for example a short streamed answer with transient thoughts only), its duration is plain text with no empty disclosure. Commentary and intermediate messages share the normal foreground color. Activities use compact muted rows; their details and `FrameCodeBlock` output expand in place. `outputLanguage` defaults to `text` and can select a supported code language such as `html`, `json` or `bash`. Output is rendered as code, never executed as HTML. Group elapsed time spans the earliest activity start through the latest finish, including concurrent activity; running groups use the current clock and completed groups freeze their duration.

Consecutive activities share an expandable group. Commentary, intermediate messages and input requests separate automatic groups. A group keeps its identity as output streams; operations in an earlier group can keep running after commentary starts a new group. Opening an individual activity shows its details and output. Running and failed/cancelled groups start expanded; successfully finished groups collapse and can be reopened.

For explicit membership, call `const groupId = writer.activityGroup({ label: 'Project checks' })`, then `writer.activity({ label: 'Run tests', groupId })`. Named groups appear when created, including before their first activity. An activity assigned to a named group remains there, including when added after later commentary. Omit `groupId` for automatic grouping. Group IDs belong to the current turn; unknown or earlier-turn IDs are rejected. Updating an activity changes its details/output without moving it between groups. Snapshots retain group definitions and membership.

Thoughts are provider-supplied reasoning summaries. Only one current thought is displayed, as a single changing line at the bottom of the live work. `thinking(text)` starts it and supersedes any previous thought, `updateThinking(id, text)` replaces its text, and `finishThinking(id)` clears it. Publishing a new commentary, activity, message, request or artifact also clears the current thought. Output/status updates to an existing activity leave it intact. Completion, stop and failure remove it; reopening completed work does not display old thoughts as permanent blocks. Raw thought records and timestamps remain available in source snapshots.

Activities describe actions such as commands, searches and file edits; adapters translate provider-specific tool events into this common type. Raw part IDs and source chronology remain intact for adapters and snapshots. Copy includes final answer text only.

While rewinding, the composer shows a single-line preview of the original prompt. Click it to scroll back to that message; editing the draft does not change the preview. Message actions fade in on hover or keyboard focus and stay available on touch devices.

| Prop / event / slot                      | Behavior                                                                                       |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `chat`                                   | Required `AIChatController` from `createAIChat`                                                |
| `label`, `placeholder`                   | Accessible room label and composer placeholder                                                 |
| `userAlignment`, `assistantAlignment`    | Independently choose `left` or `right`; defaults: right / left                                 |
| `attachmentActions` / `attachmentAction` | Extra `FrameMenuItem` actions / selected item event; reserve IDs beginning `chat-`             |
| `speechEnabled` / `speech`               | Host-supplied speech input; disabled by default. Write recognized text into `chat.state.draft` |
| `copy`                                   | Emitted with the message after successful clipboard copy                                       |
| `message-actions`                        | Slot receiving `{ message }` for additional actions                                            |
| `composer-actions`, `empty`              | Slots for additional composer controls and empty conversation content                          |

The plus menu uses browser file and folder pickers. The composer also accepts file drops and pasted files/images, and supports attachment-only submission. Selected `File` objects remain in memory on attachments; no automatic upload or persistence occurs. Folder selection depends on browser support and exposes selected file paths relative to that folder. Hosts can provide native adapters through custom attachment actions. Enter sends, Shift+Enter adds a line, and IME composition does not submit. The waiting border respects reduced motion. The room scrolls with new content when near the bottom and offers a jump action when reading earlier messages.

Run `bun run dev`, then open **Components → Features → AI chat** for the local streaming mock server. It returns a random sentence and a second message after simulated thinking. The endpoint also runs with `bun run preview`; static hosting needs its own backend. No AI credentials are used.

A file explorer remains a future candidate. Applications must supply process, model-provider, and filesystem adapters; Modules should not start services or configure credentials.

## Local AI agent connectors

`createAgentChatSession(connection, options)` connects the existing AI chat controller to a native agent session. `createJsonLineAgentConnection(transport)` adapts a host-owned JSONL channel. Supported provider identifiers are `codex`, `claude`, `gemini`, `copilot`, and `opencode`; the native implementation is in the Frame Native companion's `agents` module. Claude uses the Python Agent SDK helper.

See [agent connector integration](../../../../docs/guides/agent-connectors.md) for ownership, history scope, setup, and capability limits. Imports do not start processes or model requests. Render the returned chat explicitly; the factory does not register a shell view.

Native chat hosts may supply `prepareAttachments(attachments, signal)` to `createAgentChatSession`. It validates/snapshots the selected files and returns `{ name, data }` references to forward with `turn/send`. The host backend must interpret these references as validated image inputs or reference text. Without that callback, native attachments are rejected explicitly. Preparation is cancelled by the same turn signal; Frame does not upload or resolve native file paths on its own.

Assistant replies and intermediate messages render Markdown, including tables,
inline emphasis, lists and fenced code. HTML is escaped, unsafe link protocols
are rejected, and image syntax does not load remote resources. User messages
remain plain text. Work summaries group timing in parentheses without dot
separators.
