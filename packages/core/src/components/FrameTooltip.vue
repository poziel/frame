<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from "vue";
import { fitOverlay, insetOverlayBounds, useOverlayBoundary } from "../frame/overlays";
const props = withDefaults(defineProps<{ text: string; shortcut?: string; disabled?: boolean; placement?: "top" | "bottom" | "left" | "right" }>(), { placement: "bottom" });
const id = useId();
const trigger = ref<HTMLElement>();
const bubble = ref<HTMLElement>();
const { bounds: boundary, target, getBounds } = useOverlayBoundary(() => trigger.value);
const visible = ref(false);
const position = ref<Record<string, string>>({ left: "0px", top: "0px" });
let timer: ReturnType<typeof setTimeout> | undefined;
let hovering = false;
let focused = false;
let disposed = false;
function hide() { clearTimeout(timer); visible.value = false; }
async function reveal() {
  if (disposed || props.disabled || !props.text) return;
  const area = insetOverlayBounds(getBounds());
  const limits = { maxWidth: `${area.width}px`, maxHeight: `${area.height}px`, overflow: "hidden" };
  position.value = { ...limits, visibility: "hidden" };
  visible.value = true;
  await nextTick();
  if (!trigger.value || !bubble.value) return;
  const anchor = trigger.value.getBoundingClientRect();
  const bounds = bubble.value.getBoundingClientRect();
  let left = anchor.left;
  let top = props.placement === "top" ? anchor.top - bounds.height - 6 : anchor.bottom + 6;
  if (props.placement === "right" || props.placement === "left") {
    left = props.placement === "right" ? anchor.right + 6 : anchor.left - bounds.width - 6;
    if (left + bounds.width > area.left + area.width) left = anchor.left - bounds.width - 6;
    if (left < area.left) left = anchor.right + 6;
    top = anchor.top + (anchor.height - bounds.height) / 2;
  } else {
    if (top + bounds.height > area.top + area.height) top = anchor.top - bounds.height - 6;
    if (top < area.top) top = anchor.bottom + 6;
  }
  const fitted = fitOverlay({ left, top, width: bounds.width, height: bounds.height }, getBounds());
  position.value = { ...limits, visibility: "visible", left: `${fitted.left}px`, top: `${fitted.top}px` };
}
function enter() { if (props.disabled) return; hovering = true; clearTimeout(timer); timer = setTimeout(() => void reveal(), 400); }
function leave() { hovering = false; if (!focused) hide(); }
function focusIn() {
  focused = document.activeElement?.matches(":focus-visible") ?? false;
  if (focused) { clearTimeout(timer); void reveal(); }
}
function focusOut() { focused = false; if (!hovering) hide(); }
function keydown(event: KeyboardEvent) { if (event.key === "Escape") hide(); }
if (boundary) watch(boundary, hide);
onMounted(() => {
  window.addEventListener("keydown", keydown);
  window.addEventListener("resize", hide);
  window.addEventListener("scroll", hide, true);
});
onBeforeUnmount(() => {
  disposed = true;
  clearTimeout(timer);
  window.removeEventListener("keydown", keydown);
  window.removeEventListener("resize", hide);
  window.removeEventListener("scroll", hide, true);
});
</script>
<template>
  <span ref="trigger" class="tooltip-trigger" @pointerenter="enter" @pointerleave="leave" @focusin="focusIn" @focusout="focusOut" @pointerdown="hide">
    <slot :describedby="visible ? id : undefined" />
    <Teleport :to="target">
      <div v-if="visible && !disabled" :id="id" ref="bubble" role="tooltip" class="frame-tooltip" :style="position">
        <span>{{ text }}</span><kbd v-if="shortcut">{{ shortcut }}</kbd>
      </div>
    </Teleport>
  </span>
</template>

