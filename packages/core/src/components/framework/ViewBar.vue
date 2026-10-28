<script setup lang="ts">
import DockRegion from './DockRegion.vue';
import {useId} from 'vue';
import {ContextMenuCommands} from '../../framework/commands/contextMenuCommands';
import ViewBarSeparators from './ViewBarSeparators.vue';
import {barContextActions} from '../../framework/layout/barContext';
import FrameContextMenu from '../navigation/FrameContextMenu.vue';
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watch,
} from 'vue';
import type {Component} from 'vue';
import FrameDropdownMenu from '../navigation/FrameDropdownMenu.vue';
import BarItemContent from './BarItemContent.vue';
import './styles/bar-items.scss';
import FrameIconButton from '../actions/FrameIconButton.vue';
import {useFrame} from '../../framework/useFrame';
import type {
  ViewBarPosition,
  ViewBarSize,
  ViewBarDisplay,
} from '../../framework/views/primaryViewBar';
import type {FrameMenuItem} from '../navigation/generalMenu';
import type {
  SidePanelDefinition,
  ViewRegion,
} from '../../framework/views/shellViewContainer';
import './styles/view-bars.scss';

interface ViewItemKey {

  id: string;
}

const frame = useFrame();
const props = withDefaults(
  defineProps<{
    /** Registered sidebar definitions represented by this view bar. */
    panels: readonly SidePanelDefinition[];
    /** Identifier of the currently selected registered view. */
    activeId: string;
    /** Whether the associated sidebar is currently expanded. */
    expanded: boolean;
    /** Sidebar region coordinated through the injected Frame instance; defaults to primary. */
    region?: 'primary' | 'secondary';
  }>(),
  {region: 'primary'}
);
const emit = defineEmits<{
  /** Requests activation of the selected registered item ID. */
  select: [id: string];
  /** Reports the measured selector dimensions to the owning shell layout. */
  resize: [size: {width: number; height: number}];
}>();
const secondary = computed(() => props.region === 'secondary');
const controller = computed(() =>
  secondary.value ? frame.secondaryViewBar : frame.primaryViewBar
);
const position = computed(() =>
  secondary.value
    ? frame.secondaryViewBar.position.value
    : frame.primaryViewBar.position.value
);
const horizontal = computed(() => {
  const configured = secondary.value
    ? frame.layout.secondaryViewBarPosition
    : frame.layout.primaryViewBarPosition;
  return configured === 'top' || configured === 'bottom';
});
const display = computed<ViewBarDisplay>(
  () => controller.value.effectiveDisplay.value
);
const compact = computed(() => controller.value.size.value === 'compact');
const label = computed(() =>
  secondary.value ? 'Secondary view bar' : 'Primary view bar'
);
const rail = ref<HTMLElement>(),
  itemsRoot = ref<HTMLElement>(),
  measureRoot = ref<HTMLElement>();
const anchor = shallowRef<HTMLElement>(),
  overflowAnchor = shallowRef<HTMLElement>();
let menuAnchor: HTMLElement | undefined;
const point = ref({x: 0, y: 0}),
  target = ref<ViewItemKey>();
const buttons = new Map<string, HTMLButtonElement>();
const key = (item: ViewItemKey) => item.id;

interface Entry {

  titleColor?: string;

  key: ViewItemKey;

  label: string;

  icon?: Component;

  disabled?: boolean;

  selected: boolean;

  badge?: string | number;
}

const registrations = computed(() =>
  secondary.value
    ? frame.secondaryViewBar.items.value
    : frame.primaryViewBar.items.value
);
function visible(item: ViewItemKey) {
  return controller.value.isVisible(item.id);
}
function setVisible(item: ViewItemKey, value: boolean) {
  return controller.value.setVisible(item.id, value);
}
function setBadgeVisible(item: ViewItemKey, value: boolean) {
  return controller.value.setBadgeVisible(item.id, value);
}
function badge(item: ViewItemKey) {
  const entry = registrations.value.find((entry) => key(entry) === key(item));
  return entry?.badgeVisible && entry.badge !== '' ? entry?.badge : undefined;
}
const entries = computed<Entry[]>(() => [
  ...props.panels
    .filter((panel) => visible({id: panel.id}))
    .map((panel) => ({
      key: {id: panel.id},
      label: panel.label,
      titleColor: panel.titleColor,
      icon: panel.icon,
      selected: props.expanded && props.activeId === panel.id,
      badge: badge({id: panel.id}),
    })),
]);
const shownKeys = ref<string[]>([]);
const shown = computed(() =>
  horizontal.value
    ? entries.value.filter((entry) => shownKeys.value.includes(key(entry.key)))
    : entries.value
);
const hidden = computed(() =>
  horizontal.value
    ? entries.value.filter((entry) => !shownKeys.value.includes(key(entry.key)))
    : []
);
let observer: ResizeObserver | undefined,
  alive = true;
