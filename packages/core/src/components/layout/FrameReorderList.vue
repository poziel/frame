<script setup lang="ts">
import {computed, onBeforeUnmount, ref, watch} from 'vue';
import FrameDragPreview from '../overlays/FrameDragPreview.vue';
import {reorderItems} from '../forms/shared/reorder';

const props = withDefaults(
  defineProps<{
    /** Controlled value supplied by the parent; updates are emitted rather than mutating it. */
    modelValue: readonly string[];
    /** Selected row IDs used for range selection and moving groups; defaults to an empty array. */
    selected?: readonly string[];
    /** Prevents user selection and reordering while retaining rendered content. */
    disabled?: boolean;
    /** Accessible name for this component and its built-in control or region. */
    label?: string;
  }>(),
  {selected: () => []}
);
const emit = defineEmits<{
  /** Emitted when user interaction requests a new controlled value. */
  'update:modelValue': [ids: string[]];
  /** Emitted when pointer selection requests a new set of selected row IDs. */
  'update:selected': [ids: string[]];
  /** Emitted after an actual order change with moved IDs and the resulting complete order. */
  reorder: [value: {ids: string[]; order: string[]}];
  /** Emitted when a row becomes the active selection target. */
  activate: [id: string];
}>();
const root = ref<HTMLElement>(),
  dragged = ref<string[]>([]),
  over = ref<{id: string; after: boolean; top: number} | null>(null);
const cursor = ref({x: 0, y: 0});
const indicatorStyle = computed(() => ({top: `${over.value?.top ?? 0}px`}));
let pending: {
  id: string;
  pointerId: number;
  x: number;
  y: number;
  element: HTMLElement;
} | null = null;
let listeners: AbortController | undefined,
  suppressClick = false,
  clickTimer: ReturnType<typeof setTimeout> | undefined;
let point = {x: 0, y: 0},
  scrollParent: HTMLElement | undefined,
  animation = 0;
