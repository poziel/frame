# Frame architecture direction

Frame is the application coordinator. The host supplies content and intent; a root Frame instance manages the workbench that presents them. `FrameShell` is its Vue rendering surface. Applications should be able to control the shell through public APIs without reconstructing Frame's internal state or reaching into its DOM.

This document records the agreed direction. It does not introduce new runtime APIs.

## Shell and view components

| Responsibility | Owner | Host interaction |
| --- | --- | --- |
| Primary/secondary sidebars, bottom panels, menus, activity/action bars | Frame | Configure availability, register contributions, invoke instance APIs |
| Workspace pane layout, active content, and placement | Frame | Supply Vue components and request navigation/layout changes |
| Content inside an application view | Host application | Compose its own Vue components using Frame's visual controls |
| Shared controls and their interaction/accessibility behavior | Frame component library | Use props, events, slots, and theme variables |
| Domain data, business rules, AI/backend adapters | Host application | Provide data and explicit service adapters |
| Optional feature creation, shared state, and presentation | Installed capability coordinated by Frame | Create instances and open/control them through Frame |

The shell must offer configuration and runtime control appropriate to each capability. Initial configuration, availability, visibility, and disposal have different meanings: hiding a panel does not destroy it, and disabling a capability must not leave active commands or fallback paths that bypass the restriction. Exact policies belong in each capability's implemented contract.

Reusable visual components form the second part of Frame. They let host applications build views that follow Frame's styling and themes. Simple controls remain independently usable. View-level integrations may access shell services through the provided Frame instance.

## One root, modular implementation

The root exposes and coordinates capabilities; focused controllers own their implementation. Avoid global singleton state and duplicate host-owned copies of Frame layout or feature state. Independent Frame instances must remain isolated.

The host can retain its own domain stores. Having one Frame entry point does not require moving every product's business rules into the framework. Frame owns the resources it creates, with explicit disposal and adapter ownership contracts.

## Optional features are factories

Installing Features should make capabilities available on Frame without eagerly creating chats, editors, or terminal processes. Later requests create independent feature instances. For chat, each instance can have its own responder/backend configuration; a single global responder selected at Frame creation is insufficient.

The current agreed direction separates feature creation and presentation. Configure self-describing typed descriptors through chained .use(feature) calls; each descriptor supplies its own capability key. Access inferred capabilities under frame.features and create independent instances later. Callers do not name or alias features during installation. The proposed container APIs are frame.views.primarySidebar.register(), frame.views.secondarySidebar.register(), and frame.views.panel.register(). A feature instance can provide a typed view definition registered explicitly through a sidebar or bottom-panel container, or be rendered inside existing workspace content. Creating a controller must not automatically manufacture a sidebar. This supersedes the earlier automatic chat fallback proposal.

See [the current design](extension-and-reka-design.md) for the proposed namespaces, typing, and migration of existing features/views properties. Those runtime APIs are still proposals. The package rename to @frame/features is implemented independently.

## Build integration

Tailwind generates CSS during the host build. It cannot be enabled solely by a runtime Frame instance. The optional `@frame/tailwind` package currently supplies a Vite plugin and CSS mappings; its setup is documented in [the package README](../packages/tailwind/README.md).

A unified `@frame/vite` integration that also injects styles was discussed as a convenience, but does not currently exist. Keep runtime capability installation and build integration distinct, even if a future setup tool configures both.

Themes share runtime CSS variables between the shell, application views, and portalled overlays. See [the token contract](theme-variables.md) for implemented values and current component coverage.

## Existing implementation and gaps

At the time of this documentation update:

- `packages/core/src/frame/createFrame.ts` creates per-instance commands, view registries, layout state, workspace control, settings, notifications, navigation, and disposal. It already provides much of the coordinator model.
- `FrameOptions` currently includes settings, notifications, and navigation switches. Shell visibility lives in layout state; some presentation options remain `FrameShell` props. A complete unified configuration contract is not implemented.
- `FrameShell` receives/provides the instance and renders the shell. `useFrame()` accesses the provided instance inside its component tree.
- Features currently exports standalone controllers and components, including `createAIChat` and `AIChat`. It does not yet install typed capabilities onto Frame or provide the proposed feature-instance view factories.
- Reka UI is installed, and Tailwind is available as a separate optional package. Existing controls are not all Reka-based, and existing styles are not fully tokenized.

Future work should extend these existing systems deliberately. There is no need to replace the working shell to establish Frame as the public application API.
