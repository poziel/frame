<script setup lang="ts">
import {computed, nextTick, ref} from 'vue';
import {useFrame} from '../../framework/useFrame';
import {
  normalizeShortcut,
  shortcutFromEvent,
} from '../../framework/shortcuts/shortcuts';
import FrameDialog from '../overlays/FrameDialog.vue';
import FrameKeycap from '../data-display/FrameKeycap.vue';
import FrameIconButton from '../actions/FrameIconButton.vue';

const frame = useFrame();
const props = defineProps<{
  /** Controlled filter query; omission keeps a component-local query. */
  search?: string;
  /** Hides the local search field so a host can provide its own filter control. */
  hideSearch?: boolean;
}>();
const emit = defineEmits<{
  /** Requests an updated controlled filter query. */
  'update:search': [value: string];
  /** Requests focus in the host-provided search control. */
  'focus-search': [];
}>();
const ownSearch = ref('');
const search = computed({
  get: () => props.search ?? ownSearch.value,
  set: (value) => {
    ownSearch.value = value;
    emit('update:search', value);
  },
});
const editing = ref<string>();
const candidate = ref('');
const capture = ref<HTMLInputElement>();
const searchInput = ref<HTMLInputElement>();
const opener = ref<HTMLElement>();
const source = (command: {source?: string; scope?: string}) =>
  command.source ?? (command.scope === 'frame' ? 'Frame' : 'Application');
const when = (command: {id: string}) =>
  frame.commands.getShortcutCondition(command.id).label;
const rows = computed(() => {
  const query = search.value.trim().toLowerCase();
  return frame.commands
    .list()
    .filter((command) => {
      if (query.startsWith('key:'))
        return (
          !!command.shortcut &&
          normalizeShortcut(command.shortcut).toLowerCase() === query.slice(4)
        );
      return [
        command.label,
        command.id,
        command.shortcut ?? '',
        source(command),
        when(command),
        command.detail ?? '',
      ]
        .join(' ')
        .toLowerCase()
        .includes(query);
    })
    .slice()
    .sort((a, b) => a.label.localeCompare(b.label));
});
const conflicts = computed(() =>
  candidate.value
    ? frame.commands
        .list()
        .filter(
          (command) =>
            command.id !== editing.value &&
            command.shortcut &&
            normalizeShortcut(command.shortcut) ===
              normalizeShortcut(candidate.value)
        )
    : []
);
const command = computed(() =>
  editing.value ? frame.commands.get(editing.value) : undefined
);
async function edit(id: string, event: Event) {
  opener.value = event.currentTarget as HTMLElement;
  candidate.value = '';
  editing.value = id;
  await nextTick();
  capture.value?.focus();
}
function close() {
  editing.value = undefined;
  void nextTick(() => opener.value?.focus());
}
function record(event: KeyboardEvent) {
  if (event.key === 'Tab' && candidate.value) return;
  event.preventDefault();
  event.stopPropagation();
  if (event.repeat) return;
  const plain =
    !event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey;
  if (event.key === 'Escape' && plain) {
    close();
    return;
  }
  if (event.key === 'Enter' && plain && candidate.value) {
    if (editing.value && frame.commands.get(editing.value))
      frame.commands.setKeybinding(editing.value, candidate.value);
    close();
    return;
  }
  const value = shortcutFromEvent(event);
  if (value) candidate.value = value;
}
function showConflicts() {
  search.value = 'key:' + normalizeShortcut(candidate.value).toLowerCase();
  close();
  void nextTick(() => {
    searchInput.value?.focus();
    emit('focus-search');
  });
}
</script>
<template>
  <section class="frame-keybindings" aria-label="Keyboard shortcuts">
    <input
      v-if="!hideSearch"
      ref="searchInput"
      v-model="search"
      class="shortcut-search"
      type="search"
      aria-label="Search keyboard shortcuts"
      placeholder="Search commands, keybindings, conditions, or source"
    />
    <div class="shortcut-scroll">
      <table>
        <thead
          ><tr
            ><th class="shortcut-actions-heading"
              ><span class="shortcut-sr-only">Actions</span></th
            ><th>Command</th><th>Keybinding</th><th>When</th><th>Source</th></tr
          ></thead
        >
        <tbody>
          <tr
            v-for="item in rows"
            :key="item.id"
            tabindex="0"
            @dblclick="edit(item.id, $event)"
            @keydown.enter.self.prevent="edit(item.id, $event)"
          >
            <td class="shortcut-actions"
              ><div class="shortcut-action-line">
                <FrameIconButton
                  :icon="item.shortcut ? 'edit' : 'add'"
                  :label="
                    (item.shortcut
                      ? 'Edit shortcut for '
                      : 'Add shortcut for ') + item.label
                  "
                  :size="22"
                  @click="edit(item.id, $event)"
                  @dblclick.stop
                />
                <span class="shortcut-binding-actions">
                  <FrameIconButton
                    v-if="item.shortcut"
                    icon="close"
                    :size="20"
                    :label="'Remove shortcut for ' + item.label"
                    @click="frame.commands.setKeybinding(item.id, null)"
                    @dblclick.stop
                  />
                  <FrameIconButton
                    v-if="
                      Object.prototype.hasOwnProperty.call(
                        frame.commands.getKeybindings(),
                        item.id
                      )
                    "
                    icon="discard"
                    :size="20"
                    :label="'Reset shortcut for ' + item.label"
                    @click="frame.commands.resetKeybinding(item.id)"
                    @dblclick.stop
                  />
                </span> </div
            ></td>
            <td class="shortcut-command"
              >{{ item.label }}<small>{{ item.id }}</small></td
            >
            <td class="shortcut-binding"
              ><FrameKeycap :shortcut="item.shortcut"
            /></td>
            <td class="shortcut-when" :title="when(item)">{{
              when(item) || '—'
            }}</td>
            <td>{{ source(item) }}</td>
          </tr>
        </tbody>
      </table>
      <p v-if="!rows.length" role="status">No matching commands.</p>
    </div>
    <FrameDialog
      :open="!!editing"
      :title="'Change shortcut: ' + (command?.label ?? '')"
      hide-title
      :footer="false"
      class="shortcut-capture-dialog"
      description="Press desired key combination then press ENTER. ESC to cancels."
      @update:open="!$event && close()"
      @open-auto-focus.prevent="capture?.focus()"
    >
      <template #trigger><span /></template>
      <div class="shortcut-capture" data-frame-shortcut-capture>
        <input
          ref="capture"
          class="shortcut-search"
          :value="candidate"
          aria-label="Press desired key combination"
          readonly
          @keydown="record"
        />
        <div v-if="candidate" class="shortcut-capture-keys" aria-live="polite"
          ><FrameKeycap :shortcut="candidate"
        /></div>
        <a
          v-if="conflicts.length"
          class="shortcut-conflicts"
          :href="'#keybinding=' + encodeURIComponent(candidate)"
          @click.prevent="showConflicts"
          >{{ conflicts.length }} other command(s) use this keybinding. Show
          matches</a
        >
      </div>
    </FrameDialog>
  </section>
