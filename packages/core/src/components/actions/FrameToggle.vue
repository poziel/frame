<script setup lang="ts">
import { Toggle } from "reka-ui";
import "../forms/shared/controls.css";

withDefaults(defineProps<{modelValue?: boolean; disabled?: boolean; label?: string}>(), {modelValue:false});
const emit=defineEmits<{"update:modelValue":[value:boolean]}>();
</script>
<template><Toggle class="frame-toggle" :model-value="modelValue" :disabled="disabled" :aria-label="label" @update:model-value="emit('update:modelValue',$event)"><slot>{{label}}</slot></Toggle></template>
