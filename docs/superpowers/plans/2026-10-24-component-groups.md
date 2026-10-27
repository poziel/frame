# Component Groups Implementation Plan

**Goal:** Align documentation categories and Core component folders by purpose, preserving public exports and existing work.

**Architecture:** A build-time component inventory defines the agreed folders and documentation labels. Reusable controls move into those folders; shell components and uncertain cases remain at the root and appear under General. Features remains a separate package and catalog.

**Scope:** Actions, Form Controls, Dates and Times, Colors, Navigation, Layout, Data Display, Feedback, Overlays, and General. Preserve alphabetical catalog entries, current component names, behavior, styles, theme variables, and shell APIs. No commits or publication.

- [x] Define the inventory and move the clearly classified components and their private helpers. Rewrite relative imports, source links, fixtures, and extraction paths without changing unrelated work.
- [x] Use the inventory for documentation grouping; retain shell pages in General and optional features in Features. Document the folder conventions.
- [x] Check inventory coverage, source/import resolution, catalog ordering, and unchanged public exports. Run Core/Features/consumer/Docs checks appropriate to the move and report dependency or type failures accurately.

## Verification

- Four structural tests pass: inventory/folder agreement, root General cases, documented source resolution, and Core relative imports/type exports.
- Core Vite bundling and consumer type checking pass. Public component names remain unchanged by the grouping work.
- Full Core and Features builds reach type checking but encounter dependency/type errors, including CSSProperties and Shiki exports.
- Documentation extraction/catalog tests encounter missing dependencies (`entities/decode`, `ohash`, `@vueuse/core`). Documentation Vite bundling reaches Monaco and fails on an EPERM realpath operation for its worker. Browser verification remains unavailable.
