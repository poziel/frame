<script lang="ts">
import type { AccordionRootProps } from 'reka-ui';
export interface FrameAccordionItem { value: string; title: string; description?: string; disabled?: boolean }
export interface FrameAccordionProps extends AccordionRootProps {
  /** Sections rendered by the built-in trigger and content composition. A default slot replaces this composition. */
  items?: FrameAccordionItem[]
}
</script>
<script setup lang="ts">
import { computed } from 'vue';
import { AccordionRoot, AccordionItem, AccordionHeader, AccordionTrigger, AccordionContent, useForwardPropsEmits, type AccordionRootEmits } from 'reka-ui';
import FrameIcon from '../data-display/FrameIcon.vue';
import '../shared/general-a.css';
const props = defineProps<FrameAccordionProps>();
const emit = defineEmits<AccordionRootEmits>();
const rootProps = computed(() => { const { items, ...root } = props; return root; });
const forwarded = useForwardPropsEmits(rootProps, emit);
</script>
<template><AccordionRoot v-bind="forwarded" v-slot="{ modelValue }" class="frame-accordion"><slot :model-value="modelValue"><AccordionItem v-for="item in items" :key="item.value" :value="item.value" :disabled="item.disabled" class="frame-accordion-item"><AccordionHeader class="frame-accordion-header"><AccordionTrigger class="frame-accordion-trigger"><slot name="trigger" :item="item">{{ item.title }}</slot><FrameIcon name="chevron-down" class="frame-accordion-chevron"/></AccordionTrigger></AccordionHeader><AccordionContent class="frame-accordion-content"><div class="frame-accordion-body"><slot name="content" :item="item">{{ item.description }}</slot></div></AccordionContent></AccordionItem></slot></AccordionRoot></template>
