<script setup lang="ts">
import {computed, ref, onMounted, onBeforeUnmount, watch, nextTick} from 'vue';
import {MenubarRoot, useForwardProps} from 'reka-ui';
import type {MenubarRootProps} from 'reka-ui';
import type {FrameMenubarItem, FrameMenubarAction} from './menubarTypes';
import type {FrameMenuItem} from './generalMenu';
import {normalizeMenuItems} from './generalMenu';
import MenubarEntry from './MenubarEntry.vue';
import './styles/navigation.scss';

const props = withDefaults(
  defineProps<
    MenubarRootProps & {
      /** Items rendered by the built-in composition; a default slot replaces that composition. */
      items?: FrameMenubarItem[];
      /** Command-backed menu tree; takes precedence over the simpler items collection. */
      menus?: readonly FrameMenuItem[];
      /** Accessible name for this component and its built-in control or region. */
      label?: string;
      /** Maximum visible menu groups before overflow; defaults to no count limit. */
      maxVisible?: number;
      /** Available width in pixels used to move overflowing groups into the overflow menu. */
      availableWidth?: number;
      /** Accessible label for the overflow menu presentation. */
      popupLabel?: string;
    }
  >(),
  {maxVisible: Infinity}
);
const emit = defineEmits<{
  /** Emitted when user interaction requests a new controlled value. */
  'update:modelValue': [value: string];
  /** Emitted when a built-in menubar item action is selected. */
  action: [item: FrameMenubarAction];
  /** Emitted with the command ID for a selected command-backed menu item. */
  execute: [id: string];
}>();
const root = computed(() => {
  const {items, menus, label, maxVisible, availableWidth, popupLabel, ...rest} =
    props;
  return rest;
});
const localValue = ref(props.defaultValue ?? '');
const openValue = computed({
  get: () => props.modelValue ?? localValue.value,
  set: (value: string) => {
    localValue.value = value;
    emit('update:modelValue', value);
  },
});
const forwarded = useForwardProps(root);
const groups = computed(
  () =>
    props.menus
      ?.filter((item) => item.type !== 'separator')
      .map((item) => ({
        value: item.id,
        label: item.label,
        disabled: item.disabled,
        action: !item.children?.length && item.command ? item : undefined,
        items: item.children ?? [],
      })) ??
    (props.items ?? []).map((item) => ({
      ...item,
      action: undefined,
      items: normalizeMenuItems(item.items),
    }))
);
const measure = ref<HTMLElement>();
const widths = ref<number[]>([]),
  overflowWidth = ref(28);
let observer: ResizeObserver | undefined;
function measureItems() {
  if (!measure.value) return;
  widths.value = [
    ...measure.value.querySelectorAll<HTMLElement>('[data-menu-measure]'),
  ].map((el) => el.getBoundingClientRect().width);
  overflowWidth.value =
    measure.value
      .querySelector<HTMLElement>('[data-overflow-measure]')
      ?.getBoundingClientRect().width ?? 28;
}
onMounted(() => {
  observer = new ResizeObserver(measureItems);
  if (measure.value) observer.observe(measure.value);
  measureItems();
  document.fonts?.ready.then(measureItems);
});
onBeforeUnmount(() => observer?.disconnect());
watch(groups, () => nextTick(measureItems), {deep: true});
const visibleCount = computed(() => {
  const cap = Math.min(groups.value.length, props.maxVisible);
  if (props.availableWidth === undefined) return cap;
  const sizes = widths.value;
  if (sizes.length !== groups.value.length) return 0;
  if (
    cap === groups.value.length &&
    sizes.reduce((a, b) => a + b, 0) <= props.availableWidth
  )
    return cap;
  let used = overflowWidth.value,
    count = 0;
  for (const width of sizes.slice(0, cap)) {
    if (used + width > props.availableWidth) break;
    used += width;
    count++;
  }
  return count;
});
const overflowItems = computed(
  () =>
    props.menus
      ?.filter((item) => item.type !== 'separator')
      .slice(visibleCount.value) ??
    groups.value.slice(visibleCount.value).map((menu) => ({
      id: menu.value,
      label: menu.label,
      children: menu.items,
    }))
);
function select(item: FrameMenuItem) {
  if (item.type === 'separator') return;
  if (item.command) emit('execute', item.command);
  emit('action', item);
}
defineSlots<{
  /** Replaces all built-in menu groups and overflow presentation. */ default?(): unknown;
  /** Additional content for one opened menu group. */ content?(
    props: {
    menu: {
      value: string;
      label: string;
      disabled?: boolean;
      action?: FrameMenuItem;
      items: readonly FrameMenuItem[];
    };
  }
  ): unknown;
}>();
</script>
<template>
  <MenubarRoot
    v-bind="forwarded"
    :loop="loop ?? true"
    v-model="openValue"
    class="frame-menubar frame-navigation-text frame-navigation-list-layout frame-shell-label"
    :aria-label="label"
    ><slot
      ><div class="menubar-groups"
        ><MenubarEntry
          v-for="menu in groups.slice(0, visibleCount)"
          :key="menu.value"
          :value="menu.value"
          :label="menu.label"
          :disabled="menu.disabled"
          :action="menu.action"
          :items="menu.items"
          :menu-label="popupLabel ?? menu.label"
          @select="select"
          @dismiss="openValue = ''"
          ><template v-if="$slots.content" #default
            ><slot name="content" :menu="menu" /></template></MenubarEntry></div
      ><MenubarEntry
        v-if="overflowItems.length"
        value="frame-overflow"
        label="···"
        aria-label="All application menus"
        class="menubar-overflow"
        :class="{needed: groups.length > visibleCount}"
        :items="overflowItems"
        menu-label="Application menu"
        @select="select"
        @dismiss="openValue = ''" /></slot
    ><div
      ref="measure"
      class="menubar-measure menubar-groups frame-menu-measure"
      aria-hidden="true"
      inert
      ><button
        v-for="menu in groups"
        :key="menu.value"
        data-menu-measure
        tabindex="-1"
        >{{ menu.label }}</button
      ><button data-overflow-measure tabindex="-1">···</button></div
    ></MenubarRoot
  >
</template>