function buttonRef(item: ViewItemKey, component: unknown) {
  const element = (component as {element?: HTMLButtonElement} | null)?.element;
  if (element instanceof HTMLButtonElement) buttons.set(key(item), element);
  else buttons.delete(key(item));
}
function focusSelected() {
  const selected = entries.value.find((entry) => entry.selected);
  (
    (selected && buttons.get(key(selected.key))) ||
    itemsRoot.value?.querySelector<HTMLButtonElement>(
      '[aria-label="More Views"]'
    ) ||
    buttons.values().next().value ||
    rail.value
  )?.focus();
}
function measure() {
  if (!alive || !horizontal.value || !itemsRoot.value || !measureRoot.value)
    return;
  const width = itemsRoot.value.clientWidth,
    gap = parseFloat(getComputedStyle(measureRoot.value).gap) || 0;
  const widths = new Map(
    [
      ...measureRoot.value.querySelectorAll<HTMLElement>('[data-measure-key]'),
    ].map((element) => [
      element.dataset.measureKey!,
      element.getBoundingClientRect().width,
    ])
  );
  let trailing = 0;
  for (const separator of measureRoot.value.querySelectorAll<HTMLElement>(
    '[data-bar-separator-before]'
  )) {
    const id = separator.dataset.barSeparatorBefore!,
      size = separator.getBoundingClientRect().width + gap;
    if (id) widths.set(id, (widths.get(id) ?? 0) + size);
    else trailing += size;
  }
  const total =
    trailing +
    entries.value.reduce(
      (sum, entry) => sum + (widths.get(key(entry.key)) ?? 0) + gap,
      0
    ) -
    gap;
  let next: string[] = [];
  if (total <= width) next = entries.value.map((entry) => key(entry.key));
  else {
    const configuredInset = parseFloat(
      getComputedStyle(itemsRoot.value).getPropertyValue(
        '--frame-view-bar-overflow-padding'
      )
    );
    const overflowInset = Number.isFinite(configuredInset)
      ? Math.max(0, configuredInset)
      : 8;
    let remaining = Math.max(0, width - 26 - overflowInset - gap - trailing);
    const active = entries.value.find((entry) => entry.selected);
    if (active && (widths.get(key(active.key)) ?? Infinity) <= remaining) {
      next.push(key(active.key));
      remaining -= (widths.get(key(active.key)) ?? 0) + gap;
    }
    for (const entry of entries.value) {
      const id = key(entry.key);
      if (next.includes(id)) continue;
      const size = (widths.get(id) ?? Infinity) + gap;
      if (size <= remaining) {
        next.push(id);
        remaining -= size;
      }
    }
  }
  if (
    next.length === shownKeys.value.length &&
    next.every((id, index) => id === shownKeys.value[index])
  )
    return;
  const focused = document.activeElement,
    owned = !!focused && !!itemsRoot.value.contains(focused);
  shownKeys.value = next;
  void nextTick(() => {
    if (owned && focused && !focused.isConnected) focusSelected();
  });
}
watch(
  () => [
    entries.value,
    controller.value.separators.value,
    props.activeId,
    horizontal.value,
    display.value,
    compact.value,
  ],
  () => void nextTick(measure),
  {deep: true, flush: 'post'}
);
onMounted(() => {
  observer = new ResizeObserver(() => {
    measure();
    if (rail.value) {
      const box = rail.value.getBoundingClientRect();
      if (box.width && box.height)
        emit('resize', {width: box.width, height: box.height});
    }
  });
  if (rail.value) observer.observe(rail.value);
  if (itemsRoot.value) observer.observe(itemsRoot.value);
  if (measureRoot.value) observer.observe(measureRoot.value);
  measure();
  document.fonts?.ready.then(measure);
});
onBeforeUnmount(() => {
  alive = false;
  observer?.disconnect();
});
function activate(entry: Entry) {
  if (entry.disabled) return;
  emit('select', entry.key.id);
}
async function navigationKey(event: KeyboardEvent, entry: Entry) {
  contextKey(event, entry.key);
  if (event.defaultPrevented) return;
  frame.viewKey(event, entry.key.id, props.region as ViewRegion);
  if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey)
    return;
  const previous = horizontal.value ? 'ArrowLeft' : 'ArrowUp',
    next = horizontal.value ? 'ArrowRight' : 'ArrowDown';
  if (![previous, next, 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  event.stopPropagation();
  const list = entries.value.filter((item) => !item.disabled);
  if (!list.length) return;
  const current = list.findIndex((item) => key(item.key) === key(entry.key));
  const direction =
    horizontal.value && getComputedStyle(rail.value!).direction === 'rtl'
      ? -1
      : 1;
  const index =
    event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? list.length - 1
        : (current + (event.key === next ? 1 : -1) * direction + list.length) %
          list.length;
  const item = list[index]!;
  if (horizontal.value) emit('select', item.key.id);
  await nextTick();
  measure();
  await nextTick();
  (
    buttons.get(key(item.key)) ??
    itemsRoot.value?.querySelector<HTMLButtonElement>(
      '[aria-label="More Views"]'
    )
  )?.focus();
}
function openMenu(event: MouseEvent | KeyboardEvent, item?: ViewItemKey) {
  event.preventDefault();
  event.stopPropagation();
  overflowAnchor.value = undefined;
  anchor.value = event.currentTarget as HTMLElement;
  menuAnchor = anchor.value;
  target.value = item;
  const rect = anchor.value.getBoundingClientRect();
  point.value = {
    x: 'clientX' in event && event.clientX ? event.clientX : rect.left,
    y: 'clientY' in event && event.clientY ? event.clientY : rect.bottom,
  };
}
function contextKey(event: KeyboardEvent, item?: ViewItemKey) {
  if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10'))
    openMenu(event, item);
}
const contextMenuCommands = new ContextMenuCommands(
  frame,
  'frame.context.viewBar.' + useId(),
  () => (secondary.value ? 'secondaryViewBar' : 'primaryViewBar'),
  (item) => {
    menuActions.get(item.id)?.();
  }
);
onBeforeUnmount(contextMenuCommands.dispose);
const menuActions = new Map<string, () => void>();
const menuItems = computed<FrameMenuItem[]>(() => {
  const items: FrameMenuItem[] = [];
  menuActions.clear();
  const separator = controller.value.separators.value.find(
    (item) => item.id === target.value?.id
  );
  const focused =
    target.value &&
    registrations.value.find((item) => key(item) === key(target.value!));
  const ids = registrations.value.map((item) => item.id),
    at = separator
      ? separator.before === undefined
        ? ids.length
        : ids.indexOf(separator.before)
      : ids.indexOf(focused?.id ?? '');
  const movable =
    (!!separator && controller.value.canMoveSeparators.value) ||
    (!!focused && frame.canMoveView(focused.id, props.region));
  items.push(
    ...barContextActions({
      allowAddSeparator: controller.value.allowAddSeparator.value,
      target:
        separator || focused
          ? {
              label: focused?.label ?? 'Separator',
              separator: !!separator,
              allowRemove: separator?.allowRemove,
              badgeVisible: focused?.badgeVisible,
              earlier: movable && at > 0,
              later:
                movable &&
                at >= 0 &&
                at < (separator ? ids.length : ids.length - 1),
            }
          : undefined,
    })
  );
  menuActions.set('add-separator', () => {
    controller.value.addSeparator(separator?.before ?? focused?.id);
  });
  if (separator) {
    menuActions.set('delete-separator', () => {
      controller.value.removeSeparator(separator.id);
    });
    menuActions.set('earlier', () => {
      controller.value.moveSeparator(separator.id, ids[at - 1]);
    });
    menuActions.set('later', () => {
      controller.value.moveSeparator(separator.id, ids[at + 1]);
    });
  }
  if (focused) {
    menuActions.set('hide', () => {
      setVisible(focused, false);
    });
    menuActions.set('badge', () => {
      setBadgeVisible(focused, !focused.badgeVisible);
    });
    menuActions.set('earlier', () => {
      frame.moveView(focused.id, props.region, ids[at - 1]);
    });
    menuActions.set('later', () => {
      frame.moveView(focused.id, props.region, ids[at + 2]);
    });
    {
      const destinations: {id: string; label: string; region: ViewRegion}[] = [
        {id: 'move-panel', label: 'Panel', region: 'bottom'},
        secondary.value
          ? {id: 'move-primary', label: 'Primary Sidebar', region: 'primary'}
          : {
              id: 'move-secondary',
              label: 'Secondary Sidebar',
              region: 'secondary',
            },
      ];
      items.push({
        id: 'move-target',
        label: 'Move To',
        children: destinations.map((destination) => {
          menuActions.set(destination.id, () => {
            frame.moveView(focused.id, destination.region);
          });
          return {
            id: destination.id,
            label: destination.label,
            disabled: !frame.canMoveView(focused.id, destination.region),
          };
        }),
      });
    }
    items.push({id: 'view-bar-separator', type: 'separator'});
  }
  for (const item of registrations.value) {
    const id = `toggle:${key(item)}`;
    items.push({id, label: item.label, checked: item.visible});
    menuActions.set(id, () => {
      setVisible(item, !item.visible);
    });
  }
  items.push({id: 'view-bar-layout-separator', type: 'separator'});
  const positions: {id: ViewBarPosition; label: string}[] = [
    {id: 'default', label: 'Default'},
    {id: 'top', label: 'Top'},
    {id: 'bottom', label: 'Bottom'},
    {id: 'hidden', label: 'Hidden'},
  ];
  items.push({
    id: 'view-bar-position',
    label: 'View Bar Position',
    children: positions.map((option) => {
      const id = `position:${option.id}`;
      menuActions.set(id, () => {
        (secondary.value
          ? frame.secondaryViewBar
          : frame.primaryViewBar
        ).setPosition(option.id);
      });
      return {id, label: option.label, checked: position.value === option.id};
    }),
  });
  const sizes: {id: ViewBarSize; label: string}[] = [
    {id: 'default', label: 'Default'},
    {id: 'compact', label: 'Compact'},
  ];
  if (controller.value.allowSizeChange)
    items.push({
      id: 'view-bar-size',
      label: 'View Bar Size',
      children: sizes.map((option) => {
        const id = `size:${option.id}`;
        menuActions.set(id, () => {
          controller.value.setSize(option.id);
        });
        return {
          id,
          label: option.label,
          checked: controller.value.size.value === option.id,
        };
      }),
    });
  const modes: {id: ViewBarDisplay; label: string}[] = [
    {id: 'icons', label: 'Icons Only'},
    {id: 'text', label: 'Text Only'},
    {id: 'both', label: 'Icons and Text'},
  ];
  if (controller.value.allowDisplayChange)
    items.push({
      id: 'view-bar-display',
      label: 'View Bar Display',
      children: modes.map((option) => {
        const id = `display:${option.id}`;
        menuActions.set(id, () => {
          controller.value.setDisplay(option.id);
        });
        return {
          id,
          label: option.label,
          checked: display.value === option.id,
          disabled: false,
        };
      }),
    });
  const side = secondary.value
    ? frame.layout.primarySide === 'left'
      ? 'left'
      : 'right'
    : frame.layout.primarySide === 'left'
      ? 'right'
      : 'left';
  items.push({
    id: 'move-side',
    label: `Move ${secondary.value ? 'Secondary' : 'Primary'} Sidebar ${side === 'right' ? 'Right' : 'Left'}`,
  });
  menuActions.set('move-side', () => {
    if (secondary.value) frame.secondaryViewBar.moveSide(side);
    else frame.primaryViewBar.movePrimarySide(side);
  });
  return contextMenuCommands.bind(items);
});
async function selectMenu(item: FrameMenuItem) {
  if (item.type !== 'separator' && item.command)
    await frame.commands.execute(item.command);
  await nextTick();
  if (!menuAnchor?.isConnected) focusSelected();
}
const overflowItems = computed<FrameMenuItem[]>(() =>
  hidden.value.map((entry) => ({
    id: key(entry.key),
    label: entry.label,
    checked: entry.selected,
    disabled: entry.disabled,
  }))
);
async function selectOverflow(item: FrameMenuItem) {
  const entry = entries.value.find((entry) => key(entry.key) === item.id);
  if (entry) activate(entry);
  await nextTick();
  measure();
  await nextTick();
  focusSelected();
}
defineExpose({
  /** Opens the view-bar context menu at the provided pointer event. */
  openContext: openMenu,
});
defineSlots<{
  /** Additional content after the registered view selector items. */ default?(): unknown;
}>();
</script>
<template>
  <nav
    ref="rail"
    class="view-bar frame-shell-label"
    :class="{
      'view-bar-horizontal': horizontal,
      'view-bar-compact': compact,
      ['view-bar-display-' + display]: true,
      'secondary-view-bar': secondary,
    }"
    :aria-label="label"
    tabindex="-1"
    :data-view-region="region"
    :data-view-axis="horizontal ? 'x' : 'y'"
    @dragover.prevent
    @drop="frame.dropView($event, region as ViewRegion)"
    @contextmenu="openMenu($event)"
    @keydown.self="contextKey($event)"
  >
    <DockRegion
      :region="secondary ? 'secondaryViewBar' : 'primaryViewBar'"
      mode="inside"
      class="frame-dock-anchor-content"
    >
      <slot />
      <div
        ref="itemsRoot"
        class="view-bar-items bar-drop-list"
        :data-bar-axis="horizontal ? 'x' : 'y'"
      >
        <template v-for="(entry, index) in shown" :key="key(entry.key)"
          ><ViewBarSeparators
            :items="controller.separators.value"
            :before="entry.key.id"
            :move="controller.moveSeparator"
            :can-move="controller.canMoveSeparators.value"
            @context="(event, id) => openMenu(event, {id})" /><span
            class="bar-drop-gap"
            :class="{'bar-drop-edge': index === 0}"
            :data-bar-drop-before="entry.key.id"
            aria-hidden="true" /><FrameIconButton
            :label="entry.label"
            :ref="(element) => buttonRef(entry.key, element)"
            class="rail-button"
            :style="{color: entry.titleColor}"
            :class="{selected: entry.selected}"
            :aria-pressed="entry.selected"
            :aria-controls="secondary ? 'secondary-panel' : 'side-panel'"
            :disabled="entry.disabled"
            :draggable="false"
            :data-view-id="entry.key.id"
            @keydown="navigationKey($event, entry)"
            @pointerdown="
              frame.beginViewDrag($event, entry.key.id, region as ViewRegion)
            "
            @dragover.prevent
            @drop.stop="
              frame.dropView($event, region as ViewRegion, entry.key.id)
            "
            @contextmenu="openMenu($event, entry.key)"
            @click="activate(entry)"
          >
            <BarItemContent
              :label="entry.label"
              :icon="entry.icon"
              :badge="entry.badge"
              :display="display"
            /> </FrameIconButton
        ></template>
        <ViewBarSeparators
          :items="controller.separators.value"
          :move="controller.moveSeparator"
          :can-move="controller.canMoveSeparators.value"
          @context="(event, id) => openMenu(event, {id})"
        />
        <span
          class="bar-drop-gap"
          :class="{'bar-drop-edge': !hidden.length}"
          data-bar-drop-before=""
          aria-hidden="true"
        />
        <span v-if="hidden.length" class="view-bar-overflow"
          ><FrameIconButton
            label="More Views"
            icon="ellipsis"
            aria-haspopup="menu"
            :aria-expanded="!!overflowAnchor"
            @contextmenu="openMenu($event)"
            @click="
              anchor = undefined;
              overflowAnchor = overflowAnchor
                ? undefined
                : ($event.currentTarget as HTMLElement);
            "
        /></span>
      </div>
      <div ref="measureRoot" class="view-bar-measure" aria-hidden="true" inert
        ><template v-for="entry in entries" :key="key(entry.key)"
          ><ViewBarSeparators
            :items="controller.separators.value"
            :before="entry.key.id"
            :move="controller.moveSeparator"
            :can-move="controller.canMoveSeparators.value"
            measure /><FrameIconButton
            :label="entry.label"
            :tooltip="false"
            class="rail-button"
            :data-measure-key="key(entry.key)"
            tabindex="-1"
            ><BarItemContent
              :label="entry.label"
              :icon="entry.icon"
              :badge="entry.badge"
              :display="display" /></FrameIconButton></template
        ><ViewBarSeparators
          :items="controller.separators.value"
          :move="controller.moveSeparator"
          :can-move="controller.canMoveSeparators.value"
          measure
      /></div>
      <FrameDropdownMenu
        v-if="overflowAnchor && hidden.length"
        :anchor="overflowAnchor"
        :items="overflowItems"
        label="More Views"
        @close="overflowAnchor = undefined"
        @select="selectOverflow"
      />
      <FrameContextMenu
        v-if="anchor && menuItems.length"
        :anchor="anchor"
        :point="point"
        :items="menuItems"
        :label="label"
        @close="anchor = undefined"
        @select="selectMenu"
      /> </DockRegion
  ></nav>
</template>
