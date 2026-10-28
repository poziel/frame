<script setup lang="ts">
import {computed, onBeforeUnmount, onMounted, ref, shallowRef} from 'vue';
import {useOverlayBoundary} from '../overlays/overlays';

const props = defineProps<{
  /** Optional scrolling root; defaults to the surrounding parent element. */
  root?: HTMLElement;
}>();
const {target} = useOverlayBoundary(() => props.root);
// Keep an overlay's scrollbars inside its own stacking context.
const scrollbarTarget = computed(
  () =>
    props.root?.closest<HTMLElement>(
      '.frame-menu, .frame-select-popup, .frame-modal-layer, .palette-backdrop, .frame-notifications, .frame-custom-overlays'
    ) ?? target.value
);

type Bar = {
  host: HTMLElement;
  axis: 'x' | 'y';
  x: number;
  y: number;
  length: number;
  thumb: number;
  offset: number;
  range: number;
};

const bars = shallowRef<Bar[]>([]);
const dragging = ref(false);
let hovered: HTMLElement | undefined;
let raf = 0;
let resize: ResizeObserver | undefined;
let mutation: MutationObserver | undefined;
function update() {
  raf = 0;
  if (
    !hovered?.isConnected ||
    hovered.closest('[inert]') ||
    !props.root?.contains(hovered)
  ) {
    bars.value = [];
    return;
  }
  const next: Bar[] = [];
  for (
    let host: HTMLElement | null = hovered;
    host && props.root.contains(host);
    host = host.parentElement
  ) {
    const style = getComputedStyle(host);
    const rect = host.getBoundingClientRect();
    if (!rect.width || !rect.height) continue;
    for (const axis of ['y', 'x'] as const) {
      if (!/auto|scroll/.test(axis === 'y' ? style.overflowY : style.overflowX))
        continue;
      const viewport = axis === 'y' ? host.clientHeight : host.clientWidth;
      const content = axis === 'y' ? host.scrollHeight : host.scrollWidth;
      if (content <= viewport + 1 || viewport < 1) continue;
      // Clip the track to scrolling ancestors so nested/partially hidden regions remain contained.
      let left = rect.left + host.clientLeft,
        top = rect.top + host.clientTop;
      let right = left + host.clientWidth,
        bottom = top + host.clientHeight;
      for (
        let parent = host.parentElement;
        parent;
        parent = parent.parentElement
      ) {
        const css = getComputedStyle(parent),
          bounds = parent.getBoundingClientRect();
        if (css.overflowX !== 'visible') {
          left = Math.max(left, bounds.left);
          right = Math.min(right, bounds.right);
        }
        if (css.overflowY !== 'visible') {
          top = Math.max(top, bounds.top);
          bottom = Math.min(bottom, bounds.bottom);
        }
      }
      const length = Math.max(0, axis === 'y' ? bottom - top : right - left);
      if (!length) continue;
      const thumb = Math.min(
        length,
        Math.max(24, (length * viewport) / content)
      );
      const range = content - viewport;
      next.push({
        host,
        axis,
        x: axis === 'y' ? right - 12 : left,
        y: axis === 'y' ? top : bottom - 12,
        length,
        thumb,
        range,
        offset:
          ((axis === 'y' ? host.scrollTop : host.scrollLeft) / range) *
          (length - thumb),
      });
    }
  }
  bars.value = next;
}
function schedule() {
  if (!raf) raf = requestAnimationFrame(update);
}
function hover(event: PointerEvent) {
  if (dragging.value) return;
  const target = event.target as HTMLElement;
  if (target.closest('.frame-overlay-scrollbar')) return;
  hovered = props.root?.contains(target) ? target : undefined;
  resize?.disconnect();
  if (props.root) resize?.observe(props.root);
  for (
    let element = hovered;
    element && props.root?.contains(element);
    element = element.parentElement ?? undefined
  )
    resize?.observe(element);
  schedule();
}
let drag:
  | {
      bar: Bar;
      position: number;
      scroll: number;
      element: HTMLElement;
      pointer: number;
    }
  | undefined;
