<script setup lang="ts">
import {computed} from 'vue';
import {
  TimeRangeFieldRoot,
  TimeRangeFieldInput,
  useForwardPropsEmits,
  type TimeRangeFieldRootProps,
  type TimeValue,
} from 'reka-ui';
import '../shared/dates.css';
import type {TimeRange} from '../shared/dates';

const props = defineProps<
  Omit<TimeRangeFieldRootProps, 'modelValue' | 'defaultValue'> & {
    /** Controlled start and end times; null leaves the range empty. */
    modelValue?: TimeRange | null;
    /** Initial start and end times when the range is uncontrolled. */
    defaultValue?: TimeRange;
    /** Accessible name of the date or time control. */
    label?: string;
  }
>();
const emit = defineEmits<{
  /** Requests the new application-owned value after interaction. */
  'update:modelValue': [value: TimeRange];
  /** Requests the date or time used as the navigation placeholder. */
  'update:placeholder': [value: TimeValue];
}>();
const rootProps = computed(() => {
  const {label, ...rest} = props;
  return rest;
});
const forwarded = useForwardPropsEmits(rootProps, emit);
</script>
<template>
  <TimeRangeFieldRoot
    v-bind="forwarded"
    :aria-label="label"
    class="frame-date-field"
    v-slot="{segments}"
  >
    <TimeRangeFieldInput
      v-for="(segment, index) in segments.start"
      :key="'start' + index"
      :part="segment.part"
      type="start"
      class="frame-date-segment"
      >{{ segment.value }}</TimeRangeFieldInput
    >
    <span class="frame-date-separator" aria-hidden="true">–</span>
    <TimeRangeFieldInput
      v-for="(segment, index) in segments.end"
      :key="'end' + index"
      :part="segment.part"
      type="end"
      class="frame-date-segment"
      >{{ segment.value }}</TimeRangeFieldInput
    >
  </TimeRangeFieldRoot>
</template>
