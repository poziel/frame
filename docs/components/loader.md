# Loader

All 44 LDRS loading animations, available independently wherever you need an indicator.

## Features

### Explore all 44 loader variants

Browse all 44 styles below, select one, and copy its usage. The default is a 32px ring in the theme accent color. Reduced-motion preferences pause the animation. Use decorative when a surrounding component supplies the status.

<!-- frame:example id="loader.original-playground" -->

```vue
import { FrameLoader } from '@frame/core';

// In your template:
<FrameLoader variant="tailspin" :size="40" label="Calculating…" />
```

### Indicate a background task

A compact indicator communicates ongoing work while the surrounding view remains interactive.

<!-- frame:example id="loader.inline-status" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameLoader } from '@frame/core';
const demoSize = 24;
</script>
<template>
<FrameLoader :variant="&quot;ring&quot;" :size="demoSize" :label="&quot;Saving project&quot;" />
</template>
```

### Make an operation easier to notice

A larger animation works in an empty region that is waiting for application data.

<!-- frame:example id="loader.large-progress" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameLoader } from '@frame/core';
const demoSize = 40;
</script>
<template>
<FrameLoader :variant="&quot;tailspin&quot;" :size="demoSize" :label="&quot;Loading workspace&quot;" />
</template>
```

### Present a paused indicator

A speed of zero pauses the animation while retaining the accessible loading label.

<!-- frame:example id="loader.quiet-motion" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameLoader } from '@frame/core';
const demoSize = 32;
const demoSpeed = 0;
</script>
<template>
<FrameLoader :variant="&quot;ring&quot;" :size="demoSize" :speed="demoSpeed" :label="&quot;Waiting for connection&quot;" />
</template>
```

## APIs

<!-- frame:generated api="loader" -->

### FrameLoader

Source: `packages/core/src/components/feedback/FrameLoader.vue`

#### Properties

| Name           | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Default                        | Description                                                    |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | -------------------------------------------------------------- |
| `variant`      | `"ring" \| "bouncy" \| "cardio" \| "grid" \| "hatch" \| "helix" \| "hourglass" \| "infinity" \| "jelly" \| "leapfrog" \| "metronome" \| "mirage" \| "miyagi" \| "momentum" \| "orbit" \| "ping" \| "pinwheel" \| "pulsar" \| "quantum" \| "reuleaux" \| "ripples" \| "spiral" \| "square" \| "squircle" \| "superballs" \| "tailspin" \| "treadmill" \| "trefoil" \| "trio" \| "waveform" \| "wobble" \| "zoomies" \| "ring-2" \| "line-spinner" \| "tail-chase" \| "dot-spinner" \| "bouncy-arc" \| "line-wobble" \| "chaotic-orbit" \| "dot-wave" \| "newtons-cradle" \| "dot-stream" \| "dot-pulse" \| "jelly-triangle" \| undefined` | "ring"                         | Loader animation rendered from the supported LDRS variants.    |
| `size`         | `number \| undefined`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | 32                             | Largest dimension in pixels.                                   |
| `color`        | `string \| undefined`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | "var(--frame-accent, #0078d4)" | CSS color applied to the loader animation.                     |
| `speed`        | `number \| undefined`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Omitted                        | Animation loop duration in seconds; 0 pauses the animation.    |
| `stroke`       | `number \| undefined`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Omitted                        | Stroke width for line-based variants.                          |
| `strokeLength` | `number \| undefined`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Omitted                        | Track length as a fraction from 0 to 1, for supported styles.  |
| `bgOpacity`    | `number \| undefined`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Omitted                        | Background track opacity from 0 to 1, for supported styles.    |
| `label`        | `string \| undefined`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | "Loading…"                     | Accessible loading status label.                               |
| `decorative`   | `boolean \| undefined`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | false                          | Use when a surrounding loading region supplies its own status. |

#### Events

No declared entries.

#### Slots

No declared entries.

#### Exposed API

No declared entries.

<!-- /frame:generated -->

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="loader" -->

No declared entries.

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->
