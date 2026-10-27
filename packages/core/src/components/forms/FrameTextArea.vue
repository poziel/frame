<script setup lang="ts">
import { Primitive } from "reka-ui";
import { ref } from "vue";
const element=ref<HTMLTextAreaElement>();
defineExpose({element,focus:()=>element.value?.focus()});
import FrameControlTooltip from '../overlays/FrameControlTooltip.vue';
import {useControlTooltip,type ControlTooltipProps} from './shared/tooltip';
defineOptions({inheritAttrs:false});
const props=withDefaults(defineProps<ControlTooltipProps & { modelValue?: string; disabled?: boolean; placeholder?: string; rows?: number }>(), {tooltip:undefined, modelValue: "", rows: 4 });
const {tooltipText,controlAttrs,describedBy}=useControlTooltip(props);
const emit = defineEmits<{ "update:modelValue": [value: string] }>();
</script>
<template><FrameControlTooltip :tooltip="tooltipText" :tooltip-placement="tooltipPlacement"><template #default="{describedby}"><Primitive as-child><textarea ref="element" v-bind="controlAttrs" :aria-describedby="describedBy(describedby)" class="frame-text-area" :value="modelValue" :disabled="disabled" :placeholder="placeholder" :rows="rows" @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"/></Primitive></template><template v-if="$slots.tooltip" #tooltip><slot name="tooltip" /></template></FrameControlTooltip></template>
