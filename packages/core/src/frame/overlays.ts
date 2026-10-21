import { computed, inject, onBeforeUnmount, onMounted, provide, shallowRef, watch, type InjectionKey, type Ref } from "vue";

export interface OverlayBounds { left: number; top: number; width: number; height: number }
interface OverlayBoundary { bounds: Ref<OverlayBounds>; target: Ref<HTMLElement | undefined> }
const boundaryKey: InjectionKey<OverlayBoundary> = Symbol("frame-overlay-boundary");

export function viewportBounds(): OverlayBounds {
  return { left: 0, top: 0, width: typeof window === "undefined" ? 0 : window.innerWidth, height: typeof window === "undefined" ? 0 : window.innerHeight };
}

export function intersectOverlayBounds(a: OverlayBounds, b: OverlayBounds): OverlayBounds {
  const left = Math.max(a.left, b.left), top = Math.max(a.top, b.top);
  return { left, top, width: Math.max(0, Math.min(a.left + a.width, b.left + b.width) - left), height: Math.max(0, Math.min(a.top + a.height, b.top + b.height) - top) };
}

export function insetOverlayBounds(bounds: OverlayBounds, gap = 6): OverlayBounds {
  const x = Math.min(gap, bounds.width / 2), y = Math.min(gap, bounds.height / 2);
  return { left: bounds.left + x, top: bounds.top + y, width: Math.max(0, bounds.width - x * 2), height: Math.max(0, bounds.height - y * 2) };
}

export function fitOverlay(rect: OverlayBounds, bounds: OverlayBounds, gap = 6): OverlayBounds {
  const area = insetOverlayBounds(bounds, gap);
  const width = Math.min(rect.width, area.width), height = Math.min(rect.height, area.height);
  return { left: Math.max(area.left, Math.min(rect.left, area.left + area.width - width)), top: Math.max(area.top, Math.min(rect.top, area.top + area.height - height)), width, height };
}

export function overlayLayerStyle(bounds: OverlayBounds) {
  return { left: `${bounds.left}px`, top: `${bounds.top}px`, width: `${bounds.width}px`, height: `${bounds.height}px`, right: "auto", bottom: "auto" };
}

/** Each shell owns a measured boundary and an external host, outside its inert background. */
export function provideOverlayBoundary(body: Ref<HTMLElement | undefined>, target: Ref<HTMLElement | undefined>) {
  const bounds = shallowRef<OverlayBounds>(viewportBounds());
  provide(boundaryKey, { bounds, target });
  let observer: ResizeObserver | undefined;
  function measure() {
    if (!body.value) return;
    const next = intersectOverlayBounds(body.value.getBoundingClientRect(), viewportBounds());
    if (next.left !== bounds.value.left || next.top !== bounds.value.top || next.width !== bounds.value.width || next.height !== bounds.value.height) bounds.value = next;
  }
  function observe() { observer?.disconnect(); if (body.value) observer?.observe(body.value); measure(); }
  onMounted(() => {
    observer = new ResizeObserver(measure); observe();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
  });
  watch(body, observe, { flush: "post" });
  onBeforeUnmount(() => { observer?.disconnect(); window.removeEventListener("resize", measure); window.removeEventListener("scroll", measure, true); });
  return { bounds, target, style: computed(() => overlayLayerStyle(bounds.value)) };
}

/** Standalone controls fall back to their anchor's shell, then to the browser viewport. */
export function useOverlayBoundary(anchor?: () => HTMLElement | undefined) {
  const boundary = inject(boundaryKey, undefined);
  const fallback = shallowRef(viewportBounds());
  let observer: ResizeObserver | undefined;
  function owner() {
    const origin = anchor?.();
    const host = origin?.closest<HTMLElement>(".frame-overlay-host");
    const shell = origin?.closest<HTMLElement>(".workbench");
    const id = shell?.dataset.frameOverlayHost;
    return { area: shell?.querySelector<HTMLElement>(".workbench-body") ?? host, host: host ?? (id ? document.getElementById(id) : undefined) };
  }
  function resolveBounds() {
    const area = owner().area;
    return area ? intersectOverlayBounds(area.getBoundingClientRect(), viewportBounds()) : viewportBounds();
  }
  function updateFallback() {
    const next = resolveBounds(), current = fallback.value;
    if (next.left !== current.left || next.top !== current.top || next.width !== current.width || next.height !== current.height) fallback.value = next;
  }
  onMounted(() => {
    if (boundary) return;
    updateFallback();
    window.addEventListener("resize", updateFallback);
    window.addEventListener("scroll", updateFallback, true);
    const area = owner().area;
    if (area) { observer = new ResizeObserver(updateFallback); observer.observe(area); }
  });
  onBeforeUnmount(() => {
    if (!boundary) { window.removeEventListener("resize", updateFallback); window.removeEventListener("scroll", updateFallback, true); }
    observer?.disconnect();
  });
  function getBounds(): OverlayBounds {
    if (boundary) return boundary.bounds.value;
    // Track fallback changes, but read the anchor's current geometry on each placement.
    void fallback.value;
    return resolveBounds();
  }
  return { bounds: boundary?.bounds ?? fallback, target: computed(() => { void fallback.value; return boundary?.target.value ?? owner().host ?? "body"; }), getBounds };
}
