<script setup lang="ts">
import {computed, ref, onMounted, onBeforeUnmount, watch, nextTick} from 'vue';
import type {ComponentPublicInstance} from 'vue';
import {useFrame} from '../../framework/useFrame';
import {fitViewSizes} from '../../framework/views/viewSizes';
import FrameIcon from '../data-display/FrameIcon.vue';
import ViewVisibilityMenu from './ViewVisibilityMenu.vue';
import PanelActions from './PanelActions.vue';
import ResizeHandle from '../layout/ResizeHandle.vue';

const props = defineProps<{viewId?: string; menuId?: string}>();
const frame = useFrame();
const collectionId = computed(() => props.viewId ?? props.menuId ?? '');
const allChildren = computed(() => frame.getViewChildren(collectionId.value));
const children = computed(() =>
  allChildren.value.filter((child) => frame.isViewVisible(child.id))
);
const region = computed(
  () => frame.viewRegion(collectionId.value) ?? 'primary'
);
const closed = frame.viewState.collapsed;
const heights = frame.viewState.heights;
const container = ref<HTMLElement>();
const available = ref(0);
const opened = computed(() =>
  children.value.filter((child) => !closed[child.id])
);
const sizes = computed(() => {
  const values = fitViewSizes(
    opened.value.map((child) => heights[child.id] ?? 180),
    available.value
  );
  return Object.fromEntries(
    opened.value.map((child, index) => [child.id, values[index] ?? 0])
  );
});
function measure() {
  const element = container.value;
  if (!element) return;
  const headers = [...element.children].reduce(
    (sum, section) =>
      sum +
      (section
        .querySelector<HTMLElement>(':scope > header')
        ?.getBoundingClientRect().height ?? 0) +
      (section.classList.contains('panel-section')
        ? parseFloat(getComputedStyle(section).borderBottomWidth) || 0
        : 0),
    0
  );
  available.value = Math.max(0, element.clientHeight - headers);
}
let observer: ResizeObserver | undefined;
onMounted(() => {
  observer = new ResizeObserver(measure);
  if (container.value) observer.observe(container.value);
  measure();
});
watch(
  () =>
    children.value
      .map((child) => `${child.id}:${!!closed[child.id]}`)
      .join('|'),
  async () => {
    await nextTick();
    measure();
  }
);
onBeforeUnmount(() => observer?.disconnect());
function resize(id: string, value: number) {
  const index = opened.value.findIndex((child) => child.id === id);
  const next = opened.value[index + 1];
  if (index < 0 || !next) return;
  const total = sizes.value[id]! + sizes.value[next.id]!;
  const minimum = Math.min(60, total / 2);
  const height = Math.max(minimum, Math.min(total - minimum, value));
  // Save actual heights only for a deliberate sash resize, never for a temporary shrink.
  for (const child of opened.value) heights[child.id] = sizes.value[child.id]!;
  heights[id] = height;
  heights[next.id] = total - height;
}
function resetSizes() {
  for (const child of opened.value) delete heights[child.id];
}
const refs = new Map<
  string,
  (element: Element | ComponentPublicInstance | null) => void
>();
function childRef(id: string) {
  if (!refs.has(id))
    refs.set(id, (value) => {
      if (value instanceof HTMLElement) frame.contentHosts.set(id, value);
      else frame.contentHosts.delete(id);
    });
  return refs.get(id)!;
}
</script>
<template>
  <div
    ref="container"
    class="panel-sections view-sections"
    :data-view-parent="collectionId"
    data-view-axis="y"
    :data-view-region="region"
    @dragover.prevent
    @drop="frame.dropView($event, region)"
  >
    <section
      v-for="child in children"
      :key="child.id"
      class="panel-section"
      :class="{expanded: !closed[child.id]}"
    >
      <header class="frame-shell-label"
        ><button
          class="section-toggle"
          :style="{color: child.titleColor}"
          :data-view-id="child.id"
          :aria-expanded="!closed[child.id]"
          :aria-controls="`view-section-${child.id}`"
          @pointerdown="frame.beginViewDrag($event, child.id, region)"
          @keydown="frame.viewKey($event, child.id, region)"
          @click="closed[child.id] = !closed[child.id]"
          ><FrameIcon
            class="section-chevron"
            :name="closed[child.id] ? 'chevron-right' : 'chevron-down'"
          /><component v-if="child.icon" :is="child.icon" class="tab-icon" />{{
            child.label
          }}</button
        ><ViewVisibilityMenu
          v-if="child.children !== undefined"
          :view-id="child.id" /><PanelActions
          v-if="!closed[child.id]"
          :actions="child.actions"
      /></header>
      <div
        v-show="!closed[child.id]"
        :id="`view-section-${child.id}`"
        class="accordion-content nested-view-content"
        :class="{
          unpadded:
            child.padded === false ||
            child.children !== undefined ||
            !!child.top ||
            !!child.bottom,
        }"
        :style="{height: `${sizes[child.id] ?? 0}px`}"
        ><div :ref="childRef(child.id)" class="view-host"
      /></div>
      <ResizeHandle
        v-if="
          !closed[child.id] &&
          opened.findIndex((view) => view.id === child.id) < opened.length - 1
        "
        axis="y"
        :label="`Resize ${child.label}`"
        :value="sizes[child.id] ?? 0"
        :min="0"
        :max="available"
        @change="resize(child.id, $event)"
        @reset="resetSizes"
      />
    </section>
    <p v-if="!children.length" class="menu-drop-placeholder">{{
      allChildren.length
        ? 'All sub-views are hidden. Use Views and more to show them.'
        : 'Drag a view here to display.'
    }}</p>
  </div>
</template>

<style lang="scss">
.section-chevron {
  width: var(--frame-section-chevron-width, 16px);
  height: var(--frame-section-chevron-height, 16px);
  flex: 0 0 16px;
}
</style>
