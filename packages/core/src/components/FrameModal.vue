<script setup lang="ts">
import OverlayScrollbars from "./OverlayScrollbars.vue";
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, useId, watch } from "vue";
import type { Component } from "vue";
import type { PanelAction } from "../types";
import { fitModal, initialModal, resizeModal, type ModalEdge, type ModalRect } from "../frame/modal";
import PanelActions from "./PanelActions.vue";
import FrameIconButton from "./FrameIconButton.vue";
import { insetOverlayBounds, intersectOverlayBounds, overlayLayerStyle, useOverlayBoundary, viewportBounds } from "../frame/overlays";

const props = withDefaults(defineProps<{ title: string; icon?: Component; actions?: readonly PanelAction[]; bounds?: HTMLElement; active?: boolean; width?: number; height?: number; maximized?: boolean; layer?: number }>(), { active: true, layer: 0 });
const emit = defineEmits<{ close: [] }>();
const titleId = useId();
const dialog = ref<HTMLElement>();
const { bounds: boundary, target, getBounds } = useOverlayBoundary(() => props.bounds ?? dialog.value);
const layerBounds = ref(viewportBounds());
const layerStyle = computed(() => ({ ...overlayLayerStyle(layerBounds.value), zIndex: 60 + props.layer * 2 }));
const maximized = ref(props.maximized ?? false);
const area = reactive<ModalRect>({ x: 6, y: 40, width: 800, height: 600 });
const rect = reactive<ModalRect>({ ...area });
const style = computed(() => { const box = maximized.value ? area : rect; return { left: `${box.x}px`, top: `${box.y}px`, width: `${box.width}px`, height: `${box.height}px` }; });
let previousFocus: HTMLElement | null = null;
let observer: ResizeObserver | undefined;
let stopGesture: (() => void) | undefined;
let initialized = false;
function measure() {
  const requested = props.bounds?.getBoundingClientRect();
  layerBounds.value = requested ? intersectOverlayBounds(getBounds(), requested) : getBounds();
  const bounds = insetOverlayBounds(layerBounds.value);
  Object.assign(area, { x: bounds.left, y: bounds.top, width: bounds.width, height: bounds.height });
  if (!initialized) { Object.assign(rect, initialModal(area, props.width, props.height)); initialized = true; }
  else Object.assign(rect, fitModal(rect, area));
}
function focusInitial() { (dialog.value?.querySelector<HTMLElement>('[data-modal-autofocus], [autofocus], input:not(:disabled), textarea:not(:disabled), select:not(:disabled)') ?? dialog.value)?.focus(); }
function controls() { return Array.from(dialog.value?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), a[href], [tabindex="0"]') ?? []).filter(element => element.getClientRects().length && element.tabIndex >= 0); }
function keydown(event: KeyboardEvent) {
  if (!props.active || event.isComposing || event.defaultPrevented) return;
  if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); emit("close"); return; }
  if (event.key === "Tab") {
    const items = controls(); const index = items.indexOf(document.activeElement as HTMLElement);
    if (!items.length) { event.preventDefault(); dialog.value?.focus(); }
    else if (event.shiftKey && index <= 0) { event.preventDefault(); items[items.length - 1]?.focus(); }
    else if (!event.shiftKey && (index === items.length - 1 || index < 0)) { event.preventDefault(); items[0]?.focus(); }
  }
}
function focusGuard(event: FocusEvent) {
  const target = event.target as HTMLElement;
  if (props.active && !dialog.value?.contains(target) && !target.closest('.frame-menu, .palette-backdrop')) focusInitial();
}
function toggleMaximize() { stopGesture?.(); maximized.value = !maximized.value; }
function begin(event: PointerEvent, edge?: ModalEdge) {
  if (!props.active || maximized.value || event.button !== 0) return;
  if (!edge && (event.target as HTMLElement).closest('button, input, a, select, textarea')) return;
  event.preventDefault(); stopGesture?.();
  const element = event.currentTarget as HTMLElement;
  element.setPointerCapture(event.pointerId);
  const origin = { ...rect }; const x = event.clientX, y = event.clientY;
  function move(next: PointerEvent) { if (next.pointerId !== event.pointerId) return; Object.assign(rect, edge ? resizeModal(origin, edge, next.clientX - x, next.clientY - y, area) : fitModal({ ...origin, x: origin.x + next.clientX - x, y: origin.y + next.clientY - y }, area)); }
  function finish(next: PointerEvent) { if (next.pointerId === event.pointerId) stopGesture?.(); }
  function cancel() { Object.assign(rect, origin); stopGesture?.(); }
  stopGesture = () => { element.removeEventListener("pointermove", move); element.removeEventListener("pointerup", finish); element.removeEventListener("pointercancel", cancel); element.removeEventListener("lostpointercapture", finish); if (element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId); stopGesture = undefined; };
  element.addEventListener("pointermove", move); element.addEventListener("pointerup", finish); element.addEventListener("pointercancel", cancel); element.addEventListener("lostpointercapture", finish);
}
function headerKey(event: KeyboardEvent) {
  if (!event.altKey || maximized.value || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
  event.preventDefault(); event.stopPropagation();
  const dx = event.key === "ArrowLeft" ? -10 : event.key === "ArrowRight" ? 10 : 0;
  const dy = event.key === "ArrowUp" ? -10 : event.key === "ArrowDown" ? 10 : 0;
  Object.assign(rect, event.shiftKey ? resizeModal(rect, "se", dx, dy, area) : fitModal({ ...rect, x: rect.x + dx, y: rect.y + dy }, area));
}
onMounted(() => {
  previousFocus = document.activeElement as HTMLElement; measure();
  observer = new ResizeObserver(measure); if (props.bounds) observer.observe(props.bounds);
  window.addEventListener("resize", measure); window.addEventListener("keydown", keydown); document.addEventListener("focusin", focusGuard);
  if (props.active) focusInitial();
});
watch(() => props.bounds, () => { measure(); observer?.disconnect(); if (props.bounds) observer?.observe(props.bounds); }, { flush: "post" });
if (boundary) watch(boundary, measure);
watch(() => props.active, async active => { if (active) { await nextTick(); focusInitial(); } });
onBeforeUnmount(() => { stopGesture?.(); observer?.disconnect(); window.removeEventListener("resize", measure); window.removeEventListener("keydown", keydown); document.removeEventListener("focusin", focusGuard); if (props.active) void nextTick(() => { if (previousFocus?.isConnected && !previousFocus.closest('[inert]')) previousFocus.focus(); }); });
</script>
<template><Teleport :to="target"><div class="frame-modal-layer" :style="layerStyle" :inert="!active || undefined" @contextmenu.prevent><div class="frame-modal-backdrop"/><section ref="dialog" role="dialog" :aria-modal="active ? true : undefined" :aria-labelledby="titleId" tabindex="-1" class="frame-modal" :class="{ maximized }" :style="style">
  <header class="frame-modal-header" tabindex="0" aria-label="Move or resize modal" @pointerdown="begin($event)" @dblclick.self="toggleMaximize" @keydown="headerKey"><component v-if="icon" :is="icon" class="modal-icon"/><h2 :id="titleId" @dblclick="toggleMaximize">{{ title }}</h2><PanelActions :actions="actions"/><slot name="header-actions"/><FrameIconButton :label="maximized ? 'Restore modal' : 'Maximize modal'" :icon="maximized ? 'screen-normal' : 'screen-full'" tooltip-placement="bottom" @click="toggleMaximize"/><FrameIconButton label="Close modal" icon="close" @click="emit('close')"/></header>
  <div class="frame-modal-content"><slot/></div>
  <template v-if="!maximized"><div v-for="edge in (['n','s','e','w','ne','nw','se','sw'] as const)" :key="edge" class="modal-resize" :class="edge" aria-hidden="true" @pointerdown="begin($event, edge)"/></template>
</section></div><OverlayScrollbars :root="dialog"/></Teleport></template>
