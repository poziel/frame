<script setup lang="ts">
withDefaults(defineProps<{ modelValue: number; min?: number; max?: number; step?: number; disabled?: boolean }>(), { min: 0, max: 100, step: 1 });
const emit = defineEmits<{ "update:modelValue": [value: number] }>();
</script>
<template><input class="frame-slider" type="range" :value="modelValue" :min="min" :max="max" :step="step" :disabled="disabled" @input="emit('update:modelValue', ($event.target as HTMLInputElement).valueAsNumber)"/></template>
