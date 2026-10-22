<script setup lang="ts">
import { TagsInputRoot, TagsInputItem, TagsInputItemText, TagsInputItemDelete, TagsInputInput } from "reka-ui";
import "../forms/controls.css";

defineProps<{modelValue:string[];disabled?:boolean;placeholder?:string;label?:string}>(); const emit=defineEmits<{"update:modelValue":[value:string[]]}>();
</script>
<template><TagsInputRoot class="frame-tags-input" :model-value="modelValue" :disabled="disabled" @update:model-value="emit('update:modelValue', $event.map(String))"><TagsInputItem v-for="value in modelValue" :key="value" :value="value" class="frame-tags-input-item"><TagsInputItemText/><TagsInputItemDelete as="button" type="button" :aria-labelledby="null" class="frame-control-button" :aria-label="`Remove ${value}`">×</TagsInputItemDelete></TagsInputItem><TagsInputInput class="frame-form-input" :placeholder="placeholder" :aria-label="label"/></TagsInputRoot></template>
