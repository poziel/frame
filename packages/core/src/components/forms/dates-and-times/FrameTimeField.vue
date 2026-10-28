<script setup lang="ts">
import {computed} from 'vue';
import {
  TimeFieldRoot,
  TimeFieldInput,
  useForwardPropsEmits,
  type TimeFieldRootProps,
  type TimeFieldRootEmits,
} from 'reka-ui';
import '../styles/dates.scss';

const props = defineProps<TimeFieldRootProps & {label?: string}>();
const emit = defineEmits<TimeFieldRootEmits>();
const rootProps = computed(() => {
  const {label, ...rest} = props;
  return rest;
});
const forwarded = useForwardPropsEmits(rootProps, emit);
</script>
<template>
  <TimeFieldRoot
    v-bind="forwarded"
    :aria-label="label"
    class="frame-date-field frame-input-surface frame-input-focus-within frame-date-text"
    v-slot="{segments}"
  >
    <TimeFieldInput
      v-for="(segment, index) in segments"
      :key="'' + index"
      :part="segment.part"
      class="frame-date-segment"
      >{{ segment.value }}</TimeFieldInput
    >
  </TimeFieldRoot>
</template>
