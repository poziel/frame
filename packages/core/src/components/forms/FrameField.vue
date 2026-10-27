<script setup lang="ts">
import { FieldRoot, FieldLabel, FieldControl, FieldDescription, FieldError, useForwardProps } from 'reka-ui';
import FrameControlTooltip from '../overlays/FrameControlTooltip.vue';
import {computed} from 'vue';
import {useControlTooltip,type ControlTooltipProps} from './shared/tooltip';
import type { FieldRootProps } from 'reka-ui';
import './shared/advanced.css';
const props=withDefaults(defineProps<FieldRootProps & ControlTooltipProps & { label?: string; description?: string; error?: string }>(),{tooltip:undefined});
defineOptions({inheritAttrs:false});
const {tooltipText,controlAttrs,describedBy}=useControlTooltip(props);
const forwarded=useForwardProps(computed(()=>{const {tooltip,tooltipPlacement,...root}=props;return root;}));
</script>
<template><FrameControlTooltip :tooltip="tooltipText" :tooltip-placement="tooltipPlacement"><template #default="{describedby}"><FieldRoot v-bind="{...controlAttrs,...forwarded}" :invalid="invalid || !!error" class="frame-field"><FieldLabel v-if="label" class="frame-field-label">{{label}}</FieldLabel><FieldControl as-child :aria-describedby="describedBy(describedby)"><slot /></FieldControl><FieldDescription v-if="description" class="frame-field-description">{{description}}</FieldDescription><FieldError class="frame-field-error"><template v-if="error">{{error}}</template></FieldError></FieldRoot></template><template v-if="$slots.tooltip" #tooltip><slot name="tooltip" /></template></FrameControlTooltip></template>
