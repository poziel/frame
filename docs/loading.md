# Loaders and loading regions

Import `FrameLoader` and `FrameLoading` from `@frame/core`. Both work independently of `FrameShell` and `createFrame`. The docs application's **Loader** page previews every style; **Loading region** demonstrates a task completing with the rest of the app still interactive.

```vue
<FrameLoader variant="tailspin" :size="32" label="Calculating…" />
```

`FrameLoader` wraps all 44 styles from [LDRS](https://uiball.com/ldrs/). It works independently of the loading region: use it in a button, toolbar, status area, or any other application content. The exported `frameLoaderVariants` list and `FrameLoaderVariant` type expose every choice. The default is `ring`.

Available variants: `ring`, `ring-2`, `tailspin`, `line-spinner`, `squircle`, `square`, `reuleaux`, `tail-chase`, `dot-spinner`, `spiral`, `bouncy`, `treadmill`, `bouncy-arc`, `waveform`, `hatch`, `hourglass`, `zoomies`, `line-wobble`, `infinity`, `trefoil`, `cardio`, `helix`, `grid`, `quantum`, `wobble`, `orbit`, `chaotic-orbit`, `superballs`, `trio`, `momentum`, `dot-wave`, `leapfrog`, `newtons-cradle`, `dot-stream`, `dot-pulse`, `metronome`, `jelly`, `jelly-triangle`, `mirage`, `ping`, `pulsar`, `ripples`, `miyagi`, and `pinwheel`.

The application's **Loader** section shows the entire gallery. Select a style to preview it and copy its usage, or filter by name. **Loading region** has separate controls for the animation, text, text placement, and visibility of each part.

| Prop | Default | Meaning |
| --- | --- | --- |
| `size` | `32` | Largest dimension in pixels |
| `color` | Theme accent | Any CSS color, including CSS variables |
| `speed` | LDRS style default | Loop duration in seconds; `0` pauses |
| `stroke` | LDRS style default | Stroke width for line-based styles |
| `strokeLength` | LDRS style default | Track length from 0 to 1, for styles that support it |
| `bgOpacity` | LDRS style default | Background track opacity from 0 to 1, for styles that support it |
| `label` | `Loading…` | Accessible status label |
| `decorative` | `false` | Hide the animation from assistive technology when its parent supplies the status |

Reduced-motion preferences pause the animation automatically, including changes made while the component is mounted. LDRS registers in the browser after mount; importing core does not require browser globals. Each loader reserves its requested size during initialization.

## Cover a region

```vue
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { FrameLoading } from '@frame/core';

const active = ref(true);
const data = ref<unknown>();
const error = ref('');
async function load() {
  active.value = true;
  error.value = '';
  try {
    const response = await fetch('/api/workspace');
    if (!response.ok) throw new Error('Unable to load workspace');
    data.value = await response.json();
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
  } finally {
    active.value = false;
  }
}
onMounted(load);
</script>

<template>
  <FrameLoading :active="active" variant="ring" label="Preparing workspace…">
    <p v-if="error" role="alert">{{ error }}</p>
    <pre v-else>{{ data }}</pre>
  </FrameLoading>
</template>
```

`active` is required. While true, the default slot stays mounted, retains its layout, and becomes visually hidden, inert, and hidden from assistive technology. A centered loader and label cover only this region. The wrapper exposes `aria-busy`; the overlay supplies one accessible status. When false, the overlay is removed and the existing content becomes visible and interactive again.

The region accepts every loader appearance prop: `variant`, `size`, `color`, `speed`, `stroke`, `strokeLength`, and `bgOpacity`. It has a 96px minimum height; size it with ordinary CSS for page-sized or smaller regions. The overlay uses `--frame-surface`.

| Presentation prop | Default | Meaning |
| --- | --- | --- |
| `text` | `label` or `Loading…` | Visible message; an empty string hides it |
| `label` | `text` or `Loading…` | Accessible status, independently of visible text |
| `textPosition` | `below` | `above`, `below`, `left`, or `right` of the animation |
| `showLoader` | `true` | Show or hide the animation |
| `showText` | `true` | Show or hide the message |

```vue
<!-- Text above the selected animation. -->
<FrameLoading :active="loading" variant="helix" text="Calculating…" text-position="above">
  <Results />
</FrameLoading>

<!-- Message only. -->
<FrameLoading :active="loading" :show-loader="false" text="Preparing workspace…">
  <WorkspaceContent />
</FrameLoading>

<!-- Animation only, with an accessible label. -->
<FrameLoading :active="loading" variant="pinwheel" :show-text="false" label="Loading results">
  <Results />
</FrameLoading>
```

Named slots allow custom content without changing the region's mounted-content behavior:

- `#loader` replaces only the animation; the configured text and placement remain in effect.
- `#text` replaces the message markup.
- `#overlay` replaces the entire overlay arrangement. The surrounding accessible status remains.

Keep custom overlay content non-interactive, and mark nested `FrameLoader` components as `decorative` to avoid duplicate status announcements.

```vue
<FrameLoading :active="loading" text="Preparing preview…" text-position="left">
  <Preview />
  <template #loader><FrameLoader variant="dot-wave" :size="48" decorative /></template>
</FrameLoading>

<FrameLoading :active="loading" label="Preparing preview">
  <Preview />
  <template #overlay>
    <div class="my-loading-layout">
      <strong>Preparing preview</strong>
      <FrameLoader variant="newtons-cradle" decorative />
      <p>This can take a moment.</p>
    </div>
  </template>
</FrameLoading>
```

`FrameLoaderProps`, `FrameLoadingProps`, and `FrameLoadingTextPosition` are exported for application wrappers.

Do not put the default slot behind `v-if="!active"`: that prevents children from mounting and completing their initialization. The component changes presentation and user interaction only; the host owns task execution, errors, and cancellation. Expensive synchronous JavaScript still blocks the UI: run CPU-heavy work in a Web Worker or backend task. Always clear the loading state on failure as well as success.

## Browser regression check

With `bun run dev` serving port 1420, run `uv run --python 3.11 --with playwright python tests/loading-browser.py`. This checks mounted content, asynchronous completion, region isolation, pointer/keyboard behavior, all 44 variants, four text positions, optional text/animation, custom slots, documentation previews, and reduced-motion behavior. It requires a Playwright Chromium installation.
