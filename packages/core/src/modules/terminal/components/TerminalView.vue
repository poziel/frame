<script setup lang="ts">
import '../styles/index.scss';
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  useId,
  watch,
} from 'vue';
import {
  FrameButton,
  FrameColorPicker,
  FrameIcon,
  FrameIconButton,
  FrameMenu,
  FrameSelect,
  FrameTextField,
  FrameTooltip,
  ResizeHandle,
  type FrameMenuItem,
  type SelectItem,
} from '../../../index';
import type {
  TerminalController,
  TerminalSession,
  TerminalSessionLayout,
} from '../controllers/terminal';
import Terminal from './Terminal.vue';

const props = withDefaults(
  defineProps<{
    /** Caller-owned terminal controller; unmount detaches presentation without disposing the controller. */
    terminal: TerminalController;
    /** Displays the terminal toolbar; defaults to true. */
    toolbar?: boolean;
    /** Creates an initial terminal session on mount when none exist; defaults to true. */
    autoStart?: boolean;
    /** Initially offers the session selector sidebar; defaults to true. */
    sidebar?: boolean;
    /** Initial session presentation arrangement; defaults to sidebar. */
    sessionLayout?: TerminalSessionLayout;
  }>(),
  {toolbar: true, autoStart: true, sidebar: true, sessionLayout: 'sidebar'}
);
const localId = useId();
const selectedProfile = ref(''),
  showSidebar = ref(props.sidebar),
  showSearch = ref(false),
  query = ref(''),
  found = ref(true);
const sessionLayout = ref(props.sessionLayout);
watch(
  () => props.sessionLayout,
  (value) => {
    sessionLayout.value = value;
  }
);
const selectorVisible = computed(
  () => showSidebar.value && props.terminal.sessions.value.length > 1
);
const body = ref<HTMLElement>(),
  panes = ref<HTMLElement>();
const bodyWidth = ref(0),
  panesWidth = ref(0),
  sidebarWidth = ref(210);
const paneWeights = ref<Record<string, number>>({});
const sidebarMax = computed(() =>
  Math.max(0, bodyWidth.value - Math.min(160, bodyWidth.value / 2))
);
const sidebarMin = computed(() => Math.min(100, sidebarMax.value));
const sidebarSize = computed(() =>
  Math.max(sidebarMin.value, Math.min(sidebarMax.value, sidebarWidth.value))
);
const renameId = ref<string>(),
  renameText = ref('');
const renameInput = ref<InstanceType<typeof FrameTextField>>(),
  searchInput = ref<InstanceType<typeof FrameTextField>>();
const menuAnchor = ref<InstanceType<typeof FrameIconButton>>(),
  menuOpen = ref(false);
const externalMenuAnchor = shallowRef<HTMLElement>();
const menuTarget = computed(
  () => externalMenuAnchor.value ?? menuAnchor.value?.element
);
const contextAnchor = shallowRef<HTMLElement>(),
  contextId = ref<string>(),
  contextPoint = ref({x: 0, y: 0});
