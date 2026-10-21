import { describe, expect, test } from "bun:test";
import { fitMenu, selectableMenuItems } from "../packages/core/src/frame/menu";

describe("menu navigation and positioning", () => {
  test("separators and disabled rows cannot receive keyboard selection", () => {
    expect(selectableMenuItems([
      { id: "separator", type: "separator" },
      { id: "disabled", label: "Disabled", disabled: true },
      { id: "toggle", label: "Panel", checked: false },
    ]).map(item => item.id)).toEqual(["toggle"]);
  });
  test("flyouts open to the left when there is no room on the right", () => {
    const result = fitMenu({ left: 400, right: 640, top: 200, bottom: 225 }, { width: 240, height: 120 }, { width: 700, height: 500 }, true);
    expect(result).toEqual({ left: 156, top: 196 });
  });
  test("menus stay within the visible viewport near the bottom edge", () => {
    const result = fitMenu({ left: 300, right: 330, top: 270, bottom: 295 }, { width: 240, height: 150 }, { width: 360, height: 300 });
    expect(result.left).toBe(114);
    expect(result.top).toBe(144);
  });
});

test("Manage menus stay beside the button when clamped at the bottom", () => {
  const anchor = { left: 10, right: 42, top: 700, bottom: 734 };
  const result = fitMenu(anchor, { width: 240, height: 120 }, { width: 1180, height: 780 }, false, "right");
  expect(result.left).toBe(46); expect(result.top).toBe(654);
  expect(result.left).toBeGreaterThan(anchor.right);
  const flipped = fitMenu({ left: 1100, right: 1132, top: 700, bottom: 734 }, { width: 240, height: 120 }, { width: 1180, height: 780 }, false, "right");
  expect(flipped.left).toBe(856);
});

test("menus respect an offset workbench body instead of the full window", () => {
  const body = { left: 20, top: 34, width: 800, height: 712 };
  const bottom = fitMenu({ left: 30, right: 62, top: 700, bottom: 734 }, { width: 240, height: 150 }, body, false, "right");
  expect(bottom).toEqual({ left: 66, top: 590 });
  const top = fitMenu({ left: 30, right: 62, top: 0, bottom: 30 }, { width: 240, height: 150 }, body);
  expect(top).toEqual({ left: 30, top: 40 });
  const submenu = fitMenu({ left: 760, right: 800, top: 0, bottom: 30 }, { width: 240, height: 150 }, body, true);
  expect(submenu).toEqual({ left: 516, top: 40 });
});

test("menu positioning reads measured dimensions even when DOMRect properties are not enumerable", () => {
  const size = Object.defineProperties({}, { width: { get: () => 240 }, height: { get: () => 150 } }) as { width: number; height: number };
  expect(fitMenu({ left: 30, right: 62, top: 700, bottom: 734 }, size, { left: 0, top: 34, width: 1180, height: 712 }, false, "right")).toEqual({ left: 66, top: 590 });
});
