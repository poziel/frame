<script setup lang="ts">
defineOptions({ inheritAttrs: false });
withDefaults(defineProps<{ modelValue?: boolean; disabled?: boolean; label?: string }>(), { modelValue: false });
const emit = defineEmits<{ "update:modelValue": [value: boolean] }>();
</script>
<template><label class="frame-checkbox"><input v-bind="$attrs" type="checkbox" :checked="modelValue" :disabled="disabled" @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)"/><span v-if="label || $slots.default"><slot>{{ label }}</slot></span></label></template>
