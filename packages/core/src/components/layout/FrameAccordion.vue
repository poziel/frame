<script lang="ts">
import type {AccordionRootProps} from 'reka-ui';

export interface FrameAccordionItem {

  value: string;

  title: string;

  description?: string;

  disabled?: boolean;
}

export interface FrameAccordionProps extends AccordionRootProps {

  /** Sections rendered by the built-in trigger and content composition. A default slot replaces this composition. */
  items?: FrameAccordionItem[];
}
</script>
<script setup lang="ts">
import {computed} from 'vue';
import {
  AccordionRoot,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionContent,
  useForwardPropsEmits,
  type AccordionRootEmits,
} from 'reka-ui';
import FrameIcon from '../data-display/FrameIcon.vue';
import './styles/disclosure-and-layout.scss';

const props = defineProps<FrameAccordionProps>();
const emit = defineEmits<AccordionRootEmits>();
const rootProps = computed(() => {
  const {items, ...root} = props;
  return root;
});
const forwarded = useForwardPropsEmits(rootProps, emit);
</script>
<template>
  <AccordionRoot
    v-bind="forwarded"
    v-slot="{modelValue}"
    class="frame-accordion frame-layout-text"
    ><slot :model-value="modelValue"
      ><AccordionItem
        v-for="item in items"
        :key="item.value"
        :value="item.value"
        :disabled="item.disabled"
        class="frame-accordion-item"
        ><AccordionHeader class="frame-accordion-header"
          ><AccordionTrigger
            class="frame-accordion-trigger frame-disclosure-trigger frame-layout-focus frame-layout-disabled"
            ><slot name="trigger" :item="item">{{ item.title }}</slot
            ><FrameIcon
              name="chevron-down"
              class="frame-accordion-chevron" /></AccordionTrigger></AccordionHeader
        ><AccordionContent class="frame-accordion-content"
          ><div class="frame-accordion-body frame-disclosure-content"
            ><slot name="content" :item="item">{{
              item.description
            }}</slot></div
          ></AccordionContent
        ></AccordionItem
      ></slot
    ></AccordionRoot
  >
</template>

<style lang="scss">
.frame-accordion {
  border: 1px solid var(--frame-accordion-border, var(--frame-line));
  border-radius: var(--frame-control-radius);
  overflow: hidden;
  width: 100%;
}

.frame-accordion-item + .frame-accordion-item {
  border-top: 1px solid var(--frame-accordion-border, var(--frame-line));
}

.frame-accordion-header {
  margin: 0;
  font: inherit;
}

.frame-accordion-chevron {
  transition: transform var(--frame-duration) var(--frame-ease);
}

.frame-accordion-trigger[data-state='open'] .frame-accordion-chevron {
  transform: rotate(180deg);
}
</style>

<style lang="scss">
@media (prefers-reduced-motion: reduce) {
  .frame-accordion-chevron {
    transition: none;
  }
}
</style>
