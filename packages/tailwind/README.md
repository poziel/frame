# @frame/tailwind

Optional Tailwind CSS v4 integration for Frame applications using Vite 8. The package supplies Tailwind and its Vite plugin as dependencies; applications do not need to install them separately. Core never imports this package. All Frame packages currently remain private and local.

## Install locally

Build Core with `bun run build:library` in the Frame repository, then add both packages to the application's package.json and run its package manager's install command:

```json
{
  "dependencies": {
    "@frame/core": "file:../frame/packages/core"
  },
  "devDependencies": {
    "@frame/tailwind": "file:../frame/packages/tailwind"
  }
}
```

Adjust paths to your repository layout. Workspaces can use `workspace:*` instead. Alternatively, run `npm pack` in each package directory and install the resulting archives. Tailwind's package exports are ready to pack without a build; Core must be built first. The application supplies compatible Vue and Vite versions.

## Enable in Vite

```ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import frameTailwind from '@frame/tailwind/vite';

export default defineConfig({
  plugins: [vue(), frameTailwind()],
});
```

Create `src/app.css`:

```css
@import '@frame/core/style.css';
@import '@frame/tailwind/style.css';

/* Relative to this stylesheet; explicitly scan the consuming app. */
@source './';

/* Selected-theme overrides follow defaults. */
:root[data-theme='custom'] {
  --frame-accent: #7c3aed;
  --frame-content-padding: 20px;
  --frame-control-radius: 8px;
  --frame-font-body: 'Application Sans', system-ui, sans-serif;
}
```

Import `./app.css` from the application's entry point. For utilities without shell styles, replace `@frame/core/style.css` with `@frame/core/tokens.css`.

```vue
<template>
  <section class="bg-frame-surface text-frame-text p-frame-content rounded-frame-panel font-frame-body">
    Application content
  </section>
</template>
```

Ordinary utilities such as `flex`, `gap-4`, and `p-4` are available too. This entry intentionally excludes Preflight, so it does not globally reset native elements. Frame's existing component CSS is unlayered and can take precedence over layered utilities on the same element; use theme tokens to customize Frame controls. Application-owned elements can freely use utilities.

## Existing Tailwind applications

Keep the application's existing Tailwind Vite plugin and CSS import. Import only `@frame/tailwind/theme.css` after that CSS import to add Frame's token mappings. Do not register a second Tailwind plugin or import the full integration a second time. Import Core's styles or tokens separately. The package still carries its build dependencies, but this path does not require using its plugin wrapper.

## Runtime themes and custom variables

The mappings use `@theme inline`, so generated utilities reference `--frame-*` variables directly. Changing them on `document.documentElement` updates both application components and body-portalled overlays without rebuilding CSS. Font files need `@font-face` declarations or application-managed loading in addition to setting the font variable.

Use `duration-[var(--frame-duration)]` for the motion duration token. Additional application variables can be used directly, such as `p-[var(--app-panel-padding)]`, or mapped in the application's own `@theme inline` block. Theme uploads change values of existing tokens; they cannot introduce new generated class names or change compiled breakpoints.

See [the token contract](../../docs/theme-variables.md) for defaults, override precedence, and current coverage. An uploaded-theme parser and theme selection UI are not implemented here.

## Verify

From the repository root:

```sh
bun run check:tailwind
python tests/tailwind-browser.py
```

The browser check requires Python Playwright and Chromium. It exercises the production-built consumer, ordinary utilities, runtime theme changes, default restoration, and a real Reka portal.
