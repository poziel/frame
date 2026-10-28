<script setup lang="ts">
import {useId} from 'vue';
import {ContextMenuCommands} from '../../framework/commands/contextMenuCommands';
import {
  computed,
  nextTick,
  onMounted,
  onBeforeUnmount,
  ref,
  shallowRef,
  watch,
} from 'vue';
import {
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuPortal,
} from 'reka-ui';
import {BarDrag} from '../../framework/layout/barDrag';
import {barContextActions} from '../../framework/layout/barContext';
import BarDragOverlay from './BarDragOverlay.vue';
import {useFrame} from '../../framework/useFrame';
import {
  normalizeNavigationItems,
  type NavigationItem,
  type NavigationLinkItem,
} from '../../framework/views/navigationItems';
import {useOverlayBoundary} from '../overlays/overlays';
import type {FrameMenuItem} from '../navigation/generalMenu';
import FrameContextMenu from '../navigation/FrameContextMenu.vue';
import FrameIcon from '../data-display/FrameIcon.vue';
import BarItemContent from './BarItemContent.vue';
import NavigationItemMenu from './NavigationItemMenu.vue';
import './styles/bar-items.scss';

const frame = useFrame(),
  bar = frame.navigationBar;
const root = ref<HTMLElement>(),
  itemsRoot = ref<HTMLElement>(),
  measureRoot = ref<HTMLElement>();
const {target} = useOverlayBoundary(() => root.value);
const horizontal = computed(
  () => bar.position.value === 'top' || bar.position.value === 'bottom'
);
const side = computed(() =>
  bar.position.value === 'bottom'
    ? 'top'
    : bar.position.value === 'left'
      ? 'right'
      : bar.position.value === 'right'
        ? 'left'
        : 'bottom'
);
const available = computed(() =>
  bar.items.value.filter((item) => !!bar.getItemState(item.id)?.visible)
);
const shownIds = ref<string[]>([]),
  openId = ref('');
const overflowOpen = ref(false),
  overflowTrigger = ref<HTMLButtonElement>();
function itemOpen(open: boolean, id: string) {
  if (open && bar.enabled(id)) {
    overflowOpen.value = false;
    openId.value = id;
  } else if (openId.value === id) openId.value = '';
}
function setOverflowOpen(open: boolean) {
  overflowOpen.value = open;
  if (open) openId.value = '';
}
const shown = computed(() =>
  available.value.filter((item) => shownIds.value.includes(item.id))
);
const hidden = computed(() =>
  normalizeNavigationItems(
    available.value,
    (id) => !shownIds.value.includes(id)
  )
);
const context = shallowRef<HTMLElement>(),
  contextId = ref(''),
  point = ref({x: 0, y: 0});
let observer: ResizeObserver | undefined,
  alive = true;
