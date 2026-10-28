# Loading Region

Cover one region with a loader while its mounted content continues initializing.

## Features

### Control a loading region

Bind active to your task state and clear it in finally. Loading hides the default slot and makes it inert, preserving its component instances and layout. Other regions remain interactive. Keep the content mounted rather than putting it behind v-if. CPU-heavy JavaScript still needs a worker or backend task.

<!-- frame:example id="loading.original-playground" -->

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

### Load one content region

The active overlay blocks this region while keeping its mounted content and component state intact.

<!-- frame:example id="loading.load-region" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameLoading, FrameShell } from '@frame/core';
import { createFrame } from '@frame/core';
const frame = createFrame();
const demoActive = true;
onBeforeUnmount(() => { frame.dispose(); });
</script>
<template>
<FrameShell :frame="frame">
<FrameLoading :active="demoActive" :text="&quot;Loading workspace&quot;" :variant="&quot;ring&quot;">
  <template #default><span v-text="&quot;Workspace content remains mounted.&quot;" /></template>
</FrameLoading>
</FrameShell>
</template>
```

### Reveal completed content

Clear active when the host operation finishes. The original mounted content becomes interactive again.

<!-- frame:example id="loading.ready-region" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameLoading, FrameShell } from '@frame/core';
import { createFrame } from '@frame/core';
const frame = createFrame();
const demoActive = false;
onBeforeUnmount(() => { frame.dispose(); });
</script>
<template>
<FrameShell :frame="frame">
<FrameLoading :active="demoActive" :text="&quot;Loading workspace&quot;">
  <template #default><span v-text="&quot;Workspace is ready.&quot;" /></template>
</FrameLoading>
</FrameShell>
</template>
```

### Use text without an animation

A text-only status can explain a wait when an animated indicator is unnecessary.

<!-- frame:example id="loading.text-status" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameLoading, FrameShell } from '@frame/core';
import { createFrame } from '@frame/core';
const frame = createFrame();
const demoActive = true;
const demoShowLoader = false;
onBeforeUnmount(() => { frame.dispose(); });
</script>
<template>
<FrameShell :frame="frame">
<FrameLoading :active="demoActive" :show-loader="demoShowLoader" :text="&quot;Waiting for a response…&quot;">
  <template #default><span v-text="&quot;Application content&quot;" /></template>
