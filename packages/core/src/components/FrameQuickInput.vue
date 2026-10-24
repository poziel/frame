<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { ComboboxRoot, ComboboxInput, ComboboxContent, ComboboxItem } from "reka-ui";
import type { QuickPickItem } from "../types";
import FrameTextInput from "./FrameTextInput.vue";
import QuickInputText from "./QuickInputText.vue";
import FrameIcon from "./FrameIcon.vue";
import QuickOverlay from "./QuickOverlay.vue";

const props = withDefaults(defineProps<{ items: readonly QuickPickItem[]; title: string; placeholder?: string; position?: "top" | "center"; mode?: "application" | "frame" | "pick"; category?: string; categories?: readonly import('../frame/commands').CommandCategory[] }>(), { placeholder: "Type to search…" });
const emit = defineEmits<{ close: []; accept: [id: string]; mode: [mode: string] }>();
const operator = computed(() => props.category ?? (props.mode === 'frame' ? '>' : ''));
const categories = computed(() => props.categories ?? [{ prefix: '>', label: 'Frame commands' }]);
const input = ref<InstanceType<typeof FrameTextInput>>();
const combo = ref<{ highlightItem: (value: string) => void }>();
const query = ref("");
const selectedId = ref("");
const results = computed(() => {
  const text = query.value.trim().toLowerCase();
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
watch(query, value => {
  if (props.mode === 'pick' || operator.value) return;
  const category = categories.value.find(item => value.startsWith(item.prefix) && /^\s/.test(value.slice(item.prefix.length)));
  if (category) { query.value = value.slice(category.prefix.length).trimStart(); emit('mode', category.prefix === '>' ? 'frame' : category.prefix); }
});
function compositionKey(event: KeyboardEvent) {
  if (event.isComposing) { if (["Enter", "Escape"].includes(event.key)) event.stopPropagation(); return; }
  const target = event.target as HTMLInputElement;
  const category = categories.value.find(item => item.prefix === query.value);
  if (props.mode !== 'pick' && !operator.value && category && ["Tab", " "].includes(event.key)) {
    event.preventDefault(); event.stopPropagation(); query.value = ""; emit("mode", category.prefix === '>' ? 'frame' : category.prefix);
  } else if (props.mode !== 'pick' && operator.value && event.key === "Backspace" && target.selectionStart === 0 && target.selectionEnd === 0) {
    event.preventDefault(); event.stopPropagation(); emit("mode", "application");
  }
}
const element = computed(() => input.value?.element);
defineExpose({ element, focus: () => input.value?.focus() });
</script>
<template>
  <QuickOverlay :title="title" :position="position" @close="emit('close')">
    <ComboboxRoot ref="combo" as-child :open="true" :ignore-filter="true" :loop="true" :highlight-on-hover="true" :reset-search-term-on-select="false" @update:model-value="accept" @highlight="selectedId = String($event?.value ?? '')">
      <div class="quick-input-content" style="display:flex;flex-direction:column;min-height:0;flex:1 1 auto" @keydown.capture="compositionKey">
        <div class="palette-input"><span v-if="mode !== 'pick' && operator" class="quick-input-operator" :aria-label="`${title} operator`">{{ operator }}</span><ComboboxInput as-child v-model="query"><FrameTextInput ref="input" v-model="query" data-quick-autofocus :aria-label="title" :placeholder="placeholder" /></ComboboxInput></div>
        <ComboboxContent class="palette-results" :aria-label="title" @escape-key-down="escape">
          <ComboboxItem v-for="item in results" :key="item.id" :value="item.id" :text-value="item.label" :disabled="item.disabled" class="command-result" :class="{ active: selectedId === item.id, disabled: item.disabled }" @mousedown.prevent>
            <slot name="item" :item="item" :active="selectedId === item.id"><span v-if="item.icon" class="quick-input-icon" aria-hidden="true"><FrameIcon v-if="typeof item.icon === 'string'" :name="item.icon" :size="16"/><component v-else :is="item.icon" /></span><span class="command-label"><QuickInputText :text="item.label" :query="query" /></span><small v-if="item.detail"><QuickInputText :text="item.detail" :query="query" /></small><kbd v-if="item.shortcut">{{ item.shortcut }}</kbd></slot>
          </ComboboxItem>
          <p v-if="!results.length" class="no-results" role="status">No matching actions.</p>
        </ComboboxContent>
      </div>
    </ComboboxRoot>
  </QuickOverlay>
</template>


<style scoped>
.palette-input { display: flex; align-items: center; gap: var(--frame-spacing-unit, 4px); }
.quick-input-operator { color: var(--frame-text); background: var(--frame-input-bg, var(--frame-overlay-background)); border-radius: var(--frame-radius-small, 3px); padding: 2px 8px; font-family: var(--frame-font-mono); }
.palette-input :deep(input) { min-width: 0; flex: 1; }
</style>
