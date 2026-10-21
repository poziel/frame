<script setup lang="ts">
defineProps<{ modelValue: string; disabled?: boolean }>();
const emit = defineEmits<{ "update:modelValue": [value: string] }>();
</script>
<template><input class="frame-color-picker" type="color" :value="modelValue" :disabled="disabled" @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"/></template>
