<script setup lang="ts">
import OverlayScrollbars from "./OverlayScrollbars.vue";
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import type { FrameMenuItem } from "../types";
import { fitMenu, selectableMenuItems } from "../frame/menu";
import VisibilityIndicator from "./VisibilityIndicator.vue";
import AppIcon from "./AppIcon.vue";
import { insetOverlayBounds, useOverlayBoundary } from "../frame/overlays";
const props = defineProps<{
  items: readonly FrameMenuItem[]; menuId?: string; owner: string; anchor: HTMLElement; label: string; submenu?: boolean; autofocus?: boolean; placement?: "bottom" | "right"; point?: { x: number; y: number };
}>();
const emit = defineEmits<{ select: [item: FrameMenuItem]; dismiss: []; back: [] }>();
const root = ref<HTMLElement>();
const { bounds, target, getBounds } = useOverlayBoundary(() => props.anchor);
const child = ref<{ focusFirst: () => void }>();
const opened = ref("");
const active = ref("");
function childRef(element: unknown) { child.value = element ? element as { focusFirst: () => void } : undefined; }
const buttons = new Map<string, HTMLButtonElement>();
const position = ref<Record<string, string>>({ left: "0px", top: "0px", visibility: "hidden" });
let timer: ReturnType<typeof setTimeout> | undefined;
function buttonRef(id: string, element: unknown) {
  if (element instanceof HTMLButtonElement) buttons.set(id, element); else buttons.delete(id);
}
async function place() {
  await nextTick();
  if (!root.value) return;
  const area = insetOverlayBounds(getBounds());
  const limits = { minWidth: `${Math.min(240, area.width)}px`, maxWidth: `${area.width}px`, maxHeight: `${area.height}px` };
  Object.assign(position.value, limits);
  await nextTick();
  if (!root.value) return;
  const rect = fitMenu(props.point ? new DOMRect(props.point.x, props.point.y, 0, 0) : props.anchor.getBoundingClientRect(), root.value.getBoundingClientRect(), getBounds(), props.submenu, props.placement);
  position.value = { ...limits, left: `${rect.left}px`, top: `${rect.top}px`, visibility: "visible" };
}
async function focusFirst() {
  await place();
  await nextTick();
  const item = selectableMenuItems(props.items)[0];
  if (item) buttons.get(item.id)?.focus(); else root.value?.focus();
}
async function open(item: FrameMenuItem, focusChild = false) {
  clearTimeout(timer);
  if (item.type === "separator" || item.disabled) return;
  active.value = item.id;
  opened.value = item.children?.length ? item.id : "";
  if (focusChild) { await nextTick(); child.value?.focusFirst(); }
}
function hover(item: FrameMenuItem) {
  clearTimeout(timer);
  if (item.type === "separator" || item.disabled) return;
  active.value = item.id;
  timer = setTimeout(() => void open(item), 140);
}
function choose(item: FrameMenuItem) {
  if (item.type === "separator" || item.disabled) return;
  if (item.children?.length) void open(item, true);
  else emit("select", item);
}
function closeChild() {
  const parent = opened.value;
  opened.value = "";
  buttons.get(parent)?.focus();
}
function keydown(event: KeyboardEvent) {
  const items = selectableMenuItems(props.items);
  const focused = items.findIndex(item => buttons.get(item.id) === document.activeElement);
  const item = items[focused];
  if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
    event.preventDefault(); event.stopPropagation(); clearTimeout(timer); opened.value = "";
    const index = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : (focused + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
    const target = items[index];
    if (target) { active.value = target.id; buttons.get(target.id)?.focus(); }
  }
  if (event.key === "ArrowRight" && item?.children?.length) { event.preventDefault(); event.stopPropagation(); void open(item, true); }
  if (event.key === "ArrowLeft") { event.preventDefault(); event.stopPropagation(); emit("back"); }
  if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); emit("dismiss"); }
  if (event.key === "Tab") emit("dismiss");
}
onMounted(async () => { await place(); if (props.autofocus) focusFirst(); });
watch(() => props.items, place, { deep: true });
if (bounds) watch(bounds, place);
onBeforeUnmount(() => clearTimeout(timer));
defineExpose({ focusFirst });
</script>
<template>
  <Teleport :to="target">
    <div ref="root" :id="menuId" class="frame-menu" :data-frame-menu-owner="owner" :style="position" role="menu" :aria-label="label" tabindex="-1" @keydown="keydown">
      <template v-for="item in items" :key="item.id">
        <div v-if="item.type === 'separator'" role="separator" class="menu-separator" />
        <div v-else class="menu-row" @pointerenter="hover(item)">
          <button :ref="element => buttonRef(item.id, element)" :role="item.checked === undefined ? 'menuitem' : 'menuitemcheckbox'"
            :aria-checked="item.checked" :aria-disabled="item.disabled || undefined" :disabled="item.disabled" tabindex="-1"
            :aria-controls="item.children?.length ? `${owner}-${item.id}` : undefined" :aria-haspopup="item.children?.length ? 'menu' : undefined" :aria-expanded="item.children?.length ? opened === item.id : undefined"
            :class="{ active: active === item.id && !item.disabled }" @focus="active = item.id" @click="choose(item)">
            <span class="menu-check"><AppIcon v-if="item.checked && !item.visibility" name="check" :size="14" /></span>
            <span class="menu-label">{{ item.label }}</span>
            <VisibilityIndicator v-if="item.visibility" :visible="!!item.checked"/><kbd v-if="item.shortcut">{{ item.shortcut }}</kbd>
            <AppIcon v-if="item.children?.length" name="chevron" :size="13" class="menu-chevron" />
            <span v-else class="menu-chevron" />
          </button>
          <MenuList v-if="opened === item.id && item.children?.length && buttons.get(item.id)" :ref="childRef"
            :items="item.children" :menu-id="`${owner}-${item.id}`" :owner="owner" :anchor="buttons.get(item.id)!" :label="item.label" submenu
            @select="emit('select', $event)" @dismiss="emit('dismiss')" @back="closeChild" />
        </div>
      </template>
    </div>
  <OverlayScrollbars :root="root"/></Teleport>
</template>


