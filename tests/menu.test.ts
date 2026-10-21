import { describe, expect, test } from "bun:test";
import { fitMenu, selectableMenuItems } from "../src/frame/menu";

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
