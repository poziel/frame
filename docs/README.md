# Using Frame

Frame is a Vue application shell controlled through one `createFrame()` instance. Your application supplies content, commands, and services; Frame manages their shell presentation and shared layout.

## Start here

1. [Build a small application](guides/getting-started.md): install the packages, mount a shell, and add views and commands.
2. [Configure Frame](configuration/frame-options.md): every creation option, its default, and runtime configuration.
3. [Choose a shell contribution](shell/README.md): decide where your content or action belongs.
4. [Integrate an existing application](guides/existing-app.md): keep your router, stores, backend, and native host.

5. [Host integration](guides/hosts.md): browser defaults, Tauri, Electron, and custom host contracts.

## Contribute to the shell

| Task | Guide |
| --- | --- |
| Add sidebar or panel content | [Views and sidebars](shell/views.md) |
| Configure the bars that select views | [View bars](shell/view-bars.md) |
| Add actions, links, or dropdowns | [Navigation bar](shell/navigation-bar.md) |
| Add application menus and title-bar buttons | [Menus and toolbar](shell/menus-and-toolbar.md) |
| Add footer text, buttons, badges, or status messages | [Status bar](shell/status-bar.md) |
| Add commands and searchable choices | [Commands](shell/commands.md) |
| Display screens, split panes, or document tabs | [Workspace](shell/workspace.md) |
| Add a banner, modal, settings, or notification | [Shell services](shell/services.md) |

## Configuration, styling, and packages

- [Component documentation](components/README.md): basic form controls, examples, API, behavior, and styling.
- [Layout](configuration/layout.md): region visibility, placement, sizing, Zen, and overlay boundaries.
- [Theme tokens](styling/theme-variables.md): shared colors, spacing, fonts, and component tokens.
- [Theme files](styling/theme-files.md): JSON, JSONC, JSON5, YAML, TOML and INI; nested and dotted token paths.
- [Packages](reference/packages.md): Core, Features, Tailwind, and Docs boundaries.
- [Optional Features](../packages/features/README.md): explicit setup and ownership for chat, editor, viewer, terminal, and notification history.
- [Optional Tailwind](../packages/tailwind/README.md): build integration.

## For AI coding assistants

The repository-root [llms.txt](../llms.txt) provides a concise reading map. Keep its links current when adding or moving consumer documentation. It points to these same Markdown sources; there is no separate AI-only copy of the detailed guides.

Start with getting started, configuration, and the guide for the area being changed. These documents describe implemented library behavior. Use public imports from `@frame/core` and `@frame/features`, and check the installed version's declarations when writing code. Do not import documentation examples or library internals into a host application.

Create a stable Frame instance per shell. Use its controllers rather than DOM queries or a second layout store. Keep business data and persistence in the host. Registration, opening, hiding, and disposal are separate operations.

The proposed `.use(feature)` installer and `frame.views.primarySidebar` namespaces are not implemented. Optional Features currently expose explicit components and factories. Individual controls have their own props/events/slots; these shell guides cover how to place and coordinate content rather than every control's interactions.

- [Local AI agent connectors](guides/agent-connectors.md): connect the AI chat to Codex, Claude, Gemini, Copilot, or OpenCode through a native host.
