<script setup lang="ts">
import {computed, nextTick, ref, watch} from 'vue';
import {
  ComboboxRoot,
  ComboboxInput,
  ComboboxContent,
  ComboboxItem,
  ListboxRoot,
  ListboxContent,
  ListboxItem,
} from 'reka-ui';
import type {QuickPickItem} from './quickPick';
import FrameTextField from '../forms/FrameTextField.vue';
import QuickPickText from './QuickPickText.vue';
import FrameIcon from '../data-display/FrameIcon.vue';
import QuickOverlay from './QuickOverlay.vue';

const props = withDefaults(
  defineProps<{
    items: readonly QuickPickItem[];
    title: string;
    placeholder?: string;
    position?: 'top' | 'center';
    mode?: 'application' | 'frame' | 'pick';
    category?: string;
    searchable?: boolean;
    initialQuery?: string;
    initialSelectedId?: string;
    categories?: readonly import('../../framework/commands/commandPrefixes').CommandPrefix[];
  }>(),
  {placeholder: 'Type to search…'}
);
const emit = defineEmits<{
  close: [];
  accept: [id: string];
  mode: [mode: string];
  state: [state: {query: string; selectedId: string}];
}>();
const operator = computed(
  () => props.category ?? (props.mode === 'frame' ? '>' : '')
);
const categories = computed(
  () => props.categories ?? [{prefix: '>', label: 'Frame commands'}]
);
const input = ref<InstanceType<typeof FrameTextField>>();
const combo = ref<{highlightItem: (value: string) => void}>();
const query = ref(props.initialQuery ?? '');
const selectedId = ref(props.initialSelectedId ?? '');
watch([query, selectedId], () =>
  emit('state', {query: query.value, selectedId: selectedId.value})
);
const results = computed(() => {
  const text =
    props.searchable === false ? '' : query.value.trim().toLowerCase();
  return props.items.filter((item) =>
    `${item.label} ${item.detail ?? ''} ${item.description ?? ''}`
      .toLowerCase()
      .includes(text)
  );
});
const enabledResults = computed(() =>
  results.value.filter(
    (item) =>
      !item.disabled && item.type !== 'separator' && item.type !== 'heading'
  )
);
watch(
  [results, query, enabledResults],
  async () => {
    if (!enabledResults.value.some((item) => item.id === selectedId.value))
      selectedId.value = enabledResults.value[0]?.id ?? '';
    await nextTick();
    if (selectedId.value) combo.value?.highlightItem(selectedId.value);
  },
  {immediate: true}
);
function accept(value: unknown) {
  const id = String(value);
  if (
    props.items.some(
      (item) =>
        item.id === id &&
        !item.disabled &&
        item.type !== 'separator' &&
        item.type !== 'heading'
    )
  )
    emit('accept', id);
}
function escape(event: KeyboardEvent) {
  if (event.isComposing) return;
  event.preventDefault();
  event.stopPropagation();
  emit('close');
}
watch(query, (value) => {
  if (props.mode === 'pick' || operator.value) return;
  const category = categories.value.find(
    (item) =>
      value.startsWith(item.prefix) &&
      /^\s/.test(value.slice(item.prefix.length))
  );
  if (category) {
    query.value = value.slice(category.prefix.length).trimStart();
    emit('mode', category.prefix === '>' ? 'frame' : category.prefix);
  }
});
function compositionKey(event: KeyboardEvent) {
  if (event.isComposing) {
    if (['Enter', 'Escape'].includes(event.key)) event.stopPropagation();
    return;
  }
  const target = event.target as HTMLInputElement;
  const category = categories.value.find((item) => item.prefix === query.value);
  if (
    props.mode !== 'pick' &&
    !operator.value &&
    category &&
    ['Tab', ' '].includes(event.key)
  ) {
    event.preventDefault();
    event.stopPropagation();
    query.value = '';
    emit('mode', category.prefix === '>' ? 'frame' : category.prefix);
  } else if (
    props.mode !== 'pick' &&
    operator.value &&
    event.key === 'Backspace' &&
    target.selectionStart === 0 &&
    target.selectionEnd === 0
  ) {
    event.preventDefault();
    event.stopPropagation();
    emit('mode', 'application');
  }
}
const element = computed(() => input.value?.element);
defineExpose({element, focus: () => input.value?.focus()});
</script>
<template>
  <QuickOverlay :title="title" :position="position" @close="emit('close')">
    <component
      :is="searchable === false ? ListboxRoot : ComboboxRoot"
      ref="combo"
      as-child
      :open="true"
      :ignore-filter="true"
      :loop="true"
      :highlight-on-hover="true"
      :reset-search-term-on-select="false"
      @update:model-value="accept"
      @highlight="selectedId = String($event?.value ?? '')"
    >
      <div
        class="quick-input-content"
        style="
          display: flex;
          flex-direction: column;
          min-height: 0;
          flex: 1 1 auto;
        "
        @keydown.capture="compositionKey"
      >
        <div v-if="searchable !== false" class="palette-input">
          <span
            v-if="mode !== 'pick' && operator"
            class="quick-input-operator"
            :aria-label="`${title} operator`"
            >{{ operator }}</span
          ><ComboboxInput as-child v-model="query"
            ><FrameTextField
              ref="input"
              v-model="query"
              data-quick-autofocus
              :aria-label="title"
              :placeholder="placeholder"
          /></ComboboxInput>
        </div>
        <component
          :is="searchable === false ? ListboxContent : ComboboxContent"
          :tabindex="searchable === false ? 0 : undefined"
          :data-quick-autofocus="searchable === false ? '' : undefined"
          class="palette-results"
          :aria-label="title"
          @escape-key-down="escape"
        >
          <template v-for="item in results" :key="item.id">
            <div
              v-if="item.type === 'separator' || item.type === 'heading'"
              :role="item.type === 'separator' ? 'separator' : 'presentation'"
              class="picker-heading"
            >
              {{ item.label }}
            </div>
            <component
              :is="searchable === false ? ListboxItem : ComboboxItem"
              v-else
              :value="item.id"
              :text-value="item.label"
              :disabled="item.disabled"
              class="command-result"
              :class="{active: selectedId === item.id, disabled: item.disabled}"
              @mousedown.prevent
            >
              <slot name="item" :item="item" :active="selectedId === item.id"
                ><span
                  v-if="item.icon"
                  class="quick-input-icon"
                  aria-hidden="true"
                  ><FrameIcon
                    v-if="typeof item.icon === 'string'"
                    :name="item.icon"
                    :size="16" /><component v-else :is="item.icon" /></span
                ><span class="command-label"
                  ><QuickPickText :text="item.label" :query="query" /></span
                ><small v-if="item.detail"
                  ><QuickPickText :text="item.detail" :query="query" /></small
                ><small v-if="item.description">{{ item.description }}</small
                ><small v-if="item.sectionLabel" class="picker-section">{{
                  item.sectionLabel
                }}</small
                ><span v-if="item.selected" aria-label="Selected">✓</span
                ><span v-if="item.items" aria-hidden="true">›</span
                ><button
                  v-for="action in item.actions"
                  :key="action.id"
                  type="button"
                  :aria-label="action.label"
                  :disabled="item.disabled"
                  @mousedown.stop
                  @keydown.enter.stop
                  @keydown.space.stop
                  @click.stop="!item.disabled && action.run()"
                >
                  <FrameIcon
                    v-if="action.icon"
                    :name="action.icon"
                    :size="16"
                  /><span v-else>{{ action.label }}</span></button
                ><kbd v-if="item.shortcut">{{ item.shortcut }}</kbd></slot
              >
            </component>
          </template>
          <p v-if="!results.length" class="no-results" role="status">
            No matching actions.
          </p>
        </component>
      </div>
    </component>
  </QuickOverlay>
