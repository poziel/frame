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
import '../shared/general-c.css';

defineOptions({inheritAttrs: false});

interface Props extends ToastRootProps {

  /** Heading announced with the toast. */
  title: string;

  /** Additional message displayed below the heading. */

  description?: string;

  /** Visible action text; an action also requires actionAltText. */

  actionLabel?: string;

  /** Accessible alternative describing the action outside the toast context. */

  actionAltText?: string;

  /** Accessible viewport label, with the provider hotkey placeholder supported. */

  viewportLabel?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<
  ToastRootEmits & {
    /** The application action was activated. */
    action: [];
  }
>();
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

defineSlots<{
  /** Additional toast content after the description and before the action. */
  default?(): unknown;
}>();
</script>
<template>
  <span ref="anchor" class="frame-general-anchor" /><ToastProvider
    :duration="duration"
    ><ToastPortal :to="target"
      ><div class="frame-general-toast-layer" :style="layer"
        ><ToastRoot
          v-bind="{...rootBindings, ...$attrs}"
          class="frame-general-toast"
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
