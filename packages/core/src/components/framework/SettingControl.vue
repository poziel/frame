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

<style lang="scss">
.setting-field {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  /* Space between children for .setting-field. @token --frame-setting-field-gap */
  --_frame-default-setting-field-gap-03aa98648a: 8px;
  gap: var(
    --frame-setting-field-gap,
    var(--_frame-default-setting-field-gap-03aa98648a)
  ); /* Outer spacing for .setting-field. @token --frame-setting-field-margin */
  --_frame-default-setting-field-margin-4c18b82bf5: 0 0 30px;
  margin: var(
    --frame-setting-field-margin,
    var(--_frame-default-setting-field-margin-4c18b82bf5)
  ); /* Maximum width for .setting-field. @token --frame-setting-field-max-width */
  --_frame-default-setting-field-max-width-327c37b473: 760px;
  max-width: var(
    --frame-setting-field-max-width,
    var(--_frame-default-setting-field-max-width-327c37b473)
  );
}

.setting-label {
  /* Text size for .setting-label. @token --frame-setting-label-font-size */
  --_frame-default-setting-label-font-size-c91f120e24: 13px;
  font-size: var(
    --frame-setting-label-font-size,
    var(--_frame-default-setting-label-font-size-c91f120e24)
  ); /* Text weight for .setting-label. @token --frame-setting-label-font-weight */
  --_frame-default-setting-label-font-weight-deb1338406: 600;
  font-weight: var(
    --frame-setting-label-font-weight,
    var(--_frame-default-setting-label-font-weight-deb1338406)
  );
}

.setting-description {
  /* Text size for .setting-description. @token --frame-setting-description-font-size */
  --_frame-default-setting-description-font-size-a2eccfb8c4: 12px;
  font-size: var(
    --frame-setting-description-font-size,
    var(--_frame-default-setting-description-font-size-a2eccfb8c4)
  ); /* Foreground for .setting-description. @token --frame-setting-description-color */
  --_frame-default-setting-description-color-0a497103c3: #a5adb1;
  color: var(
    --frame-setting-description-color,
    var(--_frame-default-setting-description-color-0a497103c3)
  ); /* Text line height for .setting-description. @token --frame-setting-description-line-height */
  --_frame-default-setting-description-line-height-b1224cb4f3: 1.6;
  line-height: var(
    --frame-setting-description-line-height,
    var(--_frame-default-setting-description-line-height-b1224cb4f3)
  ); /* Outer spacing for .setting-description. @token --frame-setting-description-margin */
  --_frame-default-setting-description-margin-037c8664e2: 0 0 8px;
  margin: var(
    --frame-setting-description-margin,
    var(--_frame-default-setting-description-margin-037c8664e2)
  );
}

.setting-field :is(input:not([type='checkbox']), select, textarea) {
  /* Width for .setting-field :is(input:not([type='checkbox']), select, textarea). @token --frame-setting-field-is-input-not-width */
  --_frame-default-setting-field-is-input-not-width-648e7ce632: min(
    100%,
    340px
  );
  width: var(
    --frame-setting-field-is-input-not-width,
    var(--_frame-default-setting-field-is-input-not-width-648e7ce632)
  ); /* Internal spacing for .setting-field :is(input:not([type='checkbox']), select, textarea). @token --frame-setting-field-is-input-not-padding */
  --_frame-default-setting-field-is-input-not-padding-c90501ecc0: 7px 9px;
  padding: var(
    --frame-setting-field-is-input-not-padding,
    var(--_frame-default-setting-field-is-input-not-padding-c90501ecc0)
  ); /* Border for .setting-field :is(input:not([type='checkbox']), select, textarea). @token --frame-setting-field-is-input-not-border */
  --_frame-default-setting-field-is-input-not-border-135cc4fa33: 1px solid
    var(--frame-control-border);
  /* Resting border color of form controls, independently overridable from menu borders. @token --frame-control-border @context */
  border: var(
    --frame-setting-field-is-input-not-border,
    var(--_frame-default-setting-field-is-input-not-border-135cc4fa33)
  ); /* Corner radius for .setting-field :is(input:not([type='checkbox']), select, textarea). @token --frame-setting-field-is-input-not-border-radius */
  --_frame-default-setting-field-is-input-not-border-radius-bc31788f05: var(
    --frame-input-radius
  );
  /* Shared corner radius for text fields, text areas, selects, and composed input surfaces. @token --frame-input-radius @context */
  border-radius: var(
    --frame-setting-field-is-input-not-border-radius,
    var(--_frame-default-setting-field-is-input-not-border-radius-bc31788f05)
  ); /* Background for .setting-field :is(input:not([type='checkbox']), select, textarea). @token --frame-setting-field-is-input-not-background */
  --_frame-default-setting-field-is-input-not-background-8df9e05406: #1b1d1e;
  background: var(
    --frame-setting-field-is-input-not-background,
    var(--_frame-default-setting-field-is-input-not-background-8df9e05406)
  ); /* Foreground for .setting-field :is(input:not([type='checkbox']), select, textarea). @token --frame-setting-field-is-input-not-color */
  --_frame-default-setting-field-is-input-not-color-d9d68d1ecd: #dedede;
  color: var(
    --frame-setting-field-is-input-not-color,
    var(--_frame-default-setting-field-is-input-not-color-d9d68d1ecd)
  );
  font: inherit;
}

