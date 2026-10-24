# Five agent connectors implementation plan

**Goal:** Implement native Codex, Claude/Python, Gemini, Copilot and OpenCode connectors plus a provider-neutral Features chat adapter.

**Spec:** agent-connectors-design.md. User authorized execution; preserve all unrelated changes and do not commit or push.

- [x] Shared Rust types, process/RPC transport, session runtime and JSONL executable; test framing, timeouts, routing and lifecycle.
- [x] Codex App Server connector and real protocol fixture tests.
- [x] Claude Python SDK helper, Rust helper client and helper protocol tests.
- [x] Gemini ACP connector and protocol tests.
- [x] OpenCode HTTP/SSE connector and protocol tests.
- [x] Copilot Rust SDK connector and SDK event/handler tests.
- [x] Features transport/session interfaces and ChatResponder mapping with cancellation/interaction tests and consumer compile coverage.
- [x] Build and test all components, document setup and capability limits, independent review, install native module in Frame Native.

## Execution decisions

Use the current shared checkout with targeted edits: it contains extensive user work. Native staging remains ignored build output until verified. Provider implementations can be delegated after the shared contract is written, each in disjoint files. The primary agent owns shared types, transports, runtime, Codex, Copilot and TypeScript integration.
