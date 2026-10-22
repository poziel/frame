<script setup lang="ts">
import { Primitive } from "reka-ui";
import { ref, type InputTypeHTMLAttribute } from "vue";
withDefaults(defineProps<{ modelValue?: string | number; type?: InputTypeHTMLAttribute; disabled?: boolean; placeholder?: string }>(), { modelValue: "", type: "text" });
const emit = defineEmits<{ "update:modelValue": [value: string | number] }>();
const element = ref<HTMLInputElement>();
function input(event: Event) { const target = event.target as HTMLInputElement; emit("update:modelValue", target.type === "number" && target.value !== "" ? target.valueAsNumber : target.value); }
defineExpose({ element, focus: () => element.value?.focus() });
</script>
<template><Primitive as-child><input ref="element" class="frame-text-input" :type="type" :value="modelValue" :disabled="disabled" :placeholder="placeholder" @input="input"/></Primitive></template>
