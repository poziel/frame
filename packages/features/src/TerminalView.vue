<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, useId, watch } from 'vue';
import { FrameButton, FrameColorPicker, FrameIcon, FrameIconButton, FrameMenu, FrameSelect, FrameTextInput, FrameTooltip, ResizeHandle, type FrameMenuItem, type SelectItem } from '@frame/core';
import type { TerminalController, TerminalSession, TerminalSessionLayout } from './terminal';
import Terminal from './Terminal.vue';
const props = withDefaults(defineProps<{ terminal: TerminalController; toolbar?: boolean; autoStart?: boolean; sidebar?: boolean; sessionLayout?: TerminalSessionLayout }>(), { toolbar: true, autoStart: true, sidebar: true, sessionLayout: 'sidebar' });
const localId = useId();
const selectedProfile = ref(''), showSidebar = ref(props.sidebar), showSearch = ref(false), query = ref(''), found = ref(true);
const sessionLayout = ref(props.sessionLayout);
watch(() => props.sessionLayout, value => { sessionLayout.value = value; });
const selectorVisible = computed(() => showSidebar.value && props.terminal.sessions.value.length > 1);
const body = ref<HTMLElement>(), panes = ref<HTMLElement>();
const bodyWidth = ref(0), panesWidth = ref(0), sidebarWidth = ref(210);
const paneWeights = ref<Record<string, number>>({});
const sidebarMax = computed(() => Math.max(0, bodyWidth.value - Math.min(160, bodyWidth.value / 2)));
const sidebarMin = computed(() => Math.min(100, sidebarMax.value));
const sidebarSize = computed(() => Math.max(sidebarMin.value, Math.min(sidebarMax.value, sidebarWidth.value)));
const renameId = ref<string>(), renameText = ref('');
const renameInput = ref<InstanceType<typeof FrameTextInput>>(), searchInput = ref<InstanceType<typeof FrameTextInput>>();
const menuAnchor = ref<InstanceType<typeof FrameIconButton>>(), menuOpen = ref(false);
const externalMenuAnchor = shallowRef<HTMLElement>();
const menuTarget = computed(() => externalMenuAnchor.value ?? menuAnchor.value?.element);
const contextAnchor = shallowRef<HTMLElement>(), contextId = ref<string>(), contextPoint = ref({ x: 0, y: 0 });
const colorId = ref<string>();
const colorSession = computed(() => props.terminal.sessions.value.find(s => s.id === colorId.value));
const sessionItems: FrameMenuItem[] = [{ id: 'rename', label: 'Rename terminal' }, { id: 'color', label: 'Change terminal color' }];
const terminals = new Map<string, InstanceType<typeof Terminal>>();
const active = computed(() => props.terminal.sessions.value.find(s => s.id === props.terminal.activeId.value));
const group = computed(() => props.terminal.groups.value.find(g => g.includes(props.terminal.activeId.value ?? '')) ?? []);
const fractions = computed(() => {
  const saved = group.value.map(id => paneWeights.value[id]).filter((weight): weight is number => weight !== undefined && weight > 0);
  const fallback = saved.length ? saved.reduce((sum, weight) => sum + weight, 0) / saved.length : 1;
  return group.value.map(id => paneWeights.value[id] ?? fallback);
});
const paneSizes = computed(() => {
  const total = fractions.value.reduce((sum, weight) => sum + weight, 0);
  return fractions.value.map(weight => total ? panesWidth.value * weight / total : 0);
});
const paneColumns = computed(() => fractions.value.length ? fractions.value.flatMap(weight => [`minmax(0, ${weight}fr)`, '0px']).slice(0, -1).join(' ') : 'minmax(0, 1fr)');
function resizePane(index: number, value: number) {
  const sizes = [...paneSizes.value];
  const total = (sizes[index] ?? 0) + (sizes[index + 1] ?? 0);
  if (!total) return;
  const minimum = Math.min(80, total / 2);
  sizes[index] = Math.max(minimum, Math.min(total - minimum, value));
  sizes[index + 1] = total - sizes[index]!;
  paneWeights.value = { ...paneWeights.value, ...Object.fromEntries(group.value.map((id, i) => [id, sizes[i]!])) };
}
function resetPanes() { const weights = { ...paneWeights.value }; for (const id of group.value) delete weights[id]; paneWeights.value = weights; }
const sidebarGroups = computed(() => {
  const sessions = new Map(props.terminal.sessions.value.map(session => [session.id, session]));
  return props.terminal.groups.value.map(ids => ids.map(id => sessions.get(id)).filter((session): session is Readonly<TerminalSession> => !!session)).filter(group => group.length);
});
const profileOptions = computed<SelectItem[]>(() => props.terminal.profiles.value.map(p => ({ value: p.id, label: p.name, description: p.path, detail: p.default ? 'default' : undefined })));
const items = computed<FrameMenuItem[]>(() => [
  { id: 'search', label: 'Find in terminal', shortcut: 'Ctrl+F', disabled: !active.value },
  { id: 'clear', label: 'Clear terminal', disabled: !active.value },
  { id: 'sidebar', label: sessionLayout.value === 'tabs' ? 'Show terminal tabs' : 'Show terminal sidebar', checked: showSidebar.value },
  { id: 'layout-tabs', label: 'Show terminals as tabs', checked: sessionLayout.value === 'tabs' },
  { id: 'layout-sidebar', label: 'Show terminals as sidebar', checked: sessionLayout.value === 'sidebar' },
  { id: 'unsplit', label: 'Separate split terminals', disabled: group.value.length < 2 },
]);
async function run(action: () => unknown | Promise<unknown>) { try { await action(); } catch (cause) { props.terminal.reportError(cause); } }
async function create(split = false) { await run(async () => { const session = await props.terminal.create(selectedProfile.value || undefined, { split }); await nextTick(); terminals.get(session.id)?.focus(); }); }
async function activate(id: string) { props.terminal.activate(id); await nextTick(); terminals.get(id)?.focus(); }
let selectingTabWithKeyboard = false;
watch(() => props.terminal.activeId.value, async id => { const focusTerminal = !selectingTabWithKeyboard; await nextTick(); if (id && focusTerminal) terminals.get(id)?.focus(); }, { flush: 'post' });
async function sessionKey(event: KeyboardEvent, id: string) {
  sessionMenu(event, id);
  if (sessionLayout.value !== 'tabs' || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault(); event.stopPropagation();
  const sessions = props.terminal.sessions.value;
  const index = sessions.findIndex(session => session.id === id);
  const next = event.key === 'Home' ? sessions[0] : event.key === 'End' ? sessions[sessions.length - 1] : sessions[(index + (event.key === 'ArrowRight' ? 1 : -1) + sessions.length) % sessions.length];
  if (!next) return;
  selectingTabWithKeyboard = true; props.terminal.activate(next.id);
  await nextTick(); document.getElementById(`${localId}-session-${next.id}`)?.focus(); selectingTabWithKeyboard = false;
}
function openMenu(anchor?: HTMLElement) { externalMenuAnchor.value = anchor; menuOpen.value = !menuOpen.value; }
function sessionMenu(event: MouseEvent | KeyboardEvent, id: string) {
  if (event instanceof KeyboardEvent && event.key !== 'ContextMenu' && !(event.shiftKey && event.key === 'F10')) return;
  event.preventDefault(); event.stopPropagation();
  const row = event.currentTarget as HTMLElement;
  const anchor = row.querySelector<HTMLButtonElement>('.frame-terminal-session-select');
  if (!anchor) return;
  const rect = anchor.getBoundingClientRect();
  contextPoint.value = event instanceof MouseEvent && (event.clientX || event.clientY) ? { x: event.clientX, y: event.clientY } : { x: rect.left, y: rect.bottom };
  contextId.value = id; contextAnchor.value = anchor;
}
function selectSession(item: FrameMenuItem) {
  const id = contextId.value;
  if (!id || item.type === 'separator') return;
  if (item.id === 'rename') { colorId.value = undefined; void rename(id); }
  if (item.id === 'color') { renameId.value = undefined; colorId.value = id; }
}
function finishColor() { colorId.value = undefined; terminals.get(props.terminal.activeId.value ?? '')?.focus(); }
async function searchOpen() { showSearch.value = true; await nextTick(); searchInput.value?.focus(); }
function search(previous = false) { found.value = terminals.get(props.terminal.activeId.value ?? '')?.search(query.value, previous) ?? false; }
function searchClose() { showSearch.value = false; query.value = ''; terminals.get(props.terminal.activeId.value ?? '')?.search(''); terminals.get(props.terminal.activeId.value ?? '')?.focus(); }
async function rename(id = props.terminal.activeId.value) { const session = props.terminal.sessions.value.find(s => s.id === id); if (!session) return; renameId.value = session.id; renameText.value = session.name; await nextTick(); renameInput.value?.focus(); renameInput.value?.element?.select(); }
function finishRename() { if (renameId.value) props.terminal.rename(renameId.value, renameText.value); renameId.value = undefined; }
function select(item: FrameMenuItem) {
  if (item.type === 'separator') return;
  if (item.id === 'rename') void rename();
  if (item.id === 'search') void searchOpen();
  if (item.id === 'clear') props.terminal.clear();
  if (item.id === 'sidebar') showSidebar.value = !showSidebar.value;
  if (item.id === 'layout-tabs') sessionLayout.value = 'tabs';
  if (item.id === 'layout-sidebar') sessionLayout.value = 'sidebar';
  if (item.id === 'unsplit') props.terminal.unsplit();
}
let observer: ResizeObserver | undefined;
onMounted(() => {
  const measure = () => { bodyWidth.value = body.value?.clientWidth ?? 0; panesWidth.value = panes.value?.clientWidth ?? 0; };
  observer = new ResizeObserver(measure);
  if (body.value) observer.observe(body.value);
  if (panes.value) observer.observe(panes.value);
  measure();
});
onBeforeUnmount(() => observer?.disconnect());
onMounted(() => run(async () => {
  const profiles = await props.terminal.detectProfiles();
  selectedProfile.value = profiles.find(p => p.default)?.id ?? profiles[0]?.id ?? '';
  if (props.autoStart && !props.terminal.sessions.value.length) await props.terminal.create();
  selectedProfile.value = active.value?.profile ?? selectedProfile.value;
}));
defineExpose({ create, search: searchOpen, rename, openMenu, toggleSidebar: () => { showSidebar.value = !showSidebar.value; } });
</script>
<template><div class="frame-terminal-view">
  <header v-if="toolbar" class="frame-terminal-toolbar">
    <span class="frame-terminal-title"><FrameIcon name="terminal"/>{{ active?.name ?? 'Terminal' }}</span>
    <FrameTooltip text="Shell profile used for new terminals" v-slot="{ describedby }"><FrameSelect v-model="selectedProfile" :options="profileOptions" label="Terminal profile" :aria-describedby="describedby" :disabled="!profileOptions.length" /></FrameTooltip>
    <FrameIconButton label="New terminal" icon="add" :disabled="!selectedProfile" @click="create()"/>
    <FrameIconButton label="Split terminal side by side" icon="split-horizontal" :disabled="!selectedProfile || !active" @click="create(true)"/>
    <FrameIconButton label="Clear terminal" icon="clear-all" :disabled="!active" @click="terminal.clear()"/>
    <FrameIconButton label="Close terminal session" icon="trash" :disabled="!active" @click="run(() => terminal.close(active!.id))"/>
    <FrameIconButton ref="menuAnchor" label="Terminal options" icon="ellipsis" :aria-expanded="menuOpen" @click="openMenu()"/>
  </header>
  <FrameMenu v-if="menuOpen && menuTarget" :anchor="menuTarget" :items="items" label="Terminal options" @close="menuOpen = false" @select="select"/>
  <FrameMenu v-if="contextAnchor" :anchor="contextAnchor" :point="contextPoint" :items="sessionItems" label="Terminal session options" @close="contextAnchor = undefined" @select="selectSession"/>
  <div v-if="showSearch" class="frame-terminal-search" @keydown.esc.stop="searchClose">
    <FrameTextInput ref="searchInput" :model-value="query" type="search" aria-label="Find in terminal" placeholder="Find in terminal" @update:model-value="query = String($event); search()" @keydown.enter.prevent="search($event.shiftKey)"/>
    <span v-if="query && !found" role="status">No match</span>
    <FrameIconButton label="Previous match" icon="arrow-up" @click="search(true)"/>
    <FrameIconButton label="Next match" icon="arrow-down" @click="search()"/>
    <FrameIconButton label="Close search" icon="close" @click="searchClose"/>
  </div>
  <div v-if="renameId" class="frame-terminal-rename">
    <label :for="`${localId}-rename`">Terminal name</label><FrameTextInput :id="`${localId}-rename`" ref="renameInput" :model-value="renameText" @update:model-value="renameText = String($event)" @keydown.enter.prevent="finishRename" @keydown.esc.stop="renameId = undefined"/>
    <FrameButton @click="finishRename">Save</FrameButton><FrameIconButton label="Cancel rename" icon="close" @click="renameId = undefined"/>
  </div>
  <div v-if="colorSession" class="frame-terminal-color" @keydown.esc.stop="finishColor">
    <label :for="`${localId}-color`">Color for {{ colorSession.name }}</label><FrameColorPicker :id="`${localId}-color`" :model-value="colorSession.color ?? '#cccccc'" @update:model-value="terminal.setColor(colorSession!.id, $event)"/>
    <FrameButton @click="finishColor">Done</FrameButton>
  </div>
  <div ref="body" class="frame-terminal-body" :class="{ 'with-sidebar': selectorVisible && sessionLayout === 'sidebar', 'with-tabs': selectorVisible && sessionLayout === 'tabs' }" :style="selectorVisible && sessionLayout === 'sidebar' ? { gridTemplateColumns: `minmax(0, 1fr) 0px ${sidebarSize}px` } : undefined">
    <div ref="panes" class="frame-terminal-panes" :style="{ gridTemplateColumns: paneColumns }">
      <div v-if="!group.length" class="frame-terminal-empty"><FrameIcon name="terminal" :size="32"/><p>No terminal sessions</p><p v-if="terminal.error.value" class="frame-terminal-error" role="alert">{{ terminal.error.value }}</p><FrameButton v-else :disabled="!selectedProfile" @click="create()">New terminal</FrameButton></div>
      <template v-for="(id, index) in group" :key="id"><section :id="`${localId}-terminal-${id}`" class="frame-terminal-pane" :class="{ active: terminal.activeId.value === id }" :style="{ gridColumn: index * 2 + 1 }" :role="sessionLayout === 'tabs' && selectorVisible ? 'tabpanel' : undefined" :aria-labelledby="sessionLayout === 'tabs' && selectorVisible ? `${localId}-session-${id}` : undefined">
        <Terminal :ref="value => { if (value) terminals.set(id, value as InstanceType<typeof Terminal>); else terminals.delete(id); }" :terminal="terminal" :session-id="id" :error-message="terminal.activeId.value === id ? terminal.error.value : undefined" @focus="terminal.activate" @find="searchOpen"/>
      </section><ResizeHandle v-if="index < group.length - 1" class="frame-terminal-pane-resize" :style="{ gridColumn: index * 2 + 2 }" axis="x" :label="`Resize terminal pane ${index + 1}`" :value="paneSizes[index] ?? 0" :min="Math.min(80, ((paneSizes[index] ?? 0) + (paneSizes[index + 1] ?? 0)) / 2)" :max="(paneSizes[index] ?? 0) + (paneSizes[index + 1] ?? 0) - Math.min(80, ((paneSizes[index] ?? 0) + (paneSizes[index + 1] ?? 0)) / 2)" @change="resizePane(index, $event)" @reset="resetPanes"/></template>
    </div>
    <ResizeHandle v-if="selectorVisible && sessionLayout === 'sidebar'" class="frame-terminal-sidebar-resize" axis="x" label="Resize terminal sidebar" reverse :value="sidebarSize" :min="sidebarMin" :max="sidebarMax" @change="sidebarWidth = $event" @reset="sidebarWidth = 210"/>
    <aside v-if="selectorVisible" :class="sessionLayout === 'tabs' ? 'frame-terminal-tabs' : 'frame-terminal-sidebar'" :role="sessionLayout === 'tabs' ? 'tablist' : undefined" :aria-label="sessionLayout === 'tabs' ? 'Terminal tabs' : 'Terminal sessions'">
      <div v-for="(sessions, index) in sidebarGroups" :key="sessions[0]!.id" class="frame-terminal-session-group" :class="{ 'split-group': sessions.length > 1 }" :role="sessionLayout === 'tabs' ? 'presentation' : 'group'" :aria-label="sessionLayout === 'sidebar' ? `${sessions.length > 1 ? 'Split terminal group' : 'Terminal group'} ${index + 1}` : undefined">
        <div v-for="session in sessions" :key="session.id" class="frame-terminal-session" :class="{ active: session.id === terminal.activeId.value }" :data-session-id="session.id" @contextmenu="sessionMenu($event, session.id)" @keydown="sessionKey($event, session.id)">
          <FrameTooltip class="frame-terminal-session-label" :text="`${session.name} · ${session.status}`" :placement="sessionLayout === 'tabs' ? 'bottom' : 'left'" v-slot="{ describedby }"><button :id="`${localId}-session-${session.id}`" type="button" class="frame-terminal-session-select" :role="sessionLayout === 'tabs' ? 'tab' : undefined" :tabindex="sessionLayout === 'tabs' ? (session.id === terminal.activeId.value ? 0 : -1) : undefined" :aria-selected="sessionLayout === 'tabs' ? session.id === terminal.activeId.value : undefined" :aria-controls="sessionLayout === 'tabs' && group.includes(session.id) ? `${localId}-terminal-${session.id}` : undefined" :aria-describedby="describedby" :aria-pressed="sessionLayout === 'sidebar' ? session.id === terminal.activeId.value : undefined" @click="activate(session.id)"><FrameIcon name="terminal" :style="{ color: session.color }"/><span>{{ session.name }}</span><small v-if="session.status !== 'running'">{{ session.status }}</small></button></FrameTooltip>
          <span class="frame-terminal-session-close"><FrameIconButton :label="`Close ${session.name}`" icon="close" :size="24" @click="run(() => terminal.close(session.id))"/></span>
        </div>
      </div>
    </aside>
  </div>
</div></template>
