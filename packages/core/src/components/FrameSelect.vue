<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from "vue";
import { isSelectOption, selectableOptions } from "../frame/select";
import type { SelectItem } from "../types";
import OverlayScrollbars from "./OverlayScrollbars.vue";
import FrameIcon from "./FrameIcon.vue";
import { insetOverlayBounds, useOverlayBoundary } from "../frame/overlays";
defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<{ modelValue: string; options: readonly SelectItem[]; label?: string; disabled?: boolean; defaultValue?: string }>(), { label: "Select an option" });
const emit = defineEmits<{ "update:modelValue": [value: string] }>();
const id = useId(), button = ref<HTMLButtonElement>(), popup = ref<HTMLElement>();
const { bounds, target, getBounds } = useOverlayBoundary(() => button.value);
const open = ref(false), active = ref(0), style = ref<Record<string, string>>({});
const activeOption = computed(() => { const item = props.options[active.value]; return isSelectOption(item) ? item : undefined; });
const selected = computed(() => props.options.filter(isSelectOption).find(item => isSelectOption(item) && item.value === props.modelValue));
function close() { open.value = false; }
async function show() {
  if (props.disabled) return;
  active.value = props.options.findIndex(item => isSelectOption(item) && item.value === props.modelValue && !item.disabled); if (active.value < 0) active.value = selectableOptions(props.options)[0] ?? -1; style.value = { visibility: "hidden" }; open.value = true;
  await nextTick();
  if (!button.value || !open.value) return;
  const area = insetOverlayBounds(getBounds(), 8);
  const rect = button.value.getBoundingClientRect();
  const bottomAnchor = Math.max(area.top, Math.min(rect.bottom, area.top + area.height));
  const topAnchor = Math.max(area.top, Math.min(rect.top, area.top + area.height));
  const below = area.top + area.height - bottomAnchor, above = topAnchor - area.top;
  const upward = below < Math.min(240, props.options.length * 28 + 60) && above > below;
  const height = Math.min(320, upward ? above : below);
  const width = Math.min(rect.width, area.width);
  style.value = { visibility: "visible", left: `${Math.max(area.left, Math.min(rect.left, area.left + area.width - width))}px`, width: `${width}px`, maxHeight: `${height}px`, ...(upward ? { bottom: `${innerHeight - topAnchor}px` } : { top: `${bottomAnchor}px` }) };
  await nextTick(); popup.value?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
}
function choose(index: number) { const option = props.options[index]; if (!isSelectOption(option) || option.disabled) return; emit("update:modelValue", option.value); close(); button.value?.focus(); }
let search = "", searchTimer: ReturnType<typeof setTimeout> | undefined;
function key(event: KeyboardEvent) {
  if (["ArrowDown", "ArrowUp", "Home", "End", "Enter", " ", "Escape"].includes(event.key)) {
    if (event.key === "Escape") { if (open.value) { event.preventDefault(); event.stopPropagation(); close(); } return; }
    event.preventDefault(); event.stopPropagation();
    if (!open.value) { void show(); return; }
    if (event.key === "Enter" || event.key === " ") { choose(active.value); return; }
    const available = selectableOptions(props.options);
    const position = available.indexOf(active.value);
    active.value = event.key === "Home" ? available[0] ?? 0 : event.key === "End" ? available[available.length - 1] ?? 0 : available[(position + (event.key === "ArrowDown" ? 1 : -1) + available.length) % available.length] ?? 0;
    void nextTick(() => popup.value?.querySelector(`#${id}-option-${active.value}`)?.scrollIntoView({ block: "nearest" }));
  } else if (event.key === "Tab") close();
  else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
    search += event.key.toLowerCase(); clearTimeout(searchTimer); searchTimer = setTimeout(() => { search = ""; }, 700);
    const index = props.options.findIndex(item => isSelectOption(item) && !item.disabled && item.label.toLowerCase().startsWith(search));
    if (index >= 0) { if (open.value) active.value = index; else choose(index); }
  }
}
function outside(event: PointerEvent) { if (!button.value?.contains(event.target as Node) && !popup.value?.contains(event.target as Node)) close(); }
function scroll(event: Event) { if (!popup.value?.contains(event.target as Node)) close(); }
if (bounds) watch(bounds, close);
onMounted(() => { window.addEventListener("pointerdown", outside); window.addEventListener("resize", close); window.addEventListener("scroll", scroll, true); });
onBeforeUnmount(() => { clearTimeout(searchTimer); window.removeEventListener("pointerdown", outside); window.removeEventListener("resize", close); window.removeEventListener("scroll", scroll, true); });
</script>
<template><button ref="button" v-bind="$attrs" type="button" class="frame-select" role="combobox" :aria-label="label" aria-haspopup="listbox" :aria-expanded="open" :aria-controls="open ? `${id}-list` : undefined" :aria-activedescendant="open && active >= 0 ? `${id}-option-${active}` : undefined" :disabled="disabled" @click="open ? close() : show()" @keydown="key"><span>{{ selected?.label ?? 'Select…' }}</span><FrameIcon name="chevron-down" :size="16"/></button><Teleport :to="target"><div v-if="open" ref="popup" class="frame-select-popup" :style="style" @pointerdown.prevent><div :id="`${id}-list`" class="frame-select-options" role="listbox" :aria-label="label"><template v-for="(option, index) in options" :key="isSelectOption(option) ? option.value : option.id"><div v-if="!isSelectOption(option)" role="separator" class="frame-select-separator"/><div v-else :id="`${id}-option-${index}`" role="option" :aria-selected="active === index" :aria-disabled="option.disabled || undefined" :class="{ active: active === index, disabled: option.disabled }" @pointermove="!option.disabled && (active = index)" @click="choose(index)"><span>{{ option.label }}</span><small v-if="option.detail">{{ option.detail }}</small><small v-if="option.value === defaultValue" class="select-default">default</small></div></template></div><p v-if="activeOption?.description" class="frame-select-description">{{ activeOption?.description }}</p></div><OverlayScrollbars v-if="popup" :root="popup"/></Teleport></template>
