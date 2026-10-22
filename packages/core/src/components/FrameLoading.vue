<script setup lang="ts">
import { computed } from "vue";
import type { FrameLoadingProps } from "../frame/loading";
import FrameLoader from "./FrameLoader.vue";

const props = withDefaults(defineProps<FrameLoadingProps>(), { textPosition: "below", showLoader: true, showText: true });
const message = computed(() => props.text ?? props.label ?? "Loading…");
const statusLabel = computed(() => props.label || props.text || "Loading…");
</script>

<template>
  <div class="frame-loading" :class="{ 'is-loading': active }" :aria-busy="active">
    <div class="frame-loading-content" :inert="active" :aria-hidden="active ? true : undefined"><slot /></div>
    <div v-if="active" class="frame-loading-overlay" role="status" :aria-label="statusLabel">
      <slot name="overlay">
        <div class="frame-loading-indicator" :class="`text-${textPosition}`">
          <div v-if="showLoader" class="frame-loading-animation"><slot name="loader"><FrameLoader :variant="variant" :size="size" :color="color" :speed="speed" :stroke="stroke" :stroke-length="strokeLength" :bg-opacity="bgOpacity" decorative /></slot></div>
          <div v-if="showText && (message || $slots.text)" class="frame-loading-label"><slot name="text">{{ message }}</slot></div>
        </div>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.frame-loading { position: relative; isolation: isolate; min-width: var(--frame-slot-div-div-slot-div-div-template-style-scoped-frame-loading-min-width, 0); min-height: var(--frame-slot-div-div-slot-div-div-template-style-scoped-frame-loading-min-height, 96px); }
.frame-loading-content { min-width: var(--frame-loading-content-min-width, 0); min-height: inherit; height: var(--frame-loading-content-height, 100%); }
.is-loading > .frame-loading-content { visibility: hidden; opacity: var(--frame-is-loading-frame-loading-content-opacity, 0); pointer-events: none; }
.frame-loading-overlay { position: absolute; inset: 0; z-index: 1; display: flex; align-items: center; justify-content: center; background: var(--frame-surface, #181818); }
.frame-loading-indicator { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--frame-loading-indicator-gap, 12px); padding: var(--frame-loading-indicator-padding, 16px); max-width: var(--frame-loading-indicator-max-width, 100%); box-sizing: border-box; }
.frame-loading-indicator.text-above { flex-direction: column-reverse; }
.frame-loading-indicator.text-left { flex-direction: row-reverse; }
.frame-loading-indicator.text-right { flex-direction: row; }
.frame-loading-animation { display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.frame-loading-label { color: var(--frame-muted, #8e9496); font-size: var(--frame-loading-label-font-size, 12px); text-align: center; overflow-wrap: anywhere; min-width: var(--frame-loading-label-min-width, 0); }
</style>
