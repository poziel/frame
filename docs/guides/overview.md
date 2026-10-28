# What is Frame?

Frame is an application framework for building a workbench around your Vue views. It coordinates sidebars, panels, workspace panes, menus, commands, settings, and notifications through one root `Frame` instance.

## Your application inside a shared workbench

Your application creates a stable instance with `createFrame(options)` and passes it to `FrameShell`. Register content and use instance APIs to change what appears, where it appears, and which view is active. Descendants use `useFrame()` to access that same instance.

Frame owns shell placement, visibility, focus, layout, and the lifecycle of registered presentations. Your application owns domain data, business rules, backend connections, credentials, and persistence policy. Each instance has independent state.

## Shell and controls

The application shell coordinates registered views, navigation, commands, and shared services. Reusable visual controls provide buttons, fields, menus, and other themed content inside your application views. Ordinary controls use explicit props, events, and slots and do not require a Frame instance.

Use the root instance for shell behavior such as opening a sidebar or splitting a workspace. Use application components and stores for the work inside those views.

## A typical interaction

1. Create a Frame instance and render `FrameShell`.
2. Contribute Vue views, commands, and menus.
3. A user invokes a command or an application calls an instance method.
4. Frame updates its state and the shell presents the result.

## Start building

- [Getting started](getting-started.md): installation, a first shell, views, and commands.
- [How Frame works](how-it-works.md): ownership, packages, modules, and lifecycle.
- [Host integration](hosts.md): browser defaults, Tauri, Electron, and custom services.
- [Shell contributions](../shell/README.md): choose the right location for content.
- [Reusable components](../components/README.md): controls for application views.

Frame's workbench is inspired by VS Code. Frame is an independent project and is not affiliated with Microsoft or Visual Studio Code.
