<script setup lang="ts">
import FrameTextField from "../FrameTextField.vue";
import { ColorFieldRoot, useForwardPropsEmits, ColorFieldInput } from 'reka-ui';
import type { ColorFieldRootProps, ColorFieldRootEmits } from 'reka-ui';
import '../shared/advanced.css';
defineOptions({inheritAttrs:false});
const props=defineProps<ColorFieldRootProps>();
const emit=defineEmits<ColorFieldRootEmits>();
const forwarded=useForwardPropsEmits(props,emit);
</script>
<template><ColorFieldRoot v-bind="forwarded" class="frame-color-field"><ColorFieldInput as-child><FrameTextField v-bind="$attrs" class="frame-color-field-input" /></ColorFieldInput></ColorFieldRoot></template>
