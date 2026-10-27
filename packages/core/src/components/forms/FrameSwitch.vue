<script setup lang="ts">
import { SwitchRoot, SwitchThumb, Label } from "reka-ui";
import "./shared/controls.css";
defineOptions({inheritAttrs:false});
import FrameControlTooltip from '../overlays/FrameControlTooltip.vue';
import {useControlTooltip,type ControlTooltipProps} from './shared/tooltip';
const props=withDefaults(defineProps<ControlTooltipProps & {modelValue?: boolean; disabled?: boolean; label?: string}>(), {tooltip:undefined,modelValue:false});
const {tooltipText,controlAttrs,describedBy}=useControlTooltip(props);
const emit=defineEmits<{"update:modelValue":[value:boolean]}>();
</script>
<template><Label class="frame-form-inline"><FrameControlTooltip :tooltip="tooltipText" :tooltip-placement="tooltipPlacement"><template #default="{describedby}"><SwitchRoot v-bind="controlAttrs" :aria-describedby="describedBy(describedby)" class="frame-switch" :model-value="modelValue" :disabled="disabled" @update:model-value="emit('update:modelValue',$event)"><SwitchThumb class="frame-switch-thumb"/></SwitchRoot></template><template v-if="$slots.tooltip" #tooltip><slot name="tooltip" /></template></FrameControlTooltip><slot>{{label}}</slot></Label></template>