const colorId = ref<string>();
const colorSession = computed(() =>
  props.terminal.sessions.value.find((s) => s.id === colorId.value)
);
const sessionItems: FrameMenuItem[] = [
  {id: 'rename', label: 'Rename terminal'},
  {id: 'color', label: 'Change terminal color'},
];
const terminals = new Map<string, InstanceType<typeof Terminal>>();
const active = computed(() =>
  props.terminal.sessions.value.find(
    (s) => s.id === props.terminal.activeId.value
  )
);
const group = computed(
  () =>
    props.terminal.groups.value.find((g) =>
      g.includes(props.terminal.activeId.value ?? '')
    ) ?? []
);
const fractions = computed(() => {
  const saved = group.value
    .map((id) => paneWeights.value[id])
    .filter((weight): weight is number => weight !== undefined && weight > 0);
  const fallback = saved.length
    ? saved.reduce((sum, weight) => sum + weight, 0) / saved.length
    : 1;
  return group.value.map((id) => paneWeights.value[id] ?? fallback);
});
const paneSizes = computed(() => {
  const total = fractions.value.reduce((sum, weight) => sum + weight, 0);
  return fractions.value.map((weight) =>
    total ? (panesWidth.value * weight) / total : 0
  );
});
const paneColumns = computed(() =>
  fractions.value.length
    ? fractions.value
        .flatMap((weight) => [`minmax(0, ${weight}fr)`, '0px'])
        .slice(0, -1)
        .join(' ')
    : 'minmax(0, 1fr)'
);
function resizePane(index: number, value: number) {
  const sizes = [...paneSizes.value];
  const total = (sizes[index] ?? 0) + (sizes[index + 1] ?? 0);
  if (!total) return;
  const minimum = Math.min(80, total / 2);
  sizes[index] = Math.max(minimum, Math.min(total - minimum, value));
  sizes[index + 1] = total - sizes[index]!;
  paneWeights.value = {
    ...paneWeights.value,
    ...Object.fromEntries(group.value.map((id, i) => [id, sizes[i]!])),
  };
}
function resetPanes() {
  const weights = {...paneWeights.value};
  for (const id of group.value) delete weights[id];
  paneWeights.value = weights;
}
const sidebarGroups = computed(() => {
  const sessions = new Map(
    props.terminal.sessions.value.map((session) => [session.id, session])
  );
  return props.terminal.groups.value
    .map((ids) =>
      ids
        .map((id) => sessions.get(id))
        .filter((session): session is Readonly<TerminalSession> => !!session)
    )
    .filter((group) => group.length);
});
const profileOptions = computed<SelectItem[]>(() =>
  props.terminal.profiles.value.map((p) => ({
    value: p.id,
    label: p.name,
    description: p.path,
    detail: p.default ? 'default' : undefined,
  }))
);
const items = computed<FrameMenuItem[]>(() => [
  {
    id: 'search',
    label: 'Find in terminal',
    shortcut: 'Ctrl+F',
    disabled: !active.value,
  },
  {id: 'clear', label: 'Clear terminal', disabled: !active.value},
  {
    id: 'sidebar',
    label:
      sessionLayout.value === 'tabs'
        ? 'Show terminal tabs'
        : 'Show terminal sidebar',
    checked: showSidebar.value,
  },
  {
    id: 'layout-tabs',
    label: 'Show terminals as tabs',
    checked: sessionLayout.value === 'tabs',
  },
  {
    id: 'layout-sidebar',
    label: 'Show terminals as sidebar',
    checked: sessionLayout.value === 'sidebar',
  },
  {
    id: 'unsplit',
    label: 'Separate split terminals',
    disabled: group.value.length < 2,
  },
]);
async function run(action: () => unknown | Promise<unknown>) {
  try {
    await action();
  } catch (cause) {
    props.terminal.reportError(cause);
  }
}
async function create(split = false) {
  await run(async () => {
    const session = await props.terminal.create(
      selectedProfile.value || undefined,
      {split}
    );
    await nextTick();
    terminals.get(session.id)?.focus();
  });
}
async function activate(id: string) {
  props.terminal.activate(id);
  await nextTick();
  terminals.get(id)?.focus();
}
let selectingTabWithKeyboard = false;
watch(
  () => props.terminal.activeId.value,
  async (id) => {
    const focusTerminal = !selectingTabWithKeyboard;
    await nextTick();
    if (id && focusTerminal) terminals.get(id)?.focus();
  },
  {flush: 'post'}
);
async function sessionKey(event: KeyboardEvent, id: string) {
  sessionMenu(event, id);
  if (
    sessionLayout.value !== 'tabs' ||
    !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)
  )
    return;
  event.preventDefault();
  event.stopPropagation();
  const sessions = props.terminal.sessions.value;
  const index = sessions.findIndex((session) => session.id === id);
  const next =
    event.key === 'Home'
      ? sessions[0]
      : event.key === 'End'
        ? sessions[sessions.length - 1]
        : sessions[
            (index + (event.key === 'ArrowRight' ? 1 : -1) + sessions.length) %
              sessions.length
          ];
  if (!next) return;
  selectingTabWithKeyboard = true;
  props.terminal.activate(next.id);
  await nextTick();
  document.getElementById(`${localId}-session-${next.id}`)?.focus();
  selectingTabWithKeyboard = false;
}
function openMenu(anchor?: HTMLElement) {
  externalMenuAnchor.value = anchor;
  menuOpen.value = !menuOpen.value;
}
function sessionMenu(event: MouseEvent | KeyboardEvent, id: string) {
  if (
    event instanceof KeyboardEvent &&
    event.key !== 'ContextMenu' &&
    !(event.shiftKey && event.key === 'F10')
  )
    return;
  event.preventDefault();
  event.stopPropagation();
  const row = event.currentTarget as HTMLElement;
  const anchor = row.querySelector<HTMLButtonElement>(
    '.frame-terminal-session-select'
  );
  if (!anchor) return;
  const rect = anchor.getBoundingClientRect();
  contextPoint.value =
    event instanceof MouseEvent && (event.clientX || event.clientY)
      ? {x: event.clientX, y: event.clientY}
      : {x: rect.left, y: rect.bottom};
  contextId.value = id;
  contextAnchor.value = anchor;
}
function selectSession(item: FrameMenuItem) {
  const id = contextId.value;
  if (!id || item.type === 'separator') return;
  if (item.id === 'rename') {
    colorId.value = undefined;
    void rename(id);
  }
  if (item.id === 'color') {
    renameId.value = undefined;
    colorId.value = id;
  }
}
function finishColor() {
  colorId.value = undefined;
  terminals.get(props.terminal.activeId.value ?? '')?.focus();
}
async function searchOpen() {
  showSearch.value = true;
  await nextTick();
  searchInput.value?.focus();
}
function search(previous = false) {
  found.value =
    terminals
      .get(props.terminal.activeId.value ?? '')
      ?.search(query.value, previous) ?? false;
}
function searchClose() {
  showSearch.value = false;
  query.value = '';
  terminals.get(props.terminal.activeId.value ?? '')?.search('');
  terminals.get(props.terminal.activeId.value ?? '')?.focus();
}
async function rename(id = props.terminal.activeId.value) {
  const session = props.terminal.sessions.value.find((s) => s.id === id);
  if (!session) return;
  renameId.value = session.id;
  renameText.value = session.name;
  await nextTick();
  renameInput.value?.focus();
  renameInput.value?.element?.select();
}
function finishRename() {
  if (renameId.value) props.terminal.rename(renameId.value, renameText.value);
  renameId.value = undefined;
}
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
  const measure = () => {
    bodyWidth.value = body.value?.clientWidth ?? 0;
    panesWidth.value = panes.value?.clientWidth ?? 0;
  };
  observer = new ResizeObserver(measure);
  if (body.value) observer.observe(body.value);
  if (panes.value) observer.observe(panes.value);
  measure();
});
onBeforeUnmount(() => observer?.disconnect());
onMounted(() =>
  run(async () => {
    const profiles = await props.terminal.detectProfiles();
    selectedProfile.value =
      profiles.find((p) => p.default)?.id ?? profiles[0]?.id ?? '';
    if (props.autoStart && !props.terminal.sessions.value.length)
      await props.terminal.create();
    selectedProfile.value = active.value?.profile ?? selectedProfile.value;
  })
);
defineExpose({
  /** Creates a terminal session using the currently selected profile. */
  create,

  /** Opens the search controls and focuses the terminal query input. */
  search: searchOpen,

  /** Starts renaming the selected terminal session. */
  rename,

  /** Opens the terminal actions menu using the supplied anchor or current selection. */
  openMenu,

  /** Toggles the local terminal session selector presentation. */
  toggleSidebar: () => {
    showSidebar.value = !showSidebar.value;
  },
});
</script>
<template>
  <div class="frame-terminal-view">
    <header
      v-if="toolbar"
      class="frame-terminal-toolbar frame-terminal-controls"
    >
      <span class="frame-terminal-title"
        ><FrameIcon name="terminal" />{{ active?.name ?? 'Terminal' }}</span
      >
      <FrameTooltip
        text="Shell profile used for new terminals"
        v-slot="{describedby}"
        ><FrameSelect
          v-model="selectedProfile"
          :options="profileOptions"
          label="Terminal profile"
          :aria-describedby="describedby"
          :disabled="!profileOptions.length"
      /></FrameTooltip>
      <FrameIconButton
        label="New terminal"
        icon="add"
        :disabled="!selectedProfile"
        @click="create()"
      />
      <FrameIconButton
        label="Split terminal side by side"
        icon="split-horizontal"
        :disabled="!selectedProfile || !active"
        @click="create(true)"
      />
      <FrameIconButton
        label="Clear terminal"
        icon="clear-all"
        :disabled="!active"
        @click="terminal.clear()"
      />
      <FrameIconButton
        label="Close terminal session"
        icon="trash"
        :disabled="!active"
        @click="run(() => terminal.close(active!.id))"
      />
      <FrameIconButton
        ref="menuAnchor"
        label="Terminal options"
        icon="ellipsis"
        :aria-expanded="menuOpen"
        @click="openMenu()"
      />
    </header>
    <FrameMenu
      v-if="menuOpen && menuTarget"
      :anchor="menuTarget"
      :items="items"
      label="Terminal options"
      @close="menuOpen = false"
      @select="select"
    />
    <FrameMenu
      v-if="contextAnchor"
      :anchor="contextAnchor"
      :point="contextPoint"
      :items="sessionItems"
      label="Terminal session options"
      @close="contextAnchor = undefined"
      @select="selectSession"
    />
    <div
      v-if="showSearch"
      class="frame-terminal-search frame-terminal-controls"
      @keydown.esc.stop="searchClose"
    >
      <FrameTextField
        ref="searchInput"
        :model-value="query"
        type="search"
        aria-label="Find in terminal"
        placeholder="Find in terminal"
        @update:model-value="
          query = String($event);
          search();
        "
        @keydown.enter.prevent="search($event.shiftKey)"
      />
      <span v-if="query && !found" role="status">No match</span>
      <FrameIconButton
        label="Previous match"
        icon="arrow-up"
        @click="search(true)"
      />
      <FrameIconButton label="Next match" icon="arrow-down" @click="search()" />
      <FrameIconButton label="Close search" icon="close" @click="searchClose" />
    </div>
    <div v-if="renameId" class="frame-terminal-rename frame-terminal-controls">
      <label :for="`${localId}-rename`">Terminal name</label
      ><FrameTextField
        :id="`${localId}-rename`"
        ref="renameInput"
        :model-value="renameText"
        @update:model-value="renameText = String($event)"
        @keydown.enter.prevent="finishRename"
        @keydown.esc.stop="renameId = undefined"
      />
      <FrameButton @click="finishRename">Save</FrameButton
      ><FrameIconButton
        label="Cancel rename"
        icon="close"
        @click="renameId = undefined"
      />
    </div>
    <div
      v-if="colorSession"
      class="frame-terminal-color frame-terminal-controls"
      @keydown.esc.stop="finishColor"
    >
      <label :for="`${localId}-color`">Color for {{ colorSession.name }}</label
      ><FrameColorPicker
        :id="`${localId}-color`"
        :model-value="colorSession.color ?? '#cccccc'"
        @update:model-value="terminal.setColor(colorSession!.id, $event)"
      />
      <FrameButton @click="finishColor">Done</FrameButton>
    </div>
    <div
      ref="body"
      class="frame-terminal-body"
      :class="{
        'with-sidebar': selectorVisible && sessionLayout === 'sidebar',
        'with-tabs': selectorVisible && sessionLayout === 'tabs',
      }"
      :style="
        selectorVisible && sessionLayout === 'sidebar'
          ? {gridTemplateColumns: `minmax(0, 1fr) 0px ${sidebarSize}px`}
          : undefined
      "
    >
      <div
        ref="panes"
        class="frame-terminal-panes"
        :style="{gridTemplateColumns: paneColumns}"
      >
        <div v-if="!group.length" class="frame-terminal-empty"
          ><FrameIcon name="terminal" :size="32" /><p>No terminal sessions</p
          ><p
            v-if="terminal.error.value"
            class="frame-terminal-error"
            role="alert"
            >{{ terminal.error.value }}</p
          ><FrameButton v-else :disabled="!selectedProfile" @click="create()"
            >New terminal</FrameButton
          ></div
        >
        <template v-for="(id, index) in group" :key="id"
          ><section
            :id="`${localId}-terminal-${id}`"
            class="frame-terminal-pane"
            :class="{active: terminal.activeId.value === id}"
            :style="{gridColumn: index * 2 + 1}"
            :role="
              sessionLayout === 'tabs' && selectorVisible
                ? 'tabpanel'
                : undefined
            "
            :aria-labelledby="
              sessionLayout === 'tabs' && selectorVisible
                ? `${localId}-session-${id}`
                : undefined
            "
          >
            <Terminal
              :ref="
                (value) => {
                  if (value)
                    terminals.set(id, value as InstanceType<typeof Terminal>);
                  else terminals.delete(id);
                }
              "
              :terminal="terminal"
              :session-id="id"
              :error-message="
                terminal.activeId.value === id
                  ? terminal.error.value
                  : undefined
              "
              @focus="terminal.activate"
              @find="searchOpen"
            /> </section
          ><ResizeHandle
            v-if="index < group.length - 1"
            class="frame-terminal-pane-resize"
            :style="{gridColumn: index * 2 + 2}"
            axis="x"
            :label="`Resize terminal pane ${index + 1}`"
            :value="paneSizes[index] ?? 0"
            :min="
              Math.min(
                80,
                ((paneSizes[index] ?? 0) + (paneSizes[index + 1] ?? 0)) / 2
              )
            "
            :max="
              (paneSizes[index] ?? 0) +
              (paneSizes[index + 1] ?? 0) -
              Math.min(
                80,
                ((paneSizes[index] ?? 0) + (paneSizes[index + 1] ?? 0)) / 2
              )
            "
            @change="resizePane(index, $event)"
            @reset="resetPanes"
        /></template>
      </div>
      <ResizeHandle
        v-if="selectorVisible && sessionLayout === 'sidebar'"
        class="frame-terminal-sidebar-resize"
        axis="x"
        label="Resize terminal sidebar"
        reverse
        :value="sidebarSize"
        :min="sidebarMin"
        :max="sidebarMax"
        @change="sidebarWidth = $event"
        @reset="sidebarWidth = 210"
      />
      <aside
        v-if="selectorVisible"
        :class="
          sessionLayout === 'tabs'
            ? 'frame-terminal-tabs'
            : 'frame-terminal-sidebar'
        "
        :role="sessionLayout === 'tabs' ? 'tablist' : undefined"
        :aria-label="
          sessionLayout === 'tabs' ? 'Terminal tabs' : 'Terminal sessions'
        "
      >
        <div
          v-for="(sessions, index) in sidebarGroups"
          :key="sessions[0]!.id"
          class="frame-terminal-session-group"
          :class="{'split-group': sessions.length > 1}"
          :role="sessionLayout === 'tabs' ? 'presentation' : 'group'"
          :aria-label="
            sessionLayout === 'sidebar'
              ? `${sessions.length > 1 ? 'Split terminal group' : 'Terminal group'} ${index + 1}`
              : undefined
          "
        >
          <div
            v-for="session in sessions"
            :key="session.id"
            class="frame-terminal-session"
            :class="{active: session.id === terminal.activeId.value}"
            :data-session-id="session.id"
            @contextmenu="sessionMenu($event, session.id)"
            @keydown="sessionKey($event, session.id)"
          >
            <FrameTooltip
              class="frame-terminal-session-label"
              :text="`${session.name} · ${session.status}`"
              :placement="sessionLayout === 'tabs' ? 'bottom' : 'left'"
              v-slot="{describedby}"
              ><button
                :id="`${localId}-session-${session.id}`"
                type="button"
                class="frame-terminal-session-select"
                :role="sessionLayout === 'tabs' ? 'tab' : undefined"
                :tabindex="
                  sessionLayout === 'tabs'
                    ? session.id === terminal.activeId.value
                      ? 0
                      : -1
                    : undefined
                "
                :aria-selected="
                  sessionLayout === 'tabs'
                    ? session.id === terminal.activeId.value
                    : undefined
                "
                :aria-controls="
                  sessionLayout === 'tabs' && group.includes(session.id)
                    ? `${localId}-terminal-${session.id}`
                    : undefined
                "
                :aria-describedby="describedby"
                :aria-pressed="
                  sessionLayout === 'sidebar'
                    ? session.id === terminal.activeId.value
                    : undefined
                "
                @click="activate(session.id)"
                ><FrameIcon
                  name="terminal"
                  :style="{color: session.color}"
                /><span>{{ session.name }}</span
                ><small v-if="session.status !== 'running'">{{
                  session.status
                }}</small></button
              ></FrameTooltip
            >
            <span class="frame-terminal-session-close"
              ><FrameIconButton
                :label="`Close ${session.name}`"
                icon="close"
                :size="24"
                @click="run(() => terminal.close(session.id))"
            /></span>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<style lang="scss">
