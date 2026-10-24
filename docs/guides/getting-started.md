# Getting started with Frame Shell

Frame provides the persistent application shell around your Vue content: sidebars, workspace panes, panels, commands, and shared controls. Your application supplies the views and business logic.

This guide is the starting point for application developers and AI coding assistants integrating Frame. It describes current public APIs. Detailed interaction rules belong in the linked component and service guides.

## The two parts of a Frame application

`createFrame()` creates an isolated application coordinator. It owns shell registrations, layout state, commands, workspace control, and shell services. `FrameShell` renders that instance and provides it to descendant components.

Create one stable instance for each shell. Keep it mounted at your application's layout level while navigating between screens. Create it in Vue setup, rather than in a render function or on every route change. Separate shells should use separate instances.

| Frame owns                                                   | Your application owns                                          |
| ------------------------------------------------------------ | -------------------------------------------------------------- |
| Shell placement, visibility, layout, and registered commands | Domain data, business rules, authentication, and backend calls |
| Presentation of registered Vue views                         | The content and behavior inside those views                    |
| Shared controls and theme variables                          | Application navigation and persistence policies                |
| Resources created by its controllers                         | Host-created services and their cleanup                        |

Use public instance APIs to control the shell. Application code should not query shell DOM elements or keep a second copy of Frame's layout state.

## Install the packages

Frame currently uses private local packages. For development across separate repositories, build the packages and link them directly. No archive or published release is required.

From the Frame repository root:

```powershell
bun install
bun run build:library
bun run build:themes

cd packages/core
bun link

cd ../themes
bun link

cd ../tailwind
bun link
```

Then, from your Vue application's root:

```powershell
bun link --save @frame/core @frame/themes
bun link --save --dev @frame/tailwind
```

Core supplies the shell and controls. Themes supplies optional presets. Tailwind supplies optional build tooling and utilities. Core alone is enough to mount the shell; link only the packages your application needs. The repository root and documentation application are not library entry points.

The application supplies Vue `^3.5.13`. The Tailwind integration requires Vite `^8.0.0` and supplies Tailwind and its Vite plugin as dependencies.

If you also need optional Features, build and register it from the Frame repository root:

```powershell
bun run build:features
cd packages/features
bun link
```

Then run `bun link --save @frame/features` from your application root. Features requires compatible Core; importing it registers no views or starts any services.

### Rebuild while developing

After editing Core, run `bun run build:library` from the Frame repository root. After editing Themes or Features, run `bun run build:themes` or `bun run build:features`; build Core first when its contracts change. Tailwind's package has no build step. Links continue pointing to the same directories, so rebuilding does not require packing or relinking. Restart the application's development server if it retains an older dependency build.

For an archive-based installation, run `npm pack ./packages/core` and the equivalent command for each other package you need from the Frame repository root after building them. Install the resulting `.tgz` files in the application using `bun add` (and `--dev` for Tailwind). Archives are snapshots: rebuild, repack, and update the application dependency when upgrading.

## Enable Tailwind utilities (optional)

Add Frame's Tailwind integration to your application's existing `vite.config.ts`, preserving its other configuration:

```ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import frameTailwind from "@frame/tailwind/vite";

export default defineConfig({
  plugins: [vue(), frameTailwind()],
});
```

In your browser application entry point, such as `src/main.ts`, add:

```ts
import "@frame/tailwind";
```

Core's public JavaScript import includes its component styles automatically. The Tailwind entry includes its own stylesheet, and the Vite integration scans the application's Vite project root for class names. You do not need manual Frame CSS imports, an `@source` declaration, or a runtime `.use(tailwind)` call.

Utilities such as `bg-surface`, `text-foreground`, `p-4`, and `rounded-md` reference Frame's theme variables. Changing a Frame instance's theme updates their values within that instance's theme scope, including its managed portals. Explicit values such as `p-[17px]` retain their own behavior.

