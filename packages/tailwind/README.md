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

In the application's entry point, include the utilities:

```ts
import '@frame/tailwind';
import { createFrame } from '@frame/core';
```

Core's package entry automatically loads its component stylesheet. The Tailwind entry loads its own CSS, and `frameTailwind()` scans the Vite project root for application classes. No application CSS imports or `@source` declaration are required. These imports are global stylesheet side effects; no runtime `.use()` call is needed. Keep Core and Tailwind imports in the browser application, not in Node-only scripts.

The explicit `@frame/core/style.css`, `@frame/tailwind/style.css`, and `@frame/tailwind/theme.css` entries remain available. Use the additive CSS entry for an application with an existing Tailwind setup; importing the package root opts into the full Frame scales.

```vue
<template>
  <section class="bg-surface text-foreground p-4 rounded-md font-sans text-sm">
    Application content
  </section>
</template>
```

Ordinary utilities use Frame's design scales by default: `p-4`/`gap-4` use four `--frame-spacing-unit` units (16px), `text-sm` is 11px, `rounded-md` is 4px, and `font-sans`, font weights, tracking, line heights, box shadows and easing use Core tokens. Semantic colors include `bg`, `canvas`, `surface`, `foreground`, `muted`, `accent`, `accent-foreground`, `border`, and `danger`. Existing `frame-*` utilities remain supported. Changing tokens updates these utilities at runtime.

**Compatibility:** the full entry replaces stock color palettes, typography, radii, box shadows and easing scales. Classes such as `bg-red-500` require an explicitly added palette, or the additive setup below. Structural utilities, breakpoints, container sizes, animations, specialized drop/text/inset-shadow effects and explicit arbitrary values retain Tailwind behavior. Numeric duration utilities remain explicit; `transition` defaults to Frame's duration and easing.

This entry excludes Preflight, so it does not globally reset native elements. Frame's existing component CSS is unlayered and can take precedence over layered utilities on the same element; use theme tokens to customize Frame controls. Application-owned elements can freely use utilities. FrameShell and explicitly attached scopes supply inherited base typography; outside those surfaces, use font/size utilities or set application root typography yourself.

## Existing Tailwind applications

Keep the application's existing Tailwind Vite plugin and CSS import. Import only `@frame/tailwind/theme.css` after that CSS import. This additive bridge adds semantic and `frame-*` colors, overrides standard spacing/typography/radius/box-shadow/easing scales, and preserves existing named host palettes. Host `@theme` overrides can follow the bridge. Do not register a second Tailwind plugin or import the full integration a second time. Import Core's styles or tokens separately. The package still carries its build dependencies, but this path does not require using its plugin wrapper.

## Runtime themes and custom variables

The mappings use `@theme inline`, so generated utilities reference `--frame-*` variables directly. Use Core's `defineTheme`/`parseTheme` with `createFrame({ theme })` or `frame.theme.set(theme)` for per-instance themes; FrameShell handles its root and portal scope. `frame.theme.attach(element)` supports host surfaces. `frame.theme.reset()` restores document CSS inheritance, so existing document-root CSS themes still work. Font files need `@font-face` declarations or application-managed loading in addition to setting the font variable.

Use `duration-[var(--frame-duration)]` for the motion duration token. Additional application variables can be used directly, such as `p-[var(--app-panel-padding)]`, or mapped in the application's own `@theme inline` block. Theme uploads change values of existing tokens; they cannot introduce new generated class names or change compiled breakpoints.

See [the token contract](../../docs/styling/theme-variables.md) for import JSON, validation, defaults, precedence and current coverage. Parsing and application live in Core; import UI and persistence belong to the host. No presets package is required.

## Verify

From the repository root:

```sh
bun run check:tailwind
python tests/tailwind-browser.py
```

Build Core first. The browser check requires Python Playwright and Chromium. It exercises both production-built CSS entry points, standard scales, user imports, two Frame instances and real Reka portals, remount, cleanup, standalone controls, global CSS compatibility, and native controls without Preflight.

## Implementation structure

`vite.js` keeps the default `frameTailwind(options)` factory. Each call creates
an independent `FrameTailwindSources` in `src/frameTailwindSources.js` and the
upstream Tailwind compiler plugins. The class owns its resolved stylesheet
identity and consuming Vite root; its hooks stay bound when invoked separately.
Only the canonical Frame utility stylesheet receives the escaped `@source`
directive. Unrelated files and missing resources remain untouched.

The package archive includes the class implementation and requires no build
step. Runtime stylesheet entries, generated utility behavior, and the public
Vite declaration remain compatible. This is build tooling, not a Frame runtime
capability. CSS token mappings and visual scales are unchanged.
