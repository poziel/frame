<script setup lang="ts">
import {computed, ref} from 'vue';
import {
  ToastProvider,
  ToastRoot,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  ToastViewport,
  ToastPortal,
  useForwardPropsEmits,
  type ToastRootProps,
  type ToastRootEmits,
} from 'reka-ui';
import {useOverlayBoundary, overlayLayerStyle} from '../overlays/overlays';
import '../overlays/styles/surfaces.scss';

defineOptions({inheritAttrs: false});

interface Props extends ToastRootProps {

  title: string;

  description?: string;

  actionLabel?: string;

  actionAltText?: string;

  viewportLabel?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<ToastRootEmits & {action: []}>();
const rootProps = computed(() => {
  const {
    title,
    description,
    actionLabel,
    actionAltText,
    viewportLabel,
    ...root
  } = props;
  return root;
});
const forwarded = useForwardPropsEmits(rootProps, emit);
const rootBindings = computed(() =>
  Object.fromEntries(
    Object.entries(forwarded.value).filter(([key]) => key !== 'onAction')
  )
);
const anchor = ref<HTMLElement>();
const {target, bounds} = useOverlayBoundary(() => anchor.value);
const layer = computed(() => overlayLayerStyle(bounds.value));
</script>
<template>
  <span ref="anchor" class="frame-general-anchor" /><ToastProvider
    :duration="duration"
    ><ToastPortal :to="target"
      ><div class="frame-general-toast-layer" :style="layer"
        ><ToastRoot
          v-bind="{...rootBindings, ...$attrs}"
          class="frame-general-toast frame-general-surface frame-overlay-surface"
          ><ToastTitle class="frame-general-title">{{ title }}</ToastTitle
          ><ToastDescription
            v-if="description"
            class="frame-general-description"
            >{{ description }}</ToastDescription
          ><slot /><ToastAction
            v-if="actionLabel && actionAltText"
            :alt-text="actionAltText"
            class="frame-general-button"
            @click="emit('action')"
            >{{ actionLabel }}</ToastAction
          ><ToastClose
            class="frame-general-button"
            aria-label="Dismiss notification"
            >Dismiss</ToastClose
          ></ToastRoot
        ><ToastViewport
          class="frame-general-toast-viewport"
          :label="
            viewportLabel ?? 'Notifications ({hotkey})'
          " /></div></ToastPortal
  ></ToastProvider>
</template>

<style lang="scss">
.frame-general-toast-layer {
  position: fixed;
  pointer-events: none;
  z-index: 1105;
}
.frame-general-toast-viewport {
  position: absolute;
  right: 12px;
  bottom: 12px;
  width: min(360px, calc(100% - 24px));
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: auto;
}
.frame-general-toast {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.frame-general-toast[data-state='closed'] {
  display: none;
}
</style>
