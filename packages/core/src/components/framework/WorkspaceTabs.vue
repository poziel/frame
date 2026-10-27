<script setup lang="ts">
import {useId} from 'vue';
import {ContextMenuCommands} from '../../framework/commands/contextMenuCommands';
import {
  computed,
  nextTick,
  ref,
  shallowRef,
  watch,
  onMounted,
  onBeforeUnmount,
} from 'vue';
import {TabsRoot, TabsList, TabsTrigger} from 'reka-ui';
import {useFrame} from '../../framework/useFrame';
import type {FrameMenuItem} from '../navigation/generalMenu';
import type {WorkspaceTab} from '../../framework/workspace/workspaceTypes';
import {WorkspaceTabMenu} from '../../framework/workspace/workspaceTabMenu';
import FrameIcon from '../data-display/FrameIcon.vue';
import FrameIconButton from '../actions/FrameIconButton.vue';
import FrameContextMenu from '../navigation/FrameContextMenu.vue';
import FrameDropdownMenu from '../navigation/FrameDropdownMenu.vue';

const props = defineProps<{paneId: string}>();
const frame = useFrame();
const w = frame.workspace;
const tabMenu = new WorkspaceTabMenu(w);
const local = computed(() =>
  w.tabs.value.filter((t) => t.paneId === props.paneId)
);
const options = computed(() => w.tabOptions(props.paneId));
const active = computed(() => w.activeTabs.value[props.paneId]);
const strip = ref<HTMLElement>();
const measureRoot = ref<HTMLElement>();
const overflowMeasure = ref<HTMLElement>();
const activeWidth = ref(240);
const shownIds = ref<string[]>([]);
const shown = computed(() =>
  local.value.filter((tab) => shownIds.value.includes(tab.id))
);
const hidden = computed(() =>
  local.value.filter((tab) => !shownIds.value.includes(tab.id))
);
const overflowAnchor = shallowRef<HTMLElement>();
const overflowItems = computed<FrameMenuItem[]>(() =>
  hidden.value.map((tab) => ({
    id: tab.id,
    label: tab.title,
    checked: active.value === tab.id,
  }))
);
const dropBefore = ref<string>();
const dirty = (tab: WorkspaceTab) =>
  !!options.value.trackChanges && !!tab.dirty;
const display = computed(() => options.value.display ?? 'both');
function iconVisible(tab: WorkspaceTab) {
  return display.value !== 'text' && (tab.showIcon ?? options.value.showIcons);
}
function closeVisible(tab: WorkspaceTab) {
  return (
    !!(tab.showClose ?? options.value.showClose) &&
    !!options.value.allowClose &&
    tab.closable !== false &&
    !tab.pinned
  );
}
function titleVisible(tab: WorkspaceTab) {
  return (
    display.value !== 'icons' && (tab.showTitle ?? options.value.showTitles)
  );
}
let observer: ResizeObserver | undefined,
  alive = true;