.frame-terminal-view {
  display: flex;
  flex-direction: column;
  flex: 1;
  /* Height for .frame-terminal-view; terminal view height. @token --frame-terminal-view-height */
  --_frame-default-terminal-view-height-01c74607a7: 100%;
  height: var(
    --frame-terminal-view-height,
    var(--_frame-default-terminal-view-height-01c74607a7)
  );
  /* Min height for .frame-terminal-view; terminal view min height. @token --frame-terminal-view-min-height */
  --_frame-default-terminal-view-min-height-af7f326321: 0;
  min-height: var(
    --frame-terminal-view-min-height,
    var(--_frame-default-terminal-view-min-height-af7f326321)
  );
  /* Min width for .frame-terminal-view; terminal view min width. @token --frame-terminal-view-min-width */
  --_frame-default-terminal-view-min-width-302ca979c8: 0;
  min-width: var(
    --frame-terminal-view-min-width,
    var(--_frame-default-terminal-view-min-width-302ca979c8)
  );
  box-sizing: border-box;
  overflow: hidden;
  /* Background for .frame-terminal-view; surface. @token --frame-surface */
  --_frame-default-surface-7fcb70be5e: #181818;
  background: var(--frame-surface, var(--_frame-default-surface-7fcb70be5e));
  /* Color for .frame-terminal-view; terminal view color. @token --frame-terminal-view-color */
  --_frame-default-terminal-view-color-f39072723f: #ccc;
  color: var(
    --frame-terminal-view-color,
    var(--_frame-default-terminal-view-color-f39072723f)
  );
  /* Font size for .frame-terminal-view; terminal view font size. @token --frame-terminal-view-font-size */
  --_frame-default-terminal-view-font-size-900c2ce053: 12px;
  font-size: var(
    --frame-terminal-view-font-size,
    var(--_frame-default-terminal-view-font-size-900c2ce053)
  );
}

