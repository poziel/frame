<script setup lang="ts">
import { computed, ref } from 'vue';
import { AlertDialogRoot, AlertDialogTrigger, AlertDialogPortal, AlertDialogOverlay, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction, useForwardPropsEmits, useEmitAsProps, type AlertDialogProps, type AlertDialogEmits, type AlertDialogContentProps, type AlertDialogContentEmits } from 'reka-ui';
import { useOverlayBoundary, overlayLayerStyle } from '../frame/overlays';
import '../general-c.css';
defineOptions({ inheritAttrs: false });
interface Props extends AlertDialogProps { title: string; description?: string; triggerLabel?: string; contentProps?: AlertDialogContentProps; confirmLabel?: string }
const props = defineProps<Props>();
const emit = defineEmits<AlertDialogEmits & AlertDialogContentEmits & { confirm: [] }>();
const contentEvents = useEmitAsProps(emit);
const rootProps = computed(() => { const { title, description, triggerLabel, contentProps, confirmLabel, ...root } = props; return root; });
const forwarded = useForwardPropsEmits(rootProps, emit);
const rootBindings = computed(() => Object.fromEntries(Object.entries(forwarded.value).filter(([key]) => !key.startsWith('on') || key.startsWith('onUpdate:'))));
const anchor = ref<HTMLElement>();
const {target, bounds} = useOverlayBoundary(() => anchor.value);
const layer = computed(() => overlayLayerStyle(bounds.value));
</script>
<template>
  <AlertDialogRoot v-bind="rootBindings">
    <span ref="anchor" class="frame-general-anchor"><AlertDialogTrigger as-child><slot name="trigger"><button type="button" class="frame-general-button">{{ triggerLabel ?? title }}</button></slot></AlertDialogTrigger></span>
    <AlertDialogPortal :to="target">
      <AlertDialogOverlay class="frame-general-backdrop" :style="layer" />
      <div class="frame-general-layer" :style="layer">
        <AlertDialogContent v-bind="{...contentEvents, ...contentProps, ...$attrs}" class="frame-general-dialog frame-advanced-popup ">
          <AlertDialogTitle class="frame-general-title">{{ title }}</AlertDialogTitle>
          <AlertDialogDescription v-if="description" class="frame-general-description">{{ description }}</AlertDialogDescription>
          <slot />
          <footer class="frame-general-actions"><slot name="actions"><AlertDialogCancel class="frame-general-button">Cancel</AlertDialogCancel><AlertDialogAction class="frame-general-button" @click="emit('confirm')">{{ confirmLabel }}</AlertDialogAction></slot></footer>
        </AlertDialogContent>
      </div>
    </AlertDialogPortal>
  </AlertDialogRoot>
</template>
