<script setup lang="ts">
import {computed, ref} from 'vue';
import {
  DrawerRoot,
  DrawerTrigger,
  DrawerPortal,
  DrawerOverlay,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
  useForwardPropsEmits,
  useEmitAsProps,
  type DrawerRootProps,
  type DrawerRootEmits,
  type DrawerContentProps,
  type DrawerContentEmits,
} from 'reka-ui';
import {useOverlayBoundary, overlayLayerStyle} from './overlays';
import '../shared/general-c.css';

defineOptions({inheritAttrs: false});

interface Props extends DrawerRootProps {

  /** Initial open state when open is uncontrolled. @defaultValue false */
  defaultOpen?: DrawerRootProps['defaultOpen'];

  /** Initial uncontrolled snap point; omission lets the drawer choose its normal starting position. */
  defaultSnapPoint?: DrawerRootProps['defaultSnapPoint'];

  /** Visible heading and accessible title of the overlay. */
  title: string;

  /** Supporting text associated with the overlay title. */

  description?: string;

  /** Text for the built-in trigger when no trigger slot is supplied. */

  triggerLabel?: string;

  /** Properties forwarded to the overlay content primitive, separate from root state. */

  contentProps?: DrawerContentProps;

  /** Reserved confirmation label; the current close-only footer does not render it. */

  confirmLabel?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<
  Omit<
    DrawerRootEmits,
    'update:open' | 'update:openComplete' | 'update:snapPoint'
  > &
    Omit<DrawerContentEmits, 'openAutoFocus' | 'closeAutoFocus'> & {
      /** Requests an open-state change with cancellable cause details. */
      'update:open': DrawerRootEmits['update:open'];
      /** Reports completion of the opening or closing transition. */
      'update:openComplete': DrawerRootEmits['update:openComplete'];
      /** Requests a new active snap point after drawer movement. */
      'update:snapPoint': DrawerRootEmits['update:snapPoint'];
      /** Before the drawer receives initial focus; preventDefault overrides automatic focusing. */
      openAutoFocus: DrawerContentEmits['openAutoFocus'];
      /** Before focus returns after closing; preventDefault overrides automatic restoration. */
      closeAutoFocus: DrawerContentEmits['closeAutoFocus'];
      /** Reserved confirmation event; the built-in close-only footer does not emit it. */
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
  <DrawerRoot v-bind="rootBindings">
    <span ref="anchor" class="frame-general-anchor"
      ><DrawerTrigger as-child
        ><slot name="trigger"
          ><button type="button" class="frame-general-button">{{
            triggerLabel ?? title
          }}</button></slot
        ></DrawerTrigger
      ></span
    >
    <DrawerPortal :to="target">
      <DrawerOverlay class="frame-general-backdrop" :style="layer" />
      <div
        class="frame-general-layer frame-general-drawer-layer"
        :data-direction="swipeDirection ?? 'down'"
        :style="layer"
      >
        <DrawerContent
          v-bind="{...contentEvents, ...contentProps, ...$attrs}"
          class="frame-general-dialog frame-advanced-popup frame-general-drawer"
        >
          <DrawerTitle class="frame-general-title">{{ title }}</DrawerTitle>
          <DrawerDescription
            v-if="description"
            class="frame-general-description"
            >{{ description }}</DrawerDescription
          >
          <slot />
          <footer class="frame-general-actions"
            ><slot name="actions"
              ><DrawerClose class="frame-general-button"
                >Close</DrawerClose
              ></slot
            ></footer
          >
        </DrawerContent>
      </div>
    </DrawerPortal>
  </DrawerRoot>
</template>