.setting-field input[type='checkbox'] {
  /* Width for .setting-field input[type='checkbox']. @token --frame-setting-field-input-width */
  --_frame-default-setting-field-input-width-8d67004d34: 18px;
  width: var(
    --frame-setting-field-input-width,
    var(--_frame-default-setting-field-input-width-8d67004d34)
  ); /* Height for .setting-field input[type='checkbox']. @token --frame-setting-field-input-height */
  --_frame-default-setting-field-input-height-abdbe0a9db: 18px;
  height: var(
    --frame-setting-field-input-height,
    var(--_frame-default-setting-field-input-height-abdbe0a9db)
  ); /* Shared interaction color for keyboard focus, active actions, and accent-filled controls. @token --frame-accent @context */
  accent-color: var(--frame-accent);
}

.setting-field input[type='color'] {
  /* Height for .setting-field input[type='color']. @token --frame-setting-field-input-height-2 */
  --_frame-default-setting-field-input-height-2-dff5fec9f3: 36px;
  height: var(
    --frame-setting-field-input-height-2,
    var(--_frame-default-setting-field-input-height-2-dff5fec9f3)
  ); /* Width for .setting-field input[type='color']. @token --frame-setting-field-input-width-2 */
  --_frame-default-setting-field-input-width-2-263ba4f86d: 70px;
  width: var(
    --frame-setting-field-input-width-2,
    var(--_frame-default-setting-field-input-width-2-263ba4f86d)
  ); /* Internal spacing for .setting-field input[type='color']. @token --frame-setting-field-input-padding */
  --_frame-default-setting-field-input-padding-0406037be0: 3px;
  padding: var(
    --frame-setting-field-input-padding,
    var(--_frame-default-setting-field-input-padding-0406037be0)
  );
}

.setting-field textarea {
  /* Minimum height for .setting-field textarea. @token --frame-setting-field-textarea-min-height */
  --_frame-default-setting-field-textarea-min-height-baab27d51e: 90px;
  min-height: var(
    --frame-setting-field-textarea-min-height,
    var(--_frame-default-setting-field-textarea-min-height-baab27d51e)
  );
  resize: vertical;
}

.setting-field :disabled {
  /* Opacity for .setting-field :disabled. @token --frame-setting-field-disabled-opacity */
  --_frame-default-setting-field-disabled-opacity-4726f69794: 0.5;
  opacity: var(
    --frame-setting-field-disabled-opacity,
    var(--_frame-default-setting-field-disabled-opacity-4726f69794)
  );
}

.setting-field select option {
  /* Background for .setting-field select option. @token --frame-setting-field-select-option-background */
  --_frame-default-setting-field-select-option-background-fb1d50cbb4: #25292c;
  background: var(
    --frame-setting-field-select-option-background,
    var(--_frame-default-setting-field-select-option-background-fb1d50cbb4)
  ); /* Foreground for .setting-field select option. @token --frame-setting-field-select-option-color */
  --_frame-default-setting-field-select-option-color-4d2829a31c: #eee;
  color: var(
    --frame-setting-field-select-option-color,
    var(--_frame-default-setting-field-select-option-color-4d2829a31c)
  );
}

.setting-field output {
  /* Secondary foreground for descriptions, hints, and visually subordinate content. @token --frame-muted @context */
  color: var(
    --frame-muted
  ); /* Text size for .setting-field output. @token --frame-setting-field-output-font-size */
  --_frame-default-setting-field-output-font-size-5962992896: 12px;
  font-size: var(
    --frame-setting-field-output-font-size,
    var(--_frame-default-setting-field-output-font-size-5962992896)
  );
}
</style>