.frame-terminal-controls {
  display: flex;
  align-items: center;
  /* Gap for .frame-terminal-controls; terminal toolbar gap. @token --frame-terminal-toolbar-gap */
  --_frame-default-terminal-toolbar-gap-b85fcc0d5e: 4px;
  gap: var(
    --frame-terminal-toolbar-gap,
    var(--_frame-default-terminal-toolbar-gap-b85fcc0d5e)
  );
  /* Padding for .frame-terminal-controls; terminal toolbar padding. @token --frame-terminal-toolbar-padding */
  --_frame-default-terminal-toolbar-padding-e45c6272b6: 3px 6px;
  padding: var(
    --frame-terminal-toolbar-padding,
    var(--_frame-default-terminal-toolbar-padding-e45c6272b6)
  );
  flex-shrink: 0;
}

.frame-terminal-toolbar {
  /* Border bottom for .frame-terminal-toolbar; line. @token --frame-line */
  --_frame-default-line-a07f23943d: #2b2b2b;
  border-bottom: 1px solid
    var(--frame-line, var(--_frame-default-line-a07f23943d));
  flex-wrap: wrap;
}

.frame-terminal-title {
  display: flex;
  align-items: center;
  /* Gap for .frame-terminal-title; terminal title gap. @token --frame-terminal-title-gap */
  --_frame-default-terminal-title-gap-308fe43a2e: 6px;
  gap: var(
    --frame-terminal-title-gap,
    var(--_frame-default-terminal-title-gap-308fe43a2e)
  );
  flex: 1;
  /* Min width for .frame-terminal-title; terminal title min width. @token --frame-terminal-title-min-width */
  --_frame-default-terminal-title-min-width-4d0c993cbd: 70px;
  min-width: var(
    --frame-terminal-title-min-width,
    var(--_frame-default-terminal-title-min-width-4d0c993cbd)
  );
}

