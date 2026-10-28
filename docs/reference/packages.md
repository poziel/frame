# Packages and responsibilities

| Package                                | Provides                                                                                                                               | Host supplies                                                                         |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `@frame/core`                          | Shell, views, workspace, commands, controls, settings primitives, transient notifications, validated theme contract and runtime scopes | Product screens, domain stores, backend, persistence, theme import UI and font assets |
| `@frame/core/modules/*` (same package) | Notification history, chat, viewer, editor, terminal controllers/components and backend interfaces                                     | Explicit setup, adapters, credentials, host-owned cleanup                             |
| `@frame/tailwind`                      | Optional Tailwind/Vite tooling referencing runtime tokens                                                                              | Build configuration and stylesheet imports                                            |
| `@frame/themes`                        | Optional validated presets and JSON: VS Code Light 2026, High Contrast Black and White                                                 | Selection UI, persistence, font assets                                                |
| `@frame/tauri`                         | Optional TypeScript host adapter                                                                                                       | Native Tauri host, plugins and permissions                                            |
| `@frame/electron`                      | Renderer adapter, preload bridge and main-process handlers                                                                             | Electron window and explicit authorization policy                                     |
| `@frame/docs`                          | Interactive documentation and examples                                                                                                 | Never an application dependency                                                       |

Workspace manifests are private. The repository root orchestrates the workspace and is not an install target. Use [local archives](../guides/getting-started.md#install-the-packages) or the [GitHub Packages release workflow](../guides/github-packages.md) in your own application. Publishing stages separate `@poziel/frame-*` manifests; consumers use aliases to preserve `@frame/*` imports.

The main Core entry never imports modules. Importing a module registers no views and starts no provider requests or terminal processes. Each module has an isolated JavaScript entry and automatic styles; unused modules stay out of application builds. Heavy engines install automatically with Core; Monaco and PDF support load lazily. Use explicit [factories and components](../../packages/core/src/modules/README.md). The typed `.use(moduleDescriptor)` installer is implemented; the editor module provides `editorModule`, which automatically enables settings JSON editing. Descriptors for other modules remain future work.

Frame owns shell layout and resources created by its controllers. The host owns business data, adapters, persistence policy, and its native application. Ordinary controls work without a shell; their individual props/events/slots define content behavior.

## Repository builds

```powershell
bun run build:library
bun run build:themes
bun run check:consumer
bun run check:modules
bun run build
```

Build Core, including modules, before consumer checks. `build` builds Docs. Implementations live in `packages/core/src` (including `modules/`), and `packages/tailwind`; examples live in `packages/docs/src`. Library entry points must not import demo registrations or product backend services.

Core distributes JavaScript, CSS, declarations, tokens, and notices. The package manifest controls archive contents. These repository consumer guides are not currently copied into the archives; an AI in another project needs access to this documentation checkout alongside installed declarations.

[License sources](../licenses/THIRD_PARTY_NOTICES.md) stay under `docs/licenses`; the Core build copies notices into its distributable. Consumers do not need the Docs application or repository branding directory to render Frame.

Frame's TypeScript packages build without Rust. Docs stays in `packages/docs` and runs only in the browser. Host-independent terminal and agent execution libraries live in [Frame Server](https://github.com/poziel/frame-server), with optional native adapters enabled through their `tauri` Cargo features. Frame provides the TypeScript halves through `@frame/tauri/terminal` and `@frame/tauri/agents`; its npm package contains no Rust sources. The former Frame Native companion retains recovery material. See [host integration](../guides/hosts.md).

Core's reusable components are organized by purpose in [component folders](../../packages/core/src/components/README.md). Framework presentation components live in `components/framework/` and appear under General in the documentation. The shared inventory keeps documentation categories and physical folders aligned; public imports remain through `@frame/core`.
