<script setup lang="ts">
import {isSelectOption} from '../forms/shared/select';
import FrameSlider from '../forms/FrameSlider.vue';
import FrameColorPicker from '../forms/colors/FrameColorPicker.vue';
import FrameTextArea from '../forms/FrameTextArea.vue';
import FrameSelect from '../forms/FrameSelect.vue';
import FrameCheckbox from '../forms/FrameCheckbox.vue';
import FrameTextField from '../forms/FrameTextField.vue';
import FrameNumberField from '../forms/FrameNumberField.vue';
import {computed, useId} from 'vue';
import type {
  SettingDefinition,
  SettingValue,
} from '../../framework/settings/setting';

const props = defineProps<{
  /** Setting definition controlling the input type, options, description, and disabled state. */
  setting: SettingDefinition;
  /** Controlled value supplied by the host; user changes request updates through the matching event. */
  modelValue: SettingValue;
}>();
const emit = defineEmits<{
  /** Requests a new controlled value after input interaction. */
  'update:modelValue': [value: SettingValue];
}>();
const id = `setting-${useId()}`;
const optionDescription = computed(
  () =>
    props.setting.options
      ?.filter(isSelectOption)
      .find((option) => option.value === props.modelValue)?.description
);
</script>
<template>
  <div class="setting-field">
    <label :for="id" class="setting-label">{{ setting.label }}</label>
    <p
      v-if="
        setting.description || (setting.type === 'select' && optionDescription)
      "
      class="setting-description"
      ><span v-if="setting.description" :id="`${id}-description`"
        >{{ setting.description }}{{ optionDescription ? ' ' : '' }}</span
      ><span
        v-if="setting.type === 'select' && optionDescription"
        :id="`${id}-option-description`"
        >{{ optionDescription }}</span
      ></p
    >
    <component
      :is="setting.component"
      v-if="setting.component"
      v-bind="setting.props"
      :setting="setting"
      :model-value="modelValue"
      :input-id="id"
      :disabled="setting.disabled"
      :aria-describedby="setting.description ? `${id}-description` : undefined"
      @update:model-value="emit('update:modelValue', $event)"
    />
    <FrameSelect
      v-else-if="setting.type === 'select'"
      :id="id"
      :model-value="String(modelValue)"
      :label="setting.label"
      :options="setting.options ?? []"
      :default-value="String(setting.default)"
      :disabled="setting.disabled"
      :aria-describedby="
        [
          setting.description ? `${id}-description` : '',
          optionDescription ? `${id}-option-description` : '',
        ]
          .filter(Boolean)
          .join(' ') || undefined
      "
      @update:model-value="emit('update:modelValue', $event)"
    />
    <FrameCheckbox
      v-else-if="setting.type === 'checkbox'"
      :id="id"
      :aria-label="setting.label"
      :model-value="Boolean(modelValue)"
      :disabled="setting.disabled"
      :aria-describedby="setting.description ? `${id}-description` : undefined"
      @update:model-value="emit('update:modelValue', $event)"
    />
    <FrameNumberField
      v-else-if="setting.type === 'number'"
      :id="id"
      controls="stacked"
      :model-value="Number(modelValue)"
      :label="setting.label"
      :disabled="setting.disabled"
      :min="setting.min"
      :max="setting.max"
      :step="setting.step"
      :aria-describedby="setting.description ? `${id}-description` : undefined"
      @update:model-value="emit('update:modelValue', $event)"
    />
    <FrameTextField
      v-else-if="setting.type === 'text'"
      :id="id"
      :type="setting.type"
      :model-value="String(modelValue)"
      :disabled="setting.disabled"
      :placeholder="setting.placeholder"
      :min="setting.min"
      :max="setting.max"
      :step="setting.step"
      :aria-describedby="setting.description ? `${id}-description` : undefined"
      @update:model-value="emit('update:modelValue', $event)"
    />
    <FrameTextArea
      v-else-if="setting.type === 'textarea'"
      :id="id"
      :model-value="String(modelValue)"
      :disabled="setting.disabled"
      :placeholder="setting.placeholder"
      @update:model-value="emit('update:modelValue', $event)"
    />
    <FrameSlider
      v-else-if="setting.type === 'range'"
      :id="id"
      :model-value="Number(modelValue)"
      :min="setting.min"
      :max="setting.max"
      :step="setting.step"
      :disabled="setting.disabled"
      @update:model-value="emit('update:modelValue', $event)"
    />
    <FrameColorPicker
      v-else
      :id="id"
      :model-value="String(modelValue)"
      :disabled="setting.disabled"
      @update:model-value="emit('update:modelValue', $event)"
    />
    <output v-if="setting.type === 'range'" :for="id">{{ modelValue }}</output>
  </div>
</template>