</FrameLoading>
</FrameShell>
</template>
```

## APIs

<!-- frame:generated api="loading" -->

### FrameLoading

Source: `packages/core/src/components/feedback/FrameLoading.vue`

#### Properties

| Name           | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Default  | Description                                                                                 |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------- |
| `active`       | `boolean`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Required | Displays the overlay while retaining and disabling interaction with the underlying content. |
| `text`         | `string \| undefined`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Omitted  | Visible message; falls back to label or Loading…. Empty string hides the message.           |
| `textPosition` | `FrameLoadingTextPosition \| undefined`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | "below"  | Placement of the message relative to the loader animation.                                  |
| `showLoader`   | `boolean \| undefined`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | true     | Displays the animation area of the default overlay.                                         |
| `showText`     | `boolean \| undefined`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | true     | Displays the message area of the default overlay.                                           |
| `label`        | `string \| undefined`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Omitted  | Accessible loading status label.                                                            |
| `size`         | `number \| undefined`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Omitted  | Largest dimension in pixels.                                                                |
| `variant`      | `"ring" \| "bouncy" \| "cardio" \| "grid" \| "hatch" \| "helix" \| "hourglass" \| "infinity" \| "jelly" \| "leapfrog" \| "metronome" \| "mirage" \| "miyagi" \| "momentum" \| "orbit" \| "ping" \| "pinwheel" \| "pulsar" \| "quantum" \| "reuleaux" \| "ripples" \| "spiral" \| "square" \| "squircle" \| "superballs" \| "tailspin" \| "treadmill" \| "trefoil" \| "trio" \| "waveform" \| "wobble" \| "zoomies" \| "ring-2" \| "line-spinner" \| "tail-chase" \| "dot-spinner" \| "bouncy-arc" \| "line-wobble" \| "chaotic-orbit" \| "dot-wave" \| "newtons-cradle" \| "dot-stream" \| "dot-pulse" \| "jelly-triangle" \| undefined` | Omitted  | Loader animation rendered from the supported LDRS variants.                                 |
| `color`        | `string \| undefined`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Omitted  | CSS color applied to the loader animation.                                                  |
| `speed`        | `number \| undefined`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Omitted  | Animation loop duration in seconds; 0 pauses the animation.                                 |
| `stroke`       | `number \| undefined`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Omitted  | Stroke width for line-based variants.                                                       |
| `strokeLength` | `number \| undefined`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Omitted  | Track length as a fraction from 0 to 1, for supported styles.                               |
| `bgOpacity`    | `number \| undefined`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Omitted  | Background track opacity from 0 to 1, for supported styles.                                 |

#### Events

No declared entries.

#### Slots

| Name      | Parameters | Return type  | Description                                               |
| --------- | ---------- | ------------ | --------------------------------------------------------- |
| `default` | `None`     | `VNodeChild` | Application content retained beneath the loading overlay. |
| `overlay` | `None`     | `VNodeChild` | Replaces the complete loading overlay presentation.       |
| `loader`  | `None`     | `VNodeChild` | Replaces the default loader animation.                    |
| `text`    | `None`     | `VNodeChild` | Replaces the fallback loading message.                    |

#### Exposed API

No declared entries.

<!-- /frame:generated -->

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="loading" -->

| CSS variable                                                                       | Theme path                                                                       | Default expression                              | Purpose                                              | Context                                |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------- | ---------------------------------------------------- | -------------------------------------- |
| `--frame-slot-div-div-slot-div-div-template-style-scoped-frame-loading-min-width`  | `frame.slot.div.div.slot.div.div.template.style.scoped.frame.loading.min.width`  | `0`                                             | Minimum width for .frame-loading.                    | `.frame-loading`                       |
| `--frame-slot-div-div-slot-div-div-template-style-scoped-frame-loading-min-height` | `frame.slot.div.div.slot.div.div.template.style.scoped.frame.loading.min.height` | `96px`                                          | Minimum height for .frame-loading.                   | `.frame-loading`                       |
| `--frame-loading-content-min-width`                                                | `frame.loading.content.min.width`                                                | `0`                                             | Minimum width for .frame-loading-content.            | `.frame-loading-content`               |
| `--frame-loading-content-height`                                                   | `frame.loading.content.height`                                                   | `100%`                                          | Height for .frame-loading-content.                   | `.frame-loading-content`               |
| `--frame-is-loading-frame-loading-content-opacity`                                 | `frame.is.loading.frame.loading.content.opacity`                                 | `0`                                             | Opacity for .is-loading > .frame-loading-content.    | `.is-loading > .frame-loading-content` |
| `--frame-surface`                                                                  | `frame.surface`                                                                  | `#181818`                                       | Background for .frame-loading-overlay.               | `.frame-loading-overlay`               |
| `--frame-gap`                                                                      | `frame.gap`                                                                      | `6px`                                           | Space between children for .frame-loading-indicator. | `.frame-loading-indicator`             |
| `--frame-loading-indicator-gap`                                                    | `frame.loading.indicator.gap`                                                    | `calc(     var(--frame-gap, 6px) * 2   )`       | Space between children for .frame-loading-indicator. | `.frame-loading-indicator`             |
| `--frame-loading-indicator-padding`                                                | `frame.loading.indicator.padding`                                                | `16px`                                          | Internal spacing for .frame-loading-indicator.       | `.frame-loading-indicator`             |
| `--frame-loading-indicator-max-width`                                              | `frame.loading.indicator.max.width`                                              | `100%`                                          | Maximum width for .frame-loading-indicator.          | `.frame-loading-indicator`             |
| `--frame-muted`                                                                    | `frame.muted`                                                                    | `#8e9496`                                       | Foreground for .frame-loading-label.                 | `.frame-loading-label`                 |
| `--frame-font-size-body`                                                           | `frame.font.size.body`                                                           | `12px`                                          | Text size for .frame-loading-label.                  | `.frame-loading-label`                 |
| `--frame-loading-label-font-size`                                                  | `frame.loading.label.font.size`                                                  | `var(     --frame-font-size-body,     12px   )` | Text size for .frame-loading-label.                  | `.frame-loading-label`                 |
| `--frame-loading-label-min-width`                                                  | `frame.loading.label.min.width`                                                  | `0`                                             | Minimum width for .frame-loading-label.              | `.frame-loading-label`                 |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->