function badge(id: string) {
  const state = bar.getItemState(id);
  return state?.badgeVisible ? state.badge : undefined;
}
function active(item: NavigationItem) {
  return (
    (item.type === 'link' || item.type === 'action') &&
    (typeof item.active === 'function' ? item.active() : !!item.active)
  );
}
function focusItem(id?: string) {
  void nextTick(() => {
    if (!alive) return;
    if (!bar.visible.value) {
      root.value
        ?.closest('.workbench')
        ?.querySelector<HTMLElement>('.workspace-panes')
        ?.focus();
      return;
    }
    const buttons = [
      ...(root.value?.querySelectorAll<HTMLElement>('[data-nav-id]') ?? []),
    ].filter((el) => el.getAttribute('aria-disabled') !== 'true');
    (
      buttons.find((el) => el.dataset.navId === id) ??
      buttons[0] ??
      overflowTrigger.value ??
      root.value
    )?.focus();
  });
}
function measure() {
  if (!alive || !itemsRoot.value || !measureRoot.value) return;
  const axis = horizontal.value ? 'width' : 'height',
    space = horizontal.value
      ? itemsRoot.value.clientWidth
      : itemsRoot.value.clientHeight;
  const gap = parseFloat(getComputedStyle(measureRoot.value).gap) || 0;
  const sizes = new Map(
    [...measureRoot.value.children].map((el) => [
      (el as HTMLElement).dataset.navMeasure!,
      el.getBoundingClientRect()[axis],
    ])
  );
  const total =
    available.value.reduce(
      (sum, item) => sum + (sizes.get(item.id) ?? 0) + gap,
      0
    ) - gap;
  let remaining = total <= space ? space : Math.max(0, space - 40 - gap);
  const ids: string[] = [];
  for (const item of available.value) {
    const length = (sizes.get(item.id) ?? 0) + (ids.length ? gap : 0);
    if (length <= remaining) {
      ids.push(item.id);
      remaining -= length;
    }
  }
  if (ids.join('\0') !== shownIds.value.join('\0')) {
    const focused = (document.activeElement as HTMLElement)?.dataset.navId;
    shownIds.value = ids;
    if (focused) focusItem(focused);
    if (!hidden.value.length) overflowOpen.value = false;
  }
}
function openContext(event: MouseEvent | KeyboardEvent, id = '') {
  event.preventDefault();
  event.stopPropagation();
  openId.value = '';
  overflowOpen.value = false;
  context.value = event.currentTarget as HTMLElement;
  contextId.value = id;
  const rect = context.value.getBoundingClientRect();
  point.value = {
    x: 'clientX' in event ? event.clientX : rect.left,
    y: 'clientY' in event ? event.clientY : rect.bottom,
  };
}
function key(event: KeyboardEvent, id?: string) {
  if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')) {
    openContext(event, id);
    return;
  }
  if (
    ![
      horizontal.value ? 'ArrowLeft' : 'ArrowUp',
      horizontal.value ? 'ArrowRight' : 'ArrowDown',
      'Home',
      'End',
    ].includes(event.key) ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey
  )
    return;
  event.preventDefault();
  const list = [
    ...(root.value?.querySelectorAll<HTMLElement>(
      '[data-nav-id],[data-nav-overflow],[data-nav-collapse]'
    ) ?? []),
  ].filter((el) => el.getAttribute('aria-disabled') !== 'true');
  let at = list.indexOf(event.currentTarget as HTMLElement);
  const previous = event.key === (horizontal.value ? 'ArrowLeft' : 'ArrowUp'),
    rtl = horizontal.value && getComputedStyle(root.value!).direction === 'rtl';
  at =
    event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? list.length - 1
        : (at + (previous ? -1 : 1) * (rtl ? -1 : 1) + list.length) %
          list.length;
  list[at]?.focus();
}
function click(event: MouseEvent, item: NavigationItem) {
  if (item.type === 'link') {
    link(event, item);
    return;
  }
  if (item.type === 'action') void bar.activate(item.id);
}
function link(event: MouseEvent, item: NavigationLinkItem) {
  if (!bar.enabled(item.id)) {
    event.preventDefault();
    return;
  }
  if (
    item.onNavigate &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.shiftKey &&
    !event.altKey &&
    event.button === 0
  ) {
    event.preventDefault();
    void bar.activate(item.id);
  }
}
const contextCommands = new ContextMenuCommands(
  frame,
  'frame.context.navigation.' + useId(),
  () => 'navigationBar',
  (item) => {
    commands.get(item.id)?.();
  }
);
onBeforeUnmount(contextCommands.dispose);
const commands = new Map<string, () => void>();
const menu = computed<FrameMenuItem[]>(() => {
  commands.clear();
  const items: FrameMenuItem[] = [];
  const item = bar.find(contextId.value);
  const add = (
    id: string,
    label: string,
    run: () => void,
    checked?: boolean,
    disabled?: boolean
  ) => {
    commands.set(id, run);
    return {id, label, checked, disabled};
  };
  const at = bar.items.value.findIndex((entry) => entry.id === item?.id),
    state = item && bar.getItemState(item.id);
  items.push(
    ...barContextActions({
      allowAddSeparator: bar.allowAddSeparator.value,
      target: item
        ? {
            label: item.label ?? item.id,
            separator: item.type === 'separator',
            allowRemove: item.type === 'separator' && item.allowRemove,
            badgeVisible: state?.badgeVisible,
            earlier: at > 0 && item.draggable !== false,
            later:
              at >= 0 &&
              at < bar.items.value.length - 1 &&
              item.draggable !== false,
          }
        : undefined,
    })
  );
  commands.set('add-separator', () => {
    bar.addSeparator(contextId.value || undefined);
  });
  if (item) {
    commands.set('delete-separator', () => {
      bar.removeSeparator(item.id);
    });
    commands.set('hide', () => {
      bar.setItemVisible(item.id, false);
    });
    commands.set('badge', () => {
      bar.setBadgeVisible(item.id, !state?.badgeVisible);
    });
    commands.set('earlier', () => {
      bar.moveItem(item.id, bar.items.value[at - 1]?.id);
    });
    commands.set('later', () => {
      bar.moveItem(item.id, bar.items.value[at + 2]?.id);
    });
  }
  for (const entry of bar.items.value.filter(
    (entry) => entry.type !== 'separator'
  ))
    items.push(
      add(
        `visible:${entry.id}`,
        entry.label ?? entry.id,
        () => {
          bar.setItemVisible(entry.id, !bar.getItemState(entry.id)?.visible);
        },
        bar.getItemState(entry.id)?.visible
      )
    );
  items.push(
    {id: 'layout-separator', type: 'separator'},
    {
      id: 'position',
      label: 'Navigation Bar Position',
      children: (['top', 'bottom', 'left', 'right'] as const).map((value) =>
        add(
          `position:${value}`,
          value[0]!.toUpperCase() + value.slice(1),
          () => {
            bar.setPosition(value);
          },
          bar.position.value === value
        )
      ),
    },
    {
      id: 'size',
      label: 'Navigation Bar Size',
      children: (['default', 'compact'] as const).map((value) =>
        add(
          `size:${value}`,
          value === 'default' ? 'Default' : 'Compact',
          () => {
            bar.setSize(value);
          },
          bar.size.value === value
        )
      ),
    },
    {
      id: 'display',
      label: 'Navigation Bar Display',
      children: (['icons', 'text', 'both'] as const).map((value) =>
        add(
          `display:${value}`,
          value === 'icons'
            ? 'Icons Only'
            : value === 'text'
              ? 'Text Only'
              : 'Icons and Text',
          () => {
            bar.setDisplay(value);
          },
          bar.display.value === value
        )
      ),
    }
  );
  if (!horizontal.value)
    items.push({
      id: 'justification',
      label: 'Navigation Item Justification',
      children: (['left', 'center', 'right'] as const).map((value) =>
        add(
          `justify:${value}`,
          value[0]!.toUpperCase() + value.slice(1),
          () => {
            bar.setJustification(value);
          },
          bar.justification.value === value
        )
      ),
    });
  items.push(
    add(
      'collapse',
      bar.collapsed.value ? 'Expand Navigation Bar' : 'Collapse Navigation Bar',
      () => {
        bar.setCollapsed(!bar.collapsed.value);
      },
      bar.collapsed.value,
      !bar.canCollapse.value
    )
  );
  return contextCommands.bind(items);
});
async function selected(item: FrameMenuItem) {
  const id = contextId.value;
  if (item.type !== 'separator' && item.command)
    await frame.commands.execute(item.command);
  await nextTick();
  focusItem(id);
}
const drag = new BarDrag({
  list: () => itemsRoot.value,
  exists: (id) => !!bar.find(id) && bar.find(id)?.draggable !== false,
  move: (id, before) => bar.moveItem(id, before),
  start: () => {
    openId.value = '';
    overflowOpen.value = false;
  },
  focus: focusItem,
});
const dragItem = computed(() => bar.find(drag.state.id));
const dropBefore = computed(() =>
  drag.state.active && drag.state.marker ? (drag.state.before ?? '') : undefined
);
function start(event: PointerEvent, item: NavigationItem) {
  drag.begin(event, item.id);
}
function cancel() {
  drag.cancel();
}
// Capture ownership synchronously, before v-show or item removal can discard the active element.
watch(
  () => [bar.position.value, bar.visible.value],
  () => {
    const active = document.activeElement as HTMLElement;
    const owned =
      !!root.value?.contains(active) || !!openId.value || overflowOpen.value;
    const focused = active?.dataset.navId;
    openId.value = '';
    overflowOpen.value = false;
    context.value = undefined;
    cancel();
    if (owned) focusItem(focused);
  },
  {flush: 'sync'}
);
watch(
  () => [available.value, bar.effectiveDisplay.value, bar.size.value],
  () => {
    const active = document.activeElement as HTMLElement;
    const owned = !!root.value?.contains(active);
    const focused = active?.dataset.navId,
      collapseFocused = active?.hasAttribute('data-nav-collapse');
    if (openId.value && !bar.enabled(openId.value)) openId.value = '';
    void nextTick(async () => {
      measure();
      await nextTick();
      if (owned) {
        if (collapseFocused && bar.canCollapse.value)
          root.value
            ?.querySelector<HTMLElement>('[data-nav-collapse]')
            ?.focus();
        else focusItem(focused);
      }
    });
  },
  {deep: true, flush: 'sync'}
);
onMounted(() => {
  observer = new ResizeObserver(measure);
  if (itemsRoot.value) observer.observe(itemsRoot.value);
  if (measureRoot.value) observer.observe(measureRoot.value);
  measure();
  document.fonts?.ready.then(measure);
});
onBeforeUnmount(() => {
  alive = false;
  observer?.disconnect();
  cancel();
});
</script>
<template>
  <nav
    ref="root"
    class="navigation-bar"
    :data-justification="bar.justification.value"
    :data-collapsed="bar.canCollapse.value && bar.collapsed.value"
    :class="{
      'bar-horizontal': horizontal,
      'bar-compact': bar.size.value === 'compact',
      ['bar-display-' + bar.effectiveDisplay.value]: true,
    }"
    aria-label="Navigation bar"
    tabindex="-1"
    @contextmenu="openContext($event)"
    @keydown.self="key($event)"
  >
    <div
      ref="itemsRoot"
      class="navigation-bar-items bar-drop-list"
      :data-bar-axis="horizontal ? 'x' : 'y'"
      @contextmenu.self="openContext($event)"
    >
      <template v-for="(item, index) in shown" :key="item.id"
        ><span
          class="bar-drop-gap"
          :class="{
            'bar-drop-edge': index === 0,
            'bar-drop-active': dropBefore === item.id,
          }"
          :data-bar-drop-before="item.id"
          aria-hidden="true" /><span
          :data-nav-wrapper="item.id"
          class="navigation-item-wrapper"
          @contextmenu="openContext($event, item.id)"
          @pointerdown="start($event, item)"
        >
          <span
            v-if="item.type === 'separator'"
            class="navigation-separator"
            role="separator"
            tabindex="0"
            :aria-label="item.label ?? 'Separator'"
            @keydown="key($event, item.id)"
            :aria-orientation="horizontal ? 'vertical' : 'horizontal'"
          />
          <DropdownMenuRoot
            v-else-if="item.type === 'dropdown'"
            :open="openId === item.id"
            :modal="false"
            @update:open="itemOpen($event, item.id)"
            ><DropdownMenuTrigger as-child
              ><button
                type="button"
                class="frame-bar-item"
                :data-nav-id="item.id"
                :aria-disabled="!bar.enabled(item.id) || undefined"
                :aria-label="item.label"
                :title="item.label"
                @keydown="key($event, item.id)"
                @click="!bar.enabled(item.id) && $event.preventDefault()"
                ><BarItemContent
                  :label="item.label"
                  :icon="item.icon"
                  :badge="badge(item.id)"
                  :display="
                    bar.effectiveDisplay.value
                  " /></button></DropdownMenuTrigger
            ><DropdownMenuPortal :to="target"
              ><DropdownMenuContent
                class="frame-menu navigation-menu frame-overlay-surface frame-overlay-interactive frame-box-scope frame-control-scope frame-shell-text frame-scroll-scope"
                :side="side"
                :side-offset="6"
                :collision-padding="8"
                :aria-label="item.label"
                @close-auto-focus.prevent="focusItem(item.id)"
                ><NavigationItemMenu
                  :items="item.items"
                  :anchor="root" /></DropdownMenuContent></DropdownMenuPortal
          ></DropdownMenuRoot>
          <component
            v-else
            :is="item.type === 'link' ? 'a' : 'button'"
            :type="item.type === 'action' ? 'button' : undefined"
            class="frame-bar-item"
            :class="{selected: active(item)}"
            :draggable="false"
            :href="item.type === 'link' ? item.href : undefined"
            :target="item.type === 'link' ? item.target : undefined"
            :rel="
              item.type === 'link'
                ? (item.rel ??
                  (item.target === '_blank'
                    ? 'noopener noreferrer'
                    : undefined))
                : undefined
            "
            :data-nav-id="item.id"
            :aria-label="item.label"
            :title="item.label"
            :aria-disabled="!bar.enabled(item.id) || undefined"
            :aria-current="
              item.type === 'link' && active(item) ? 'page' : undefined
            "
            :aria-pressed="
              item.type === 'action' && item.active !== undefined
                ? active(item)
                : undefined
            "
            @auxclick="item.type === 'link' && link($event, item)"
            @click="click($event, item)"
            @keydown="key($event, item.id)"
            ><BarItemContent
              :label="item.label"
              :icon="item.icon"
              :badge="badge(item.id)"
              :display="bar.effectiveDisplay.value"
          /></component> </span
      ></template>
      <span
        class="bar-drop-gap"
        :class="{
          'bar-drop-edge': !hidden.length,
          'bar-drop-active': dropBefore === '',
        }"
        data-bar-drop-before=""
        aria-hidden="true"
      />
      <DropdownMenuRoot
        v-if="hidden.length"
        :open="overflowOpen"
        :modal="false"
        @update:open="setOverflowOpen"
        ><DropdownMenuTrigger as-child
          ><button
            class="frame-bar-item nav-overflow"
            type="button"
            ref="overflowTrigger"
            data-nav-overflow
            aria-label="More Navigation Items"
            @keydown="key($event)"
            >⋯</button
          ></DropdownMenuTrigger
        ><DropdownMenuPortal :to="target"
          ><DropdownMenuContent
            class="frame-menu navigation-menu frame-overlay-surface frame-overlay-interactive frame-box-scope frame-control-scope frame-shell-text frame-scroll-scope"
            :side="side"
            :side-offset="6"
            :collision-padding="8"
            aria-label="More Navigation Items"
            ><NavigationItemMenu
              :items="hidden"
              :anchor="root" /></DropdownMenuContent></DropdownMenuPortal
      ></DropdownMenuRoot>
    </div>
    <button
      v-if="bar.canCollapse.value"
      class="frame-bar-item nav-collapse"
      type="button"
      data-nav-collapse
      :aria-label="
        bar.collapsed.value
          ? 'Expand Navigation Bar'
          : 'Collapse Navigation Bar'
      "
      :title="
        bar.collapsed.value
          ? 'Expand Navigation Bar'
          : 'Collapse Navigation Bar'
      "
      :aria-expanded="!bar.collapsed.value"
      @click="bar.setCollapsed(!bar.collapsed.value)"
      @keydown="key($event)"
      ><span class="bar-icon-slot"
        ><FrameIcon
          :name="
            (bar.position.value === 'left') !== bar.collapsed.value
              ? 'chevron-left'
              : 'chevron-right'
          " /></span
      ><span v-if="!bar.collapsed.value" class="bar-item-label"
        >Collapse</span
      ></button
    >
    <div
      ref="measureRoot"
      class="navigation-bar-measure"
      aria-hidden="true"
      inert
      ><span
        v-for="item in available"
        :key="item.id"
        :data-nav-measure="item.id"
        class="navigation-item-wrapper"
        ><span
          v-if="item.type === 'separator'"
          class="navigation-separator" /><span v-else class="frame-bar-item"
          ><BarItemContent
            :label="item.label"
            :icon="item.icon"
            :badge="badge(item.id)"
            :display="bar.effectiveDisplay.value" /></span></span
    ></div>
    <BarDragOverlay
      :active="drag.state.active"
      :x="drag.state.x"
      :y="drag.state.y"
      :label="dragItem?.type === 'separator' ? undefined : dragItem?.label"
      :icon="
        dragItem && dragItem.type !== 'separator' ? dragItem.icon : undefined
      "
      :marker="drag.state.marker"
      :anchor="root"
    />
    <FrameContextMenu
      v-if="context"
      :anchor="context"
      :point="point"
      :items="menu"
      label="Navigation bar"
      @close="context = undefined"
      @select="selected"
    />
  </nav>
</template>
