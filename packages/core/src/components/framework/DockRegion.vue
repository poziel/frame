<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  nextTick,
  type ComponentPublicInstance,
} from 'vue';
import {useFrame} from '../../framework/useFrame';
import type {
  Dock,
  DockEdge,
  DockPlacement,
  DockSpace,
} from '../../framework/layout/docks';
import './styles/docks.scss';

const props = withDefaults(
  defineProps<{
    region: string;
    mode?: 'inside' | 'outside' | 'both';
    showContent?: boolean;
  }>(),
  {mode: 'both', showContent: true}
);
const frame = useFrame(),
  edges = ['top', 'right', 'bottom', 'left'] as const;
const lanes = new Map<string, HTMLElement>(),
  targets = new Map<string, {id: string; element: HTMLElement}>();
const root = ref<HTMLElement>(),
  main = ref<HTMLElement>();
const outside = computed(
  () =>
    props.mode !== 'inside' &&
    frame.docks.at(props.region, 'outside').length > 0
);
const inside = computed(
  () =>
    props.mode !== 'outside' &&
    frame.docks.at(props.region, 'inside').length > 0
);
function list(place: DockPlacement, edge: DockEdge) {
  return (
    place === 'overlay'
      ? props.mode !== 'outside'
      : props.mode !== (place === 'inside' ? 'outside' : 'inside')
  )
    ? frame.docks.at(props.region, place, edge)
    : [];
}
function size(dock: Dock) {
  const bounds = frame.docks.anchorRect(dock.anchor),
    origin = lanes.get(`outside:${dock.edge}`)?.getBoundingClientRect();
  const horizontal = dock.edge === 'top' || dock.edge === 'bottom';
  const outside = frame.docks.resolve(dock.id)?.placement === 'outside';
  const measured =
    outside && bounds && bounds.width > 0 && bounds.height > 0 && origin;
  const left =
    measured &&
    horizontal &&
    frame.docks
      .at(props.region, 'outside', 'left')
      .some((d) => d.anchor === dock.anchor)
      ? frame.docks.space(props.region).left
      : 0;
  const right =
    measured &&
    horizontal &&
    frame.docks
      .at(props.region, 'outside', 'right')
      .some((d) => d.anchor === dock.anchor)
      ? frame.docks.space(props.region).right
      : 0;
  return {
    width:
      dock.width === undefined
        ? measured && horizontal
          ? `${bounds.width + left + right}px`
          : undefined
        : `${dock.width}px`,
    height:
      dock.height === undefined
        ? measured && !horizontal
          ? `${bounds.height}px`
          : undefined
        : `${dock.height}px`,
    marginLeft:
      measured && horizontal
        ? `${Math.max(0, bounds.left - origin.left - left)}px`
        : undefined,
    marginTop:
      measured && !horizontal
        ? `${Math.max(0, bounds.top - origin.top)}px`
        : undefined,
  };
}
function host(
  id: string,
  place: DockPlacement,
  edge: DockEdge,
  node: Element | ComponentPublicInstance | null
) {
  const key = `${place}:${edge}:${id}`,
    old = targets.get(key)?.element;
  const el = node instanceof HTMLElement ? node : null;
  if (el) {
    targets.set(key, {id, element: el});
    frame.docks.setHost(id, el);
  } else if (old) {
    targets.delete(key);
    frame.docks.setHost(id, null, old);
  }
}
let observer: ResizeObserver | undefined;
let measurementFrame = 0,
  alive = true;
