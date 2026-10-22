<script setup lang="ts">
import { computed, ref } from 'vue';
import { DrawerRoot, DrawerTrigger, DrawerPortal, DrawerOverlay, DrawerContent, DrawerTitle, DrawerDescription, DrawerClose, useForwardPropsEmits, useEmitAsProps, type DrawerRootProps, type DrawerRootEmits, type DrawerContentProps, type DrawerContentEmits } from 'reka-ui';
import { useOverlayBoundary, overlayLayerStyle } from '../frame/overlays';
import '../general-c.css';
defineOptions({ inheritAttrs: false });
interface Props extends DrawerRootProps { title: string; description?: string; triggerLabel?: string; contentProps?: DrawerContentProps; confirmLabel?: string }
const props = defineProps<Props>();
const emit = defineEmits<DrawerRootEmits & DrawerContentEmits & { confirm: [] }>();
const contentEvents = useEmitAsProps(emit);
const rootProps = computed(() => { const { title, description, triggerLabel, contentProps, confirmLabel, ...root } = props; return root; });
const forwarded = useForwardPropsEmits(rootProps, emit);
const rootBindings = computed(() => Object.fromEntries(Object.entries(forwarded.value).filter(([key]) => !key.startsWith('on') || key.startsWith('onUpdate:'))));
const anchor = ref<HTMLElement>();
const {target, bounds} = useOverlayBoundary(() => anchor.value);
const layer = computed(() => overlayLayerStyle(bounds.value));
</script>
<template>
  <DrawerRoot v-bind="rootBindings">
    <span ref="anchor" class="frame-general-anchor"><DrawerTrigger as-child><slot name="trigger"><button type="button" class="frame-general-button">{{ triggerLabel ?? title }}</button></slot></DrawerTrigger></span>
    <DrawerPortal :to="target">
      <DrawerOverlay class="frame-general-backdrop" :style="layer" />
      <div class="frame-general-layer frame-general-drawer-layer" :data-direction="swipeDirection ?? 'down'" :style="layer">
        <DrawerContent v-bind="{...contentEvents, ...contentProps, ...$attrs}" class="frame-general-dialog frame-advanced-popup frame-general-drawer">
          <DrawerTitle class="frame-general-title">{{ title }}</DrawerTitle>
          <DrawerDescription v-if="description" class="frame-general-description">{{ description }}</DrawerDescription>
          <slot />
          <footer class="frame-general-actions"><slot name="actions"><DrawerClose class="frame-general-button">Close</DrawerClose></slot></footer>
        </DrawerContent>
      </div>
    </DrawerPortal>
  </DrawerRoot>
</template>
