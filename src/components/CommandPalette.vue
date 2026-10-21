<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from "vue";
import type { QuickPickItem } from "../types";
import AppIcon from "./AppIcon.vue";
const props = withDefaults(defineProps<{ items: readonly QuickPickItem[]; title: string; placeholder: string; searchable?: boolean; position?: "top" | "center" }>(), { searchable: true, position: "top" });
const emit = defineEmits<{ close: []; accept: [id: string] }>();
const uid = useId();
const query = ref("");
const selectedId = ref("");
const input = ref<HTMLInputElement>();
const list = ref<HTMLElement>();
const dialog = ref<HTMLElement>();
const results = computed(() => {
  const text = query.value.replace(/^>\s*/, "").trim().toLowerCase();
  return props.items.filter(item => `${item.label} ${item.detail ?? ""}`.toLowerCase().includes(text));
});
const enabledResults = computed(() => results.value.filter(item => !item.disabled));
watch([results, query], () => {
  if (!enabledResults.value.some(item => item.id === selectedId.value)) selectedId.value = enabledResults.value[0]?.id ?? "";
}, { immediate: true });
watch(selectedId, async () => {
  await nextTick();
  list.value?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
});
let previousFocus: HTMLElement | null = null;
onMounted(() => { previousFocus = document.activeElement as HTMLElement; (input.value ?? dialog.value?.querySelector<HTMLButtonElement>("button"))?.focus(); });
onBeforeUnmount(() => { if (previousFocus?.isConnected) previousFocus.focus(); });
function onKey(event: KeyboardEvent) {
  if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); emit("close"); }
  if (event.key === "Tab") {
    const controls = Array.from(dialog.value?.querySelectorAll<HTMLElement>('input, button:not(:disabled):not([tabindex="-1"]), [tabindex="0"]') ?? []).filter(el => el.getClientRects().length);
    const current = controls.indexOf(document.activeElement as HTMLElement);
    event.preventDefault(); controls[(current + (event.shiftKey ? -1 : 1) + controls.length) % controls.length]?.focus();
  }
  if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
    event.preventDefault();
    const items = enabledResults.value;
    if (!items.length) return;
    const current = items.findIndex(item => item.id === selectedId.value);
    const index = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1
      : (current + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
    selectedId.value = items[index]?.id ?? "";
  }
  if (event.key === "Enter" && !event.isComposing && selectedId.value) {
    event.preventDefault();
    if (selectedId.value) emit("accept", selectedId.value);
  }
}
</script>
<template>
  <div class="palette-backdrop" :class="{ 'position-center': position === 'center' }" @pointerdown.self="emit('close')" @keydown="onKey">
    <section ref="dialog" class="palette" :class="{ 'quick-panel': !searchable }" role="dialog" aria-modal="true" :aria-label="title">
      <header v-if="!searchable" class="quick-panel-header"><span>{{ title }}</span><div class="quick-panel-actions"><slot name="header-actions" /><button class="icon-button" aria-label="Close panel" @click="emit('close')"><AppIcon name="close" :size="16" /></button></div></header>
      <div v-else class="palette-input">
        <input ref="input" v-model="query" :aria-label="title" role="combobox" aria-autocomplete="list"
          :aria-controls="`${uid}-results`" :aria-expanded="true" :placeholder="placeholder"
          :aria-activedescendant="selectedId ? `${uid}-${selectedId}` : undefined" />
      </div>
      <slot name="content"><div :id="`${uid}-results`" ref="list" class="palette-results" role="listbox" :aria-label="title">
        <div v-for="item in results" :id="`${uid}-${item.id}`" :key="item.id" role="option"
          :aria-selected="selectedId === item.id" :aria-disabled="item.disabled || undefined"
          class="command-result" :class="{ active: selectedId === item.id, disabled: item.disabled }"
          @pointermove="!item.disabled && (selectedId = item.id)" @mousedown.prevent
          @click="!item.disabled && emit('accept', item.id)">
          <span class="command-label">{{ item.label }}</span><small v-if="item.detail">{{ item.detail }}</small>
          <kbd v-if="item.shortcut">{{ item.shortcut }}</kbd>
        </div>
        <p v-if="searchable && !results.length" class="no-results" role="status">No matching actions.</p>
      </div></slot>
    </section>
  </div>
</template>