onBeforeUnmount(() => {
  clear();
  clearTimeout(clickTimer);
});
let anchor: string | undefined;
watch(
  () => props.disabled,
  (value) => {
    if (value) clear();
  }
);
function select(id: string, event: MouseEvent) {
  if (props.disabled) return;
  let next = [id];
  if (event.shiftKey && anchor && props.modelValue.includes(anchor)) {
    const a = props.modelValue.indexOf(anchor),
      b = props.modelValue.indexOf(id);
    next = props.modelValue.slice(Math.min(a, b), Math.max(a, b) + 1);
  } else if (event.ctrlKey || event.metaKey)
    next = props.selected.includes(id)
      ? props.selected.filter((value) => value !== id)
      : [...props.selected, id];
  else anchor = id;
  emit('update:selected', next);
  emit('activate', id);
}
function down(event: PointerEvent, id: string) {
  if (
    props.disabled ||
    event.button !== 0 ||
    !event.isPrimary ||
    (event.target as HTMLElement).closest(
      'input,textarea,select,[contenteditable=true],[data-reorder-ignore]'
    )
  )
    return;
  clear();
  pending = {
    id,
    pointerId: event.pointerId,
    x: event.clientX,
    y: event.clientY,
    element: event.currentTarget as HTMLElement,
  };
  point = {x: event.clientX, y: event.clientY};
  cursor.value = {...point};
  scrollParent = root.value?.parentElement ?? undefined;
  while (
    scrollParent &&
    !/(auto|scroll)/.test(getComputedStyle(scrollParent).overflowY)
  )
    scrollParent = scrollParent.parentElement ?? undefined;
  listeners = new AbortController();
  const options = {signal: listeners.signal};
  window.addEventListener('pointermove', motion, options);
  window.addEventListener('pointerup', up, options);
  window.addEventListener('pointercancel', clear, options);
  window.addEventListener('blur', clear, options);
  window.addEventListener('keydown', escape, options);
}
function locate() {
  const clip = scrollParent?.getBoundingClientRect();
  if (
    clip &&
    (point.x < clip.left ||
      point.x > clip.right ||
      point.y < clip.top ||
      point.y > clip.bottom)
  ) {
    over.value = null;
    return;
  }
  const bounds = root.value?.getBoundingClientRect();
  if (
    !bounds ||
    point.x < bounds.left ||
    point.x > bounds.right ||
    point.y < bounds.top ||
    point.y > bounds.bottom
  ) {
    over.value = null;
    return;
  }
  const rows = Array.from(root.value!.children).filter(
    (element): element is HTMLElement =>
      element instanceof HTMLElement && !!element.dataset.reorderId
  );
  const row =
    rows.find((element) => point.y < element.getBoundingClientRect().bottom) ??
    rows[rows.length - 1];
  if (!row) {
    over.value = null;
    return;
  }
  const rect = row.getBoundingClientRect(),
    after = point.y > rect.top + rect.height / 2;
  over.value = {
    id: row.dataset.reorderId!,
    after,
    top: (after ? rect.bottom : rect.top) - bounds.top,
  };
}
function autoScroll() {
  if (!pending || !dragged.value.length) return;
  if (scrollParent) {
    const rect = scrollParent.getBoundingClientRect();
    if (point.x >= rect.left && point.x <= rect.right) {
      const delta =
        point.y < rect.top + 24 ? -8 : point.y > rect.bottom - 24 ? 8 : 0;
      if (delta) {
        scrollParent.scrollTop += delta;
        locate();
      }
    }
  }
  animation = requestAnimationFrame(autoScroll);
}
function motion(event: PointerEvent) {
  if (!pending || event.pointerId !== pending.pointerId) return;
  point = {x: event.clientX, y: event.clientY};
  cursor.value = {...point};
  if (!dragged.value.length) {
    if (Math.hypot(point.x - pending.x, point.y - pending.y) < 4) return;
    const id = pending.id;
    dragged.value = props.modelValue.filter((value) =>
      (props.selected.includes(id) ? props.selected : [id]).includes(value)
    );
    if (!props.selected.includes(id)) {
      emit('update:selected', [id]);
      emit('activate', id);
    }
    pending.element.setPointerCapture?.(pending.pointerId);
    animation = requestAnimationFrame(autoScroll);
  }
  event.preventDefault();
  locate();
}
function up(event: PointerEvent) {
  if (!pending || event.pointerId !== pending.pointerId) return;
  if (dragged.value.length) {
    event.preventDefault();
    suppressClick = true;
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => {
      suppressClick = false;
    }, 0);
    if (over.value) {
      const {id, after} = over.value,
        rest = props.modelValue.filter(
          (value) => !dragged.value.includes(value)
        );
      if (!dragged.value.includes(id))
        move(dragged.value, rest[rest.indexOf(id) + (after ? 1 : 0)] ?? null);
    }
  }
  clear();
}
function escape(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault();
    clear();
  }
}
function click(event: MouseEvent) {
  if (suppressClick) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
}
function move(ids: string[], beforeId: string | null) {
  const order = reorderItems(props.modelValue, ids, beforeId);
  if (order.some((id, index) => id !== props.modelValue[index])) {
    emit('update:modelValue', order);
    emit('reorder', {ids, order});
  }
}
function key(event: KeyboardEvent, id: string) {
  if (
    props.disabled ||
    !event.altKey ||
    !['ArrowUp', 'ArrowDown'].includes(event.key) ||
    (event.target as HTMLElement).closest('input,textarea')
  )
    return;
  event.preventDefault();
  const ids = props.modelValue.filter((value) =>
    (props.selected.includes(id) ? props.selected : [id]).includes(value)
  );
  const rest = props.modelValue.filter((value) => !ids.includes(value));
  const first = props.modelValue.indexOf(ids[0]),
    start = props.modelValue
      .slice(0, first)
      .filter((value) => !ids.includes(value)).length;
  const at = Math.max(
    0,
    Math.min(rest.length, start + (event.key === 'ArrowUp' ? -1 : 1))
  );
  move(ids, rest[at] ?? null);
}
function clear() {
  listeners?.abort();
  listeners = undefined;
  cancelAnimationFrame(animation);
  if (pending?.element.hasPointerCapture?.(pending.pointerId))
    pending.element.releasePointerCapture(pending.pointerId);
  pending = null;
  dragged.value = [];
  over.value = null;
}
defineSlots<{
  /** Row content; invoke select from the row's selection interaction. */ default?(
    props: {
    id: string;
    selected: boolean;
    select: (event: MouseEvent) => void;
  }
  ): unknown;
  /** Drag ghost for the moving IDs, including their count and first ID. */ 'drag-preview'?(
    props: {
    ids: string[];
    id: string | undefined;
    count: number;
  }
  ): unknown;
  /** Content shown when there are no row IDs. */ empty?(): unknown;
}>();
</script>
<template>
  <div
    ref="root"
    class="frame-reorder-list"
    :data-dragging="dragged.length || undefined"
    @dragstart.prevent
    @click.capture="click"
    role="group"
    :aria-label="label"
    :aria-disabled="disabled || undefined"
  >
    <div
      v-for="id in modelValue"
      :key="id"
      class="frame-reorder-item"
      :data-reorder-id="id"
      :data-selected="selected.includes(id) || undefined"
      :data-drop-before="(over?.id === id && !over.after) || undefined"
      :data-drop-after="(over?.id === id && over.after) || undefined"
      :draggable="false"
      @pointerdown="down($event, id)"
      @keydown="key($event, id)"
    >
      <slot
        :id="id"
        :selected="selected.includes(id)"
        :select="(event: MouseEvent) => select(id, event)"
      />
    </div>
    <div
      v-if="over && dragged.length"
      class="frame-reorder-indicator"
      aria-hidden="true"
      :style="indicatorStyle"
    />
    <FrameDragPreview
      v-if="dragged.length"
      class="frame-reorder-preview"
      :anchor="root"
      :x="cursor.x"
      :y="cursor.y"
    >
      <slot
        name="drag-preview"
        :ids="dragged"
        :id="dragged[0]"
        :count="dragged.length"
      >
        <span>{{
          dragged.length === 1 ? dragged[0] : `${dragged.length} items`
        }}</span>
      </slot>
    </FrameDragPreview>
    <slot name="empty" v-if="!modelValue.length" />
  </div>
</template>
<style lang="scss" scoped>
.frame-reorder-list {
  position: relative;
  min-height: 100%;
}
.frame-reorder-item {
  position: relative;
  user-select: none;
  touch-action: pan-y;
}
.frame-reorder-item input,
.frame-reorder-item textarea {
  user-select: text;
}
.frame-reorder-list[data-dragging] {
  cursor: grabbing;
}
.frame-reorder-indicator {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  /* Background for .frame-reorder-indicator. @token --frame-accent */
  --_frame-default-accent-e21b5fbd56: #409cff;
  /* Background for .frame-reorder-indicator. @token --frame-reorder-indicator */
  --_frame-default-reorder-indicator-42bb100095: var(
    --frame-accent,
    var(--_frame-default-accent-e21b5fbd56)
  );
  background: var(
    --frame-reorder-indicator,
    var(--_frame-default-reorder-indicator-42bb100095)
  );
  z-index: 10;
  pointer-events: none;
  transform: translateY(-1px);
}
</style>
