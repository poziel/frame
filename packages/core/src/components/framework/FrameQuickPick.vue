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
    /** Available quick-pick entries; disabled, heading, and separator rows cannot be accepted. */
    items: readonly QuickPickItem[];
    /** Visible heading and accessible name for this presentation. */
    title: string;
    /** Prompt shown when the input is empty. */
    placeholder?: string;
    /** Preferred quick-input placement at the top or center of the owning shell. */
    position?: 'top' | 'center';
    /** Quick-pick mode used to select the command operator and category behavior. */
    mode?: 'application' | 'frame' | 'pick';
    /** Explicit active command-prefix category, overriding the mode-derived operator. */
    category?: string;
    /** Enables filtering by the typed query unless explicitly false. */
    searchable?: boolean;
    /** Initial input query for this picker presentation. */
    initialQuery?: string;
    /** Initial highlighted entry ID, repaired when unavailable in the filtered results. */
    initialSelectedId?: string;
    /** Available command-prefix categories; defaults to the Frame commands category. */
    categories?: readonly import('../../framework/commands/commandPrefixes').CommandPrefix[];
  }>(),
  {placeholder: 'Type to search…'}
);
const emit = defineEmits<{
  /** Requests dismissal of this presentation without disposing its owning controller. */
  close: [];
  /** Reports acceptance of an available quick-pick entry ID. */
  accept: [id: string];
  /** Reports a command-prefix category change requested by input. */
  mode: [mode: string];
  /** Reports the current query and highlighted entry for host restoration. */
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
defineExpose({
  /** Search input element, when mounted, for host focus integration. */
  element,
  /** Focuses the active input or terminal surface without creating or disposing its owning controller. */
  focus: () => input.value?.focus(),
});
defineSlots<{
  /** Replaces one result row's content while retaining picker selection and accessibility behavior. */ item?(
    props: {
    item: QuickPickItem;
    active: boolean;
  }
  ): unknown;
}>();
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
  /* border used by border in .picker-heading. @token --frame-border @context */
  /* text muted used by padding in .picker-heading. @token --frame-text-muted @context */
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
  /* Space between children for .palette-input. @token --frame-spacing-unit */
  --_frame-default-spacing-unit-fb33760b58: 4px;
  gap: var(--frame-spacing-unit, var(--_frame-default-spacing-unit-fb33760b58));
}
.quick-input-operator {
  /* Primary foreground for readable text and icons across shell and application content. @token --frame-text @context */
  color: var(--frame-text);
  /* Background for .quick-input-operator. @token --frame-input-bg */
  --_frame-default-input-bg-b13a1ddb7f: var(--frame-overlay-background);
  background: var(--frame-input-bg, var(--_frame-default-input-bg-b13a1ddb7f));
  /* Corner radius for .quick-input-operator. @token --frame-radius-small */
  --_frame-default-radius-small-a00d8c947a: 3px;
  border-radius: var(
    --frame-radius-small,
    var(--_frame-default-radius-small-a00d8c947a)
  );
  padding: 2px 8px;
  /* Monospace font family for code, terminal text, and fixed-width content. @token --frame-font-mono @context */
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
  /* Bottom internal spacing for .palette-input. @token --frame-palette-input-padding-bottom */
  --_frame-default-palette-input-padding-bottom-bbd520cfb4: 5px;
  padding-bottom: var(
    --frame-palette-input-padding-bottom,
    var(--_frame-default-palette-input-padding-bottom-bbd520cfb4)
  );
}

.palette-results {
  overflow: auto;
  /* Minimum height for .palette-results. @token --frame-palette-results-min-height */
  --_frame-default-palette-results-min-height-08300150f8: 0;
  min-height: var(
    --frame-palette-results-min-height,
    var(--_frame-default-palette-results-min-height-08300150f8)
  );
}

.command-result {
  display: flex;
  align-items: center;
  /* Space between children for .command-result. @token --frame-command-result-gap */
  --_frame-default-command-result-gap-120997ed78: 10px;
  gap: var(
    --frame-command-result-gap,
    var(--_frame-default-command-result-gap-120997ed78)
  );
  /* Minimum height for .command-result. @token --frame-command-result-min-height */
  --_frame-default-command-result-min-height-b94eac5173: 23px;
  min-height: var(
    --frame-command-result-min-height,
    var(--_frame-default-command-result-min-height-b94eac5173)
  );
  /* Internal spacing for .command-result. @token --frame-command-result-padding */
  --_frame-default-command-result-padding-b0caa94d91: 2px 7px;
  padding: var(
    --frame-command-result-padding,
    var(--_frame-default-command-result-padding-b0caa94d91)
  );
  /* Corner radius for .command-result. @token --frame-command-result-border-radius */
  --_frame-default-command-result-border-radius-29508278b3: var(
    --frame-radius-medium
  );
  /* Medium shared corner radius used by ordinary controls. @token --frame-radius-medium @context */
  border-radius: var(
    --frame-command-result-border-radius,
    var(--_frame-default-command-result-border-radius-29508278b3)
  );
  cursor: pointer;
  /* Text size for .command-result. @token --frame-command-result-font-size */
  --_frame-default-command-result-font-size-9a4ee7cad9: 12px;
  font-size: var(
    --frame-command-result-font-size,
    var(--_frame-default-command-result-font-size-9a4ee7cad9)
  );
}

