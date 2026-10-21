import { expect, test } from "bun:test";
import { createViewDrag, insertionBefore } from "../packages/core/src/frame/viewDrag";

test("drop insertion chooses either side of activities, tabs, and accordion views", () => {
  expect(insertionBefore(["a", "b", "c"], "b", false)).toBe("b");
  expect(insertionBefore(["a", "b", "c"], "b", true)).toBe("c");
  expect(insertionBefore(["a", "b", "c"], "c", true)).toBeUndefined();
});

test("pointer drag exposes preview and insertion state, activates hovered views, and cancels cleanly", async () => {
  const oldWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const oldDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  const oldFrame = Object.getOwnPropertyDescriptor(globalThis, "requestAnimationFrame");
  const bus = new EventTarget();
  const box = { left: 10, right: 42, top: 80, bottom: 114, width: 32, height: 34 };
  const region = { dataset: { viewRegion: "primary", viewAxis: "y" }, getBoundingClientRect: () => ({ left: 0, top: 34, width: 40, height: 766 }), contains: () => true };
  const item = { dataset: { viewId: "target" }, getBoundingClientRect: () => box, closest: (selector: string) => selector === "[data-view-axis]" ? region : null };
  let hit: object = { closest: (selector: string) => selector === "[data-view-region]" || selector === "[data-view-axis]" ? region : selector === "[data-view-id]" ? item : null };
  const shell = { contains: () => true, querySelector: () => ({ getBoundingClientRect: () => ({ left: 0, right: 1200, top: 34, bottom: 800, width: 1200, height: 766 }) }) };
  Object.defineProperty(globalThis, "window", { configurable: true, value: bus });
  Object.defineProperty(globalThis, "document", { configurable: true, value: { elementFromPoint: () => hit } });
  Object.defineProperty(globalThis, "requestAnimationFrame", { configurable: true, value: (callback: () => void) => { callback(); return 1; } });
  let activations = 0, reveals = 0, closed = true;
  const drag = createViewDrag({ view: () => ({ id: "source", label: "Source", component: {} }), siblings: () => ["source", "target", "next"], canMove: () => true, move: () => true, activate: () => { activations++; }, reveal: () => { reveals++; closed = false; }, closed: region => region === "bottom" && closed, primarySide: () => "left", enabled: () => true });
  const begin = () => drag.begin({ button: 0, pointerId: 1, clientX: 10, clientY: 50, currentTarget: { closest: () => shell } } as unknown as PointerEvent, "source", "primary");
  const pointer = (type: string, x: number, y: number) => { const event = new Event(type, { cancelable: true }); Object.assign(event, { pointerId: 1, clientX: x, clientY: y }); bus.dispatchEvent(event); };
  try {
    begin(); pointer("pointermove", 25, 100);
    expect(drag.state.active).toBe(true); expect(drag.state.id).toBe("source"); expect(drag.state.x).toBe(25);
    expect(drag.state.drop?.before).toBe("next"); expect(drag.state.drop?.marker.kind).toBe("insert");
    await new Promise(resolve => setTimeout(resolve, 630)); expect(activations).toBe(1);
    pointer("pointercancel", 25, 100); expect(drag.state.active).toBe(false); expect(drag.state.drop).toBeNull();
    hit = { closest: () => null };
    begin(); pointer("pointermove", 500, 790);
    expect(drag.state.drop?.region).toBe("bottom");
    await new Promise(resolve => setTimeout(resolve, 380)); expect(reveals).toBe(1);
    drag.cancel(); expect(drag.state.active).toBe(false);
  } finally {
    drag.cancel();
    for (const [name, descriptor] of [["window", oldWindow], ["document", oldDocument], ["requestAnimationFrame", oldFrame]] as const) { if (descriptor) Object.defineProperty(globalThis, name, descriptor); else Reflect.deleteProperty(globalThis, name); }
  }
});
