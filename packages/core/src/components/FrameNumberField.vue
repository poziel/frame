<script setup lang="ts">
import { NumberFieldRoot, NumberFieldInput, NumberFieldIncrement, NumberFieldDecrement } from "reka-ui";
import "../forms/controls.css";

defineProps<{modelValue:number;min?:number;max?:number;step?:number;disabled?:boolean;label?:string}>(); const emit=defineEmits<{"update:modelValue":[value:number]}>();
</script>
<template><NumberFieldRoot class="frame-number-field" :model-value="modelValue" :min="min" :max="max" :step="step" :disabled="disabled" @update:model-value="emit('update:modelValue',$event ?? Number.NaN)"><NumberFieldDecrement class="frame-control-button" aria-label="Decrease">−</NumberFieldDecrement><NumberFieldInput class="frame-form-input" :aria-label="label"/><NumberFieldIncrement class="frame-control-button" aria-label="Increase">+</NumberFieldIncrement></NumberFieldRoot></template>
