<script setup lang="ts">
import { SliderRoot, SliderTrack, SliderRange, SliderThumb } from "reka-ui";
import "./shared/controls.css";

defineOptions({inheritAttrs:false});
withDefaults(defineProps<{modelValue:number;name?:string;form?:string;required?:boolean;min?:number;max?:number;step?:number;disabled?:boolean}>(),{min:0,max:100,step:1}); const emit=defineEmits<{"update:modelValue":[value:number]}>();
</script>
<template><SliderRoot name="" :required="required" class="frame-slider frame-slider-root" :model-value="[modelValue]" :min="min" :max="max" :step="step" :disabled="disabled" @update:model-value="emit('update:modelValue',$event?.[0] ?? modelValue)"><SliderTrack class="frame-slider-track"><SliderRange class="frame-slider-range"/></SliderTrack><SliderThumb v-bind="$attrs" class="frame-slider-thumb"/></SliderRoot><input v-if="name" type="hidden" :name="name" :form="form" :value="modelValue" :disabled="disabled"/></template>
