<script setup lang="ts">
import { computed, inject, onBeforeUnmount, ref } from "vue";
import { DialogRoot, DialogContent, DialogTitle, VisuallyHidden } from "reka-ui";
import {frameKey} from '../../framework/useFrame';
import { overlayLayerStyle, useOverlayBoundary } from "../overlays/overlays";
import OverlayScrollbars from "../layout/OverlayScrollbars.vue";

defineOptions({ inheritAttrs: false });
const props = defineProps<{ title: string; position?: "top" | "center"; panel?: boolean; scroll?: boolean }>();
const emit = defineEmits<{ close: [] }>();
const frame = inject(frameKey, undefined);
const origin = ref<HTMLElement>(), surface = ref<HTMLElement>();
const { target, getBounds } = useOverlayBoundary(() => origin.value);
const position = computed(() => props.position ?? frame?.layout.quickInputPosition ?? "top");
const layerStyle = computed(() => overlayLayerStyle(getBounds()));
const surfaceStyle = computed(() => ({ maxHeight: `${Math.max(0, Math.min(420, getBounds().height - 12))}px`, minHeight: "0" }));
const previousFocus = typeof document === "undefined" ? undefined : document.activeElement as HTMLElement | null;
function focusInitial(event: Event) {
  event.preventDefault();
  surface.value = event.target instanceof HTMLElement ? event.target : undefined;
  const first = surface.value?.querySelector<HTMLElement>('[data-quick-autofocus], [autofocus]')
    ?? surface.value?.querySelector<HTMLElement>('input:not(:disabled), textarea:not(:disabled), button:not(:disabled), [tabindex="0"]');
  (first ?? surface.value)?.focus();
}
function escape(event: KeyboardEvent) {
  if (event.defaultPrevented || event.isComposing) return;
  event.preventDefault(); event.stopPropagation(); emit("close");
}
onBeforeUnmount(() => { if (previousFocus?.isConnected) previousFocus.focus(); });
</script>
<template>
  <span ref="origin" hidden />
  <DialogRoot :open="true" :modal="false">
    <Teleport :to="target">
      <div class="palette-backdrop" :class="{ 'position-center': position === 'center' }" :style="layerStyle" @pointerdown.self.prevent="emit('close')">
        <DialogContent as="section" v-bind="$attrs" class="palette" :class="{ 'quick-panel': panel }" :style="surfaceStyle" :aria-describedby="undefined" aria-modal="true" @escape-key-down="escape" @pointer-down-outside.prevent @interact-outside.prevent @open-auto-focus="focusInitial" @close-auto-focus.prevent>
          <VisuallyHidden as-child><DialogTitle>{{ title }}</DialogTitle></VisuallyHidden>
          <slot name="header" />
          <div class="quick-overlay-content" :style="{ minHeight: '0', overflow: scroll ? 'auto' : 'hidden', display: scroll ? 'block' : 'flex', flexDirection: 'column', flex: '1 1 auto' }"><slot /></div>
        </DialogContent>
      </div>
      <OverlayScrollbars v-if="surface" :root="surface" />
    </Teleport>
  </DialogRoot>
</template>