function scheduleMeasure() {
  if (alive && !measurementFrame)
    measurementFrame = requestAnimationFrame(() => {
      measurementFrame = 0;
      measure();
    });
}
function measure() {
  if (!alive) return;
  const anchor =
    props.mode === 'inside' ? root.value?.parentElement : main.value;
  if (
    anchor &&
    [
      'workspace',
      'primarySidebar',
      'secondarySidebar',
      'panel',
      'primaryViewBar',
      'secondaryViewBar',
      'panelViewBar',
      'navigationBar',
      'statusBar',
    ].includes(props.region)
  )
    frame.docks.reportAnchor(props.region, anchor.getBoundingClientRect());
  for (const place of ['outside', 'inside'] as const) {
    if (props.mode !== 'both' && props.mode !== place) continue;
    const space: DockSpace = {top: 0, right: 0, bottom: 0, left: 0};
    const intrinsic = {width: 0, height: 0};
    for (const edge of edges) {
      const el = lanes.get(`${place}:${edge}`);
      if (!el || !list(place, edge).length) continue;
      const horizontal = edge === 'top' || edge === 'bottom',
        style = getComputedStyle(el),
        children = Array.from(el.children) as HTMLElement[];
      const padding = horizontal
        ? parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)
        : parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
      const gap = parseFloat(horizontal ? style.rowGap : style.columnGap) || 0;
      space[edge] =
        padding +
        gap * Math.max(0, children.length - 1) +
        children.reduce((sum, child) => {
          const dock = frame.docks.get(child.dataset.dockHost ?? ''),
            explicit = horizontal ? dock?.height : dock?.width,
            r = child.getBoundingClientRect();
          return (
            sum +
            (explicit ??
              Math.max(
                horizontal ? r.height : r.width,
                horizontal ? child.scrollHeight : child.scrollWidth
              ))
          );
        }, 0);
    }
    for (const edge of edges) {
      const el = lanes.get(`${place}:${edge}`);
      if (!el || !list(place, edge).length) continue;
      for (const slot of Array.from(el.children) as HTMLElement[]) {
        const surface = slot.firstElementChild as HTMLElement | null;
        if (!surface) continue;
        const horizontal = edge === 'top' || edge === 'bottom';
        if (horizontal)
          intrinsic.width = Math.max(
            intrinsic.width,
            slot.scrollWidth,
            surface.scrollWidth
          );
        else
          intrinsic.height = Math.max(
            intrinsic.height,
            slot.scrollHeight,
            surface.scrollHeight
          );
      }
    }
    if (place === 'inside' && inside.value && main.value) {
      const style = getComputedStyle(main.value);
      for (const edge of edges) {
        const key =
          `padding${edge[0]!.toUpperCase() + edge.slice(1)}` as 'paddingTop';
        space[edge] += parseFloat(style[key]) || 0;
      }
    }
    frame.docks.measure(
      place === 'inside' ? `inside:${props.region}` : props.region,
      space,
      intrinsic
    );
  }
}
function lane(
  place: 'inside' | 'outside',
  edge: DockEdge,
  node: Element | ComponentPublicInstance | null
) {
  const key = `${place}:${edge}`,
    old = lanes.get(key);
  if (old) observer?.unobserve(old);
  if (node instanceof HTMLElement) {
    lanes.set(key, node);
    observer?.observe(node);
  } else lanes.delete(key);
}
onMounted(() => {
  observer = new ResizeObserver(scheduleMeasure);
  for (const el of lanes.values()) observer.observe(el);
  const anchor =
    props.mode === 'inside' ? root.value?.parentElement : main.value;
  if (anchor) observer.observe(anchor);
  scheduleMeasure();
});
watch(
  () => [frame.docks.items.value, {...frame.layout}, props.showContent],
  async () => {
    await nextTick();
    scheduleMeasure();
  },
  {flush: 'post'}
);
onBeforeUnmount(() => {
  alive = false;
  observer?.disconnect();
  cancelAnimationFrame(measurementFrame);
  for (const {id, element} of targets.values())
    frame.docks.setHost(id, null, element);
  if (props.mode !== 'inside')
    frame.docks.measure(props.region, {top: 0, right: 0, bottom: 0, left: 0});
  if (props.mode !== 'outside')
    frame.docks.measure(`inside:${props.region}`, {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    });
});
</script>
<template>
  <div
    ref="root"
    class="frame-dock-region"
    :data-dock-region="region"
    :class="{'has-outside-docks': outside}"
  >
    <div
      v-for="edge in edges"
      v-show="list('outside', edge).length"
      :key="edge"
      :ref="(node) => lane('outside', edge, node)"
      class="frame-dock-lane frame-dock-outside"
      :class="`dock-edge-${edge}`"
      :data-dock-edge="edge"
      data-dock-placement="outside"
    >
      <div
        v-for="dock in list('outside', edge)"
        :key="dock.id"
        :ref="(node) => host(dock.id, 'outside', edge, node)"
        class="frame-dock-slot"
        :style="size(dock)"
        :data-dock-host="dock.id"
      />
    </div>
    <div
      ref="main"
      class="frame-dock-main"
      :class="{'dock-content-hidden': !showContent, 'has-inside-docks': inside}"
    >
      <div class="frame-dock-content" :data-dock-content-region="region"
        ><slot />
        <div v-if="mode !== 'outside'" class="frame-dock-overlays">
          <div
            v-for="edge in edges"
            v-show="list('overlay', edge).length"
            :key="edge"
            class="frame-dock-lane frame-dock-overlay"
            :class="`dock-edge-${edge}`"
            :data-dock-edge="edge"
            data-dock-placement="overlay"
          >
            <div
              v-for="dock in list('overlay', edge)"
              :key="dock.id"
              :ref="(node) => host(dock.id, 'overlay', edge, node)"
              class="frame-dock-slot"
              :style="size(dock)"
              :data-dock-host="dock.id"
            />
          </div>
        </div>
      </div>
      <div
        v-for="edge in edges"
        v-show="list('inside', edge).length"
        :key="edge"
        :ref="(node) => lane('inside', edge, node)"
        class="frame-dock-lane frame-dock-inside"
        :class="`dock-edge-${edge}`"
        :data-dock-edge="edge"
        data-dock-placement="inside"
      >
        <div
          v-for="dock in list('inside', edge)"
          :key="dock.id"
          :ref="(node) => host(dock.id, 'inside', edge, node)"
          class="frame-dock-slot"
          :style="size(dock)"
          :data-dock-host="dock.id"
        />
      </div>
    </div>
  </div>
</template>
