<script setup lang="ts">
import { computed } from 'vue';
import { ProgressRoot, ProgressIndicator, useForwardPropsEmits, type ProgressRootProps, type ProgressRootEmits } from 'reka-ui';
import '../shared/general-a.css';
const props = defineProps<ProgressRootProps>();
const emit = defineEmits<ProgressRootEmits>();
const forwarded = useForwardPropsEmits(props, emit);
const percentage = computed(() => props.modelValue == null ? undefined : Math.max(0, Math.min(100, props.modelValue / (props.max && props.max > 0 ? props.max : 100) * 100)));
</script>
<template><ProgressRoot v-bind="forwarded" class="frame-progress"><ProgressIndicator class="frame-progress-indicator" :style="percentage === undefined ? undefined : { width: `${percentage}%` }"><slot :value="modelValue" :percentage="percentage"/></ProgressIndicator></ProgressRoot></template>
