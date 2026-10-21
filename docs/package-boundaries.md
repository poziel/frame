# Workspace packages

- packages/frame: @frame/core, the reusable empty shell and controls. The library build emits dist/ and a build-time boundary check rejects demo registrations/content.
- apps/docs: @frame/docs, the private example/documentation app consuming core through the public entry point. Vite aliases that entry to source during development.
- Root: build/test/Tauri orchestration and a compatibility frame export pointing to core's built artifact.

Both packages are private. This is a two-package workspace, not two repositories or a publication. Existing root commands remain available. `bun run build:library` builds core and declarations, copies license notices, and checks the boundary. `bun run build` builds the docs app; Tauri wraps that app.

Import createFrame/FrameShell and components from @frame/core, plus @frame/core/style.css. New instances have no app-owned views, actions, settings sections, notifications, or example pages. Settings and notifications can be disabled using createFrame({settings:false,notifications:false}). Built-in shell layout commands remain. Host app names, versions, and footer actions are provided by the host, through title-text and status-actions. The documentation app supplies its own catalog and sample contributions.

Consumers should install/reference packages/frame, never the repository root's example app. ComponentShowcase is a generic presentation primitive; it contains no example registrations or catalog pages.
