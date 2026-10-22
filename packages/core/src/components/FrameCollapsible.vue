<script setup lang="ts">
import { computed } from 'vue';
import { CollapsibleRoot, CollapsibleTrigger, CollapsibleContent, useForwardPropsEmits, type CollapsibleRootProps, type CollapsibleRootEmits } from 'reka-ui';
import FrameIcon from './FrameIcon.vue';
import '../general-a.css';
interface Props extends CollapsibleRootProps {
  /** Accessible visible text for the built-in disclosure trigger. The trigger slot can replace it. */
  label?: string
}
const props = defineProps<Props>();
const emit = defineEmits<CollapsibleRootEmits>();
const rootProps = computed(() => { const { label, ...root } = props; return root; });
const forwarded = useForwardPropsEmits(rootProps, emit);
</script>
<template><CollapsibleRoot v-bind="forwarded" v-slot="{ open }" class="frame-collapsible"><CollapsibleTrigger class="frame-collapsible-trigger"><slot name="trigger" :open="open">{{ label }}<FrameIcon :name="open ? 'chevron-up' : 'chevron-down'"/></slot></CollapsibleTrigger><CollapsibleContent class="frame-collapsible-content"><slot :open="open"/></CollapsibleContent></CollapsibleRoot></template>
