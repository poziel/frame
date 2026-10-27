<script setup lang="ts">
import { ref } from "vue";
import { Primitive } from "reka-ui";
import FrameIcon from "../data-display/FrameIcon.vue";
import FrameControlTooltip from '../overlays/FrameControlTooltip.vue';
import {useControlTooltip,type ControlTooltipProps} from '../forms/shared/tooltip';
defineOptions({inheritAttrs:false});
const props=withDefaults(defineProps<ControlTooltipProps & { variant?: "ghost" | "primary" | "secondary"; label?: string; icon?: string; disabled?: boolean; type?: "button" | "submit" | "reset" }>(), {tooltip:undefined, variant: "ghost", type: "button" });
const {tooltipText,controlAttrs,describedBy}=useControlTooltip(props);
const emit = defineEmits<{ click: [event: MouseEvent] }>();
const element = ref<HTMLButtonElement>();
defineExpose({ element, focus: () => element.value?.focus() });
</script>
<template><FrameControlTooltip :tooltip="tooltipText" :tooltip-placement="tooltipPlacement"><template #default="{describedby}"><Primitive as-child><button ref="element" v-bind="controlAttrs" :aria-describedby="describedBy(describedby)" class="frame-button" :class="variant" :type="type" :disabled="disabled" @click="emit('click', $event)"><FrameIcon v-if="icon" :name="icon" :size="16"/><slot>{{ label }}</slot></button></Primitive></template><template v-if="$slots.tooltip" #tooltip><slot name="tooltip" /></template></FrameControlTooltip></template>
