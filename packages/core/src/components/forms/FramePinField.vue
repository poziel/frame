<script setup lang="ts">
import FrameTextField from './FrameTextField.vue';
import {PinInputRoot, PinInputInput} from 'reka-ui';
import './styles/controls.scss';

withDefaults(
  defineProps<{
    /** Controlled character values in the individual PIN inputs. */
    modelValue: string[];
    /** Number of individual character inputs rendered. */
    length?: number;
    /** Prevents user interaction with the control. */
    disabled?: boolean;
    /** Accessible name of the control. */
    label?: string;
    /** Masks entered characters. */
    mask?: boolean;
    /** Enables one-time-code autocomplete on the PIN input. */
    otp?: boolean;
  }>(),
  {length: 6}
);
const emit = defineEmits<{
  /** Requests the new application-owned value after interaction. */
  'update:modelValue': [value: string[]];
}>();
</script>
<template>
  <PinInputRoot
    class="frame-pin-input frame-form-inline-layout"
    :model-value="modelValue"
    :disabled="disabled"
    :mask="mask"
    :otp="otp"
    :aria-label="label"
    @update:model-value="emit('update:modelValue', ($event ?? []).map(String))"
    ><PinInputInput v-for="i in length" :key="i" :index="i - 1" as-child
      ><FrameTextField
        class="frame-pin-entry frame-input-surface frame-input-focus-within"
        :aria-label="`${label ?? 'Code'} ${i}`" /></PinInputInput
  ></PinInputRoot>
</template>

<style lang="scss">
.frame-pin-input > .frame-form-input {
  width: 2.5em;
  text-align: center;
}

.frame-pin-input > .frame-pin-entry {
  width: 2.5em;
  text-align: center;
}
</style>
