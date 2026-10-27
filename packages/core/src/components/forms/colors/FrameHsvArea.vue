<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { ColorAreaRoot, ColorAreaArea, ColorAreaThumb, colorToString, convertToHsb, parseColor, type Color } from 'reka-ui';
import FrameColorSlider from './FrameColorSlider.vue';
const props = withDefaults(defineProps<{ modelValue?: string | Color; defaultValue?: string | Color; variant: 'rectangle' | 'wheel' | 'circle'; disabled?: boolean; size?: number | string }>(), { defaultValue: '#ff0000', size: 280 });
const emit = defineEmits<{ 'update:modelValue': [value: string]; 'update:color': [value: Color]; change: [value: string]; changeEnd: [value: string] }>();
const hsv = reactive({ space: 'hsb' as const, h: 0, s: 100, b: 100, alpha: 1 });
let authored = '';
watch(() => props.modelValue ?? props.defaultValue, value => {
  if (value === authored) return;
  Object.assign(hsv, convertToHsb(typeof value === 'string' ? parseColor(value) : value));
}, { immediate: true });
const model = computed(() => ({ ...hsv }));
const thumb = computed(() => {
  const angle = hsv.h * Math.PI / 180;
  const radius = props.variant === 'wheel' ? 44 : hsv.s / 2;
  return { left: `${50 + Math.cos(angle) * radius}%`, top: `${50 + Math.sin(angle) * radius}%` };
});
function publish() {
  if (props.disabled) return;
  authored = colorToString(model.value, 'hex');
  emit('update:modelValue', authored); emit('update:color', model.value); emit('change', authored);
}
function update(value: Color) { if (!props.disabled) { Object.assign(hsv, convertToHsb(value)); publish(); } }
function commit() { if (!props.disabled) emit('changeEnd', colorToString(model.value, 'hex')); }
function point(event: PointerEvent, start = false) {
  if (props.disabled || (start && event.button !== 0)) return;
  const element = event.currentTarget as HTMLElement;
  if (start) { element.setPointerCapture(event.pointerId); element.focus({ preventScroll: true }); }
  if (!element.hasPointerCapture(event.pointerId)) return;
  const box = element.getBoundingClientRect(), x = (event.clientX-box.left)/box.width-.5, y = (event.clientY-box.top)/box.height-.5;
  hsv.h = (Math.atan2(y,x)*180/Math.PI+360)%360;
  if (props.variant === 'circle') hsv.s = Math.min(100,Math.hypot(x,y)*200);
  publish();
}
function key(event: KeyboardEvent) {
  if (props.disabled || !['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key)) return;
  event.preventDefault();
  if (props.variant === 'circle' && ['ArrowUp','ArrowDown'].includes(event.key)) hsv.s = Math.max(0,Math.min(100,hsv.s+(event.key==='ArrowUp'?1:-1)*(event.shiftKey?10:1)));
  else hsv.h = event.key==='Home'?0:event.key==='End'?359:(hsv.h+(['ArrowRight','ArrowUp'].includes(event.key)?1:-1)*(event.shiftKey?10:1)+360)%360;
  publish(); commit();
}
</script>
<template>
  <div class="frame-hsv-area" :style="{width: typeof size==='number'?size+'px':size}" :data-variant="variant" :data-disabled="disabled || undefined">
    <ColorAreaRoot v-if="variant==='rectangle'" :model-value="model" color-space="hsb" x-channel="saturation" y-channel="brightness" :disabled="disabled" v-slot="{ style }" class="frame-hsv-plane-root" @update:color="update" @change-end="commit">
      <ColorAreaArea :style="style" class="frame-color-plane"><ColorAreaThumb class="frame-color-thumb" /></ColorAreaArea>
    </ColorAreaRoot>
    <div v-else class="frame-hsv-disc" :class="{'frame-hsv-ring':variant==='wheel'}" :style="variant==='circle'?{background:`linear-gradient(rgb(0 0 0 / ${1-hsv.b/100}),rgb(0 0 0 / ${1-hsv.b/100})),radial-gradient(closest-side,white,transparent),conic-gradient(from 90deg,red,#ff0,#0f0,#0ff,#00f,#f0f,red)`}:undefined" :tabindex="disabled?-1:0" role="slider" :aria-label="variant==='wheel'?'Hue wheel':'Hue and saturation circle; up and down adjust saturation'" :aria-valuemin="0" :aria-valuemax="359" :aria-valuenow="Math.round(hsv.h)" :aria-valuetext="`${Math.round(hsv.h)} degrees, ${Math.round(hsv.s)}% saturation`" :aria-disabled="disabled || undefined" @pointerdown="point($event,true)" @pointermove="point($event)" @pointerup="($event.currentTarget as HTMLElement).releasePointerCapture($event.pointerId);commit()" @keydown="key">
      <span class="frame-color-thumb frame-hsv-thumb" :style="thumb" />
      <ColorAreaRoot v-if="variant==='wheel'" :model-value="model" color-space="hsb" x-channel="saturation" y-channel="brightness" :disabled="disabled" v-slot="{ style }" class="frame-hsv-wheel-center" @pointerdown.stop @pointermove.stop @pointerup.stop @keydown.stop @update:color="update" @change-end="commit">
        <ColorAreaArea :style="style" class="frame-color-plane"><ColorAreaThumb class="frame-color-thumb" /></ColorAreaArea>
      </ColorAreaRoot>
    </div>
    <FrameColorSlider v-if="variant!=='wheel'" :model-value="model" color-space="hsb" :channel="variant==='circle'?'brightness':'hue'" orientation="vertical" :disabled="disabled" :aria-label="variant==='circle'?'Value':'Hue'" @update:color="update" @change-end="commit" />
  </div>
</template>
<style>
.frame-hsv-area { display:flex; align-items:stretch; gap:var(--frame-spacing-small,4px); width:280px; max-width:100%; min-width:0; container-type:inline-size; }
.frame-hsv-plane-root,.frame-hsv-disc { flex:1; min-width:0; aspect-ratio:1; position:relative; touch-action:none; }
.frame-hsv-area .frame-color-plane { width:100%; height:100%; max-width:none; }
.frame-hsv-area .frame-color-thumb { box-sizing:border-box; width:clamp(10px,4.5cqi,20px); height:clamp(10px,4.5cqi,20px); min-width:0; min-height:0; flex-shrink:0; filter:none; }
.frame-hsv-disc { border-radius:50%; background:conic-gradient(from 90deg,red,#ff0,#0f0,#0ff,#00f,#f0f,red); outline:none; }
.frame-hsv-ring::before { content:''; position:absolute; inset:12%; border-radius:50%; background:var(--frame-surface); }
.frame-hsv-thumb { position:absolute; transform:translate(-50%,-50%); pointer-events:none; }
.frame-hsv-wheel-center { position:absolute; inset:24%; }
.frame-hsv-area .frame-color-slider[data-orientation=vertical] { flex:0 0 8%; height:auto; width:8%; }
.frame-hsv-area .frame-color-slider[data-orientation=vertical] .frame-color-track { width:60%; border-radius:var(--frame-control-radius); }
.frame-hsv-disc:focus-visible { outline:2px solid var(--frame-focus-border,var(--frame-accent)); outline-offset:2px; }
.frame-hsv-area[data-disabled] { opacity:.5; }
</style>
