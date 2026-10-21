import { clamp } from "./layout";
export interface ModalRect { x: number; y: number; width: number; height: number }
export type ModalEdge = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";
export function fitModal(rect: ModalRect, bounds: ModalRect): ModalRect {
  const width = clamp(rect.width, Math.min(320, bounds.width), bounds.width);
  const height = clamp(rect.height, Math.min(160, bounds.height), bounds.height);
  return { width, height, x: clamp(rect.x, bounds.x, bounds.x + bounds.width - width), y: clamp(rect.y, bounds.y, bounds.y + bounds.height - height) };
}
export function initialModal(bounds: ModalRect, width = Math.min(960, bounds.width * .8), height = Math.min(640, bounds.height * .8)) {
  return fitModal({ x: bounds.x + (bounds.width - width) / 2, y: bounds.y + (bounds.height - height) / 2, width, height }, bounds);
}
export function resizeModal(start: ModalRect, edge: ModalEdge, dx: number, dy: number, bounds: ModalRect): ModalRect {
  let left = start.x, top = start.y, right = start.x + start.width, bottom = start.y + start.height;
  const minWidth = Math.min(320, bounds.width), minHeight = Math.min(160, bounds.height);
  if (edge.includes("w")) left = clamp(left + dx, bounds.x, right - minWidth);
  if (edge.includes("e")) right = clamp(right + dx, left + minWidth, bounds.x + bounds.width);
  if (edge.includes("n")) top = clamp(top + dy, bounds.y, bottom - minHeight);
  if (edge.includes("s")) bottom = clamp(bottom + dy, top + minHeight, bounds.y + bounds.height);
  return { x: left, y: top, width: right - left, height: bottom - top };
}
