<script setup lang="ts">
import FrameTextField from './FrameTextField.vue';
import {computed, ref} from 'vue';
import {
  ComboboxRoot,
  ComboboxAnchor,
  ComboboxInput,
  ComboboxTrigger,
  ComboboxPortal,
  ComboboxContent,
  ComboboxViewport,
  ComboboxItem,
  ComboboxEmpty,
  ComboboxSeparator,
} from 'reka-ui';
import type {SelectItem} from './shared/selectItem';
import {isSelectOption} from './shared/select';
import {useOverlayBoundary} from '../overlays/overlays';
import './styles/controls.scss';
import {encodeChoiceValue, decodeChoiceValue} from './shared/controls';

defineOptions({inheritAttrs: false});
const props = defineProps<{
  /** Controlled selected option value; labels are used for input display and filtering. */
  modelValue: string;
  /** Name of the hidden input included in native form submission. */
  name?: string;
  /** Identifier of the native form associated with the submitted input. */
  form?: string;
  /** Requires a value when the associated form is validated. */
  required?: boolean;
  /** Ordered selectable options and separators rendered by this control. */
  options: readonly SelectItem[];
  /** Prevents user interaction with the control. */
  disabled?: boolean;
  /** Accessible name of the control. */
  label?: string;
  /** Hint displayed while the editable value is empty. */
  placeholder?: string;
}>();
const emit = defineEmits<{
  /** Requests the new application-owned value after interaction. */
  'update:modelValue': [value: string];
}>();
const input = ref<InstanceType<typeof ComboboxInput>>();
const anchor = ref<InstanceType<typeof ComboboxAnchor>>(),
  search = ref('');
const {target, bounds} = useOverlayBoundary(() => anchor.value?.$el);
const filtered = computed(() =>
  props.options.filter(
    (item) =>
      !isSelectOption(item) ||
      item.label.toLocaleLowerCase().includes(search.value.toLocaleLowerCase())
  )
);
const boundary = computed(() =>
  typeof target.value === 'string' ? undefined : target.value
);
const displayValue = (value: unknown) => {
  const item = props.options.find(
    (item) =>
      isSelectOption(item) && item.value === decodeChoiceValue(String(value))
  );
  return item && isSelectOption(item) ? item.label : '';
};
</script>
<template>
  <ComboboxRoot
    name=""
    :required="required"
    :model-value="encodeChoiceValue(modelValue)"
    :disabled="disabled"
    @update:model-value="
      emit('update:modelValue', decodeChoiceValue(String($event ?? 'frame:')))
    "
    ><ComboboxAnchor
      ref="anchor"
      class="frame-combobox-anchor frame-form-inline-layout frame-input-surface frame-input-focus-within"
      ><ComboboxInput
        ref="input"
        :display-value="displayValue"
        as-child
        @update:model-value="search = $event"
        ><FrameTextField
          v-bind="$attrs"
          class="frame-combobox-input"
          :aria-label="label"
          :placeholder="placeholder" /></ComboboxInput
      ><ComboboxTrigger
        class="frame-control-button frame-control-surface frame-control-action frame-control-focus frame-control-disabled"
        aria-label="Show options"
        >⌄</ComboboxTrigger
      ></ComboboxAnchor
    ><ComboboxPortal :to="target"
      ><ComboboxContent
        position="popper"
        class="frame-select-popup frame-reka-select-popup frame-overlay-surface frame-overlay-interactive"
        :collision-boundary="boundary"
        :collision-padding="8"
        :style="{
          maxWidth: `${Math.max(0, bounds.width - 16)}px`,
          maxHeight: `min(${Math.max(0, bounds.height - 16)}px, var(--reka-combobox-content-available-height))`,
        }"
        ><ComboboxViewport class="frame-select-options"
          ><ComboboxEmpty>No options found.</ComboboxEmpty
          ><template
            v-for="(option, index) in filtered"
            :key="isSelectOption(option) ? option.value : (option.id ?? index)"
            ><ComboboxItem
              v-if="isSelectOption(option)"
              class="frame-reka-select-item"
              :value="encodeChoiceValue(option.value)"
              :text-value="option.label"
              :disabled="option.disabled"
              ><span>{{ option.label }}</span
              ><small v-if="option.detail">{{
                option.detail
              }}</small></ComboboxItem
            ><ComboboxSeparator
              v-else
              class="frame-select-separator" /></template></ComboboxViewport></ComboboxContent></ComboboxPortal></ComboboxRoot
  ><input
    v-if="name"
    type="hidden"
    :name="name"
    :form="form"
    :value="modelValue"
    :disabled="disabled"
  /><input
    v-if="required"
    class="frame-control-validation"
    type="text"
    aria-hidden="true"
    tabindex="-1"
    :value="modelValue"
    :disabled="disabled"
    :form="form"
    required
    @invalid.prevent="input?.$el?.focus()"
  />
</template>
