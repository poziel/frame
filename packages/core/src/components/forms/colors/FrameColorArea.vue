<script setup lang="ts">
import {
  ColorAreaRoot,
  useForwardPropsEmits,
  ColorAreaArea,
  ColorAreaThumb,
} from 'reka-ui';
import type {ColorAreaRootProps, ColorAreaRootEmits} from 'reka-ui';
import '../shared/advanced.css';
import FrameHsvArea from './FrameHsvArea.vue';

const props = defineProps<
  ColorAreaRootProps & {
    /** Selects the rectangle, wheel, or circle color-area composition. */
    variant?: 'rectangle' | 'wheel' | 'circle';
  }
>();
const emit = defineEmits<{
  /** Requests updated color text during interaction. */
  'update:modelValue': ColorAreaRootEmits['update:modelValue'];
  /** Publishes the structured color after a channel change. */
  'update:color': ColorAreaRootEmits['update:color'];
  /** Publishes color text while the pointer or keyboard changes the area. */
  change: ColorAreaRootEmits['change'];
  /** Publishes the committed color text when interaction ends. */
  changeEnd: ColorAreaRootEmits['changeEnd'];
}>();
const forwarded = useForwardPropsEmits(props, emit);
</script>
<template>
  <FrameHsvArea
    v-if="variant"
    :model-value="modelValue"
    :default-value="defaultValue"
    :variant="variant"
    :disabled="disabled"
    @update:model-value="emit('update:modelValue', $event)"
    @update:color="emit('update:color', $event)"
    @change="emit('change', $event)"
    @change-end="emit('changeEnd', $event)"
  /><ColorAreaRoot
    v-else
    v-bind="forwarded"
    v-slot="{style}"
    class="frame-color-area"
    ><ColorAreaArea :style="style" class="frame-color-plane"
      ><ColorAreaThumb
        :aria-disabled="disabled || undefined"
        class="frame-color-thumb" /></ColorAreaArea
  ></ColorAreaRoot>
</template>
