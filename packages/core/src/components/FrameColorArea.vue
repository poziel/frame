<script setup lang="ts">
import { ColorAreaRoot, useForwardPropsEmits, ColorAreaArea, ColorAreaThumb } from 'reka-ui';
import type { ColorAreaRootProps, ColorAreaRootEmits } from 'reka-ui';
import '../forms/advanced.css';
const props=defineProps<ColorAreaRootProps>();
const emit=defineEmits<ColorAreaRootEmits>();
const forwarded=useForwardPropsEmits(props,emit);
</script>
<template><ColorAreaRoot v-bind="forwarded" v-slot="{ style }" class="frame-color-area"><ColorAreaArea :style="style" class="frame-color-plane"><ColorAreaThumb :aria-disabled="disabled || undefined" class="frame-color-thumb" /></ColorAreaArea></ColorAreaRoot></template>
