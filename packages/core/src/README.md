# Core source structure

This is the agreed structure for `@frame/core` source. Read this guide before
adding or relocating files. Classify files by responsibility, keeping supporting
TypeScript, styles, and assets with their owner rather than grouping by extension.
Each folder's nested README documents its internal organization.

| Folder        | Responsibility                                                                                                                                                                                                                                                |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `framework/`  | Application coordination, state, contracts, and lifecycle. This is the TypeScript behavior that makes Frame function; rendering belongs in the component library.                                                                                             |
| `components/` | Vue components and their supporting logic, styles, and assets. Includes both independent reusable controls and components that render framework behavior. Component-specific logic belongs here rather than in the framework merely because it is TypeScript. |
| `themes/`     | Shared theme definitions, tokens, validation, and runtime application. Serves both framework presentation and independent controls. Component-specific styles stay with their components.                                                                     |
| `modules/`    | Optional capabilities, each owning its implementation, presentation, styles, and assets. The plural name matches public `@frame/core/modules/*` imports. Main Core must not import optional modules.                                                          |
| `styles/`     | Ordered SCSS composition and shared foundations. See the [style architecture](../../../docs/styling/style-architecture.md).                                                                                                                                   |

| Root file       | Purpose                                                                                                                    |
| --------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `index.ts`      | Public Core entry point. Collects intentional public exports while keeping optional modules separate.                      |
| `vite-env.d.ts` | TypeScript declarations for Vite and supported asset imports. Contains build-time types, not runtime application behavior. |

Keep this root limited to these shared entry files and documentation. Use
lowercase kebab-case for new folder names and follow existing file conventions
within the owning folder. Update this README when a top-level boundary changes;
document internal organization in the corresponding nested README.
