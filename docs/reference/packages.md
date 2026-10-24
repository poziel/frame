# Packages and responsibilities

| Package | Provides | Host supplies |
| --- | --- | --- |
| `@frame/core` | Shell, views, workspace, commands, controls, settings primitives, transient notifications, validated theme contract and runtime scopes | Product screens, domain stores, backend, persistence, theme import UI and font assets |
| `@frame/features` | Notification history, chat, viewer, editor, terminal controllers/components and backend interfaces | Explicit setup, adapters, credentials, host-owned cleanup |
| `@frame/tailwind` | Optional Tailwind/Vite tooling referencing runtime tokens | Build configuration and stylesheet imports |
| `@frame/themes` | Optional validated presets and JSON: VS Code Light 2026, High Contrast Black and White | Selection UI, persistence, font assets |
| `@frame/tauri` | Optional TypeScript host adapter | Native Tauri host, plugins and permissions |
| `@frame/electron` | Renderer adapter, preload bridge and main-process handlers | Electron window and explicit authorization policy |
| `@frame/docs` | Interactive documentation and examples | Never an application dependency |

All packages are currently private. The repository root orchestrates the workspace and is not an install target. Use [local archives](../guides/getting-started.md#install-the-packages) in your own application.

Core never imports Features. Importing Features registers no views and starts no provider requests or terminal processes. Use explicit [factories and components](../../packages/features/README.md). The proposed `.use(feature)` installer is not implemented.

Frame owns shell layout and resources created by its controllers. The host owns business data, adapters, persistence policy, and its native application. Ordinary controls work without a shell; their individual props/events/slots define content behavior.

## Repository builds

```powershell
bun run build:library
bun run build:themes
bun run build:features
bun run check:consumer
bun run build
```

Build Core before Features and consumer checks. `build` builds Docs. Implementations live in `packages/core/src`, `packages/features/src`, and `packages/tailwind`; examples live in `packages/docs/src`. Library entry points must not import demo registrations or product backend services.

Core distributes JavaScript, CSS, declarations, tokens, and notices. The package manifest controls archive contents. These repository consumer guides are not currently copied into the archives; an AI in another project needs access to this documentation checkout alongside installed declarations.

[License sources](../licenses/THIRD_PARTY_NOTICES.md) stay under `docs/licenses`; the Core build copies notices into its distributable. Consumers do not need the Docs application or repository branding directory to render Frame.

Frame builds without Rust. Docs stays in `packages/docs` and runs only in the browser. Native terminal execution and native examples live in the separate Frame Native companion. See [host integration](../guides/hosts.md).
