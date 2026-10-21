<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, useId } from "vue";
const props = withDefaults(defineProps<{ text: string; shortcut?: string; disabled?: boolean; placement?: "top" | "bottom" | "left" | "right" }>(), { placement: "bottom" });
const id = useId();
const trigger = ref<HTMLElement>();
const bubble = ref<HTMLElement>();
const visible = ref(false);
const position = ref({ left: "0px", top: "0px" });
let timer: ReturnType<typeof setTimeout> | undefined;
let hovering = false;
let focused = false;
let disposed = false;
function hide() { clearTimeout(timer); visible.value = false; }
async function reveal() {
  if (disposed || props.disabled || !props.text) return;
  visible.value = true;
  await nextTick();
  if (!trigger.value || !bubble.value) return;
  const anchor = trigger.value.getBoundingClientRect();
  const bounds = bubble.value.getBoundingClientRect();
  let left = anchor.left;
  let top = props.placement === "top" ? anchor.top - bounds.height - 6 : anchor.bottom + 6;
  if (props.placement === "right" || props.placement === "left") {
    left = props.placement === "right" ? anchor.right + 6 : anchor.left - bounds.width - 6;
    if (left + bounds.width > window.innerWidth - 6) left = anchor.left - bounds.width - 6;
    if (left < 6) left = anchor.right + 6;
    top = anchor.top + (anchor.height - bounds.height) / 2;
  } else {
    if (top + bounds.height > window.innerHeight - 6) top = anchor.top - bounds.height - 6;
    if (top < 6) top = anchor.bottom + 6;
  }
  position.value = { left: `${Math.max(6, Math.min(left, window.innerWidth - bounds.width - 6))}px`, top: `${Math.max(6, Math.min(top, window.innerHeight - bounds.height - 6))}px` };
}
function enter() { if (props.disabled) return; hovering = true; clearTimeout(timer); timer = setTimeout(() => void reveal(), 400); }
function leave() { hovering = false; if (!focused) hide(); }
function focusIn() {
  focused = document.activeElement?.matches(":focus-visible") ?? false;
  if (focused) { clearTimeout(timer); void reveal(); }
}
function focusOut() { focused = false; if (!hovering) hide(); }
function keydown(event: KeyboardEvent) { if (event.key === "Escape") hide(); }
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
    <Teleport to="body">
      <div v-if="visible && !disabled" :id="id" ref="bubble" role="tooltip" class="frame-tooltip" :style="position">
        <span>{{ text }}</span><kbd v-if="shortcut">{{ shortcut }}</kbd>
      </div>
    </Teleport>
  </span>
</template>

