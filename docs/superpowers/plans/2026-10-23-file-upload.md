# File Upload Implementation Plan

> Execute inline under the user's explicit approval; no further approval or commits.

**Goal:** Standalone file picker and visible/invisible drop target.
**Architecture:** Shared typed validation and picker composable; two Vue components reuse FrameButton. No Frame injection.
**Tech Stack:** Vue, TypeScript, native File/input/drag events, Bun and Playwright.
**Spec:** ../specs/2026-10-23-file-upload-design.md

## Constraints and review focus
Preserve concurrent edits. No new dependencies. Test extension/MIME/size/count boundaries, repeated selection, nested drag transitions, non-file drags, disabled targets, and mounted content retention. Native runtime drop interception requires host configuration.

## Tasks
- [x] Add failing shared validation tests in tests/file-upload.test.ts; implement packages/core/src/components/forms/shared/files.ts with FileUploadOptions, FileRejection and validateFiles.
- [x] Add browser fixture and checks for picker/zone; implement FrameFileUpload.vue, FrameFileDropZone.vue and shared useFilePicker.ts. Verify API calls and UI independently.
- [x] Export controls/types in frame/index.ts, add styling and consumer documentation/examples. Build Core, check consumers, run focused unit/browser checks and inspect targeted diff.

## Verification and rulings
- Four Bun validation tests pass. Chromium fixture checks pass, including UI and exposed open/clear APIs, size/type/count rejection, repeated selection, state retention, disabled zones and nested drop cleanup.
- Core JavaScript/CSS bundling passes. Full build declaration generation and check:consumer fail because the existing Vue dependency links cannot resolve runtime exports across the workspace. Focused vue-tsc succeeds with temporary explicit paths to installed Bun-cache Vue type packages; dependency files were not modified.
- Use native browser File objects; native desktop file interception remains host-owned. No backend requests or native paths are introduced.
- Implemented inline under explicit approval without additional review gates or commits. Nested ancestor overlays reset in capture phase while the innermost zone owns emitted files.
