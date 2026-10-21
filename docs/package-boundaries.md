# Workspace packages

| Package | Owns | Does not own |
| --- | --- | --- |
| @frame/core (`packages/core`) | Empty shell, layout, view registration, commands, controls, settings primitives, transient notifications | Notification history panel/bell, example registrations, terminal processes, AI providers, filesystem trees |
| @frame/extras (`packages/extras`) | Optional ready-made features: notification history store, panel, and indicator | Shell ownership, backend services, automatic registration |
| @frame/docs (`packages/docs`) | Documentation, examples, and explicit composition of Core and Extras | Library contracts or production application content |

The dependency direction is Docs → Extras → Core. Docs may also import Core directly. Core must never import Extras. All packages are private. The root orchestrates builds and Tauri; it is not the install target for consumer applications.

Build Core with `bun run build:library`, Extras with `bun run build:extras`, and Docs with `bun run build`. `bun run check:consumer` compiles a consumer against both built packages. The core boundary check rejects documentation and notification-panel code/CSS leakage.

New Frame instances contain no app-owned views, notifications, history, bell, or example content. The application supplies names, versions, status actions, and optional overlays. Importing Extras registers nothing: opt in by constructing a store and mounting components. Existing `createFrame({ settings: false, notifications: false })` controls shell presentation independently.

## What stays in core

Keep reusable controls, focus/keyboard mechanics, menus, layout, resizing, the command system, and view/modal registration. Keep transient notifications as a general application behavior. Core exposes notification subscriptions so optional consumers can build history without putting history state into core.

## What moved

Notification history, its bottom-right panel, bell/count control, history expansion/clearing, and panel CSS live in Extras. The `frame.notifications` command is no longer built in; hosts can register their own toggle command. `frame.notifications.state.open` and NotificationOptions.show are removed; use an Extras history store for visibility. NotificationCenter is replaced by NotificationPanel from Extras. Notifications now expire after five seconds by default; set duration to zero for persistence.

## Future Extras candidates

- Terminal: sessions, tabs, output and input UI; the host supplies the PTY/process adapter.
- AI assistant/chat: messages, composer, streaming and cancel controls; the host supplies the provider and credentials.
- File explorer: tree, selection, rename and contextual actions; the host supplies filesystem operations and permissions.
- Settings UI is another possible extraction; keep its metadata and standalone controls reusable. It remains in Core in this change.

These future features are proposals, not shipped implementations. Sample inspector, session log, collections, and banners remain Docs examples until there is a reusable contract worth exporting.

## Build configuration

The root `tsconfig.json` supplies shared compiler options only; each project chooses its own source files and aliases. Package-specific builds live beside their packages:

- `packages/core/tsconfig.json`: core TypeScript declarations.
- `packages/extras/tsconfig.json`: extras declarations, checked against built core declarations.
- `tests/tsconfig.json`: public-package consumer fixture.
- `packages/docs/tsconfig.json`: documentation application source checking.
- `packages/core/vite.config.ts` and `packages/extras/vite.config.ts`: package bundles.

The documentation app owns `packages/docs/index.html`, `packages/docs/src/main.ts`, `packages/docs/vite.config.ts`, and its own package manifest. Its output is `packages/docs/dist`; the Tauri wrapper points there. Package manifests own their dependencies and build scripts. Root commands delegate to those scripts and the root manifest has no library exports. The root retains shared test tooling; the docs package owns the Tauri CLI and native host.

Core implementation lives under `packages/core/src`. Documentation examples and demo-only components live under `packages/docs/src`. Extras implementation lives under `packages/extras/src`. The documentation app owns `packages/docs/src-tauri`; the root has no application source tree.

## Shared assets, licenses, and dependencies

Canonical branding and shared screenshots live under `assets/`. The docs app serves that directory; core imports the logo into its bundle. Consumers do not need to copy this repository's asset directory. Third-party license sources live under `docs/licenses/` and the core build copies them into its distributable `licenses/` folder.

Bun stores shared installations under root `node_modules/.bun`; package-local `node_modules` entries link to those installations. These directories are generated and ignored by Git. Removing them is possible, but running `bun install --frozen-lockfile` recreates the same workspace layout. Deleting them alone is not a runnable configuration and does not shrink package archives.