For an application that already uses Tailwind, keep its existing Tailwind plugin and CSS import, then import `@frame/tailwind/theme.css` after that CSS import instead of importing the package root. Do not register a second Tailwind plugin. This additive setup preserves the host's named color palettes; the full entry replaces them with Frame's scales. See the [Tailwind guide](../../packages/tailwind/README.md) for details.

## Mount your first shell

Place this in your host application's `App.vue`:

```vue
<script setup lang="ts">
import { onBeforeUnmount } from "vue";
import { createFrame, FrameShell } from "@frame/core";

const frame = createFrame({ settings: false, notifications: false });

onBeforeUnmount(() => frame.dispose());
</script>

<template>
  <FrameShell :frame="frame" title-text="My application">
    <main class="application-home">
      <h1>My application</h1>
      <p>Your Vue content lives here.</p>
    </main>
  </FrameShell>
</template>

<style>
html,
body,
#app {
  margin: 0;
  height: 100%;
}

.application-home {
  padding: 16px;
}
</style>
```

Core's public JavaScript entry automatically includes Frame's stylesheet. Give its containing layout a usable height. If your mount element is not `#app`, update the selector.

The default slot supplies the initial workspace pane. Omit it to use the built-in empty workspace. Additional panes and workspace tabs have their own APIs and slots; see [workspace panes](../shell/workspace.md).

The settings and notification switches above disable those shell presentations for this minimal example. Enable them when your application needs them. A new Frame instance does not include the documentation application's sample views, settings sections, or demo content.

## Choose a theme (optional)

If you linked `@frame/themes`, update the creation code in `App.vue` to select a preset:

```ts
import { vscodeLight2026 } from "@frame/themes";

const frame = createFrame({
  settings: false,
  notifications: false,
  theme: vscodeLight2026,
});
```

Use this in place of the earlier `createFrame()` call. You can later switch themes with `frame.theme.set(theme)` or restore inherited document styles with `frame.theme.reset()`. No separate theme stylesheet is required. See the [Themes guide](../../packages/themes/README.md) for the available presets.

## Add application views

The main shell regions are the workspace, primary sidebar, secondary sidebar, and panel. The panel starts below the workspace and can be repositioned through its layout controls. Sidebars are identified by their role rather than a fixed physical side.

Create your own Vue components, then add these imports and registrations to the same `App.vue` setup:

```ts
import ProjectSidebar from "./views/ProjectSidebar.vue";
import InspectorView from "./views/InspectorView.vue";
import OutputView from "./views/OutputView.vue";

const removeProjects = frame.registerSidePanel({
  id: "myapp.projects",
  label: "Projects",
  component: ProjectSidebar,
});

const removeInspector = frame.registerSecondaryTab({
  id: "myapp.inspector",
  label: "Inspector",
  component: InspectorView,
});

const removeOutput = frame.registerBottomTab({
  id: "myapp.output",
  label: "Output",
  component: OutputView,
});

frame.openSidePanel("myapp.projects");

onBeforeUnmount(() => {
  removeOutput();
  removeInspector();
  removeProjects();
});
```

For a working small application, create the three imported files under `src/views/`.

`ProjectSidebar.vue` uses the enclosing Frame instance to open the other views:

```vue
<script setup lang="ts">
import { FrameButton, useFrame } from "@frame/core";
const frame = useFrame();
</script>

<template>
  <div>
    <FrameButton
      label="Inspect project"
      @click="frame.openView('myapp.inspector')"
    />
    <FrameButton label="Show output" @click="frame.openView('myapp.output')" />
  </div>
</template>
```

`InspectorView.vue` supplies application-owned details:

```vue
<template>
  <section>
    <h2>Project details</h2>
    <p>This content belongs to your application.</p>
  </section>
</template>
```

`OutputView.vue` keeps its own editable text while its region is hidden:

```vue
<script setup lang="ts">
import { ref } from "vue";
const note = ref("Application output");
</script>

<template>
  <label>Output note <textarea v-model="note" /></label>
</template>
```

