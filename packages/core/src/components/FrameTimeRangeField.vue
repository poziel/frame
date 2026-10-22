<script setup lang="ts">
import { computed } from 'vue';
import { TimeRangeFieldRoot, TimeRangeFieldInput, useForwardPropsEmits, type TimeRangeFieldRootProps, type TimeValue } from 'reka-ui';
import '../forms/dates.css';
import type { TimeRange } from '../forms/dates';
const props = defineProps<Omit<TimeRangeFieldRootProps, 'modelValue' | 'defaultValue'> & { modelValue?: TimeRange | null; defaultValue?: TimeRange; label?: string }>();
const emit = defineEmits<{ 'update:modelValue': [value: TimeRange]; 'update:placeholder': [value: TimeValue] }>();
const rootProps = computed(() => { const { label, ...rest } = props; return rest; });
const forwarded = useForwardPropsEmits(rootProps, emit);
</script>
<template>
  <TimeRangeFieldRoot v-bind="forwarded" :aria-label="label" class="frame-date-field" v-slot="{ segments }">
  <TimeRangeFieldInput v-for="(segment, index) in segments.start" :key="'start' + index" :part="segment.part" type="start" class="frame-date-segment">{{ segment.value }}</TimeRangeFieldInput>
  <span class="frame-date-separator" aria-hidden="true">–</span>
  <TimeRangeFieldInput v-for="(segment, index) in segments.end" :key="'end' + index" :part="segment.part" type="end" class="frame-date-segment">{{ segment.value }}</TimeRangeFieldInput>
  </TimeRangeFieldRoot>
</template>
