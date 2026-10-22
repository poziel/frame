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

Installing Extras should make capabilities available on Frame without eagerly creating chats, editors, or terminal processes. Later requests create independent feature instances. For chat, each instance can have its own responder/backend configuration; a single global responder selected at Frame creation is insufficient.

The agreed presentation behavior for a future Frame-owned chat capability is:

1. Create a chat instance when the host requests one.
2. Let the host explicitly mount a presentation, or request that Frame open the chat.
3. When opening, reveal/focus an existing registered presentation, including a hidden one.
4. If no presentation is registered, create a sidebar view containing the chat component.
5. Repeated opens reuse the existing view. Moving or hiding it preserves the chat's state.
6. Dispose feature resources explicitly, or when their owning Frame is disposed. Closing a view need not end its conversation.

Presentation registration must be tied to the feature instance and cleaned up with its mounting lifecycle. The precise installer syntax, type augmentation, multiple-presentation selection policy, and creation/disposal APIs still require implementation design. Do not invent those APIs in examples and imply they already ship.

## Build integration

Tailwind generates CSS during the host build. It cannot be enabled solely by a runtime Frame instance. The optional `@frame/tailwind` package currently supplies a Vite plugin and CSS mappings; its setup is documented in [the package README](../packages/tailwind/README.md).

A unified `@frame/vite` integration that also injects styles was discussed as a convenience, but does not currently exist. Keep runtime capability installation and build integration distinct, even if a future setup tool configures both.

Themes share runtime CSS variables between the shell, application views, and portalled overlays. See [the token contract](theme-variables.md) for implemented values and current component coverage.

## Existing implementation and gaps

At the time of this documentation update:

- `packages/core/src/frame/createFrame.ts` creates per-instance commands, view registries, layout state, workspace control, settings, notifications, navigation, and disposal. It already provides much of the coordinator model.
- `FrameOptions` currently includes settings, notifications, and navigation switches. Shell visibility lives in layout state; some presentation options remain `FrameShell` props. A complete unified configuration contract is not implemented.
- `FrameShell` receives/provides the instance and renders the shell. `useFrame()` accesses the provided instance inside its component tree.
- Extras currently exports standalone controllers and components, including `createAIChat` and `AIChat`. It does not yet install typed capabilities onto Frame or automatically provide the chat sidebar fallback.
- Reka UI is installed, and Tailwind is available as a separate optional package. Existing controls are not all Reka-based, and existing styles are not fully tokenized.

Future work should extend these existing systems deliberately. There is no need to replace the working shell to establish Frame as the public application API.
