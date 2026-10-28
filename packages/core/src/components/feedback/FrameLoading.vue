<script setup lang="ts">
import {computed} from 'vue';
import type {FrameLoadingProps} from './loading';
import FrameLoader from './FrameLoader.vue';

const props = withDefaults(defineProps<FrameLoadingProps>(), {
  textPosition: 'below',
  showLoader: true,
  showText: true,
});
const message = computed(() => props.text ?? props.label ?? 'Loading…');
const statusLabel = computed(() => props.label || props.text || 'Loading…');

defineSlots<{
  /** Application content retained beneath the loading overlay. */
  default?(): unknown;
  /** Replaces the complete loading overlay presentation. */
  overlay?(): unknown;
  /** Replaces the default loader animation. */
  loader?(): unknown;
  /** Replaces the fallback loading message. */
  text?(): unknown;
}>();
</script>

<template>
  <div
    class="frame-loading"
    :class="{'is-loading': active}"
    :aria-busy="active"
  >
    <div
      class="frame-loading-content"
      :inert="active"
      :aria-hidden="active ? true : undefined"
      ><slot
    /></div>
    <div
      v-if="active"
      class="frame-loading-overlay"
      role="status"
      :aria-label="statusLabel"
    >
      <slot name="overlay">
        <div class="frame-loading-indicator" :class="`text-${textPosition}`">
          <div v-if="showLoader" class="frame-loading-animation"
            ><slot name="loader"
              ><FrameLoader
                :variant="variant"
                :size="size"
                :color="color"
                :speed="speed"
                :stroke="stroke"
                :stroke-length="strokeLength"
                :bg-opacity="bgOpacity"
                decorative /></slot
          ></div>
          <div
            v-if="showText && (message || $slots.text)"
            class="frame-loading-label"
            ><slot name="text">{{ message }}</slot></div
          >
        </div>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.frame-loading {
  position: relative;
  isolation: isolate;
  /* Minimum width for .frame-loading. @token --frame-slot-div-div-slot-div-div-template-style-scoped-frame-loading-min-width */
  --_frame-default-slot-div-div-slot-div-div-template-style-scoped-frame-loading-min-width-18168b1f98: 0;
  min-width: var(
    --frame-slot-div-div-slot-div-div-template-style-scoped-frame-loading-min-width,
    var(
      --_frame-default-slot-div-div-slot-div-div-template-style-scoped-frame-loading-min-width-18168b1f98
    )
  );
  /* Minimum height for .frame-loading. @token --frame-slot-div-div-slot-div-div-template-style-scoped-frame-loading-min-height */
  --_frame-default-slot-div-div-slot-div-div-template-style-scoped-frame-loading-min-height-48e9ea30af: 96px;
  min-height: var(
    --frame-slot-div-div-slot-div-div-template-style-scoped-frame-loading-min-height,
    var(
      --_frame-default-slot-div-div-slot-div-div-template-style-scoped-frame-loading-min-height-48e9ea30af
    )
  );
}
.frame-loading-content {
  /* Minimum width for .frame-loading-content. @token --frame-loading-content-min-width */
  --_frame-default-loading-content-min-width-7c4fef2375: 0;
  min-width: var(
    --frame-loading-content-min-width,
    var(--_frame-default-loading-content-min-width-7c4fef2375)
  );
  min-height: inherit;
  /* Height for .frame-loading-content. @token --frame-loading-content-height */
  --_frame-default-loading-content-height-6e6cebfaa3: 100%;
  height: var(
    --frame-loading-content-height,
    var(--_frame-default-loading-content-height-6e6cebfaa3)
  );
}
.is-loading > .frame-loading-content {
  visibility: hidden;
  /* Opacity for .is-loading > .frame-loading-content. @token --frame-is-loading-frame-loading-content-opacity */
  --_frame-default-is-loading-frame-loading-content-opacity-56ec215634: 0;
  opacity: var(
    --frame-is-loading-frame-loading-content-opacity,
    var(--_frame-default-is-loading-frame-loading-content-opacity-56ec215634)
  );
  pointer-events: none;
}
.frame-loading-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Background for .frame-loading-overlay. @token --frame-surface */
  --_frame-default-surface-7fcb70be5e: #181818;
  background: var(--frame-surface, var(--_frame-default-surface-7fcb70be5e));
}
.frame-loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  /* Space between children for .frame-loading-indicator. Used when --frame-loading-indicator-gap is unset. @token --frame-gap */
  --_frame-default-gap-3e2a1ab688: 6px;
  /* Space between children for .frame-loading-indicator. @token --frame-loading-indicator-gap */
  --_frame-default-loading-indicator-gap-a6c6d91414: calc(
    var(--frame-gap, var(--_frame-default-gap-3e2a1ab688)) * 2
  );
  gap: var(
    --frame-loading-indicator-gap,
    var(--_frame-default-loading-indicator-gap-a6c6d91414)
  );
  /* Internal spacing for .frame-loading-indicator. @token --frame-loading-indicator-padding */
  --_frame-default-loading-indicator-padding-e46507aa52: 16px;
  padding: var(
    --frame-loading-indicator-padding,
    var(--_frame-default-loading-indicator-padding-e46507aa52)
  );
  /* Maximum width for .frame-loading-indicator. @token --frame-loading-indicator-max-width */
  --_frame-default-loading-indicator-max-width-c57f41e13c: 100%;
  max-width: var(
    --frame-loading-indicator-max-width,
    var(--_frame-default-loading-indicator-max-width-c57f41e13c)
  );
  box-sizing: border-box;
}
.frame-loading-indicator.text-above {
  flex-direction: column-reverse;
}
.frame-loading-indicator.text-left {
  flex-direction: row-reverse;
}
.frame-loading-indicator.text-right {
  flex-direction: row;
}
.frame-loading-animation {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.frame-loading-label {
  /* Foreground for .frame-loading-label. @token --frame-muted */
  --_frame-default-muted-a933579eb4: #8e9496;
  color: var(--frame-muted, var(--_frame-default-muted-a933579eb4));
  /* Text size for .frame-loading-label. Used when --frame-loading-label-font-size is unset. @token --frame-font-size-body */
  --_frame-default-font-size-body-5e4c71c1b0: 12px;
  /* Text size for .frame-loading-label. @token --frame-loading-label-font-size */
  --_frame-default-loading-label-font-size-a180a03df1: var(
    --frame-font-size-body,
    var(--_frame-default-font-size-body-5e4c71c1b0)
  );
  font-size: var(
    --frame-loading-label-font-size,
    var(--_frame-default-loading-label-font-size-a180a03df1)
  );
  text-align: center;
  overflow-wrap: anywhere;
  /* Minimum width for .frame-loading-label. @token --frame-loading-label-min-width */
  --_frame-default-loading-label-min-width-ef3008fbab: 0;
  min-width: var(
    --frame-loading-label-min-width,
    var(--_frame-default-loading-label-min-width-ef3008fbab)
  );
}
</style>