.command-result.active {
  /* Background for .command-result.active. @token --frame-command-result-active-background */
  --_frame-default-command-result-active-background-845017fde3: #344b57;
  background: var(
    --frame-command-result-active-background,
    var(--_frame-default-command-result-active-background-845017fde3)
  );
  /* Foreground for .command-result.active. @token --frame-command-result-active-color */
  --_frame-default-command-result-active-color-8a1b3705a7: #f0f4f6;
  color: var(
    --frame-command-result-active-color,
    var(--_frame-default-command-result-active-color-8a1b3705a7)
  );
}

.command-label {
  flex-shrink: 0;
}

.command-result small {
  flex: 1;
  /* Minimum width for .command-result small. @token --frame-command-result-small-min-width */
  --_frame-default-command-result-small-min-width-9417cc934a: 0;
  min-width: var(
    --frame-command-result-small-min-width,
    var(--_frame-default-command-result-small-min-width-9417cc934a)
  );
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  /* Text size for .command-result small. @token --frame-command-result-small-font-size */
  --_frame-default-command-result-small-font-size-6070e35c6d: 10px;
  font-size: var(
    --frame-command-result-small-font-size,
    var(--_frame-default-command-result-small-font-size-6070e35c6d)
  );
  /* Foreground for .command-result small. @token --frame-command-result-small-color */
  --_frame-default-command-result-small-color-955ccfffdd: #8f9ba1;
  color: var(
    --frame-command-result-small-color,
    var(--_frame-default-command-result-small-color-955ccfffdd)
  );
}

.command-result.active small {
  color: inherit;
}

.command-result kbd {
  margin-left: auto;
  flex-shrink: 0;
  /* Text size for .command-result kbd. @token --frame-command-result-kbd-font-size */
  --_frame-default-command-result-kbd-font-size-f16f478185: 9px;
  font-size: var(
    --frame-command-result-kbd-font-size,
    var(--_frame-default-command-result-kbd-font-size-f16f478185)
  );
  /* Text line height for .command-result kbd. @token --frame-command-result-kbd-line-height */
  --_frame-default-command-result-kbd-line-height-364fdfeb23: 14px;
  line-height: var(
    --frame-command-result-kbd-line-height,
    var(--_frame-default-command-result-kbd-line-height-364fdfeb23)
  );
  /* Background for .command-result kbd. @token --frame-command-result-kbd-background */
  --_frame-default-command-result-kbd-background-aa34306749: #ffffff08;
  background: var(
    --frame-command-result-kbd-background,
    var(--_frame-default-command-result-kbd-background-aa34306749)
  );
  /* Border color for .command-result kbd. @token --frame-command-result-kbd-border-color */
  --_frame-default-command-result-kbd-border-color-93c1506541: #ffffff10;
  border-color: var(
    --frame-command-result-kbd-border-color,
    var(--_frame-default-command-result-kbd-border-color-93c1506541)
  );
}

.command-result.disabled {
  /* Foreground for .command-result.disabled. @token --frame-command-result-disabled-color */
  --_frame-default-command-result-disabled-color-624b752ba4: #68747a;
  color: var(
    --frame-command-result-disabled-color,
    var(--_frame-default-command-result-disabled-color-624b752ba4)
  );
  cursor: default;
}

.no-results {
  /* Foreground for .no-results. @token --frame-no-results-color */
  --_frame-default-no-results-color-bccd5734a7: #99a6ad;
  color: var(
    --frame-no-results-color,
    var(--_frame-default-no-results-color-bccd5734a7)
  );
  /* Text size for .no-results. @token --frame-no-results-font-size */
  --_frame-default-no-results-font-size-da93e2e2a9: 12px;
  font-size: var(
    --frame-no-results-font-size,
    var(--_frame-default-no-results-font-size-da93e2e2a9)
  );
  /* Internal spacing for .no-results. @token --frame-no-results-padding */
  --_frame-default-no-results-padding-258adc9f77: 10px 7px;
  padding: var(
    --frame-no-results-padding,
    var(--_frame-default-no-results-padding-258adc9f77)
  );
}

@media (max-width: 540px) {
  .command-result {
    /* Text size for .command-result. @token --frame-command-result-font-size-2 */
    --_frame-default-command-result-font-size-2-09450167b1: 11px;
    font-size: var(
      --frame-command-result-font-size-2,
      var(--_frame-default-command-result-font-size-2-09450167b1)
    );
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
