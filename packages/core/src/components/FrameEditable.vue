<script setup lang="ts">
import { EditableRoot, EditableArea, EditableInput, EditablePreview } from "reka-ui";
import "../forms/controls.css";

defineProps<{modelValue:string;placeholder?:string;disabled?:boolean;label?:string}>(); const emit=defineEmits<{"update:modelValue":[value:string]}>();
</script>
<template><EditableRoot class="frame-editable" :model-value="modelValue" :placeholder="placeholder" :disabled="disabled" @update:model-value="emit('update:modelValue',$event ?? '')"><EditableArea><EditablePreview class="frame-form-input" :aria-label="label"/><EditableInput class="frame-form-input" :aria-label="label"/></EditableArea></EditableRoot></template>
