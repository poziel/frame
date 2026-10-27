<script setup lang="ts">
import { computed, ref } from 'vue';
import { ToastProvider, ToastRoot, ToastTitle, ToastDescription, ToastClose, ToastAction, ToastViewport, ToastPortal, useForwardPropsEmits, type ToastRootProps, type ToastRootEmits } from 'reka-ui';
import {useOverlayBoundary,overlayLayerStyle} from '../overlays/overlays';
import '../shared/general-c.css';
defineOptions({inheritAttrs:false});
interface Props extends ToastRootProps {title:string; description?:string; actionLabel?:string; actionAltText?:string; viewportLabel?:string}
const props=defineProps<Props>();
const emit=defineEmits<ToastRootEmits & {action:[]}>();
const rootProps=computed(()=>{const {title,description,actionLabel,actionAltText,viewportLabel,...root}=props;return root;});
const forwarded=useForwardPropsEmits(rootProps,emit);
const rootBindings = computed(() => Object.fromEntries(Object.entries(forwarded.value).filter((
  [key]
) => key !== 'onAction')));
const anchor=ref<HTMLElement>();
const {target,bounds}=useOverlayBoundary(()=>anchor.value);
const layer=computed(()=>overlayLayerStyle(bounds.value));
</script>
<template><span ref="anchor" class="frame-general-anchor"/><ToastProvider :duration="duration"><ToastPortal :to="target"><div class="frame-general-toast-layer" :style="layer"><ToastRoot v-bind="{...rootBindings,...$attrs}" class="frame-general-toast"><ToastTitle class="frame-general-title">{{title}}</ToastTitle><ToastDescription v-if="description" class="frame-general-description">{{description}}</ToastDescription><slot/><ToastAction v-if="actionLabel && actionAltText" :alt-text="actionAltText" class="frame-general-button" @click="emit('action')">{{actionLabel}}</ToastAction><ToastClose class="frame-general-button" aria-label="Dismiss notification">Dismiss</ToastClose></ToastRoot><ToastViewport class="frame-general-toast-viewport" :label="viewportLabel ?? 'Notifications ({hotkey})'"/></div></ToastPortal></ToastProvider></template>
