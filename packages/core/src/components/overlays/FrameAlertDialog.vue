<script setup lang="ts">
import {computed, ref} from 'vue';
import {
  AlertDialogRoot,
  AlertDialogTrigger,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
  useForwardPropsEmits,
  useEmitAsProps,
  type AlertDialogProps,
  type AlertDialogEmits,
  type AlertDialogContentProps,
  type AlertDialogContentEmits,
} from 'reka-ui';
import {useOverlayBoundary, overlayLayerStyle} from './overlays';
import './styles/surfaces.scss';

defineOptions({inheritAttrs: false});

interface Props extends AlertDialogProps {

  /** Visible heading and accessible title of the overlay. */
  title: string;

  /** Supporting text associated with the overlay title. */

  description?: string;

  /** Text for the built-in trigger when no trigger slot is supplied. */

  triggerLabel?: string;

  /** Properties forwarded to the overlay content primitive, separate from root state. */

  contentProps?: AlertDialogContentProps;

  /** Text for the default confirmation action, when that action is rendered. */

  confirmLabel?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<
  AlertDialogEmits &
    AlertDialogContentEmits & {
      /** Emitted when the built-in confirmation action is activated. */
      confirm: [];
    }
>();
const contentEvents = useEmitAsProps(emit);
const rootProps = computed(() => {
  const {
    title,
    description,
    triggerLabel,
    contentProps,
    confirmLabel,
    ...root
  } = props;
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
const layer = computed(() => overlayLayerStyle(bounds.value));
defineSlots<{
  /** Element that opens this overlay; defaults to the built-in trigger button. */ trigger?(): unknown;
  /** Body content below the title and optional description. */ default?(): unknown;
  /** Replaces the built-in footer actions. */ actions?(): unknown;
}>();
</script>
<template>
  <AlertDialogRoot v-bind="rootBindings">
    <span ref="anchor" class="frame-general-anchor"
      ><AlertDialogTrigger as-child
        ><slot name="trigger"
          ><button type="button" class="frame-general-button">{{
            triggerLabel ?? title
          }}</button></slot
        ></AlertDialogTrigger
      ></span
    >
    <AlertDialogPortal :to="target">
      <AlertDialogOverlay class="frame-general-backdrop" :style="layer" />
      <div class="frame-general-layer" :style="layer">
        <AlertDialogContent
          v-bind="{...contentEvents, ...contentProps, ...$attrs}"
          class="frame-general-dialog frame-advanced-popup frame-general-surface frame-overlay-surface"
        >
          <AlertDialogTitle class="frame-general-title">{{
            title
          }}</AlertDialogTitle>
          <AlertDialogDescription
            v-if="description"
            class="frame-general-description"
            >{{ description }}</AlertDialogDescription
          >
          <slot />
          <footer class="frame-general-actions"
            ><slot name="actions"
              ><AlertDialogCancel class="frame-general-button"
                >Cancel</AlertDialogCancel
              ><AlertDialogAction
                class="frame-general-button"
                @click="emit('confirm')"
                >{{ confirmLabel }}</AlertDialogAction
              ></slot
            ></footer
          >
        </AlertDialogContent>
      </div>
    </AlertDialogPortal>
  </AlertDialogRoot>
</template>