</template>
<style lang="scss" scoped>
.frame-keybindings {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  /* Space between children for .frame-keybindings. @token --frame-keybindings-gap */
  --_frame-default-keybindings-gap-866e0a3588: 12px;
  gap: var(
    --frame-keybindings-gap,
    var(--_frame-default-keybindings-gap-866e0a3588)
  );
  height: 100%;
  min-height: 0;
  /* Internal spacing for .frame-keybindings. @token --frame-keybindings-padding */
  --_frame-default-keybindings-padding-11b0e9a904: 16px;
  padding: var(
    --frame-keybindings-padding,
    var(--_frame-default-keybindings-padding-11b0e9a904)
  );
  /* Primary foreground for readable text and icons across shell and application content. @token --frame-text @context */
  color: var(--frame-text);
  font: inherit;
}
.shortcut-search {
  box-sizing: border-box;
  width: 100%;
  padding: 8px 10px;
  /* Background for .shortcut-search. @token --frame-control-background */
  --_frame-default-control-background-b9ae3de79a: var(--frame-bg);
  background: var(
    --frame-control-background,
    var(--_frame-default-control-background-b9ae3de79a)
  );
  color: inherit;
  /* Shared resting border color inherited by menus and form controls. @token --frame-border-color @context */
  border: 1px solid var(--frame-border-color);
  /* Corner radius for .shortcut-search. @token --frame-radius-medium */
  --_frame-default-radius-medium-d2eb911727: 4px;
  border-radius: var(
    --frame-radius-medium,
    var(--_frame-default-radius-medium-d2eb911727)
  );
  font: inherit;
}
.shortcut-scroll {
  overflow: auto;
  min-height: 0;
  isolation: isolate;
}
table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  text-align: left;
  font-size: inherit;
}
th {
  position: sticky;
  top: 0;
  z-index: 2;
  /* Background for th. Used when --frame-keybindings-header-background is unset. @token --frame-surface-solid */
  --_frame-default-surface-solid-40b9a4572b: #202020;
  /* Background for th. @token --frame-keybindings-header-background */
  --_frame-default-keybindings-header-background-b34c4002e8: var(
    --frame-surface-solid,
    var(--_frame-default-surface-solid-40b9a4572b)
  );
  background: var(
    --frame-keybindings-header-background,
    var(--_frame-default-keybindings-header-background-b34c4002e8)
  );
  /* Primary foreground for readable text and icons across shell and application content. @token --frame-text @context */
  color: var(--frame-text);
  font-weight: 600;
}
th,
td {
  /* Internal spacing for th, td. @token --frame-keybindings-cell-padding */
  --_frame-default-keybindings-cell-padding-3d327e1530: 6px 10px;
  padding: var(
    --frame-keybindings-cell-padding,
    var(--_frame-default-keybindings-cell-padding-3d327e1530)
  );
  vertical-align: middle;
}
thead tr,
tbody tr {
  /* Shared resting border color inherited by menus and form controls. @token --frame-border-color @context */
  border-bottom: 1px solid var(--frame-border-color);
}
tr:nth-child(even) {
  /* Background for tr:nth-child(even). @token --frame-keybindings-alternate-background */
  --_frame-default-keybindings-alternate-background-fae16c87b8: var(
    --frame-list-hover-background
  );
  background: var(
    --frame-keybindings-alternate-background,
    var(--_frame-default-keybindings-alternate-background-fae16c87b8)
  );
}
tbody tr:hover,
tbody tr:focus-within {
  /* Background of a selected application list row. @token --frame-list-selection-background @context */
  background: var(--frame-list-selection-background);
}
.shortcut-command {
  min-width: 180px;
}
small {
  display: block;
  /* Secondary foreground for descriptions, hints, and visually subordinate content. @token --frame-muted @context */
  color: var(--frame-muted);
  font-size: 0.85em;
}
.shortcut-actions-heading,
.shortcut-actions {
  width: 70px;
  white-space: nowrap;
  padding-left: 4px;
  padding-right: 4px;
}
.shortcut-action-line {
  display: flex;
  align-items: center;
  gap: 2px;
  white-space: nowrap;
  /* Foreground for .shortcut-action-line. @token --frame-keybindings-action-color */
  --_frame-default-keybindings-action-color-1c6d1c0a7e: #d4d4d4;
  color: var(
    --frame-keybindings-action-color,
    var(--_frame-default-keybindings-action-color-1c6d1c0a7e)
  );
}
.shortcut-action-line :deep(button) {
  flex: none;
}
.shortcut-action-line :deep(button:hover) {
  /* Foreground for .shortcut-action-line :deep(button:hover). @token --frame-keybindings-action-hover-color */
  --_frame-default-keybindings-action-hover-color-fc66766c48: #ffffff;
  color: var(
    --frame-keybindings-action-hover-color,
    var(--_frame-default-keybindings-action-hover-color-fc66766c48)
  );
  /* Background for .shortcut-action-line :deep(button:hover). @token --frame-keybindings-action-hover-background */
  --_frame-default-keybindings-action-hover-background-84a1e95e4a: #3c3c3c;
  background: var(
    --frame-keybindings-action-hover-background,
    var(--_frame-default-keybindings-action-hover-background-84a1e95e4a)
  );
}
.shortcut-actions :deep(button),
.shortcut-binding-actions {
  opacity: 0;
}
tr:hover .shortcut-actions :deep(button),
tr:focus-within .shortcut-actions :deep(button),
tr:hover .shortcut-binding-actions,
tr:focus-within .shortcut-binding-actions {
  opacity: 1;
}
.shortcut-binding {
  white-space: nowrap;
  min-width: 140px;
}
.shortcut-binding-actions {
  display: inline-flex;
  gap: 2px;
  margin-left: 2px;
  vertical-align: middle;
}
.shortcut-when {
  /* Font family for .shortcut-when. @token --frame-font-mono */
  --_frame-default-font-mono-3920a95058: monospace;
  font-family: var(
    --frame-font-mono,
    var(--_frame-default-font-mono-3920a95058)
  );
  font-size: 0.9em;
  max-width: 320px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.shortcut-capture {
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: center;
}
.shortcut-capture .shortcut-search {
  text-align: center;
}
.shortcut-capture-keys {
  min-height: 20px;
}
.shortcut-conflicts {
  /* Primary foreground for readable text and icons across shell and application content. @token --frame-text @context */
  color: var(--frame-text);
  text-decoration: underline;
  font: inherit;
}
:global(.shortcut-capture-dialog) {
  width: min(440px, calc(100vw - 32px));
}
:global(.shortcut-capture-dialog .frame-general-description) {
  text-align: center;
}
input:focus-visible,
tr:focus-visible {
  /* Shared interaction color for keyboard focus, active actions, and accent-filled controls. @token --frame-accent @context */
  outline: 1px solid var(--frame-accent);
  outline-offset: -1px;
}
.shortcut-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}
@media (hover: none) {
  .shortcut-actions :deep(button),
  .shortcut-binding-actions {
    opacity: 1;
  }
}
</style>
