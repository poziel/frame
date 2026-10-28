# Frame documentation app

The interactive component catalog and desktop example. Depends on @frame/core and @frame/core/modules/*; its views and sample content do not ship with either library.

Run `bun run dev` or `bun run build` here, or use the root scripts. src/App.vue owns demo registrations and status content. Catalog sources are in this package under src/examples.

Use the primary view bar and sidebar to browse the docs. **Layouts** lists dedicated playground pages for navigation, sidebars, view bars, panels, menus/toolbar, status, workspace, and docks. Each page renders a separate Frame inside the workspace, with interactive controls and cleanup on leaving. The docs shell has no navigation items, secondary views, or panel demos registered by default. Direct links use `#/layouts/<page-id>`; `#/docks` remains an alias for the docks playground.

Primary Sidebar, Secondary Sidebar, and Panel each include their associated View Bar controls on one page. Old `primary-view-bar`, `secondary-view-bar`, and `panel-view-bar` routes open these combined pages. Documentation display names use Title Case with spaces; Vue components use PascalCase and TypeScript module filenames use camelCase.

Playground forms use Frame controls. Nested layout and chat shells use Frame Monokai Dark through their own Frame instance, including their portalled menus. Frame Monokai Dark and Light are both available in Settings → Appearance → Theme. `src/layouts/playground.css` styles only the preview boundary and label, keeping preview chrome separate from Core styling and the outer documentation shell.

Catalog views share the docs-only `src/components/CatalogView.vue` and `CatalogSection.vue`: a fixed search header with an optional group selector, a scrolling results body, and a fixed result-count footer. Guides, Layouts, Components, API, and Modules use this structure. The primary view order is Guides, Layouts, Components, API, Theming, then Modules; Theming contains the accent palette preview.

This app owns its HTML entry, Vue bootstrap, Vite config, TypeScript config, and frontend dependencies. Builds go to packages/docs/dist. The root commands delegate here; the package's Tauri wrapper loads this output.

**Components → Modules → AI chat** demonstrates the chat room with a local streaming endpoint at `/api/chat-demo`. The dev and preview servers send simulated thinking, a random sentence, a second message, and a completion event. No AI service is used. Static hosting and packaged Tauri builds need a host-provided responder or backend.

**AI chat playground**, available through the `Demo: Open AI chat playground` command, opens a manual agent console and chat inside its own Frame playground. Direct route: `#/playground/ai-chat`. Its secondary sidebar exists only on that page. Send a prompt in the sidebar, then emit commentary, thoughts, answers, activity/output, approval requests, questions with choices/custom answers, and image/file artifacts from the workspace. Answer requests in the chat and inspect returned results in the event log. Text sends do not end a turn; use End turn, Stop turn or Simulate failure. This playground needs no server endpoint, AI service, credentials or native backend and works in the static docs build.

The shared session survives hiding the sidebar and navigating away; reopening reuses it. Reset session clears the transcript/log and releases its object URLs; reloading the app also clears it. The application owns and disposes the session. Files stay in memory (up to 20 files, 20 MB each), and the event log retains the latest 200 entries. Component catalog examples remain separate from this session.

Use **Set thought** to create or replace the single current thought line, and **Clear thought** to remove it. Sending another event also clears it. Start several activities to see them share a group, send commentary to establish a boundary, then start another activity. Earlier activities remain selectable for output/status updates in their original groups. End turn collapses the work while leaving the final answer and files visible; reopening it shows commentary/activity history without old thought blocks.

Use **New group name → Create activity group** to create a named group, then choose **Group for new activities** before starting operations. Newly created groups are selected automatically. Choose **Automatic grouping** for grouping between commentary messages. The active-activity selector updates operations in any existing group. Text type, answer, activity and group selectors all use `FrameSelect`; the file chooser is launched through a `FrameButton`.

Click **Run demo example** in the workspace or **Try demo** beside the chat to start a ready-made response. Set **Responder mode → Interactive demo** to respond automatically to your own prompts. **Cycle through all 7 examples** rotates through a full interactive tour, a streamed answer, grouped investigation, approval, choices/custom answers, image/document delivery, and a simulated failure. You can also select any example directly and choose Normal, Fast or Instant pace. Questions and approvals pause until you answer in the chat; denial skips file delivery. Demo mode disables the manual event controls until you switch back between turns.

Stop, reset and application disposal cancel demo timers and pending input. Reset also releases generated files and restarts the example cycle. All content is scripted locally; no AI backend, external requests or project-file changes are involved. The work timeline does not render its left border until it has actual work or a current thought to display.

Quick replies with no retained work show a plain duration rather than an empty dropdown. Activity groups show elapsed time; activity rows are compact, with syntax-aware code output controlled by **Output language**. Delivered files appear as thumbnail/icon cards with type/size, an in-app Open preview and a separate Download action.

## Markdown documentation

The website reads consumer articles from the repository `docs/` tree. Component,
module and layout articles use Features, APIs and Styling sections; their
Playground stays a Vue component. API descriptions come from TSDoc, and CSS
token descriptions come from adjacent declaration comments.

Run `bun run docs:contracts` at the repository root to rebuild references, or
`bun run --cwd packages/docs docs:check` to detect stale output without writes.
The normal website build runs generation automatically and emits complete raw
Markdown under `dist/markdown/`, plus a website `llms.txt` index. The raw tree
preserves repository-relative links, including package READMEs.

See [documentation authoring](../../docs/components/component-documentation.md)
for marker syntax, source comments, CSS declarations and coverage checks.
