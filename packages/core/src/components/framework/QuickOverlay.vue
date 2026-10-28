<script setup lang="ts">
import {computed, inject, onBeforeUnmount, ref} from 'vue';
import {DialogRoot, DialogContent, DialogTitle, VisuallyHidden} from 'reka-ui';
import {frameKey} from '../../framework/useFrame';
import {overlayLayerStyle, useOverlayBoundary} from '../overlays/overlays';
import OverlayScrollbars from '../layout/OverlayScrollbars.vue';

defineOptions({inheritAttrs: false});
const props = defineProps<{
  title: string;
  position?: 'top' | 'center';
  panel?: boolean;
  scroll?: boolean;
}>();
const emit = defineEmits<{close: []}>();
const frame = inject(frameKey, undefined);
const origin = ref<HTMLElement>(),
  surface = ref<HTMLElement>();
const {target, getBounds} = useOverlayBoundary(() => origin.value);
const position = computed(
  () => props.position ?? frame?.layout.quickInputPosition ?? 'top'
);
const layerStyle = computed(() => overlayLayerStyle(getBounds()));
const surfaceStyle = computed(() => ({
  maxHeight: `${Math.max(0, Math.min(420, getBounds().height - 12))}px`,
  minHeight: '0',
}));
const previousFocus =
  typeof document === 'undefined'
    ? undefined
    : (document.activeElement as HTMLElement | null);
function focusInitial(event: Event) {
  event.preventDefault();
  surface.value =
    event.target instanceof HTMLElement ? event.target : undefined;
  const first =
    surface.value?.querySelector<HTMLElement>(
      '[data-quick-autofocus], [autofocus]'
    ) ??
    surface.value?.querySelector<HTMLElement>(
      'input:not(:disabled), textarea:not(:disabled), button:not(:disabled), [tabindex="0"]'
    );
  (first ?? surface.value)?.focus();
}
function escape(event: KeyboardEvent) {
  if (event.defaultPrevented || event.isComposing) return;
  event.preventDefault();
  event.stopPropagation();
  emit('close');
}
onBeforeUnmount(() => {
  if (previousFocus?.isConnected) previousFocus.focus();
});
</script>
<template>
  <span ref="origin" hidden />
  <DialogRoot :open="true" :modal="false">
    <Teleport :to="target">
      <div
        class="palette-backdrop frame-overlay-interactive frame-box-scope frame-control-scope frame-shell-text frame-scroll-scope"
        :class="{'position-center': position === 'center'}"
        :style="layerStyle"
        @pointerdown.self.prevent="emit('close')"
      >
        <DialogContent
          as="section"
          v-bind="$attrs"
          class="palette frame-overlay-surface"
          :class="{'quick-panel': panel}"
          :style="surfaceStyle"
          :aria-describedby="undefined"
          aria-modal="true"
          @escape-key-down="escape"
          @pointer-down-outside.prevent
          @interact-outside.prevent
          @open-auto-focus="focusInitial"
          @close-auto-focus.prevent
        >
          <VisuallyHidden as-child
            ><DialogTitle>{{ title }}</DialogTitle></VisuallyHidden
          >
          <slot name="header" />
          <div
            class="quick-overlay-content"
            :style="{
              minHeight: '0',
              overflow: scroll ? 'auto' : 'hidden',
              display: scroll ? 'block' : 'flex',
              flexDirection: 'column',
              flex: '1 1 auto',
            }"
            ><slot
          /></div>
        </DialogContent>
      </div>
      <OverlayScrollbars v-if="surface" :root="surface" />
    </Teleport>
  </DialogRoot>
</template>

<style lang="scss">
/* One quick-input surface, with no dimming or blur over the workbench. */
.palette-backdrop {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: var(--frame-One-quick-input-surface-padding, 6px 8px);
}

.palette {
  width: var(--frame-palette-width, 600px);
  max-width: var(--frame-palette-max-width, 100%);
  max-height: var(--frame-palette-max-height, min(420px, calc(100dvh - 12px)));
  display: flex;
  flex-direction: column;
  background: var(--frame-palette-background, #202325);
  border: var(
    --frame-palette-border,
    1px solid var(--frame-quick-border-color, #32383b)
  );
  border-radius: var(--frame-palette-border-radius, var(--frame-radius-large));
  padding: var(--frame-palette-padding, 6px);
  box-shadow: var(--frame-palette-box-shadow, 0 9px 28px #0006);
  overflow: hidden;
}

.position-center {
  align-items: center;
}
</style>
