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
  setting: SettingDefinition;
  modelValue: SettingValue;
}>();
const emit = defineEmits<{'update:modelValue': [value: SettingValue]}>();
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

<style lang="scss">
.setting-field {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--frame-setting-field-gap, 8px);
  margin: var(--frame-setting-field-margin, 0 0 30px);
  max-width: var(--frame-setting-field-max-width, 760px);
}

.setting-label {
  font-size: var(--frame-setting-label-font-size, 13px);
  font-weight: var(--frame-setting-label-font-weight, 600);
}

.setting-description {
  font-size: var(--frame-setting-description-font-size, 12px);
  color: var(--frame-setting-description-color, #a5adb1);
  line-height: var(--frame-setting-description-line-height, 1.6);
  margin: var(--frame-setting-description-margin, 0 0 8px);
}

.setting-field :is(input:not([type='checkbox']), select, textarea) {
  width: var(--frame-setting-field-is-input-not-width, min(100%, 340px));
  padding: var(--frame-setting-field-is-input-not-padding, 7px 9px);
  border: var(
    --frame-setting-field-is-input-not-border,
    1px solid var(--frame-control-border)
  );
  border-radius: var(
    --frame-setting-field-is-input-not-border-radius,
    var(--frame-input-radius)
  );
  background: var(--frame-setting-field-is-input-not-background, #1b1d1e);
  color: var(--frame-setting-field-is-input-not-color, #dedede);
  font: inherit;
}

.setting-field input[type='checkbox'] {
  width: var(--frame-setting-field-input-width, 18px);
  height: var(--frame-setting-field-input-height, 18px);
  accent-color: var(--frame-accent);
}

.setting-field input[type='color'] {
  height: var(--frame-setting-field-input-height-2, 36px);
  width: var(--frame-setting-field-input-width-2, 70px);
  padding: var(--frame-setting-field-input-padding, 3px);
}

.setting-field textarea {
  min-height: var(--frame-setting-field-textarea-min-height, 90px);
  resize: vertical;
}

.setting-field :disabled {
  opacity: var(--frame-setting-field-disabled-opacity, 0.5);
}

.setting-field select option {
  background: var(--frame-setting-field-select-option-background, #25292c);
  color: var(--frame-setting-field-select-option-color, #eee);
}

.setting-field output {
  color: var(--frame-muted);
  font-size: var(--frame-setting-field-output-font-size, 12px);
}
</style>
