import { reactive } from "vue";
import type { ViewDefinition, ViewRegion } from "../types";
export interface DropMarker { left: number; top: number; width: number; height: number; kind: "insert" | "inside" }
export interface ViewDrop { region: ViewRegion; parent?: string; before?: string; marker: DropMarker }
export function insertionBefore(ids: readonly string[], hovered: string, after: boolean) {
  const index = ids.indexOf(hovered);
  return index < 0 ? undefined : after ? ids[index + 1] : hovered;
}
/** Pointer sessions own all preview, hover, timer, and cancellation state. */
export function createViewDrag(context: {
  view(id: string): ViewDefinition | undefined;
  siblings(region: ViewRegion, parent?: string): string[];
  canMove(id: string, region: ViewRegion, parent?: string): boolean;
  move(id: string, region: ViewRegion, before?: string, parent?: string): boolean;
  activate(id: string): void;
  reveal(region: ViewRegion): void;
  closed(region: ViewRegion): boolean;
  primarySide(): "left" | "right";
  enabled(region: ViewRegion): boolean;
}) {
  const state = reactive({ active: false, id: "", x: 0, y: 0, drop: null as ViewDrop | null });
  let stop: (() => void) | undefined;
  function begin(event: PointerEvent, id: string, region: ViewRegion) {
    const view = context.view(id);
    const shell = (event.currentTarget as HTMLElement).closest<HTMLElement>(".workbench");
    if (!shell || !view || event.button !== 0 || !context.enabled(region) || view.draggable === false) return;
    stop?.();
    const startX = event.clientX, startY = event.clientY;
    let hoverKey = "";
    let timer: ReturnType<typeof setTimeout> | undefined;
    let point = { x: startX, y: startY };
    function cancelHover() { clearTimeout(timer); timer = undefined; hoverKey = ""; }
    function schedule(key: string, action: () => void, delay: number) {
      if (key === hoverKey) return;
      cancelHover(); hoverKey = key;
      timer = setTimeout(() => { action(); requestAnimationFrame(() => { if (state.active) update(); }); }, delay);
    }
    function update() {
      const hit = document.elementFromPoint(point.x, point.y) as HTMLElement | null;
      state.drop = null;
      if (!hit || !shell!.contains(hit)) { cancelHover(); return; }
      const body = shell!.querySelector<HTMLElement>(".workbench-body");
      if (!body) return;
      const bounds = body.getBoundingClientRect();
      let edge: ViewRegion | undefined;
      if (point.y > bounds.bottom - 28 && point.x > bounds.left + 48 && point.x < bounds.right - 48 && context.closed("bottom")) edge = "bottom";
      else if (point.x < bounds.left + 28) edge = context.primarySide() === "left" ? "primary" : "secondary";
      else if (point.x > bounds.right - 28) edge = context.primarySide() === "right" ? "primary" : "secondary";
      if (edge && context.closed(edge) && context.enabled(edge) && context.canMove(id, edge)) {
        const target = edge;
        schedule(`edge:${target}`, () => context.reveal(target), 350);
        const physicalLeft = (target === "primary") === (context.primarySide() === "left");
        state.drop = { region: target, marker: target === "bottom" ? { kind: "inside", left: bounds.left, top: bounds.bottom - 28, width: bounds.width, height: 28 } : { kind: "inside", left: physicalLeft ? bounds.left : bounds.right - 28, top: bounds.top, width: 28, height: bounds.height } };
        return;
      }
      const regionElement = hit.closest<HTMLElement>("[data-view-region]");
      if (!regionElement) { cancelHover(); return; }
      const destination = regionElement.dataset.viewRegion as ViewRegion;
      if (!context.enabled(destination)) { cancelHover(); return; }
      const item = hit.closest<HTMLElement>("[data-view-id]");
      const hovered = item?.dataset.viewId;
      if (hovered && hovered !== id) schedule(`view:${hovered}`, () => { if (context.view(hovered)) context.activate(hovered); }, 600);
      else cancelHover();
      const collection = hit.closest<HTMLElement>("[data-view-parent]");
      const parent = collection?.dataset.viewParent;
      if (!context.canMove(id, destination, parent)) return;
      const list = hit.closest<HTMLElement>("[data-view-axis]");
      if (list && item && list.contains(item)) {
        const axis = list.dataset.viewAxis;
        const box = item.getBoundingClientRect();
        const after = axis === "x" ? point.x > box.left + box.width / 2 : point.y > box.top + box.height / 2;
        const before = insertionBefore(context.siblings(destination, parent), hovered!, after);
        const row = item.closest<HTMLElement>(".panel-section")?.getBoundingClientRect() ?? box;
        const marker = axis === "x" ? { kind: "insert" as const, left: (after ? box.right : box.left) - 1, top: box.top, width: 2, height: box.height } : { kind: "insert" as const, left: row.left, top: (after ? row.bottom : row.top) - 1, width: row.width, height: 2 };
        state.drop = { region: destination, parent, before, marker };
      } else if (list && !collection) {
        const axis = list.dataset.viewAxis;
        const items = Array.from(list.querySelectorAll<HTMLElement>("[data-view-id]")).filter(element => element.closest("[data-view-axis]") === list);
        const following = items.find(element => { const box = element.getBoundingClientRect(); return axis === "x" ? point.x < box.left + box.width / 2 : point.y < box.top + box.height / 2; });
        const reference = following ?? items[items.length - 1];
        if (reference) {
          const box = reference.getBoundingClientRect();
          state.drop = { region: destination, before: following?.dataset.viewId, marker: axis === "x" ? { kind: "insert", left: (following ? box.left : box.right) - 1, top: box.top, width: 2, height: box.height } : { kind: "insert", left: box.left, top: (following ? box.top : box.bottom) - 1, width: box.width, height: 2 } };
        } else {
          const box = list.getBoundingClientRect();
          state.drop = { region: destination, marker: { kind: "inside", left: box.left, top: box.top, width: Math.max(20, box.width), height: Math.max(20, box.height) } };
        }
      } else if (collection) {
        const sections = Array.from(collection.children).filter(element => element.classList.contains("panel-section")) as HTMLElement[];
        const row = sections.find(element => point.y < element.getBoundingClientRect().top + element.getBoundingClientRect().height / 2);
        const before = row?.querySelector<HTMLElement>("[data-view-id]")?.dataset.viewId;
        const bounds = collection.getBoundingClientRect();
        const last = sections[sections.length - 1]?.getBoundingClientRect();
        state.drop = { region: destination, parent, before, marker: sections.length ? { kind: "insert", left: bounds.left, top: (row?.getBoundingClientRect().top ?? last!.bottom) - 1, width: bounds.width, height: 2 } : { kind: "inside", left: bounds.left, top: bounds.top, width: bounds.width, height: bounds.height } };
      } else {
        const bounds = regionElement.getBoundingClientRect();
        state.drop = { region: destination, marker: { kind: "inside", left: bounds.left + 2, top: bounds.top + 2, width: Math.max(0, bounds.width - 4), height: Math.max(0, bounds.height - 4) } };
      }
    }
    function move(next: PointerEvent) {
      if (next.pointerId !== event.pointerId) return;
      if (!state.active && Math.hypot(next.clientX - startX, next.clientY - startY) < 5) return;
      state.active = true; state.id = id; state.x = next.clientX; state.y = next.clientY;
      point = { x: next.clientX, y: next.clientY }; next.preventDefault(); update();
    }
    function finish(next: PointerEvent) {
      if (next.pointerId !== event.pointerId) return;
      if (state.active) {
        point = { x: next.clientX, y: next.clientY }; update();
        const drop = state.drop;
        if (drop) { context.reveal(drop.region); context.move(id, drop.region, drop.before, drop.parent); }
        window.addEventListener("click", suppressClick, { capture: true, once: true });
        setTimeout(() => window.removeEventListener("click", suppressClick, true), 0);
      }
      stop?.();
    }
    function suppressClick(next: MouseEvent) { next.preventDefault(); next.stopPropagation(); }
    function cancel() { stop?.(); }
    function key(next: KeyboardEvent) { if (next.key === "Escape") { next.preventDefault(); next.stopPropagation(); cancel(); } }
    stop = () => {
      cancelHover(); state.active = false; state.id = ""; state.drop = null;
      window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", finish); window.removeEventListener("pointercancel", cancel); window.removeEventListener("keydown", key); window.removeEventListener("blur", cancel); window.removeEventListener("scroll", update, true); window.removeEventListener("resize", update); stop = undefined;
    };
    window.addEventListener("pointermove", move, { passive: false }); window.addEventListener("pointerup", finish); window.addEventListener("pointercancel", cancel); window.addEventListener("keydown", key); window.addEventListener("blur", cancel); window.addEventListener("scroll", update, true); window.addEventListener("resize", update);
  }
  return { state, begin, cancel: () => stop?.() };
}
