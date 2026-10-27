<script setup lang="ts">
import { useForwardPropsEmits, type Color } from 'reka-ui';
import FrameHsvArea from './FrameHsvArea.vue';
const props = defineProps<{ modelValue?: string | Color; defaultValue?: string | Color; disabled?: boolean; size?: number | string }>();
const emit = defineEmits<{ 'update:modelValue': [value: string]; 'update:color': [value: Color]; change: [value: string]; changeEnd: [value: string] }>();
const forwarded = useForwardPropsEmits(props,emit);
</script>
<template><FrameHsvArea v-bind="forwarded" variant="wheel" /></template>