</template>

<style lang="scss" scoped>
.picker-heading {
  padding: 6px 12px;
  border-top: 1px solid var(--frame-border);
  color: var(--frame-text-muted);
}
.picker-section {
  margin-left: auto;
}
.palette-input {
  display: flex;
  align-items: center;
  gap: var(--frame-spacing-unit, 4px);
}
.quick-input-operator {
  color: var(--frame-text);
  background: var(--frame-input-bg, var(--frame-overlay-background));
  border-radius: var(--frame-radius-small, 3px);
  padding: 2px 8px;
  font-family: var(--frame-font-mono);
}
.palette-input :deep(input) {
  min-width: 0;
  flex: 1;
}
</style>

<style lang="scss">
.palette-input {
  flex-shrink: 0;
  padding-bottom: var(--frame-palette-input-padding-bottom, 5px);
}

.palette-results {
  overflow: auto;
  min-height: var(--frame-palette-results-min-height, 0);
}

.command-result {
  display: flex;
  align-items: center;
  gap: var(--frame-command-result-gap, 10px);
  min-height: var(--frame-command-result-min-height, 23px);
  padding: var(--frame-command-result-padding, 2px 7px);
  border-radius: var(
    --frame-command-result-border-radius,
    var(--frame-radius-medium)
  );
  cursor: pointer;
  font-size: var(--frame-command-result-font-size, 12px);
}

.command-result.active {
  background: var(--frame-command-result-active-background, #344b57);
  color: var(--frame-command-result-active-color, #f0f4f6);
}

.command-label {
  flex-shrink: 0;
}

.command-result small {
  flex: 1;
  min-width: var(--frame-command-result-small-min-width, 0);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: var(--frame-command-result-small-font-size, 10px);
  color: var(--frame-command-result-small-color, #8f9ba1);
}

.command-result.active small {
  color: inherit;
}

.command-result kbd {
  margin-left: auto;
  flex-shrink: 0;
  font-size: var(--frame-command-result-kbd-font-size, 9px);
  line-height: var(--frame-command-result-kbd-line-height, 14px);
  background: var(--frame-command-result-kbd-background, #ffffff08);
  border-color: var(--frame-command-result-kbd-border-color, #ffffff10);
}

.command-result.disabled {
  color: var(--frame-command-result-disabled-color, #68747a);
  cursor: default;
}

.no-results {
  color: var(--frame-no-results-color, #99a6ad);
  font-size: var(--frame-no-results-font-size, 12px);
  padding: var(--frame-no-results-padding, 10px 7px);
}

@media (max-width: 540px) {
  .command-result {
    font-size: var(--frame-command-result-font-size-2, 11px);
  }
  .command-result small {
    display: none;
  }
  .command-label {
    flex: 1;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}

.quick-input-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex: 0 0 16px;
}

.quick-input-icon > * {
  width: 16px;
  height: 16px;
}
</style>