function measure() {
  if (!alive || !strip.value || !measureRoot.value) return;
  const widths = new Map(
    [
      ...measureRoot.value.querySelectorAll<HTMLElement>('[data-measure-tab]'),
    ].map((el) => [el.dataset.measureTab!, el.getBoundingClientRect().width])
  );
  const width = strip.value.clientWidth;
  const total = local.value.reduce(
    (sum, tab) => sum + (widths.get(tab.id) ?? 0),
    0
  );
  const next: string[] = [];
  const overflowStyle =
    overflowMeasure.value && getComputedStyle(overflowMeasure.value);
  const overflowWidth =
    (overflowMeasure.value?.getBoundingClientRect().width ?? 24) +
    (parseFloat(overflowStyle?.marginLeft ?? '0') || 0) +
    (parseFloat(overflowStyle?.marginRight ?? '0') || 0);
  let remaining = total <= width ? width : Math.max(0, width - overflowWidth);
  const selected = local.value.find((tab) => tab.id === active.value);
  activeWidth.value = Math.max(1, remaining);
  if (selected && remaining > 0) {
    next.push(selected.id);
    remaining -= Math.min(widths.get(selected.id) ?? remaining, remaining);
  }
  for (const tab of local.value) {
    if (next.includes(tab.id)) continue;
    const size = widths.get(tab.id) ?? Infinity;
    if (size <= remaining) {
      next.push(tab.id);
      remaining -= size;
    }
  }
  if (
    next.length !== shownIds.value.length ||
    next.some((id, i) => shownIds.value[i] !== id)
  )
    shownIds.value = next;
}
watch([local, active, options], () => void nextTick(measure), {
  deep: true,
  flush: 'post',
});
onMounted(() => {
  observer = new ResizeObserver(measure);
  if (strip.value) observer.observe(strip.value);
  if (measureRoot.value) observer.observe(measureRoot.value);
  measure();
  document.fonts?.ready.then(measure);
});
onBeforeUnmount(() => {
  alive = false;
  observer?.disconnect();
});
watch(hidden, (tabs) => {
  if (!tabs.length) overflowAnchor.value = undefined;
});
async function closeOverflow(id: string, event: MouseEvent) {
  const menu = (event.currentTarget as HTMLElement).closest('[role=menu]');
  const focused = document.activeElement;
  await w.closeTabs([id], 'menu');
  await nextTick();
  measure();
  await nextTick();
  if (focused && !focused.isConnected) {
    const next = menu?.querySelector<HTMLElement>(
      '[role=menuitem],[role=menuitemcheckbox]'
    );
    (
      next ??
      overflowAnchor.value ??
      strip.value?.querySelector<HTMLElement>('[role=tab][data-state=active]')
    )?.focus();
  }
}
async function selectOverflow(item: FrameMenuItem) {
  w.activateTab(item.id, 'button');
  overflowAnchor.value = undefined;
  await nextTick();
  measure();
  await nextTick();
  strip.value
    ?.querySelector<HTMLElement>('[role=tab][data-state=active]')
    ?.focus();
}
async function navigation(event: KeyboardEvent, id: string) {
  if (
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)
  )
    return;
  event.preventDefault();
  event.stopPropagation();
  const at = local.value.findIndex((tab) => tab.id === id),
    rtl = strip.value && getComputedStyle(strip.value).direction === 'rtl';
  const delta = (event.key === 'ArrowRight' ? 1 : -1) * (rtl ? -1 : 1);
  const index =
    event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? local.value.length - 1
        : (at + delta + local.value.length) % local.value.length;
  const tab = local.value[index];
  if (!tab) return;
  w.activateTab(tab.id, 'button');
  await nextTick();
  measure();
  await nextTick();
  strip.value
    ?.querySelector<HTMLElement>('[role=tab][data-state=active]')
    ?.focus();
}
function preview(event: DragEvent, before = '') {
  const id = w.draggedTab.value;
  if (
    !id ||
    !event.dataTransfer?.types.includes(dragType) ||
    !w.canMoveTab(id, props.paneId)
  ) {
    dropBefore.value = undefined;
    return;
  }
  event.preventDefault();
  event.stopPropagation();
  dropBefore.value = insertion(before).before;
}
function insertion(before = '') {
  const dragged =
    local.value.find((tab) => tab.id === w.draggedTab.value) ??
    w.tabs.value.find((tab) => tab.id === w.draggedTab.value);
  const remaining = local.value.filter((tab) => tab.id !== dragged?.id);
  let index = before
    ? remaining.findIndex((tab) => tab.id === before)
    : remaining.length;
  if (index < 0)
    index = Math.min(
      local.value.findIndex((tab) => tab.id === before),
      remaining.length
    );
  const pinned = remaining.filter((tab) => tab.pinned).length;
  index = dragged?.pinned
    ? Math.min(Math.max(0, index), pinned)
    : Math.max(index, pinned);
  return {index, before: remaining[index]?.id ?? ''};
}
watch(
  () => w.draggedTab.value,
  (id) => {
    if (!id) dropBefore.value = undefined;
  }
);

