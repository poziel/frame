<script setup lang="ts">
import { ColorFieldRoot, useForwardPropsEmits, ColorFieldInput } from 'reka-ui';
import type { ColorFieldRootProps, ColorFieldRootEmits } from 'reka-ui';
import '../forms/advanced.css';
defineOptions({inheritAttrs:false});
const props=defineProps<ColorFieldRootProps>();
const emit=defineEmits<ColorFieldRootEmits>();
const forwarded=useForwardPropsEmits(props,emit);
</script>
<template><ColorFieldRoot v-bind="forwarded" class="frame-color-field"><ColorFieldInput v-bind="$attrs" class="frame-advanced-input" /></ColorFieldRoot></template>
