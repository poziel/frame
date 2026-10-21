import type { FrameMenuItem } from "../types";
export function selectableMenuItems(items: readonly FrameMenuItem[]) {
  return items.filter((item): item is Exclude<FrameMenuItem, { type: "separator" }> => item.type !== "separator" && !item.disabled);
}
export function fitMenu(anchor: { left: number; right: number; top: number; bottom: number }, size: { width: number; height: number }, viewport: { width: number; height: number }, submenu = false, placement: "bottom" | "right" = "bottom") {
  const gap = 4;
  const beside = submenu || placement === "right";
  let left = beside ? anchor.right + gap : anchor.left;
  if (beside && left + size.width > viewport.width - 6) left = anchor.left - size.width - gap;
  const top = submenu ? anchor.top - 4 : placement === "right" ? anchor.bottom : anchor.bottom + 3;
  return {
    left: Math.max(6, Math.min(left, viewport.width - size.width - 6)),
    top: Math.max(6, Math.min(top, viewport.height - size.height - 6)),
  };
}
