<script setup lang="ts">
import {computed, ref} from 'vue';
import type {Component} from 'vue';
import type {DropMarker} from '../../framework/views/viewDrag';
import {
  fitOverlay,
  intersectOverlayBounds,
  useOverlayBoundary,
} from '../overlays/overlays';

const props = defineProps<{
  active: boolean;
  x: number;
  y: number;
  label?: string;
  icon?: Component;
  marker?: DropMarker | null;
  anchor?: HTMLElement;
}>();
const preview = ref<HTMLElement>();
const {target, getBounds} = useOverlayBoundary(() => props.anchor);
const previewStyle = computed(() => {
  const bounds = getBounds(),
    size = preview.value?.getBoundingClientRect(),
    width = size?.width ?? 200,
    height = size?.height ?? 32;
  const left =
    props.x + width + 14 > bounds.left + bounds.width
      ? props.x - width - 14
      : props.x + 14;
  const top =
    props.y + height + 14 > bounds.top + bounds.height
      ? props.y - height - 14
      : props.y + 14;
  const fitted = fitOverlay({left, top, width, height}, bounds);
  return {
    left: `${fitted.left}px`,
    top: `${fitted.top}px`,
    maxWidth: `${Math.max(0, bounds.width - 12)}px`,
    maxHeight: `${Math.max(0, bounds.height - 12)}px`,
  };
});
const markerStyle = computed(() => {
  if (!props.marker) return {};
  const rect = intersectOverlayBounds(props.marker, getBounds());
  return {
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
  };
});
</script>
<template>
  <Teleport :to="target"
    ><template v-if="active"
      ><div
        v-if="label"
        ref="preview"
        class="view-drag-preview"
        :style="previewStyle"
        aria-hidden="true"
        ><component v-if="icon" :is="icon" /><span
          v-else
          class="drag-view-icon"
          >{{ label.slice(0, 1) }}</span
        ><span>{{ label }}</span></div
      ><div
        v-if="marker"
        class="view-drop-marker"
        :class="marker.kind"
        :style="markerStyle"
        aria-hidden="true" /></template
  ></Teleport>
</template>

<style lang="scss">
.view-drag-preview {
  position: fixed;
  z-index: 150;
  pointer-events: none;
  display: flex;
  align-items: center;
  gap: var(
    --frame-view-drag-preview-gap,
    var(--frame-activity-drag-preview-gap, 8px)
  );
  max-width: var(
    --frame-view-drag-preview-max-width,
    var(--frame-activity-drag-preview-max-width, 300px)
  );
  padding: var(
    --frame-view-drag-preview-padding,
    var(--frame-activity-drag-preview-padding, 7px 11px)
  );
  border: 1px solid var(--frame-accent);
  border-radius: var(
    --frame-view-drag-preview-border-radius,
    var(--frame-activity-drag-preview-border-radius, var(--frame-radius-medium))
  );
  background: var(
    --frame-view-drag-preview-background,
    var(--frame-activity-drag-preview-background, #25292df2)
  );
  color: var(
    --frame-view-drag-preview-color,
    var(--frame-activity-drag-preview-color, #eee)
  );
  box-shadow: var(
    --frame-view-drag-preview-box-shadow,
    var(--frame-activity-drag-preview-box-shadow, 0 5px 18px #0006)
  );
  font: var(
    --frame-view-drag-preview-font,
    var(--frame-activity-drag-preview-font, 12px system-ui)
  );
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.view-drag-preview svg,
.drag-view-icon {
  width: var(
    --frame-view-drag-preview-svg-width,
    var(--frame-activity-drag-preview-svg-width, 18px)
  );
  height: var(
    --frame-view-drag-preview-svg-height,
    var(--frame-activity-drag-preview-svg-height, 18px)
  );
  display: inline-grid;
  place-items: center;
}

.view-drop-marker {
  position: fixed;
  z-index: 149;
  pointer-events: none;
  box-sizing: border-box;
}

.view-drop-marker.insert {
  background: var(--frame-accent);
  box-shadow: var(
    --frame-view-drop-marker-insert-box-shadow,
    var(--frame-activity-drop-marker-insert-box-shadow, 0 0 0 1px #0078d430)
  );
}

.view-drop-marker.inside {
  border: 1px solid var(--frame-accent);
  background: var(
    --frame-view-drop-marker-inside-background,
    var(--frame-activity-drop-marker-inside-background, #0078d418)
  );
  border-radius: var(
    --frame-view-drop-marker-inside-border-radius,
    var(
      --frame-activity-drop-marker-inside-border-radius,
      var(--frame-radius-medium)
    )
  );
}
</style>
