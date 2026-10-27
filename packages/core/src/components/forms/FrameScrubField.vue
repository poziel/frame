<script setup lang="ts">
import { computed, nextTick, ref, onBeforeUnmount } from 'vue';
import { NumberFieldRoot, NumberFieldInput, NumberFieldIncrement, NumberFieldDecrement } from 'reka-ui';
import FrameTextField from './FrameTextField.vue';
import FrameIcon from '../data-display/FrameIcon.vue';
import { scrubValue, scrubPosition } from './shared/scrub';
import './shared/controls.css';
const props=withDefaults(defineProps<{
  modelValue:number;label:string;id?:string;min?:number;max?:number;step?:number;suffix?:string;disabled?:boolean;pixelsPerStep?:number;
}>(),{step:1,suffix:''});
const emit=defineEmits<{'update:modelValue':[value:number]}>();
const draft=ref('');
const editing=ref(false),display=ref<HTMLElement>(),entry=ref<InstanceType<typeof FrameTextField>>();
const step=computed(()=>Number.isFinite(props.step)&&props.step>0?props.step:1);
const fill=computed(()=>props.min!==undefined&&props.max!==undefined&&props.max>props.min?Math.max(0,Math.min(100,(props.modelValue-props.min)/(props.max-props.min)*100)):0);
let drag:{x:number;value:number;moved:boolean;pointer:number;left:number;width:number}|undefined;
function isDisabled(element?:HTMLElement) {return props.disabled||!!element?.closest('fieldset:disabled');}
function update(value:number|undefined) {if(!props.disabled&&value!==undefined&&Number.isFinite(value))emit('update:modelValue',scrubValue(value,step.value,props.min,props.max));}
async function edit(){if(isDisabled(display.value))return;draft.value=String(props.modelValue);editing.value=true;await nextTick();entry.value?.element?.focus();entry.value?.element?.select();}
function down(event:PointerEvent){if(event.button!==0||isDisabled(event.currentTarget as HTMLElement))return;event.preventDefault();const element=event.currentTarget as HTMLElement;element.focus({preventScroll:true});element.setPointerCapture(event.pointerId);const bounds=element.getBoundingClientRect();drag={left:bounds.left,width:bounds.width,x:event.clientX,value:props.modelValue,moved:false,pointer:event.pointerId};}
function move(event:PointerEvent){if(!drag)return;const dx=event.clientX-drag.x;if(Math.abs(dx)>=4)drag.moved=true;if(drag.moved){
  const bounded=props.min!==undefined&&props.max!==undefined&&Number.isFinite(props.min)&&Number.isFinite(props.max)&&props.max>props.min;
  if(bounded&&props.pixelsPerStep===undefined)update(scrubPosition(event.clientX,drag.left,drag.width,props.min!,props.max!,step.value));
  else update(drag.value+Math.round(dx/Math.max(1,props.pixelsPerStep??6))*step.value);
}}
function up(event:PointerEvent){const previous=drag;drag=undefined;const element=event.currentTarget as HTMLElement;if(element.hasPointerCapture(event.pointerId))element.releasePointerCapture(event.pointerId);if(previous&&!previous.moved)void edit();}
function cancel(){const previous=drag;drag=undefined;if(previous?.moved)update(previous.value);}
onBeforeUnmount(()=>{drag=undefined;});
function wheel(event:WheelEvent){if(isDisabled(event.currentTarget as HTMLElement)||editing.value||!(event.deltaY||event.deltaX))return;event.preventDefault();event.stopPropagation();update(props.modelValue+((event.deltaY||event.deltaX)<0?1:-1)*step.value);}
function key(event:KeyboardEvent){if(isDisabled(display.value))return;if(['Enter',' '].includes(event.key)){event.preventDefault();void edit();return;}let value:number|undefined;const multiplier=event.key.startsWith('Page')?10:1;if(['ArrowRight','ArrowUp','PageUp'].includes(event.key))value=props.modelValue+step.value*multiplier;else if(['ArrowLeft','ArrowDown','PageDown'].includes(event.key))value=props.modelValue-step.value*multiplier;else if(event.key==='Home')value=props.min;else if(event.key==='End')value=props.max;if(value!==undefined){event.preventDefault();update(value);}}
async function finish(cancelled=false, focus=true){if(!editing.value)return;const value=Number(draft.value.replace(/,/g,''));if(!cancelled&&draft.value.trim()&&Number.isFinite(value))update(value);editing.value=false;await nextTick();if(focus)display.value?.focus({preventScroll:true});}
</script>
<template>
  <NumberFieldRoot class="frame-number-field frame-scrub-field" :model-value="modelValue" :min="min" :max="max" :step="step" :disabled="disabled" :focus-on-change="false" :step-snapping="false" @update:model-value="update" @wheel="wheel" v-slot="{textValue}">
    <NumberFieldInput class="frame-scrub-backing" hidden aria-hidden="true" tabindex="-1" />
    <FrameTextField v-if="editing" ref="entry" :id="id" class="frame-form-input frame-scrub-input" inputmode="decimal" :model-value="draft" :aria-label="label+' value'" :disabled="disabled" @update:model-value="draft=String($event)" @keydown.enter.prevent="finish()" @keydown.esc.prevent="finish(true)" @blur="finish(false,false)" />
    <button v-else ref="display" :id="id" type="button" role="spinbutton" class="frame-scrub-display" :disabled="disabled" :aria-label="label" :aria-valuenow="modelValue" :aria-valuemin="min" :aria-valuemax="max" :aria-valuetext="textValue+suffix" @pointerdown="down" @pointermove="move" @pointerup="up" @pointercancel="cancel" @lostpointercapture="cancel" @keydown="key">
      <span class="frame-scrub-fill" :style="{width:fill+'%'}" aria-hidden="true" />
      <span class="frame-scrub-text">{{label}}: {{textValue}}{{suffix}}</span>
    </button>
    <span class="frame-scrub-steppers"><NumberFieldIncrement class="frame-control-button" aria-label="Increase"><FrameIcon name="chevron-up" :size="12" /></NumberFieldIncrement><NumberFieldDecrement class="frame-control-button" aria-label="Decrease"><FrameIcon name="chevron-down" :size="12" /></NumberFieldDecrement></span>
  </NumberFieldRoot>
</template>