const anchor = shallowRef<HTMLElement>();
const point = ref({x: 0, y: 0});
const menuTab = ref('');
const contextMenuCommands = new ContextMenuCommands(
  frame,
  'frame.context.workspace.' + useId(),
  () => 'workspace',
  (item) => {
    tabMenu.select(props.paneId, menuTab.value, item.id);
  }
);
onBeforeUnmount(contextMenuCommands.dispose);
const items = computed(() =>
  contextMenuCommands.bind(tabMenu.items(props.paneId, menuTab.value))
);
const dragType = w.dragMime;
function openMenu(tab: WorkspaceTab, event: MouseEvent) {
  event.preventDefault();
  event.stopPropagation();
  menuTab.value = tab.id;
  anchor.value = event.currentTarget as HTMLElement;
  point.value = {x: event.clientX, y: event.clientY};
}
function select(item: FrameMenuItem) {
  if (item.type !== 'separator' && item.command)
    void frame.executeCommand(item.command);
  else tabMenu.select(props.paneId, menuTab.value, item.id);
}
function create(event: MouseEvent) {
  if (
    (event.target as HTMLElement).closest(
      'button,[role=tab],[data-workspace-actions]'
    )
  )
    return;
  if (w.canCreateTab(props.paneId))
    void w.requestTab(props.paneId, 'double-click');
}
function start(tab: WorkspaceTab, event: DragEvent) {
  if (!w.tabOptions(props.paneId).allowMove || tab.movable === false) {
    event.preventDefault();
    return;
  }
  const payload = w.tabDragData(tab.id);
  if (!payload) {
    event.preventDefault();
    return;
  }
  event.dataTransfer?.setData(dragType, payload);
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
}
function drop(event: DragEvent, before?: string) {
  dropBefore.value = undefined;
  const id = w.readTabDrag(event.dataTransfer?.getData(dragType) ?? '');
  if (!id || !w.canMoveTab(id, props.paneId)) return;
  event.preventDefault();
  event.stopPropagation();
  w.moveTab(id, props.paneId, insertion(before).index, 'drag');
}
watch(active, async () => {
  const focused = strip.value
    ?.closest('.workspace-pane')
    ?.contains(document.activeElement)
    ? document.activeElement
    : undefined;
  await nextTick();
  measure();
  await nextTick();
  const selected = strip.value?.querySelector<HTMLElement>(
    '[role=tab][data-state=active]'
  );
  selected?.scrollIntoView({block: 'nearest', inline: 'nearest'});
  if (
    focused &&
    (!focused.isConnected || document.activeElement === document.body)
  )
    (selected ?? strip.value?.parentElement)?.focus({preventScroll: true});
});
defineSlots<{
  tab(props: {tab: WorkspaceTab; active: boolean}): unknown;
  actions(props: {paneId: string}): unknown;
}>();
</script>
<template>
  <TabsRoot
    v-show="local.length > 0 && (local.length > 1 || options.showSingleTab)"
    class="workspace-tabs"
    :model-value="active"
    @update:model-value="
      (value) => {
        if (value) w.activateTab(String(value), 'button');
      }
    "
  >
    <div
      class="workspace-tab-bar"
      tabindex="-1"
      @dblclick="create"
      @dragover="preview($event)"
      @dragleave="
        (event) => {
          if (
            !(event.currentTarget as HTMLElement).contains(
              event.relatedTarget as Node
            )
          )
            dropBefore = undefined;
        }
      "
      @drop="drop($event)"
    >
      <div ref="strip" class="workspace-tab-scroll"
        ><TabsList class="workspace-tab-list" aria-label="Workspace tabs">
          <div
            v-for="tab in shown"
            :key="tab.id"
            class="workspace-tab-item"
            :class="{
              selected: active === tab.id,
              pinned: tab.pinned,
              dirty: dirty(tab),
              'drop-before': dropBefore === tab.id,
              'icon-only': display === 'icons',
              'has-close': closeVisible(tab),
            }"
            :style="
              active === tab.id
                ? {
                    maxWidth: `min(var(--frame-workspace-tab-max-width, 240px), ${activeWidth}px)`,
                  }
                : undefined
            "
            :data-tab-id="tab.id"
            :draggable="
              !!w.tabOptions(props.paneId).allowMove && tab.movable !== false
            "
            @dragstart="start(tab, $event)"
            @dragend="
              w.endTabDrag();
              dropBefore = undefined;
            "
            @dragover="preview($event, tab.id)"
            @drop.stop="drop($event, tab.id)"
            @contextmenu="openMenu(tab, $event)"
            @mousedown="
              (event) => {
                if (event.button === 1) event.preventDefault();
              }
            "
            @auxclick="
              (event) => {
                if (event.button === 1 && w.canCloseTab(tab.id)) {
                  event.preventDefault();
                  void w.closeTabs([tab.id], 'middle-click');
                }
              }
            "
          >
            <TabsTrigger
              :value="tab.id"
              :aria-label="tab.title"
              :aria-description="dirty(tab) ? 'Unsaved changes' : undefined"
              :title="dirty(tab) ? tab.title + ' — Unsaved changes' : tab.title"
              :id="`${w.dragMime}-${tab.id}-trigger`"
              :aria-controls="`${w.dragMime}-${tab.id}-panel`"
              class="workspace-tab-trigger"
              @keydown="navigation($event, tab.id)"
            >
              <slot name="tab" :tab="tab" :active="active === tab.id"
                ><template v-if="iconVisible(tab)"
                  ><FrameIcon
                    v-if="!tab.icon || typeof tab.icon === 'string'"
                    :name="
                      typeof tab.icon === 'string' ? tab.icon : 'file'
                    " /><component
                    v-else
                    :is="tab.icon"
                    class="workspace-tab-icon" /></template
                ><span v-if="titleVisible(tab)" class="workspace-tab-title">{{
                  tab.title
                }}</span></slot
              >
            </TabsTrigger>
            <span v-if="tab.pinned" class="workspace-tab-close-slot"
              ><span
                v-if="dirty(tab)"
                class="workspace-tab-dirty-dot"
                aria-hidden="true" /><FrameIconButton
                class="workspace-tab-action"
                :class="{'workspace-tab-close': dirty(tab)}"
                :label="`Unpin ${tab.title}`"
                icon="pinned"
                :size="24"
                :icon-size="16"
                :tooltip="false"
                @click="w.setTabPinned(tab.id, false, 'button')"
            /></span>
            <span v-else-if="closeVisible(tab)" class="workspace-tab-close-slot"
              ><span
                v-if="dirty(tab)"
                class="workspace-tab-dirty-dot"
                aria-hidden="true" /><FrameIconButton
                class="workspace-tab-action workspace-tab-close"
                :disabled="!w.canCloseTab(tab.id)"
                :label="`Close ${tab.title}`"
                icon="close"
                :size="24"
                :icon-size="16"
                :tooltip="false"
                @click="w.closeTabs([tab.id], 'button')" /></span
            ><span
              v-else-if="dirty(tab)"
              class="workspace-tab-close-slot workspace-tab-action"
              ><span class="workspace-tab-dirty-dot" aria-hidden="true"
            /></span>
          </div>
          <span
            v-if="dropBefore === ''"
            class="workspace-tab-drop-end"
            aria-hidden="true"
          />
        </TabsList>
        <button
          v-if="hidden.length"
          class="workspace-tab-overflow workspace-tab-action"
          aria-label="More Tabs"
          aria-haspopup="menu"
          :aria-expanded="!!overflowAnchor"
          @click="
            overflowAnchor = overflowAnchor
              ? undefined
              : ($event.currentTarget as HTMLElement)
          "
          ><FrameIcon name="ellipsis"
        /></button>
      </div>
      <div class="workspace-tab-actions" data-workspace-actions
        ><slot name="actions" :pane-id="paneId"
      /></div>
    </div>
    <div
      ref="measureRoot"
      class="workspace-tab-measure"
      aria-hidden="true"
      inert
    >
      <div
        v-for="tab in local"
        :key="tab.id"
        class="workspace-tab-item"
        :class="{'icon-only': display === 'icons'}"
        :data-measure-tab="tab.id"
        ><span class="workspace-tab-trigger"
          ><slot name="tab" :tab="tab" :active="active === tab.id"
            ><template v-if="iconVisible(tab)"
              ><FrameIcon
                v-if="!tab.icon || typeof tab.icon === 'string'"
                :name="
                  typeof tab.icon === 'string' ? tab.icon : 'file'
                " /><component
                v-else
                :is="tab.icon"
                class="workspace-tab-icon" /></template
            ><span v-if="titleVisible(tab)" class="workspace-tab-title">{{
              tab.title
            }}</span></slot
          ></span
        ><span
          v-if="
            dirty(tab) ||
            tab.pinned ||
            ((tab.showClose ?? options.showClose) &&
              options.allowClose &&
              tab.closable !== false)
          "
          class="workspace-tab-action"
          ><FrameIcon name="close" /></span
      ></div>
      <span
        ref="overflowMeasure"
        class="workspace-tab-overflow workspace-tab-action"
      />
    </div>
  </TabsRoot>
  <FrameDropdownMenu
    v-if="overflowAnchor"
    :anchor="overflowAnchor"
    :items="overflowItems"
    label="More Tabs"
    @select="selectOverflow"
    @close="overflowAnchor = undefined"
    ><template #item-actions="{item}"
      ><FrameIconButton
        v-if="w.canCloseTab(item.id)"
        class="workspace-overflow-close"
        :label="`Close ${item.label}`"
        icon="close"
        :size="24"
        :icon-size="16"
        :tooltip="false"
        @pointerdown.stop
        @click.stop="closeOverflow(item.id, $event)" /></template
  ></FrameDropdownMenu>
  <FrameContextMenu
    v-if="anchor"
    :anchor="anchor"
    :point="point"
    :items="items"
    label="Workspace tab"
    @select="select"
    @close="anchor = undefined"
  />
</template>
