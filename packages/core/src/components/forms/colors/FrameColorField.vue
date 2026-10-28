<script setup lang="ts">
import FrameTextField from '../FrameTextField.vue';
import {ColorFieldRoot, useForwardPropsEmits, ColorFieldInput} from 'reka-ui';
import type {ColorFieldRootProps, ColorFieldRootEmits} from 'reka-ui';
import '../styles/advanced.scss';

defineOptions({inheritAttrs: false});
const props = defineProps<ColorFieldRootProps>();
const emit = defineEmits<{
  /** Requests the parsed color text after the field changes. */
  'update:modelValue': ColorFieldRootEmits['update:modelValue'];
  /** Publishes the structured color parsed from the input. */
  'update:color': ColorFieldRootEmits['update:color'];
}>();
const forwarded = useForwardPropsEmits(props, emit);
</script>
<template>
  <ColorFieldRoot v-bind="forwarded" class="frame-color-field"
    ><ColorFieldInput as-child
      ><FrameTextField
        v-bind="$attrs"
        class="frame-color-field-input frame-input-surface frame-input-focus-within" /></ColorFieldInput
  ></ColorFieldRoot>
</template>