.frame-terminal-toolbar .frame-select {
  /* Width for .frame-terminal-toolbar .frame-select; terminal toolbar frame select width. @token --frame-terminal-toolbar-frame-select-width */
  --_frame-default-terminal-toolbar-frame-select-width-fc978d4fb8: 160px;
  width: var(
    --frame-terminal-toolbar-frame-select-width,
    var(--_frame-default-terminal-toolbar-frame-select-width-fc978d4fb8)
  );
}

.frame-terminal-search {
  justify-content: flex-end;
}

.frame-terminal-search .frame-text-input {
  /* Width for .frame-terminal-search .frame-text-input; terminal search frame text input width. @token --frame-terminal-search-frame-text-input-width */
  --_frame-default-terminal-search-frame-text-input-width-7203265244: min(
    240px,
    60%
  );
  width: var(
    --frame-terminal-search-frame-text-input-width,
    var(--_frame-default-terminal-search-frame-text-input-width-7203265244)
  );
}

.frame-terminal-rename {
  flex-wrap: wrap;
}

.frame-terminal-body {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr);
  flex: 1;
  /* Min height for .frame-terminal-body; terminal body min height. @token --frame-terminal-body-min-height */
  --_frame-default-terminal-body-min-height-13a2086d4c: 0;
  min-height: var(
    --frame-terminal-body-min-height,
    var(--_frame-default-terminal-body-min-height-13a2086d4c)
  );
  /* Min width for .frame-terminal-body; terminal body min width. @token --frame-terminal-body-min-width */
  --_frame-default-terminal-body-min-width-0f6aa4b3d7: 0;
  min-width: var(
    --frame-terminal-body-min-width,
    var(--_frame-default-terminal-body-min-width-0f6aa4b3d7)
  );
  overflow: hidden;
}

.frame-terminal-body.with-tabs {
  grid-template-rows: auto minmax(0, 1fr);
}

