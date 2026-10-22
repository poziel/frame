<script setup lang="ts">
import { computed, ref, useAttrs, watch } from 'vue';
import { PopoverRoot, PopoverTrigger, PopoverPortal, PopoverContent, ColorSwatch, colorToString, type Color } from 'reka-ui';
import FrameColorArea from './FrameColorArea.vue';
import FrameColorSlider from './FrameColorSlider.vue';
import FrameColorField from './FrameColorField.vue';
import { useOverlayBoundary } from '../frame/overlays';
import '../forms/advanced.css';

defineOptions({ inheritAttrs: false });
const props = defineProps<{ modelValue: string; disabled?: boolean; name?: string; required?: boolean; form?: string }>();
const emit = defineEmits<{ 'update:modelValue': [value: string] }>();
const attrs = useAttrs();
const label = computed(() => String(attrs['aria-label'] ?? 'Color'));
const open = ref(false), anchor = ref<HTMLElement>();
const { target, bounds } = useOverlayBoundary(() => anchor.value);
const collisionBoundary = computed(() => typeof target.value === 'string' ? undefined : target.value);
const limits = computed(() => ({ maxHeight: Math.max(0, bounds.value.height - 16) + 'px', maxWidth: Math.max(0, bounds.value.width - 16) + 'px' }));
watch(() => props.disabled, disabled => { if (disabled) open.value = false; });
function update(value: string | Color) { if (!props.disabled) emit('update:modelValue', typeof value === 'string' ? value : colorToString(value, 'hex')); }
</script>
<template>
  <PopoverRoot v-model:open="open">
    <input v-if="name" type="hidden" :name="name" :value="modelValue" :disabled="disabled" :form="form" />
    <span ref="anchor" class="frame-color-picker-anchor">
      <input v-if="required" class="frame-color-validation" tabindex="-1" aria-hidden="true" :value="modelValue" :disabled="disabled" :form="form" required @invalid="open = true" />
      <PopoverTrigger v-bind="$attrs" :aria-label="label" :disabled="disabled" class="frame-color-picker frame-color-trigger">
        <ColorSwatch :color="modelValue" class="frame-color-trigger-swatch" />
      </PopoverTrigger>
    </span>
    <PopoverPortal :to="target">
      <PopoverContent :aria-label="label" class="frame-color-picker-popover" :collision-boundary="collisionBoundary" :collision-padding="8" :side-offset="4" :style="limits">
        <FrameColorArea :model-value="modelValue" :disabled="disabled" color-space="hsb" x-channel="saturation" y-channel="brightness" @update:model-value="update" />
        <FrameColorSlider :model-value="modelValue" :disabled="disabled" channel="hue" @update:model-value="update" />
        <FrameColorField :model-value="modelValue" :disabled="disabled" :aria-label="label + ' value'" :aria-describedby="$attrs['aria-describedby']" :required="required" @update:model-value="update" />
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
<style>
.frame-color-validation { position:absolute; width:1px; height:1px; opacity:0; pointer-events:none; }
.frame-color-picker-anchor { display:inline-flex; }
.frame-color-picker.frame-color-trigger { display:inline-flex; width:70px; height:36px; box-sizing:border-box; padding:3px; border:1px solid var(--frame-line); border-radius:var(--frame-control-radius); background:var(--frame-canvas); cursor:pointer; }
.frame-color-trigger:disabled { opacity:.5; cursor:default; }
.frame-color-trigger:focus-visible { outline:1px solid var(--frame-accent); outline-offset:2px; }
.frame-color-trigger-swatch { display:block; width:100%; height:100%; border-radius:var(--frame-control-radius); }
.frame-color-picker-popover { display:grid; gap:var(--frame-gap); box-sizing:border-box; padding:var(--frame-content-padding); background:var(--frame-surface); color:var(--frame-text); border:1px solid var(--frame-line); border-radius:var(--frame-panel-radius); box-shadow:var(--frame-overlay-shadow); font-family:var(--frame-font-body); font-size:var(--frame-font-size-body); overflow:auto; pointer-events:auto; z-index:125; }
.frame-color-picker-popover .frame-advanced-input { width:220px; max-width:100%; }
</style>
