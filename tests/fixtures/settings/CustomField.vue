<script setup lang="ts">
import { FrameFieldGroup, FrameTextField, FrameButton, type SettingDefinition, type SettingValue } from '@frame/core';
defineProps<{ setting: SettingDefinition; modelValue: SettingValue; inputId: string }>();
const emit = defineEmits<{ 'update:modelValue': [value: string] }>();
</script>
<template><FrameFieldGroup><FrameTextField :id="inputId" :model-value="String(modelValue)" :aria-label="setting.label" @update:model-value="emit('update:modelValue', String($event))"/><template #suffix><FrameButton @click="emit('update:modelValue', 'tested')">Test setting</FrameButton></template></FrameFieldGroup></template>
