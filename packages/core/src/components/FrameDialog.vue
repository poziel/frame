<script setup lang="ts">
import { computed, ref } from 'vue';
import { DialogRoot, DialogTrigger, DialogPortal, DialogOverlay, DialogContent, DialogTitle, DialogDescription, DialogClose, useForwardPropsEmits, useEmitAsProps, type DialogRootProps, type DialogRootEmits, type DialogContentProps, type DialogContentEmits } from 'reka-ui';
import { useOverlayBoundary, overlayLayerStyle } from '../frame/overlays';
import '../general-c.css';
defineOptions({ inheritAttrs: false });
interface Props extends DialogRootProps { title: string; description?: string; triggerLabel?: string; contentProps?: DialogContentProps; confirmLabel?: string }
const props = defineProps<Props>();
const emit = defineEmits<DialogRootEmits & DialogContentEmits & { confirm: [] }>();
const contentEvents = useEmitAsProps(emit);
const rootProps = computed(() => { const { title, description, triggerLabel, contentProps, confirmLabel, ...root } = props; return root; });
const forwarded = useForwardPropsEmits(rootProps, emit);
const rootBindings = computed(() => Object.fromEntries(Object.entries(forwarded.value).filter(([key]) => !key.startsWith('on') || key.startsWith('onUpdate:'))));
const anchor = ref<HTMLElement>();
const {target, bounds} = useOverlayBoundary(() => anchor.value);
const layer = computed(() => overlayLayerStyle(bounds.value));
</script>
<template>
  <DialogRoot v-bind="rootBindings">
    <span ref="anchor" class="frame-general-anchor"><DialogTrigger as-child><slot name="trigger"><button type="button" class="frame-general-button">{{ triggerLabel ?? title }}</button></slot></DialogTrigger></span>
    <DialogPortal :to="target">
      <DialogOverlay class="frame-general-backdrop" :style="layer" />
      <div class="frame-general-layer" :style="layer">
        <DialogContent v-bind="{...contentEvents, ...contentProps, ...$attrs}" class="frame-general-dialog frame-advanced-popup ">
          <DialogTitle class="frame-general-title">{{ title }}</DialogTitle>
          <DialogDescription v-if="description" class="frame-general-description">{{ description }}</DialogDescription>
          <slot />
          <footer class="frame-general-actions"><slot name="actions"><DialogClose class="frame-general-button">Close</DialogClose></slot></footer>
        </DialogContent>
      </div>
    </DialogPortal>
  </DialogRoot>
</template>
