<script setup lang="ts">
import { Primitive } from "reka-ui";
import { ref } from "vue";
const element=ref<HTMLTextAreaElement>();
defineExpose({element,focus:()=>element.value?.focus()});
withDefaults(defineProps<{ modelValue?: string; disabled?: boolean; placeholder?: string; rows?: number }>(), { modelValue: "", rows: 4 });
const emit = defineEmits<{ "update:modelValue": [value: string] }>();
</script>
<template><Primitive as-child><textarea ref="element" class="frame-text-area" :value="modelValue" :disabled="disabled" :placeholder="placeholder" :rows="rows" @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"/></Primitive></template>
