<script setup lang="ts">
import {computed, ref, useId, useSlots, watch} from 'vue';
import {
  TooltipProvider,
  TooltipRoot,
  TooltipPortal,
  TooltipContent,
  useForwardPropsEmits,
  type TooltipRootProps,
  type TooltipRootEmits,
} from 'reka-ui';
import TooltipAnchor from './TooltipAnchor.vue';
import {useOverlayBoundary} from './overlays';

interface Props extends TooltipRootProps {

  /** Hover delay before opening this Frame tooltip. @defaultValue 400 */
  delayDuration?: TooltipRootProps['delayDuration'];

  /** Ignores focus that did not originate from keyboard navigation. @defaultValue true */
  ignoreNonKeyboardFocus?: TooltipRootProps['ignoreNonKeyboardFocus'];

  /** Tooltip text used when no content slot is supplied; empty content suppresses opening. */
  text?: string;

  /** Uses the supplied trigger element without adding the normal trigger wrapper. */

  asChild?: boolean;

  /** Keyboard shortcut hint displayed beside tooltip content. */

  shortcut?: string;

  /** Preferred physical side for the overlay, subject to available space. */

  placement?: 'top' | 'bottom' | 'left' | 'right';
}

defineOptions({inheritAttrs: false});
const props = withDefaults(defineProps<Props>(), {
  text: '',
  asChild: false,
  placement: 'bottom',
  open: undefined,
  delayDuration: 400,
  ignoreNonKeyboardFocus: true,
});
const emit = defineEmits<TooltipRootEmits>();
const slots = useSlots();
const child = ref<{$el: HTMLElement | Text | Comment}>();
const id = useId(),
  visible = ref(props.open ?? props.defaultOpen ?? false),
  anchor = ref<HTMLElement>();
const {target, bounds} = useOverlayBoundary(() => {
  const node = props.asChild ? child.value?.$el : anchor.value;
  return node instanceof HTMLElement
    ? node
    : (node?.nextElementSibling as HTMLElement | undefined);
});
const rootProps = computed(() => {
  const {text, shortcut, placement, asChild, ...root} = props;
  const disabled = props.disabled || (!text && !slots.content);
  return {
    ...root,
    open: disabled ? false : (root.open ?? visible.value),
    disabled,
  };
});
const forwarded = useForwardPropsEmits(rootProps, emit);
const collisionBoundary = computed(() =>
  typeof target.value === 'string' ? undefined : target.value
);
const limits = computed(() => ({
  position: 'relative' as const,
  maxWidth: `min(${Math.max(0, bounds.value.width - 16)}px, var(--reka-tooltip-content-available-width))`,
  maxHeight: `min(${Math.max(0, bounds.value.height - 16)}px, var(--reka-tooltip-content-available-height))`,
  overflow: 'hidden',
}));
watch(
  () => props.open,
  (value) => {
    if (value !== undefined) visible.value = value;
  }
);
watch(
  () => [props.disabled, props.text],
  () => {
    if (props.disabled || (!props.text && !slots.content))
      visible.value = false;
  }
);
defineSlots<{
  /** Trigger content; bind describedby to connect it to visible tooltip content. */ default?(
    props: {
    describedby: string | undefined;
  }
  ): unknown;
  /** Replaces the text portion of the tooltip. */ content?(): unknown;
}>();
</script>
<template>
  <TooltipProvider>
    <TooltipRoot
      v-bind="forwarded"
      :open="rootProps.open"
      :disabled="rootProps.disabled"
      @update:open="visible = $event"
    >
      <TooltipAnchor v-if="asChild" ref="child" v-bind="$attrs" :content-id="id"
        ><slot
          :describedby="
            visible && !disabled && (text || $slots.content) ? id : undefined
          "
      /></TooltipAnchor>
      <span v-else ref="anchor" v-bind="$attrs" class="tooltip-trigger">
        <TooltipAnchor :content-id="id"
          ><slot
            :describedby="
              visible && !disabled && (text || $slots.content) ? id : undefined
            "
        /></TooltipAnchor>
      </span>
      <TooltipPortal :to="target"
        ><TooltipContent
          class="frame-tooltip"
          :data-noninteractive="disableHoverableContent || undefined"
          :aria-label="shortcut ? text + ' ' + shortcut : text"
          :side="placement"
          :side-offset="6"
          :collision-boundary="collisionBoundary"
          :collision-padding="8"
          :style="limits"
          ><slot name="content"
            ><span>{{ text }}</span></slot
          ><kbd v-if="shortcut">{{ shortcut }}</kbd></TooltipContent
        ></TooltipPortal
      >
    </TooltipRoot>
  </TooltipProvider>
</template>
