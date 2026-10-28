<script lang="ts">
import type {AccordionRootProps, AcceptableValue} from 'reka-ui';

export interface FrameAccordionItem {

  /** Stable section value used for expanded-state selection. */
  value: string;

  /** Fallback visible text for the section trigger. */
  title: string;

  /** Fallback body text when no content slot is provided. */
  description?: string;

  /** Prevents user activation of this section trigger. */
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
import '../shared/general-a.css';

const props = defineProps<FrameAccordionProps>();
const emit = defineEmits<AccordionRootEmits>();
const rootProps = computed(() => {
  const {items, ...root} = props;
  return root;
});
const forwarded = useForwardPropsEmits(rootProps, emit);
defineSlots<{
  /** Replaces the built-in item composition with application-owned accordion content. */
  default?(
    props: {
    modelValue: AcceptableValue | AcceptableValue[] | undefined;
  }
  ): unknown;
  /** Trigger text for one built-in item; defaults to its title. */
  trigger?(props: {item: FrameAccordionItem}): unknown;
  /** Body content for one built-in item; defaults to its description. */
  content?(props: {item: FrameAccordionItem}): unknown;
}>();
</script>
<template>
  <AccordionRoot
    v-bind="forwarded"
    v-slot="{modelValue}"
    class="frame-accordion"
    ><slot :model-value="modelValue"
      ><AccordionItem
        v-for="item in items"
        :key="item.value"
        :value="item.value"
        :disabled="item.disabled"
        class="frame-accordion-item"
        ><AccordionHeader class="frame-accordion-header"
          ><AccordionTrigger class="frame-accordion-trigger"
            ><slot name="trigger" :item="item">{{ item.title }}</slot
            ><FrameIcon
              name="chevron-down"
              class="frame-accordion-chevron" /></AccordionTrigger></AccordionHeader
        ><AccordionContent class="frame-accordion-content"
          ><div class="frame-accordion-body"
            ><slot name="content" :item="item">{{
              item.description
            }}</slot></div
          ></AccordionContent
        ></AccordionItem
      ></slot
    ></AccordionRoot
  >
</template>
