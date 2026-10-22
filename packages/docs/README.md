# Frame documentation app

The interactive component catalog and desktop example. Depends on @frame/core and @frame/features; its views and sample content do not ship with either library.

Run `bun run dev` or `bun run build` here, or use the root scripts. src/App.vue owns demo registrations and status content. Catalog sources are in this package under src/examples.

This app owns its HTML entry, Vue bootstrap, Vite config, TypeScript config, and frontend dependencies. Builds go to packages/docs/dist. The root commands delegate here; the package's Tauri wrapper loads this output.

**Components → Features → AI chat** demonstrates the chat room with a local streaming endpoint at `/api/chat-demo`. The dev and preview servers send simulated thinking, a random sentence, a second message, and a completion event. No AI service is used. Static hosting and packaged Tauri builds need a host-provided responder or backend.
