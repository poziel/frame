<script setup lang="ts">
import {computed, ref} from 'vue';
import {
  HoverCardRoot,
  HoverCardTrigger,
  HoverCardPortal,
  HoverCardContent,
  HoverCardArrow,
  useForwardPropsEmits,
  type HoverCardRootProps,
  type HoverCardRootEmits,
  type HoverCardContentProps,
} from 'reka-ui';
import {useOverlayBoundary} from './overlays';
import '../shared/general-c.css';

defineOptions({inheritAttrs: false});

interface Props extends HoverCardRootProps {

  /** Text for the built-in trigger when no trigger slot is supplied. */
  triggerLabel?: string;

  /** Properties forwarded to the overlay content primitive, separate from root state. */

  contentProps?: HoverCardContentProps;
}

const props = defineProps<Props>();
const emit = defineEmits<HoverCardRootEmits>();
const rootProps = computed(() => {
  const {triggerLabel, contentProps, ...root} = props;
  return root;
});
const forwarded = useForwardPropsEmits(rootProps, emit);
const rootBindings = computed(() =>
  Object.fromEntries(
    Object.entries(forwarded.value).filter(
      ([key]) => !key.startsWith('on') || key.startsWith('onUpdate:')
    )
  )
);
const anchor = ref<HTMLElement>();
const {target, bounds} = useOverlayBoundary(() => anchor.value);
const collisionBoundary = computed(() =>
  typeof target.value === 'string' ? undefined : target.value
);
defineSlots<{
  /** Element that opens this popup; defaults to the built-in trigger button. */ trigger?(): unknown;
  /** Content inside the popup surface. */ default?(): unknown;
}>();
</script>
<template>
  <HoverCardRoot v-bind="rootBindings"
    ><span ref="anchor" class="frame-general-anchor"
      ><HoverCardTrigger as-child
        ><slot name="trigger"
          ><button class="frame-general-button" type="button">{{
            triggerLabel ?? 'More information'
          }}</button></slot
        ></HoverCardTrigger
      ></span
    ><HoverCardPortal :to="target"
      ><HoverCardContent
        v-bind="{...contentProps, ...$attrs}"
        class="frame-general-popup frame-advanced-popup"
        :collision-boundary="collisionBoundary"
        :collision-padding="8"
        :side-offset="6"
        :style="{
          maxWidth: Math.max(0, bounds.width - 16) + 'px',
          maxHeight: Math.max(0, bounds.height - 16) + 'px',
        }"
        ><slot /><HoverCardArrow
          class="frame-general-arrow" /></HoverCardContent></HoverCardPortal
  ></HoverCardRoot>
</template>
