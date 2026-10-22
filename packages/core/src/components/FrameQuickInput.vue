<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { ComboboxRoot, ComboboxInput, ComboboxContent, ComboboxItem } from "reka-ui";
import type { QuickPickItem } from "../types";
import FrameTextInput from "./FrameTextInput.vue";
import QuickOverlay from "./QuickOverlay.vue";

const props = withDefaults(defineProps<{ items: readonly QuickPickItem[]; title: string; placeholder?: string; position?: "top" | "center" }>(), { placeholder: "Type to search…" });
const emit = defineEmits<{ close: []; accept: [id: string] }>();
const input = ref<InstanceType<typeof FrameTextInput>>();
const combo = ref<{ highlightItem: (value: string) => void }>();
const query = ref("");
const selectedId = ref("");
const results = computed(() => {
  const text = query.value.replace(/^>\s*/, "").trim().toLowerCase();
  return props.items.filter(item => `${item.label} ${item.detail ?? ""}`.toLowerCase().includes(text));
});
const enabledResults = computed(() => results.value.filter(item => !item.disabled));
watch([results, query], async () => {
  if (!enabledResults.value.some(item => item.id === selectedId.value)) selectedId.value = enabledResults.value[0]?.id ?? "";
  await nextTick();
  if (selectedId.value) combo.value?.highlightItem(selectedId.value);
}, { immediate: true });
function accept(value: unknown) {
  const id = String(value);
  if (props.items.some(item => item.id === id && !item.disabled)) emit("accept", id);
}
function escape(event: KeyboardEvent) {
  if (event.isComposing) return;
  event.preventDefault(); event.stopPropagation(); emit("close");
}
function compositionKey(event: KeyboardEvent) {
  if (event.isComposing && ["Enter", "Escape"].includes(event.key)) event.stopPropagation();
}
const element = computed(() => input.value?.element);
defineExpose({ element, focus: () => input.value?.focus() });
</script>
<template>
  <QuickOverlay :title="title" :position="position" @close="emit('close')">
    <ComboboxRoot ref="combo" as-child :open="true" :ignore-filter="true" :loop="true" :highlight-on-hover="true" :reset-search-term-on-select="false" @update:model-value="accept" @highlight="selectedId = String($event?.value ?? '')">
      <div class="quick-input-content" style="display:flex;flex-direction:column;min-height:0;flex:1 1 auto" @keydown.capture="compositionKey">
        <div class="palette-input"><ComboboxInput as-child v-model="query"><FrameTextInput ref="input" v-model="query" data-quick-autofocus :aria-label="title" :placeholder="placeholder" /></ComboboxInput></div>
        <ComboboxContent class="palette-results" :aria-label="title" @escape-key-down="escape">
          <ComboboxItem v-for="item in results" :key="item.id" :value="item.id" :text-value="item.label" :disabled="item.disabled" class="command-result" :class="{ active: selectedId === item.id, disabled: item.disabled }" @mousedown.prevent>
            <slot name="item" :item="item" :active="selectedId === item.id"><span class="command-label">{{ item.label }}</span><small v-if="item.detail">{{ item.detail }}</small><kbd v-if="item.shortcut">{{ item.shortcut }}</kbd></slot>
          </ComboboxItem>
          <p v-if="!results.length" class="no-results" role="status">No matching actions.</p>
        </ComboboxContent>
      </div>
    </ComboboxRoot>
  </QuickOverlay>
</template>

