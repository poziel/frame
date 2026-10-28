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
import './styles/disclosure-and-layout.scss';

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
  /* Border color around the accordion and between its sections. @token --frame-accordion-border */
  --_frame-default-accordion-border: var(--frame-line);
  /* Neutral divider color for content boundaries, tracks, and structural separators. @token --frame-line @context */
  border: 1px solid
    var(--frame-accordion-border, var(--_frame-default-accordion-border)); /* Shared corner radius of buttons and ordinary controls; text-entry surfaces may use the input radius instead. @token --frame-control-radius @context */
  border-radius: var(--frame-control-radius);
  overflow: hidden;
  width: 100%;
}

.frame-accordion-item + .frame-accordion-item {
  /* Border color around the accordion and between its sections. @token --frame-accordion-border */
  --_frame-default-accordion-border: var(--frame-line);
  /* Neutral divider color for content boundaries, tracks, and structural separators. @token --frame-line @context */
  border-top: 1px solid
    var(--frame-accordion-border, var(--_frame-default-accordion-border));
}

.frame-accordion-header {
  margin: 0;
  font: inherit;
}

.frame-accordion-chevron {
  /* Shared duration for control and shell presentation transitions. @token --frame-duration @context */
  /* Shared timing curve for control and shell presentation transitions. @token --frame-ease @context */
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
