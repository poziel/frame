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
  /* Space between children for .view-drag-preview. @token --frame-activity-drag-preview-gap */
  --_frame-default-activity-drag-preview-gap-5eb69d22f0: 8px;
  /* Space between children for .view-drag-preview. @token --frame-view-drag-preview-gap */
  --_frame-default-view-drag-preview-gap-dea670dbb8: var(
    --frame-activity-drag-preview-gap,
    var(--_frame-default-activity-drag-preview-gap-5eb69d22f0)
  );
  gap: var(
    --frame-view-drag-preview-gap,
    var(--_frame-default-view-drag-preview-gap-dea670dbb8)
  );
  /* Maximum width for .view-drag-preview. @token --frame-activity-drag-preview-max-width */
  --_frame-default-activity-drag-preview-max-width-2d47aed03d: 300px;
  /* Maximum width for .view-drag-preview. @token --frame-view-drag-preview-max-width */
  --_frame-default-view-drag-preview-max-width-55cd186028: var(
    --frame-activity-drag-preview-max-width,
    var(--_frame-default-activity-drag-preview-max-width-2d47aed03d)
  );
  max-width: var(
    --frame-view-drag-preview-max-width,
    var(--_frame-default-view-drag-preview-max-width-55cd186028)
  );
  /* Internal spacing for .view-drag-preview. @token --frame-activity-drag-preview-padding */
  --_frame-default-activity-drag-preview-padding-7f40e1e72a: 7px 11px;
  /* Internal spacing for .view-drag-preview. @token --frame-view-drag-preview-padding */
  --_frame-default-view-drag-preview-padding-6004742464: var(
    --frame-activity-drag-preview-padding,
    var(--_frame-default-activity-drag-preview-padding-7f40e1e72a)
  );
  padding: var(
    --frame-view-drag-preview-padding,
    var(--_frame-default-view-drag-preview-padding-6004742464)
  );
  /* Shared interaction color for keyboard focus, active actions, and accent-filled controls. @token --frame-accent @context */
  border: 1px solid var(--frame-accent);
  /* Corner radius for .view-drag-preview. @token --frame-activity-drag-preview-border-radius */
  --_frame-default-activity-drag-preview-border-radius-7529fe2dc5: var(
    --frame-radius-medium
  );
  /* Corner radius for .view-drag-preview. @token --frame-view-drag-preview-border-radius */
  --_frame-default-view-drag-preview-border-radius-bcc47184ba: var(
    --frame-activity-drag-preview-border-radius,
    var(--_frame-default-activity-drag-preview-border-radius-7529fe2dc5)
  );
  /* Medium shared corner radius used by ordinary controls. @token --frame-radius-medium @context */
  border-radius: var(
    --frame-view-drag-preview-border-radius,
    var(--_frame-default-view-drag-preview-border-radius-bcc47184ba)
  );
  /* Background for .view-drag-preview. @token --frame-activity-drag-preview-background */
  --_frame-default-activity-drag-preview-background-b8ea863562: #25292df2;
  /* Background for .view-drag-preview. @token --frame-view-drag-preview-background */
  --_frame-default-view-drag-preview-background-e3d5a19e7e: var(
    --frame-activity-drag-preview-background,
    var(--_frame-default-activity-drag-preview-background-b8ea863562)
  );
  background: var(
    --frame-view-drag-preview-background,
    var(--_frame-default-view-drag-preview-background-e3d5a19e7e)
  );
  /* Foreground for .view-drag-preview. @token --frame-activity-drag-preview-color */
  --_frame-default-activity-drag-preview-color-f6e46f1cf8: #eee;
  /* Foreground for .view-drag-preview. @token --frame-view-drag-preview-color */
  --_frame-default-view-drag-preview-color-b79a95dacd: var(
    --frame-activity-drag-preview-color,
    var(--_frame-default-activity-drag-preview-color-f6e46f1cf8)
  );
  color: var(
    --frame-view-drag-preview-color,
    var(--_frame-default-view-drag-preview-color-b79a95dacd)
  );
  /* Elevation shadow for .view-drag-preview. @token --frame-activity-drag-preview-box-shadow */
  --_frame-default-activity-drag-preview-box-shadow-c66efeb4f5: 0 5px 18px #0006;
  /* Elevation shadow for .view-drag-preview. @token --frame-view-drag-preview-box-shadow */
  --_frame-default-view-drag-preview-box-shadow-b31b1d3439: var(
    --frame-activity-drag-preview-box-shadow,
    var(--_frame-default-activity-drag-preview-box-shadow-c66efeb4f5)
  );
  box-shadow: var(
    --frame-view-drag-preview-box-shadow,
    var(--_frame-default-view-drag-preview-box-shadow-b31b1d3439)
  );
  /* Value of font for .view-drag-preview. @token --frame-activity-drag-preview-font */
  --_frame-default-activity-drag-preview-font-77e2301aff: 12px system-ui;
  /* Value of font for .view-drag-preview. @token --frame-view-drag-preview-font */
  --_frame-default-view-drag-preview-font-78a14fcf13: var(
    --frame-activity-drag-preview-font,
    var(--_frame-default-activity-drag-preview-font-77e2301aff)
  );
  font: var(
    --frame-view-drag-preview-font,
    var(--_frame-default-view-drag-preview-font-78a14fcf13)
  );
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.view-drag-preview svg,
.drag-view-icon {
  /* Width for .view-drag-preview svg, .drag-view-icon. @token --frame-activity-drag-preview-svg-width */
  --_frame-default-activity-drag-preview-svg-width-a21e143b80: 18px;
  /* Width for .view-drag-preview svg, .drag-view-icon. @token --frame-view-drag-preview-svg-width */
  --_frame-default-view-drag-preview-svg-width-cbcc8ed9a9: var(
    --frame-activity-drag-preview-svg-width,
    var(--_frame-default-activity-drag-preview-svg-width-a21e143b80)
  );
  width: var(
    --frame-view-drag-preview-svg-width,
    var(--_frame-default-view-drag-preview-svg-width-cbcc8ed9a9)
  );
  /* Height for .view-drag-preview svg, .drag-view-icon. @token --frame-activity-drag-preview-svg-height */
  --_frame-default-activity-drag-preview-svg-height-e881bf2029: 18px;
  /* Height for .view-drag-preview svg, .drag-view-icon. @token --frame-view-drag-preview-svg-height */
  --_frame-default-view-drag-preview-svg-height-1537c2dbe4: var(
    --frame-activity-drag-preview-svg-height,
    var(--_frame-default-activity-drag-preview-svg-height-e881bf2029)
  );
  height: var(
    --frame-view-drag-preview-svg-height,
    var(--_frame-default-view-drag-preview-svg-height-1537c2dbe4)
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
  /* Shared interaction color for keyboard focus, active actions, and accent-filled controls. @token --frame-accent @context */
  background: var(--frame-accent);
  /* Elevation shadow for .view-drop-marker.insert. @token --frame-activity-drop-marker-insert-box-shadow */
  --_frame-default-activity-drop-marker-insert-box-shadow-c7ed8f0ea8: 0 0 0 1px
    #0078d430;
  /* Elevation shadow for .view-drop-marker.insert. @token --frame-view-drop-marker-insert-box-shadow */
  --_frame-default-view-drop-marker-insert-box-shadow-064c53eecf: var(
    --frame-activity-drop-marker-insert-box-shadow,
    var(--_frame-default-activity-drop-marker-insert-box-shadow-c7ed8f0ea8)
  );
  box-shadow: var(
    --frame-view-drop-marker-insert-box-shadow,
    var(--_frame-default-view-drop-marker-insert-box-shadow-064c53eecf)
  );
}

.view-drop-marker.inside {
  /* Shared interaction color for keyboard focus, active actions, and accent-filled controls. @token --frame-accent @context */
  border: 1px solid var(--frame-accent);
  /* Background for .view-drop-marker.inside. @token --frame-activity-drop-marker-inside-background */
  --_frame-default-activity-drop-marker-inside-background-3b3903d0dc: #0078d418;
  /* Background for .view-drop-marker.inside. @token --frame-view-drop-marker-inside-background */
  --_frame-default-view-drop-marker-inside-background-6276aefb19: var(
    --frame-activity-drop-marker-inside-background,
    var(--_frame-default-activity-drop-marker-inside-background-3b3903d0dc)
  );
  background: var(
    --frame-view-drop-marker-inside-background,
    var(--_frame-default-view-drop-marker-inside-background-6276aefb19)
  );
  /* Corner radius for .view-drop-marker.inside. @token --frame-activity-drop-marker-inside-border-radius */
  --_frame-default-activity-drop-marker-inside-border-radius-df8a51c2d6: var(
    --frame-radius-medium
  );
  /* Corner radius for .view-drop-marker.inside. @token --frame-view-drop-marker-inside-border-radius */
  --_frame-default-view-drop-marker-inside-border-radius-f87d8d679d: var(
    --frame-activity-drop-marker-inside-border-radius,
    var(--_frame-default-activity-drop-marker-inside-border-radius-df8a51c2d6)
  );
  /* Medium shared corner radius used by ordinary controls. @token --frame-radius-medium @context */
  border-radius: var(
    --frame-view-drop-marker-inside-border-radius,
    var(--_frame-default-view-drop-marker-inside-border-radius-f87d8d679d)
  );
}
</style>
