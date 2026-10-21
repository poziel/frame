<script setup lang="ts">
import { isSelectOption } from "../frame/select";
import FrameSlider from "./FrameSlider.vue";
import FrameColorPicker from "./FrameColorPicker.vue";
import FrameTextArea from "./FrameTextArea.vue";
import FrameSelect from "./FrameSelect.vue";
import FrameCheckbox from "./FrameCheckbox.vue";
import FrameTextInput from "./FrameTextInput.vue";
import { computed, useId } from "vue";
import type { SettingDefinition, SettingValue } from "../types";
const props = defineProps<{ setting: SettingDefinition; modelValue: SettingValue }>();
const emit = defineEmits<{ "update:modelValue": [value: SettingValue] }>();
const id = `setting-${useId()}`;
const optionDescription = computed(() => props.setting.options?.filter(isSelectOption).find(option => option.value === props.modelValue)?.description);

</script>
<template><div class="setting-field">
  <label :for="id" class="setting-label">{{ setting.label }}</label>
  <p v-if="setting.description && setting.type !== 'checkbox'" :id="`${id}-description`" class="setting-description">{{ setting.description }}</p>
  <FrameSelect v-if="setting.type === 'select'" :id="id" :model-value="String(modelValue)" :label="setting.label" :options="setting.options ?? []" :default-value="String(setting.default)" :disabled="setting.disabled" :aria-describedby="setting.description ? `${id}-description` : undefined" @update:model-value="emit('update:modelValue', $event)"/>
  <FrameCheckbox v-else-if="setting.type === 'checkbox'" :id="id" :aria-label="setting.label" :model-value="Boolean(modelValue)" :label="setting.description" :disabled="setting.disabled" @update:model-value="emit('update:modelValue', $event)"/>
  <FrameTextInput v-else-if="setting.type === 'text' || setting.type === 'number'" :id="id" :type="setting.type" :model-value="String(modelValue)" :disabled="setting.disabled" :placeholder="setting.placeholder" :min="setting.min" :max="setting.max" :step="setting.step" :aria-describedby="setting.description ? `${id}-description` : undefined" @update:model-value="emit('update:modelValue', $event)"/>
  <FrameTextArea v-else-if="setting.type === 'textarea'" :id="id" :model-value="String(modelValue)" :disabled="setting.disabled" :placeholder="setting.placeholder" @update:model-value="emit('update:modelValue', $event)"/>
  <FrameSlider v-else-if="setting.type === 'range'" :id="id" :model-value="Number(modelValue)" :min="setting.min" :max="setting.max" :step="setting.step" :disabled="setting.disabled" @update:model-value="emit('update:modelValue', $event)"/>
  <FrameColorPicker v-else :id="id" :model-value="String(modelValue)" :disabled="setting.disabled" @update:model-value="emit('update:modelValue', $event)"/>
  <output v-if="setting.type === 'range'" :for="id">{{ modelValue }}</output>
  <p v-if="setting.type === 'select' && optionDescription" class="setting-description">{{ optionDescription }}</p>
</div></template>