.frame-terminal-panes {
  display: grid;
  grid-template-rows: minmax(0, 1fr);
  grid-column: 1;
  grid-row: 1;
  /* Min width for .frame-terminal-panes; terminal panes min width. @token --frame-terminal-panes-min-width */
  --_frame-default-terminal-panes-min-width-fc657dd0a6: 0;
  min-width: var(
    --frame-terminal-panes-min-width,
    var(--_frame-default-terminal-panes-min-width-fc657dd0a6)
  );
  /* Min height for .frame-terminal-panes; terminal panes min height. @token --frame-terminal-panes-min-height */
  --_frame-default-terminal-panes-min-height-4490d9ea17: 0;
  min-height: var(
    --frame-terminal-panes-min-height,
    var(--_frame-default-terminal-panes-min-height-4490d9ea17)
  );
  overflow: hidden;
}

.with-tabs > .frame-terminal-panes {
  grid-row: 2;
}

.frame-terminal-pane {
  grid-row: 1;
  /* Min width for .frame-terminal-pane; terminal pane min width. @token --frame-terminal-pane-min-width */
  --_frame-default-terminal-pane-min-width-267f990e72: 0;
  min-width: var(
    --frame-terminal-pane-min-width,
    var(--_frame-default-terminal-pane-min-width-267f990e72)
  );
  /* Min height for .frame-terminal-pane; terminal pane min height. @token --frame-terminal-pane-min-height */
  --_frame-default-terminal-pane-min-height-85acf43783: 0;
  min-height: var(
    --frame-terminal-pane-min-height,
    var(--_frame-default-terminal-pane-min-height-85acf43783)
  );
  overflow: hidden;
  /* Border bottom for .frame-terminal-pane; terminal pane border bottom. @token --frame-terminal-pane-border-bottom */
  --_frame-default-terminal-pane-border-bottom-630d9bdd86: 1px solid transparent;
  border-bottom: var(
    --frame-terminal-pane-border-bottom,
    var(--_frame-default-terminal-pane-border-bottom-630d9bdd86)
  );
}

.frame-terminal-pane:not(:first-child) {
  /* Border left for .frame-terminal-pane:not(:first-child); line. @token --frame-line */
  --_frame-default-line-a07f23943d: #2b2b2b;
  border-left: 1px solid
    var(--frame-line, var(--_frame-default-line-a07f23943d));
}

.frame-terminal-panes > .frame-terminal-pane-resize {
  position: relative;
  grid-row: 1;
  justify-self: center;
}

.frame-terminal-body > .frame-terminal-sidebar-resize {
  position: relative;
  grid-column: 2;
  grid-row: 1;
  justify-self: center;
}

.frame-terminal-pane.active {
  /* Border bottom color for .frame-terminal-pane.active; accent. @token --frame-accent */
  --_frame-default-accent-1583861c13: #0078d4;
  border-bottom-color: var(
    --frame-accent,
    var(--_frame-default-accent-1583861c13)
  );
}

.frame-terminal-sidebar {
  grid-column: 3;
  grid-row: 1;
  /* Min width for .frame-terminal-sidebar; terminal sidebar min width. @token --frame-terminal-sidebar-min-width */
  --_frame-default-terminal-sidebar-min-width-5e4f55e411: 0;
  min-width: var(
    --frame-terminal-sidebar-min-width,
    var(--_frame-default-terminal-sidebar-min-width-5e4f55e411)
  );
  /* Min height for .frame-terminal-sidebar; terminal sidebar min height. @token --frame-terminal-sidebar-min-height */
  --_frame-default-terminal-sidebar-min-height-7f3a84e012: 0;
  min-height: var(
    --frame-terminal-sidebar-min-height,
    var(--_frame-default-terminal-sidebar-min-height-7f3a84e012)
  );
  box-sizing: border-box;
  overflow: auto;
  /* Border left for .frame-terminal-sidebar; line. @token --frame-line */
  --_frame-default-line-a07f23943d: #2b2b2b;
  border-left: 1px solid
    var(--frame-line, var(--_frame-default-line-a07f23943d));
  /* Padding for .frame-terminal-sidebar; terminal sidebar padding. @token --frame-terminal-sidebar-padding */
  --_frame-default-terminal-sidebar-padding-ca8a2a6caf: 4px;
  padding: var(
    --frame-terminal-sidebar-padding,
    var(--_frame-default-terminal-sidebar-padding-ca8a2a6caf)
  );
}

.frame-terminal-tabs {
  display: flex;
  grid-column: 1;
  grid-row: 1;
  /* Min width for .frame-terminal-tabs; terminal tabs min width. @token --frame-terminal-tabs-min-width */
  --_frame-default-terminal-tabs-min-width-81314d1943: 0;
  min-width: var(
    --frame-terminal-tabs-min-width,
    var(--_frame-default-terminal-tabs-min-width-81314d1943)
  );
  overflow-x: auto;
  overflow-y: hidden;
  /* Border bottom for .frame-terminal-tabs; line. @token --frame-line */
  --_frame-default-line-a07f23943d: #2b2b2b;
  border-bottom: 1px solid
    var(--frame-line, var(--_frame-default-line-a07f23943d));
}

.frame-terminal-tabs .frame-terminal-session-group {
  display: flex;
  flex: 0 0 auto;
}

