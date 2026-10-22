<script setup lang="ts">
import { computed } from 'vue';
import { DateRangeFieldRoot, DateRangeFieldInput, useForwardPropsEmits, type DateRangeFieldRootProps, type DateRangeFieldRootEmits } from 'reka-ui';
import '../forms/dates.css';
const props = defineProps<DateRangeFieldRootProps & { label?: string }>();
const emit = defineEmits<DateRangeFieldRootEmits>();
const rootProps = computed(() => { const { label, ...rest } = props; return rest; });
const forwarded = useForwardPropsEmits(rootProps, emit);
</script>
<template>
  <DateRangeFieldRoot v-bind="forwarded" :aria-label="label" class="frame-date-field" v-slot="{ segments }">
  <DateRangeFieldInput v-for="(segment, index) in segments.start" :key="'start' + index" :part="segment.part" type="start" class="frame-date-segment">{{ segment.value }}</DateRangeFieldInput>
  <span class="frame-date-separator" aria-hidden="true">–</span>
  <DateRangeFieldInput v-for="(segment, index) in segments.end" :key="'end' + index" :part="segment.part" type="end" class="frame-date-segment">{{ segment.value }}</DateRangeFieldInput>
  </DateRangeFieldRoot>
</template>
