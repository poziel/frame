<script setup lang="ts">
import {computed, onBeforeUnmount, onMounted, ref} from 'vue';
import type {FrameLoaderProps} from './loading';
import {frameLoaderNames} from './loading';

const props = withDefaults(defineProps<FrameLoaderProps>(), {
  variant: 'ring',
  size: 32,
  color: 'var(--frame-accent, #0078d4)',
  label: 'Loading…',
  decorative: false,
});
const ready = ref(false),
  reducedMotion = ref(false);
const tag = computed(() => `frame-ldrs-${props.variant}`);
let disposeMotion: (() => void) | undefined;
let disposed = false;
onMounted(async () => {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const update = () => {
    reducedMotion.value = motion.matches;
  };
  update();
  motion.addEventListener('change', update);
  disposeMotion = () => motion.removeEventListener('change', update);
  // LDRS extends HTMLElement: defer importing until mounted, keeping core safe to import on a server.
  const loaders = await import('ldrs');
  if (disposed) return;
  for (const [name, exportName] of Object.entries(frameLoaderNames))
    loaders[exportName].register(`frame-ldrs-${name}`);
  ready.value = true;
});
onBeforeUnmount(() => {
  disposed = true;
  disposeMotion?.();
});
</script>

<template>
  <span
    class="frame-loader"
    :role="decorative ? undefined : 'status'"
    :aria-label="decorative ? undefined : label"
    :aria-hidden="decorative ? true : undefined"
    :style="{minWidth: `${size}px`, minHeight: `${size}px`}"
  >
    <component
      :is="tag"
      v-if="ready"
      :key="`${variant}-${size}-${stroke}`"
      aria-hidden="true"
      :size="size"
      :color="color"
      :speed="reducedMotion ? 0 : speed"
      :stroke="stroke"
      :stroke-length="strokeLength"
      :bg-opacity="bgOpacity"
    />
  </span>
</template>

<style lang="scss" scoped>
.frame-loader {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  vertical-align: middle;
}
</style>
