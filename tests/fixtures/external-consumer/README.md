# External browser consumer

Run `scripts/validate-external-consumer.ps1 -Browser` to pack Core, install the archive into an isolated temporary Vue application, and verify its browser UI. Supply `-Python` with a Python executable containing Playwright and Chromium.

This fixture has no Rust or native runtime dependencies. Native integration examples live in the separate Frame Native companion. Nothing is published.

Consumer source is checked strictly; third-party declaration internals are skipped, matching the library workspace configuration. Core no longer requires Tauri-related TypeScript libraries.