function start(event: PointerEvent, bar: Bar) {
  if (event.button !== 0) return;
  event.preventDefault();
  event.stopPropagation();
  const position = bar.axis === 'y' ? event.clientY : event.clientX;
  const local = position - (bar.axis === 'y' ? bar.y : bar.x);
  if (local < bar.offset || local > bar.offset + bar.thumb) {
    const value = Math.max(
      0,
      Math.min(
        bar.range,
        ((local - bar.thumb / 2) / Math.max(1, bar.length - bar.thumb)) *
          bar.range
      )
    );
    if (bar.axis === 'y') bar.host.scrollTop = value;
    else bar.host.scrollLeft = value;
  }
  const element = event.currentTarget as HTMLElement;
  drag = {
    bar,
    position,
    scroll: bar.axis === 'y' ? bar.host.scrollTop : bar.host.scrollLeft,
    element,
    pointer: event.pointerId,
  };
  dragging.value = true;
  element.setPointerCapture(event.pointerId);
  schedule();
}
function move(event: PointerEvent) {
  if (!drag || drag.pointer !== event.pointerId) return;
  const {bar} = drag;
  const value =
    drag.scroll +
    (((bar.axis === 'y' ? event.clientY : event.clientX) - drag.position) *
      bar.range) /
      Math.max(1, bar.length - bar.thumb);
  if (bar.axis === 'y') bar.host.scrollTop = value;
  else bar.host.scrollLeft = value;
  schedule();
}
function finish(event?: PointerEvent) {
  if (!drag) return;
  const saved = drag;
  drag = undefined;
  dragging.value = false;
  if (saved.element.hasPointerCapture(saved.pointer))
    saved.element.releasePointerCapture(saved.pointer);
  if (event) {
    const target = document.elementFromPoint(event.clientX, event.clientY);
    if (!target?.closest('.frame-overlay-scrollbar'))
      hovered = target instanceof HTMLElement ? target : undefined;
  }
  schedule();
}
function wheel(event: WheelEvent, bar: Bar) {
  event.preventDefault();
  event.stopPropagation();
  const scale =
    event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? bar.length : 1;
  bar.host.scrollBy({
    left:
      event.deltaX * scale +
      (bar.axis === 'x' && !event.deltaX ? event.deltaY * scale : 0),
    top: bar.axis === 'y' ? event.deltaY * scale : 0,
  });
  schedule();
}
// Filters and transformed popper wrappers establish a local coordinate system for fixed descendants.
function barPosition(bar: Bar) {
  let host =
    typeof scrollbarTarget.value === 'string'
      ? undefined
      : scrollbarTarget.value;
  while (host) {
    const style = getComputedStyle(host);
    if (
      style.transform !== 'none' ||
      style.perspective !== 'none' ||
      style.filter !== 'none' ||
      style.backdropFilter !== 'none'
    ) {
      const rect = host.getBoundingClientRect();
      return {
        left: `${bar.x - rect.left - host.clientLeft + host.scrollLeft}px`,
        top: `${bar.y - rect.top - host.clientTop + host.scrollTop}px`,
      };
    }
    host = host.parentElement ?? undefined;
  }
  return {left: `${bar.x}px`, top: `${bar.y}px`};
}
function leave() {
  if (!dragging.value) {
    hovered = undefined;
    schedule();
  }
}
onMounted(() => {
  window.addEventListener('pointerover', hover);
  window.addEventListener('scroll', schedule, true);
  window.addEventListener('resize', schedule);
  document.documentElement.addEventListener('pointerleave', leave);
  resize = new ResizeObserver(schedule);
  if (props.root) resize.observe(props.root);
  mutation = new MutationObserver((records) => {
    const isBar = (node: Node) =>
      node instanceof Element && !!node.closest('.frame-overlay-scrollbar');
    if (
      records.some(
        (record) =>
          !isBar(record.target) &&
          (record.type !== 'childList' ||
            [...record.addedNodes, ...record.removedNodes].some(
              (node) => !isBar(node)
            ))
      )
    )
      schedule();
  });
  if (props.root)
    mutation.observe(props.root, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
    });
});
onBeforeUnmount(() => {
  finish();
  cancelAnimationFrame(raf);
  resize?.disconnect();
  mutation?.disconnect();
  window.removeEventListener('pointerover', hover);
  window.removeEventListener('scroll', schedule, true);
  window.removeEventListener('resize', schedule);
  document.documentElement.removeEventListener('pointerleave', leave);
});
</script>
<template>
  <Teleport :to="scrollbarTarget"
    ><div
      v-for="bar in bars"
      :key="bars.indexOf(bar)"
      class="frame-overlay-scrollbar"
      :class="[bar.axis, {dragging}]"
      aria-hidden="true"
      :style="{
        ...barPosition(bar),
        width: `${bar.axis === 'x' ? bar.length : 12}px`,
        height: `${bar.axis === 'y' ? bar.length : 12}px`,
      }"
      @pointerdown="start($event, bar)"
      @pointermove="move"
      @pointerup="finish"
      @pointercancel="finish"
      @lostpointercapture="finish()"
      @wheel="wheel($event, bar)"
      ><div
        class="frame-overlay-thumb"
        :style="
          bar.axis === 'y'
            ? {
                height: `${bar.thumb}px`,
                transform: `translateY(${bar.offset}px)`,
              }
            : {
                width: `${bar.thumb}px`,
                transform: `translateX(${bar.offset}px)`,
              }
        " /></div
  ></Teleport>
</template>
