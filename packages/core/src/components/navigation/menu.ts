import type {FrameMenuItem} from './generalMenu';
import { fitOverlay } from "../overlays/overlays";
export function selectableMenuItems(items: readonly FrameMenuItem[]) {
  return items.filter((
    item
  ): item is Exclude<FrameMenuItem, { type: "separator" }> => item.type !== "separator" && !item.disabled);
}
export function fitMenu(
  anchor: { left: number; right: number; top: number; bottom: number },
  size: { width: number; height: number },
  viewport: { width: number; height: number; left?: number; top?: number },
  submenu = false,
  placement: "bottom" | "right" = "bottom"
) {
  const gap = 4;
  const beside = submenu || placement === "right";
  let left = beside ? anchor.right + gap : anchor.left;
  if (beside && left + size.width > (viewport.left ?? 0) + viewport.width - 6) left = anchor.left - size.width - gap;
  const top = submenu ? anchor.top - 4 : placement === "right" ? anchor.bottom : anchor.bottom + 3;
  const fitted = fitOverlay({ left, top, width: size.width, height: size.height }, { left: viewport.left ?? 0, top: viewport.top ?? 0, width: viewport.width, height: viewport.height });
  return { left: fitted.left, top: fitted.top };
}