.frame-terminal-tabs
  .frame-terminal-session-group
  + .frame-terminal-session-group {
  /* Border left for .frame-terminal-tabs
  .frame-terminal-session-group
  + .frame-terminal-session-group; line. @token --frame-line */
  --_frame-default-line-a07f23943d: #2b2b2b;
  border-left: 1px solid
    var(--frame-line, var(--_frame-default-line-a07f23943d));
}

.frame-terminal-tabs .frame-terminal-session {
  flex: 0 0 160px;
  /* Width for .frame-terminal-tabs .frame-terminal-session; terminal tabs frame terminal session width. @token --frame-terminal-tabs-frame-terminal-session-width */
  --_frame-default-terminal-tabs-frame-terminal-session-width-964bcc2916: 160px;
  width: var(
    --frame-terminal-tabs-frame-terminal-session-width,
    var(--_frame-default-terminal-tabs-frame-terminal-session-width-964bcc2916)
  );
  /* Min width for .frame-terminal-tabs .frame-terminal-session; terminal tabs frame terminal session min width. @token --frame-terminal-tabs-frame-terminal-session-min-width */
  --_frame-default-terminal-tabs-frame-terminal-session-min-width-6840aebbf2: 100px;
  min-width: var(
    --frame-terminal-tabs-frame-terminal-session-min-width,
    var(
      --_frame-default-terminal-tabs-frame-terminal-session-min-width-6840aebbf2
    )
  );
  /* Max width for .frame-terminal-tabs .frame-terminal-session; terminal tabs frame terminal session max width. @token --frame-terminal-tabs-frame-terminal-session-max-width */
  --_frame-default-terminal-tabs-frame-terminal-session-max-width-d61abe9bb4: 200px;
  max-width: var(
    --frame-terminal-tabs-frame-terminal-session-max-width,
    var(
      --_frame-default-terminal-tabs-frame-terminal-session-max-width-d61abe9bb4
    )
  );
  /* Border radius for .frame-terminal-tabs .frame-terminal-session; terminal tabs frame terminal session border radius. @token --frame-terminal-tabs-frame-terminal-session-border-radius */
  --_frame-default-terminal-tabs-frame-terminal-session-border-radius-fd94c50c88: 0;
  border-radius: var(
    --frame-terminal-tabs-frame-terminal-session-border-radius,
    var(
      --_frame-default-terminal-tabs-frame-terminal-session-border-radius-fd94c50c88
    )
  );
  /* Border bottom for .frame-terminal-tabs .frame-terminal-session; terminal tabs frame terminal session border bottom. @token --frame-terminal-tabs-frame-terminal-session-border-bottom */
  --_frame-default-terminal-tabs-frame-terminal-session-border-bottom-841701989a: 1px
    solid transparent;
  border-bottom: var(
    --frame-terminal-tabs-frame-terminal-session-border-bottom,
    var(
      --_frame-default-terminal-tabs-frame-terminal-session-border-bottom-841701989a
    )
  );
}

.frame-terminal-tabs .frame-terminal-session.active {
  /* Border bottom color for .frame-terminal-tabs .frame-terminal-session.active; accent. @token --frame-accent */
  --_frame-default-accent-1583861c13: #0078d4;
  border-bottom-color: var(
    --frame-accent,
    var(--_frame-default-accent-1583861c13)
  );
}

.frame-terminal-session {
  position: relative;
  display: flex;
  align-items: center;
  /* Min height for .frame-terminal-session; terminal session min height. @token --frame-terminal-session-min-height */
  --_frame-default-terminal-session-min-height-25c416453e: 28px;
  min-height: var(
    --frame-terminal-session-min-height,
    var(--_frame-default-terminal-session-min-height-25c416453e)
  );
  /* Border radius for .frame-terminal-session; terminal session border radius. @token --frame-terminal-session-border-radius */
  --_frame-default-terminal-session-border-radius-b2d270162c: 3px;
  border-radius: var(
    --frame-terminal-session-border-radius,
    var(--_frame-default-terminal-session-border-radius-b2d270162c)
  );
}

.frame-terminal-session.active {
  /* Background for .frame-terminal-session.active; terminal session active background. @token --frame-terminal-session-active-background */
  --_frame-default-terminal-session-active-background-7ec5119307: #ffffff0c;
  background: var(
    --frame-terminal-session-active-background,
    var(--_frame-default-terminal-session-active-background-7ec5119307)
  );
}

.frame-terminal-session-label {
  display: flex;
  flex: 1;
  /* Min width for .frame-terminal-session-label; terminal session label min width. @token --frame-terminal-session-label-min-width */
  --_frame-default-terminal-session-label-min-width-c503722ff0: 0;
  min-width: var(
    --frame-terminal-session-label-min-width,
    var(--_frame-default-terminal-session-label-min-width-c503722ff0)
  );
}

