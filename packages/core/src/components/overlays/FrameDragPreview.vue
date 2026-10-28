<script setup lang="ts">
import {computed, ref} from 'vue';
import {useOverlayBoundary} from './overlays';

defineOptions({inheritAttrs: false});
const props = withDefaults(
  defineProps<{
    /** Pointer horizontal position in viewport coordinates. */
    x: number;
    /** Pointer vertical position in viewport coordinates. */
    y: number;
    /** Element used to resolve the owning shell overlay boundary. */
    anchor?: HTMLElement;
    /** Whether the drag preview is mounted; defaults to true. */
    active?: boolean;
    /** Distance in pixels from the pointer before boundary clamping; defaults to 14. */
    offset?: number;
  }>(),
  {active: true, offset: 14}
);
const surface = ref<HTMLElement>();
const {target, bounds} = useOverlayBoundary(() => props.anchor);
const style = computed(() => {
  const area = bounds.value,
    width = surface.value?.offsetWidth ?? 220,
    height = surface.value?.offsetHeight ?? 60;
  return {
    left: `${Math.max(area.left, Math.min(props.x + props.offset, area.left + area.width - width))}px`,
    top: `${Math.max(area.top, Math.min(props.y + props.offset, area.top + area.height - height))}px`,
    maxWidth: `${area.width}px`,
    maxHeight: `${area.height}px`,
  };
});
defineSlots<{
  /** Noninteractive visual shown beside the pointer within the owning boundary. */ default?(): unknown;
}>();
</script>
<template>
  <Teleport v-if="active" :to="target"
    ><div
      ref="surface"
      v-bind="$attrs"
      class="frame-drag-preview"
      :style="style"
      aria-hidden="true"
      inert
      ><slot /></div
  ></Teleport>
</template>
<style lang="scss" scoped>
.frame-drag-preview {
  position: fixed;
  z-index: 10000;
  pointer-events: none;
  overflow: hidden;
  padding: 8px 10px;
  /* Border for .frame-drag-preview. @token --frame-reorder-preview-border */
  --_frame-default-reorder-preview-border-b2e73e2d1f: var(--frame-border-color);
  /* Border for .frame-drag-preview. @token --frame-drag-preview-border */
  --_frame-default-drag-preview-border-114f65c8a1: var(
    --frame-reorder-preview-border,
    var(--_frame-default-reorder-preview-border-b2e73e2d1f)
  );
  border: 1px solid
    var(
      --frame-drag-preview-border,
      var(--_frame-default-drag-preview-border-114f65c8a1)
    );
  /* Corner radius for .frame-drag-preview. @token --frame-radius */
  --_frame-default-radius-cde2a7669d: 4px;
  border-radius: var(--frame-radius, var(--_frame-default-radius-cde2a7669d));
  /* Background for .frame-drag-preview. @token --frame-bg */
  --_frame-default-bg-29eeb8bfdf: #181818;
  /* Background for .frame-drag-preview. @token --frame-reorder-preview-background */
  --_frame-default-reorder-preview-background-85985ba0bd: var(
    --frame-bg,
    var(--_frame-default-bg-29eeb8bfdf)
  );
  /* Background for .frame-drag-preview. @token --frame-drag-preview-background */
  --_frame-default-drag-preview-background-69d3ae2d55: var(
    --frame-reorder-preview-background,
    var(--_frame-default-reorder-preview-background-85985ba0bd)
  );
  background: var(
    --frame-drag-preview-background,
    var(--_frame-default-drag-preview-background-69d3ae2d55)
  );
  /* Primary foreground for readable text and icons across shell and application content. @token --frame-text @context */
  color: var(
    --frame-text
  ); /* Elevation shadow for .frame-drag-preview. @token --frame-reorder-preview-shadow */
  --_frame-default-reorder-preview-shadow-e836a93c9b: 0 4px 12px #0005;
  /* Elevation shadow for .frame-drag-preview. @token --frame-drag-preview-shadow */
  --_frame-default-drag-preview-shadow-0085e8d364: var(
    --frame-reorder-preview-shadow,
    var(--_frame-default-reorder-preview-shadow-e836a93c9b)
  );
  box-shadow: var(
    --frame-drag-preview-shadow,
    var(--_frame-default-drag-preview-shadow-0085e8d364)
  );
  font: inherit;
}
</style>
