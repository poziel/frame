# Working on Frame

## Coding standards

Before editing code or documentation, read [coding standards](docs/contributing/coding-standards/README.md), then the guides for each language being changed. They document the Google baselines and Frame's overrides for classes, TSDoc, spacing, parameter layout, Vue, HTML, and CSS. The project guides take precedence over formatter defaults.

Use `bun run format` and `bun run check` for the shared workflow. Formatting checks and writes use the same complete pipeline. One-class-per-file, meaningful documentation, and architectural boundaries still require review. See [formatting and checks](docs/contributing/coding-standards/formatting.md) for scope, CI usage, and deliberate whole-workspace migrations.

## Product model

Frame is an application framework controlled through a root `Frame` instance. `FrameShell` renders that instance. Applications contribute Vue components, menus, commands, configuration, and backend adapters; Frame coordinates their presentation, shared state, and lifecycle.

Read the [library documentation](docs/README.md), especially [shell ownership](docs/shell/README.md) and [configuration](docs/configuration/frame-options.md), before changing shell behavior, public APIs, optional features, or component ownership. Do not present architectural targets as implemented methods.

## Two kinds of UI

1. **Application shell:** primary and secondary sidebars/menus, bottom panels, top menus, activity and action bars, workspace panes, navigation, and overlays. Frame owns their registration, placement, visibility, focus, and lifecycle. Provide typed configuration and instance APIs for the behavior you add. Host applications must not need DOM queries, internal component refs, or parallel layout stores to control the shell.
2. **Reusable visual components:** buttons, inputs, selects, and other controls used inside application-owned views. Provide explicit props, events, slots, and theme tokens. Keep ordinary controls usable independently; a button or input must not require a Frame instance. Components that interact with shell services may use the provided instance through the existing injection mechanism.

For each change, identify which responsibility it serves. A feature can include both a controller coordinated by Frame and a visual component that displays it.

## API and state ownership

- Extend existing registration, command, layout, workspace, and disposal contracts before adding another controller system. Inspect the current readers, writers, and public exports first.
- Expose meaningful shell behavior through the instance and its configuration as appropriate. Route UI actions and API calls through the same behavior so they remain consistent. Distinguish feature availability from a view merely being hidden.
- Keep state isolated per Frame instance. Delegate to focused controllers/modules; the root is the public coordinator, not a reason to put all implementation into `framework/frame.ts`.
- The host owns domain data, business rules, backend credentials/adapters, and application-specific persistence policies. Frame owns shell and installed-feature state, and can coordinate persistence through explicit host integration.
- Preserve component identity and state across hiding, moving, and reopening views when their lifecycle requires it. Closing a presentation and disposing its feature are distinct operations.
- Registrations and subscriptions need explicit cleanup. Frame disposal must release the resources it owns; caller-owned resources need explicit ownership rules. Preserve existing API contracts unless the task explicitly includes migration.

## Optional modules

- Optional modules ship inside `@frame/core`, under `src/modules/<module>/`, with public entry points `@frame/core/modules/<module>`. Keep each module’s implementation and styles isolated; the main Core entry must not import modules. Engines install automatically with Core. The agreed installer is chained `.use(featureDescriptor)`: each typed descriptor declares its own id, literal capability key, and install behavior; callers do not provide aliases. Proposed container namespaces are `frame.views.primarySidebar`, `frame.views.secondarySidebar`, and `frame.views.panel`. The target is that installing an extension adds typed capabilities to the same Frame instance. The typed `.use(moduleDescriptor)` installer and `editorModule` are implemented; editor registration automatically enables settings JSON editing. Other module descriptors remain architectural targets.
- Installing a capability does not create a feature instance. Create chats, terminals, and similar resources lazily through the capability when requested. Multiple instances can have different adapters/configuration and independent state.
- The latest chat direction separates instance creation from presentation. A chat can be embedded in application content or provide a typed view definition registered explicitly in a chosen Frame container. Do not create a sidebar as a side effect of chat creation. Earlier automatic-fallback proposals are superseded.
- Imports and capability installation must not automatically start AI requests, authenticate, spawn processes, or create demo content. Explicit feature creation/activation defines when work starts.
- The generic module installer and editor descriptor are implemented. Other module descriptors and the Frame-owned chat factory remain architectural targets. Implement and verify their contracts before documenting consumer examples as runnable.

## Themes, styling, and package boundaries

- Share `--frame-*` variables between Frame controls and application content. Read [theme variables](docs/styling/theme-variables.md); colors, typography, spacing, radii, shadows, and motion are all theme concerns. Preserve current appearance when introducing tokens.
- Tailwind is optional build tooling, not a runtime feature installed with `frame.use(...)`. Keep it out of Core's runtime dependencies. Its generated utilities reference runtime variables so selected themes affect content and portals consistently.
- Prefer Reka UI for suitable complex interaction primitives instead of rebuilding focus/keyboard behavior. Do not migrate unrelated existing controls merely because Reka is installed.
- Follow [package boundaries](docs/reference/packages.md): Core owns the framework and shared primitives, Core modules own optional chat, editor, viewer, terminal, and notification history, Tailwind owns its build integration, and Docs owns examples and the development host. Never ship demo registrations or product-specific backend services in library entry points.

## Verification and working practices

- Preserve unrelated and uncommitted work. Make targeted edits; do not commit, push, or publish unless requested.
- For public behavior, test host API calls as well as UI interactions. Relevant cases include multiple Frame instances, disabled features, repeated registration/opening, state retention, disposal, and portals. Choose checks appropriate to the change rather than running every browser suite indiscriminately.
- Available checks: `bun test`, `bun run build:library`, `bun run check:modules`, `bun run check:consumer`, and `bun run build`. Build library outputs before checking consumers against them.
- For Tailwind: `bun run check:tailwind`, then `python tests/tailwind-browser.py` in an environment with Playwright and Chromium. This verifies the compiled consumer and runtime theme changes.
- Report actual checks and remaining limits. Separate implemented behavior from the architecture direction and future proposals.