.frame-terminal-session-select {
  display: flex;
  align-items: center;
  /* Gap for .frame-terminal-session-select; terminal session select gap. @token --frame-terminal-session-select-gap */
  --_frame-default-terminal-session-select-gap-85d917655d: 5px;
  gap: var(
    --frame-terminal-session-select-gap,
    var(--_frame-default-terminal-session-select-gap-85d917655d)
  );
  /* Width for .frame-terminal-session-select; terminal session select width. @token --frame-terminal-session-select-width */
  --_frame-default-terminal-session-select-width-896cfd8000: 100%;
  width: var(
    --frame-terminal-session-select-width,
    var(--_frame-default-terminal-session-select-width-896cfd8000)
  );
  /* Min width for .frame-terminal-session-select; terminal session select min width. @token --frame-terminal-session-select-min-width */
  --_frame-default-terminal-session-select-min-width-49335f4487: 0;
  min-width: var(
    --frame-terminal-session-select-min-width,
    var(--_frame-default-terminal-session-select-min-width-49335f4487)
  );
  /* Min height for .frame-terminal-session-select; terminal session select min height. @token --frame-terminal-session-select-min-height */
  --_frame-default-terminal-session-select-min-height-185339e11d: 28px;
  min-height: var(
    --frame-terminal-session-select-min-height,
    var(--_frame-default-terminal-session-select-min-height-185339e11d)
  );
  /* Padding for .frame-terminal-session-select; terminal session select padding. @token --frame-terminal-session-select-padding */
  --_frame-default-terminal-session-select-padding-41e3149957: 5px;
  padding: var(
    --frame-terminal-session-select-padding,
    var(--_frame-default-terminal-session-select-padding-41e3149957)
  );
  /* Border for .frame-terminal-session-select; terminal session select border. @token --frame-terminal-session-select-border */
  --_frame-default-terminal-session-select-border-a48b15c2c6: 0;
  border: var(
    --frame-terminal-session-select-border,
    var(--_frame-default-terminal-session-select-border-a48b15c2c6)
  );
  color: inherit;
  /* Background for .frame-terminal-session-select; terminal session select background. @token --frame-terminal-session-select-background */
  --_frame-default-terminal-session-select-background-b4e6d4482a: none;
  background: var(
    --frame-terminal-session-select-background,
    var(--_frame-default-terminal-session-select-background-b4e6d4482a)
  );
  text-align: left;
  cursor: pointer;
}

.frame-terminal-session-select span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.frame-terminal-session-select small {
  /* Color for .frame-terminal-session-select small; muted. @token --frame-muted */
  --_frame-default-muted-74c5fb58d7: #999;
  color: var(--frame-muted, var(--_frame-default-muted-74c5fb58d7));
}

.frame-terminal-session-close {
  display: none;
  position: absolute;
  right: 2px;
  top: 2px;
}

.frame-terminal-session:hover .frame-terminal-session-close,
.frame-terminal-session:focus-within .frame-terminal-session-close {
  display: block;
}

.frame-terminal-session:hover .frame-terminal-session-select,
.frame-terminal-session:focus-within .frame-terminal-session-select {
  /* Padding right for .frame-terminal-session:hover .frame-terminal-session-select,
.frame-terminal-session:focus-within .frame-terminal-session-select; terminal session hover frame terminal session select padding right. @token --frame-terminal-session-hover-frame-terminal-session-select-padding-right */
  --_frame-default-terminal-session-hover-frame-terminal-session-select-padding-right-b0d1b52080: 30px;
  padding-right: var(
    --frame-terminal-session-hover-frame-terminal-session-select-padding-right,
    var(
      --_frame-default-terminal-session-hover-frame-terminal-session-select-padding-right-b0d1b52080
    )
  );
}

.frame-terminal-sidebar .split-group .frame-terminal-session-select {
  /* Padding left for .frame-terminal-sidebar .split-group .frame-terminal-session-select; terminal sidebar split group frame terminal session select padding left. @token --frame-terminal-sidebar-split-group-frame-terminal-session-select-padding-left */
  --_frame-default-terminal-sidebar-split-group-frame-terminal-session-select-padding-left-e848f6c588: 22px;
  padding-left: var(
    --frame-terminal-sidebar-split-group-frame-terminal-session-select-padding-left,
    var(
      --_frame-default-terminal-sidebar-split-group-frame-terminal-session-select-padding-left-e848f6c588
    )
  );
}

.frame-terminal-sidebar .split-group .frame-terminal-session::before {
  content: '';
  position: absolute;
  pointer-events: none;
  left: 8px;
  top: 0;
  bottom: 0;
  /* Border left for .frame-terminal-sidebar .split-group .frame-terminal-session::before; muted. @token --frame-muted */
  --_frame-default-muted-a933579eb4: #8e9496;
  border-left: 1px solid
    var(--frame-muted, var(--_frame-default-muted-a933579eb4));
}

.frame-terminal-sidebar
  .split-group
  .frame-terminal-session:first-child::before {
  top: 50%;
}

.frame-terminal-sidebar
  .split-group
  .frame-terminal-session:last-child::before {
  bottom: 50%;
}

.frame-terminal-sidebar .split-group .frame-terminal-session::after {
  content: '';
  position: absolute;
  pointer-events: none;
  left: 8px;
  top: 50%;
  /* Width for .frame-terminal-sidebar .split-group .frame-terminal-session::after; terminal sidebar split group frame terminal session after width. @token --frame-terminal-sidebar-split-group-frame-terminal-session-after-width */
  --_frame-default-terminal-sidebar-split-group-frame-terminal-session-after-width-da8a9341a0: 8px;
  width: var(
    --frame-terminal-sidebar-split-group-frame-terminal-session-after-width,
    var(
      --_frame-default-terminal-sidebar-split-group-frame-terminal-session-after-width-da8a9341a0
    )
  );
  /* Border top for .frame-terminal-sidebar .split-group .frame-terminal-session::after; muted. @token --frame-muted */
  --_frame-default-muted-a933579eb4: #8e9496;
  border-top: 1px solid
    var(--frame-muted, var(--_frame-default-muted-a933579eb4));
}
</style>
