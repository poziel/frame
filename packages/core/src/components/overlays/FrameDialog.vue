<script setup lang="ts">
import {computed, ref} from 'vue';
import {
  DialogRoot,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  useForwardPropsEmits,
  useEmitAsProps,
  type DialogRootProps,
  type DialogRootEmits,
  type DialogContentProps,
  type DialogContentEmits,
} from 'reka-ui';
import {useOverlayBoundary, overlayLayerStyle} from './overlays';
import './styles/surfaces.scss';

defineOptions({inheritAttrs: false});

interface Props extends DialogRootProps {

  /** Visible heading and accessible title of the overlay. */
  title: string;

  /** Visually hides the title while retaining its accessible dialog name. */

  hideTitle?: boolean;

  /** Controls the default footer; false removes the footer and its actions slot. */

  footer?: boolean;

  /** Supporting text associated with the overlay title. */

  description?: string;

  /** Text for the built-in trigger when no trigger slot is supplied. */

  triggerLabel?: string;

  /** Properties forwarded to the overlay content primitive, separate from root state. */

  contentProps?: DialogContentProps;

  /** Reserved confirmation label; the current close-only footer does not render it. */

  confirmLabel?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<
  DialogRootEmits &
    DialogContentEmits & {
      /** Reserved confirmation event; the built-in close-only footer does not emit it. */
      confirm: [];
    }
>();
const contentEvents = useEmitAsProps(emit);
const rootProps = computed(() => {
  const {
    title,
    hideTitle,
    footer,
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
  <DialogRoot v-bind="rootBindings">
    <span ref="anchor" class="frame-general-anchor"
      ><DialogTrigger as-child
        ><slot name="trigger"
          ><button type="button" class="frame-general-button">{{
            triggerLabel ?? title
          }}</button></slot
        ></DialogTrigger
      ></span
    >
    <DialogPortal :to="target">
      <DialogOverlay class="frame-general-backdrop" :style="layer" />
      <div class="frame-general-layer" :style="layer">
        <DialogContent
          v-bind="{...contentEvents, ...contentProps, ...$attrs}"
          class="frame-general-dialog frame-advanced-popup frame-general-surface frame-overlay-surface"
        >
          <DialogTitle
            class="frame-general-title"
            :class="{'frame-dialog-hidden-title': hideTitle}"
            >{{ title }}</DialogTitle
          >
          <DialogDescription
            v-if="description"
            class="frame-general-description"
            >{{ description }}</DialogDescription
          >
          <slot />
          <footer v-if="footer !== false" class="frame-general-actions"
            ><slot name="actions"
              ><DialogClose class="frame-general-button"
                >Close</DialogClose
              ></slot
            ></footer
          >
        </DialogContent>
      </div>
    </DialogPortal>
  </DialogRoot>
</template>
<style lang="scss" scoped>
.frame-dialog-hidden-title {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}
</style>
