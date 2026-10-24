# Agent connector implementation

The user approved Codex App Server JSONL, Claude's Python Agent SDK helper, Gemini ACP, GitHub Copilot's Rust SDK, and OpenCode HTTP/SSE. This document records that decision for implementation; no additional design approval is required.

## Boundaries

`frame-native/agents` is a standalone Rust crate and JSONL host executable. It owns explicitly started child processes, per-provider session handles, streaming, request routing and cleanup. It never starts inference on import or construction. The Claude Python helper imports the official SDK only when explicitly started. Host configuration supplies executable paths, environment, working directory, model and endpoint; frontend code cannot request arbitrary process execution. Existing user logins may be used only through each provider's supported authentication. Do not authenticate or send paid AI requests during this implementation.

Features owns portable TypeScript interfaces and a ChatResponder adapter. It receives a host-owned request/event connection, translates native events into the existing writer, and returns question/approval responses through that connection. No Rust, Node, Python or provider SDK becomes a Core/Features runtime dependency. The native executable can be hosted from Tauri, Electron or another authorized local process bridge.

## Native contract

Each connector implements create/resume session, list sessions when supported, streamed send, answer interaction, cancel and dispose. Sessions and emitted events retain provider, session and caller-supplied turn IDs. One active turn per session; distinct sessions run independently. The host registry records application ownership explicitly and supports application-only or provider-wide discovery where supported. Unsupported capabilities produce explicit errors. Provider-only metadata is retained as structured event data rather than invented chat content.

The normalized event model covers text (delta/snapshot and intermediate/final phase), thinking (delta/snapshot/end), tool activity, approvals, questions, artifacts, status/usage/provider metadata and completion/failure. Provider request IDs stay opaque. Answers are validated against offered choices before forwarding. Cancellation unblocks pending interactions, ignores late turn events, and ends the turn once. No automatic approval, raw path preview or credential logging.

Artifacts carry URL or local-path metadata. The host must authorize and resolve local files before the chat renders them; do not expose an unrestricted file endpoint. Multiple sessions, errors, missing tools, malformed streams, cancellation, disposal and handshake failures need tests.

## Verification and limits

Use protocol fixtures and fake subprocess/HTTP peers for deterministic request/response and streaming tests without AI inference. Compile all Rust providers, test the Python helper without credentials, run TypeScript adapter tests and public consumer checks. Installed providers may receive version/handshake checks only. Report which live agent runs remain unverified.

Native files will be assembled under `output/native-agents` in the writable Frame checkout, then installed as the new `D:/Dev/1-codes/frame-native/agents` directory through an approved filesystem operation. Existing native sources remain untouched except a README link.
