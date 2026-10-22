<script setup lang="ts">
import { CheckboxRoot, CheckboxIndicator, Label } from "reka-ui";
import "../forms/controls.css";
defineOptions({inheritAttrs:false});
withDefaults(defineProps<{modelValue?: boolean; disabled?: boolean; label?: string}>(), {modelValue:false});
const emit=defineEmits<{"update:modelValue":[value:boolean]}>();
</script>
<template><Label class="frame-checkbox"><CheckboxRoot v-bind="$attrs" class="frame-check-control" :model-value="modelValue" :disabled="disabled" @update:model-value="emit('update:modelValue', $event === true)"><CheckboxIndicator>✓</CheckboxIndicator></CheckboxRoot><span v-if="label || $slots.default"><slot>{{label}}</slot></span></Label></template>
