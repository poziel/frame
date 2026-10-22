<script setup lang="ts">
import { computed } from 'vue';
import { DateFieldRoot, DateFieldInput, useForwardPropsEmits, type DateFieldRootProps, type DateFieldRootEmits } from 'reka-ui';
import '../forms/dates.css';
const props = defineProps<DateFieldRootProps & { label?: string }>();
const emit = defineEmits<DateFieldRootEmits>();
const rootProps = computed(() => { const { label, ...rest } = props; return rest; });
const forwarded = useForwardPropsEmits(rootProps, emit);
</script>
<template>
  <DateFieldRoot v-bind="forwarded" :aria-label="label" class="frame-date-field" v-slot="{ segments }">
  <DateFieldInput v-for="(segment, index) in segments" :key="'' + index" :part="segment.part"  class="frame-date-segment">{{ segment.value }}</DateFieldInput>
  </DateFieldRoot>
</template>