Start your host application's development server. Open Output, edit its text, close the panel, and reopen it from Projects. Its text remains while the shell stays mounted. This checks the basic integration without a backend or optional feature setup.

Registration makes a view available; opening selects and shows it. For example, call `frame.openSecondaryPanel('myapp.inspector')` or `frame.openBottomPanel('myapp.output')` when the user requests those views.

Use stable, application-prefixed IDs. Registration returns a function that removes the contribution. Call it when a dynamically installed part of your application is removed. Disposing the Frame instance clears its remaining registrations when the whole shell is destroyed.

Closing a region and unregistering a view are different operations. Keep registrations stable during ordinary navigation. See [view interactions](../shell/views.md) for moving, hiding, grouping, and component lifecycle behavior.

## Add application commands

Commands give buttons, menus, keyboard shortcuts, and Quick actions a shared behavior:

```ts
const removeShowOutput = frame.registerCommand({
  id: "myapp.show-output",
  label: "My app: Show output",
  shortcut: "Ctrl+Alt+O",
  run: () => frame.openBottomPanel("myapp.output"),
});

onBeforeUnmount(removeShowOutput);
```

The command becomes searchable in Quick actions. Application UI can call `frame.executeCommand('myapp.show-output')` to invoke the same action. Reserve IDs beginning with `frame.` for Frame's commands. Command registrations also return an unregister function.

For shortcut rules, enabled states, and custom pickers, see [commands](../shell/commands.md).

## Access the instance inside a view

Components rendered beneath `FrameShell` can call `useFrame()` in setup:

```vue
<script setup lang="ts">
import { FrameButton, useFrame } from "@frame/core";

const frame = useFrame();
</script>

<template>
  <FrameButton
    label="Show output"
    @click="frame.executeCommand('myapp.show-output')"
  />
</template>
```

This accesses the enclosing shell's instance. The component that creates `FrameShell` should use its own `frame` variable; it is outside the provider established by its child. Calling `useFrame()` without an enclosing shell throws.

Ordinary reusable controls such as `FrameButton` can also be used without a Frame instance. See [documentation index](../README.md) for their individual props, events, and slots.

## Keep the shell stable and clean up ownership

Mount your router view or application screen components inside the shell's workspace content. Keep domain state in your application's stores. Frame does not replace your router or automatically map routes to workspace tabs.

A mounted shell can retain session state, but restoring it after an application restart is a separate integration. Do not assume that registering a view saves its content, routes, or domain data to disk.

Call `frame.dispose()` when the owning shell is destroyed. Dispose host-owned subscriptions, adapters, and optional feature controllers according to their contracts as well. Frame disposal does not imply ownership of every service referenced by an application view.

## Optional Features and desktop integration

When using optional components, import their exports from `@frame/features` and load `@frame/features/style.css`. Construct and mount only the features your application needs. Each feature documents its adapters, presentation, and cleanup in the [Features guide](../../packages/features/README.md).

The proposed chained `frame.use(...)` installer and `frame.views.primarySidebar` namespaces are architectural targets, not current APIs. Use the registration methods in this guide for current integrations.

The shell runs in a browser without Rust. Native window controls require an explicitly configured host adapter; your application owns native configuration and permissions. See [external integration](existing-app.md) for host requirements, TypeScript configuration, and the scope of existing validation.

## Where to go next

- [Layout](../configuration/layout.md): shell geometry and visibility.
- [Workspace](../shell/workspace.md): panes, splitting, and workspace tabs.
- [Menus and toolbar](../shell/menus-and-toolbar.md): application menus and title-bar actions.
- [Documentation index](../README.md): choose the next topic.
- [Theme variables](../styling/theme-variables.md): style application content with Frame's tokens.
- [Package boundaries](../reference/packages.md): Core, Features, Tailwind, and Docs responsibilities.

For AI assistants: start with this guide, [configuration](../configuration/frame-options.md), and the [shell contribution map](../shell/README.md), then read the relevant guide and the installed package's TypeScript declarations. Use public exports from the installed version.
