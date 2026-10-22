<script setup lang="ts">
import { computed } from 'vue';
import { StepperRoot, StepperItem, StepperTrigger, StepperIndicator, StepperTitle, StepperDescription, StepperSeparator, useForwardPropsEmits } from 'reka-ui';
import type { StepperRootProps, StepperRootEmits } from 'reka-ui';
import type { FrameStepItem } from '../general-types';
import FrameIcon from './FrameIcon.vue';
import '../general-b.css';
const props=defineProps<StepperRootProps & { items?: FrameStepItem[]; label?: string }>();
const emit=defineEmits<StepperRootEmits>();
const root=computed(()=>{const {items,label,...rest}=props;return rest;});
const forwarded=useForwardPropsEmits(root,emit);
</script>
<template><StepperRoot v-bind="forwarded" class="frame-stepper" :aria-label="label" v-slot="state"><slot v-bind="state"><StepperItem v-for="(item,index) in items" :key="item.step" :step="item.step" :disabled="item.disabled" :completed="item.completed" class="frame-stepper-item" v-slot="{state:stepState}"><StepperTrigger class="frame-stepper-trigger"><StepperIndicator class="frame-stepper-indicator"><FrameIcon v-if="stepState==='completed'" name="check"/><template v-else>{{item.step}}</template></StepperIndicator><span><StepperTitle class="frame-stepper-title">{{item.label}}</StepperTitle><StepperDescription v-if="item.description" class="frame-stepper-description">{{item.description}}</StepperDescription></span></StepperTrigger><StepperSeparator v-if="index < (items?.length ?? 0)-1" class="frame-stepper-separator"/></StepperItem></slot></StepperRoot></template>
