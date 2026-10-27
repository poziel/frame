# Integrating an existing application

Keep your application in its own repository and consume Frame's public packages. Follow [getting started](getting-started.md) for installation, then migrate one region at a time.

## Keep a stable shell

Mount one `FrameShell` at the application layout level. Place your screen components or router view inside its workspace content. Navigation should not recreate the Frame instance. Stores, authentication, backend calls, and business rules remain application-owned.

Register supporting content as [views](../shell/views.md). Use the [navigation bar](../shell/navigation-bar.md) to invoke your router or commands. Frame does not automatically map routes to workspace tabs.

A mounted shell retains session state. Restoration after restart is a separate host policy. Do not serialize component references, callbacks, or the entire Frame instance as application data.

## Packages and styles

Import `@frame/core` and `@frame/core/style.css`; add `@frame/core/style.css` when using Features. Keep Vue compatible with the peer dependency and avoid bundling two runtimes. Vite's `resolve.dedupe: ['vue']` can help during linked development.

Archives provide deliberate upgrades. A `file:` dependency on a built package directory is also possible, but copy/link refresh behavior depends on the package manager. Rebuild after source changes. Never alias a host application to the Docs app.

Give the shell a containing layout with height. Check broad global CSS affecting buttons, inputs, or box sizing. Use [theme variables](../styling/theme-variables.md) for shared styling. [Tailwind](../../packages/tailwind/README.md) is optional build tooling, not a runtime feature.

## Browser and native hosts

Browser applications use browser defaults. Native applications explicitly supply a Tauri, Electron, or custom host adapter. Your application retains native commands, permissions, and window configuration. See [host integration](hosts.md).

The [independent consumer fixture](../../tests/fixtures/external-consumer/README.md) shows a separate browser application. Terminal integration needs additional plugin/capability setup described in [Features](../../packages/core/src/modules/README.md).

Core has no Tauri dependency. Native adapters may need additional TypeScript library declarations; see their setup guides.

## Verify your integration

Run your host's type check and production build. Exercise commands, view opening/hiding, routing, and disposal. Test native IPC/window controls and optional features with your actual adapters. The independent consumer fixture is Core-focused and does not establish compatibility with every feature or arbitrary global CSS.
