<script setup lang="ts">
import {computed} from 'vue';
import {
  CollapsibleRoot,
  CollapsibleTrigger,
  CollapsibleContent,
  useForwardPropsEmits,
  type CollapsibleRootProps,
  type CollapsibleRootEmits,
} from 'reka-ui';
import FrameIcon from '../data-display/FrameIcon.vue';
import './styles/disclosure-and-layout.scss';

interface Props extends CollapsibleRootProps {

  /** Accessible visible text for the built-in disclosure trigger. The trigger slot can replace it. */
  label?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<CollapsibleRootEmits>();
const rootProps = computed(() => {
  const {label, ...root} = props;
  return root;
});
const forwarded = useForwardPropsEmits(rootProps, emit);
defineSlots<{
  /** Disclosure body with the current expanded state. */ default?(
    props: {
    open: boolean;
  }
  ): unknown;
  /** Replaces the built-in disclosure trigger content. */ trigger?(
    props: {
    open: boolean;
  }
  ): unknown;
}>();
</script>
<template>
  <CollapsibleRoot
    v-bind="forwarded"
    v-slot="{open}"
    class="frame-collapsible frame-layout-text"
    ><CollapsibleTrigger
      class="frame-collapsible-trigger frame-disclosure-trigger frame-layout-focus frame-layout-disabled"
      ><slot name="trigger" :open="open"
        >{{ label
        }}<FrameIcon
          :name="
            open ? 'chevron-up' : 'chevron-down'
          " /></slot></CollapsibleTrigger
    ><CollapsibleContent
      class="frame-collapsible-content frame-disclosure-content"
      ><slot :open="open" /></CollapsibleContent
  ></CollapsibleRoot>
</template>

<style lang="scss">
.frame-collapsible {
  /* Neutral divider color for content boundaries, tracks, and structural separators. @token --frame-line @context */
  border: 1px solid var(--frame-line); /* Shared corner radius of buttons and ordinary controls; text-entry surfaces may use the input radius instead. @token --frame-control-radius @context */
  border-radius: var(--frame-control-radius);
  overflow: hidden;
}
</style>
