<script setup lang="ts">
withDefaults(defineProps<{ modelValue?: string; disabled?: boolean; placeholder?: string; rows?: number }>(), { modelValue: "", rows: 4 });
const emit = defineEmits<{ "update:modelValue": [value: string] }>();
</script>
<template><textarea class="frame-text-area" :value="modelValue" :disabled="disabled" :placeholder="placeholder" :rows="rows" @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"/></template>
