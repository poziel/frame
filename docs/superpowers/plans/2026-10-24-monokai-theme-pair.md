# Frame Monokai Theme Pair Implementation Plan

**Goal:** Implement the user-approved dark/light mockups as optional presets.

**Architecture:** JSON themes in Themes use Core's existing contracts. Docs registers both and uses Dark in nested playgrounds. Core does not depend on Themes.

**Tech Stack:** TypeScript, JSON, Vue, Bun and Vite.

**Spec:** Approved `monokai-frame-pair.html` mockups in this chat's visualization directory. Warm charcoal and soft ivory surfaces with golden accents. Original Frame adaptation inspired by Monokai Pro.

- [x] Add complete public color-token palettes with readable control, selection and menu states.
- [x] Export presets and JSON subpaths; document source references and integration limits.
- [x] Register both in Docs and switch nested previews to Dark.
- [x] Verify validation, contrast, package builds, type-checking and browser behavior including portals and instance isolation.

Preserve unrelated work and existing presets. Do not commit or publish. Syntax highlighting and editor/terminal palettes remain separate from shell themes.
