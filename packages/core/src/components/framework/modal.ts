import type {Component} from 'vue';
import type {PanelAction} from '../../framework/views/shellViewContainer';
import {clamp} from '../../framework/layout/layout';

/** Shared sizing and interaction defaults applied to a shell modal. */
export interface ModalOptions {

  /** Shows the header close button. Defaults to true; Escape still dismisses. */
  showCloseButton?: boolean;

  /** Minimum height in pixels, capped by available shell space. Default: 160. */
  minHeight?: number;

  /** Requested presentation width in pixels, constrained by the shell bounds. */
  width?: number;

  /** Requested presentation height in pixels, constrained by the shell bounds. */
  height?: number;

  /** CSS padding shorthand or pixels; zero removes padding. */
  contentPadding?: number | string;

  /** Whether pointer dragging is allowed for this contribution. */
  draggable?: boolean;

  /** Whether the user can resize this modal. */
  resizable?: boolean;

  /** Whether the user can toggle maximized modal presentation. */
  maximizable?: boolean;
}

/** Host-owned modal content combined with its shell presentation options. */
export interface ModalDefinition extends ModalOptions {

  /** Stable identity used to address this contribution. */
  id: string;

  /** Heading displayed by the owning presentation. */
  title: string;

  /** Host-supplied Vue component rendered for this contribution. */
  component: Component;

  /** Properties forwarded to the host-supplied component. */
  props?: Record<string, unknown>;

  /** Optional icon rendered beside the contribution. */
  icon?: Component;

  /** Actions offered by the owning surface. */
  actions?: readonly PanelAction[];

  /** Requested presentation width in pixels, constrained by the shell bounds. */
  width?: number;

  /** Requested presentation height in pixels, constrained by the shell bounds. */
  height?: number;

  /** Initial maximized presentation for this modal. */
  maximized?: boolean;

  /** Optional host-owned footer component. */
  footer?: Component;

  /** Properties forwarded to the footer component. */
  footerProps?: Record<string, unknown>;
}

export interface ModalRect {

  x: number;

  y: number;

  width: number;

  height: number;
}

export type ModalEdge = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

export function fitModal(
  rect: ModalRect,
  bounds: ModalRect,
  minimumHeight = 160
): ModalRect {
  const width = clamp(rect.width, Math.min(320, bounds.width), bounds.width);
  const height = clamp(
    rect.height,
    Math.min(minimumHeight, bounds.height),
    bounds.height
  );
  return {
    width,
    height,
    x: clamp(rect.x, bounds.x, bounds.x + bounds.width - width),
    y: clamp(rect.y, bounds.y, bounds.y + bounds.height - height),
  };
}

export function initialModal(
  bounds: ModalRect,
  width = Math.min(960, bounds.width * 0.8),
  height = Math.min(640, bounds.height * 0.8),
  minimumHeight = 160
) {
  return fitModal(
    {
      x: bounds.x + (bounds.width - width) / 2,
      y: bounds.y + (bounds.height - height) / 2,
      width,
      height,
    },
    bounds,
    minimumHeight
  );
}

export function resizeModal(
  start: ModalRect,
  edge: ModalEdge,
  dx: number,
  dy: number,
  bounds: ModalRect,
  minimumHeight = 160
): ModalRect {
  let left = start.x,
    top = start.y,
    right = start.x + start.width,
    bottom = start.y + start.height;
  const minWidth = Math.min(320, bounds.width),
    minHeight = Math.min(minimumHeight, bounds.height);
  if (edge.includes('w')) left = clamp(left + dx, bounds.x, right - minWidth);
  if (edge.includes('e'))
    right = clamp(right + dx, left + minWidth, bounds.x + bounds.width);
  if (edge.includes('n')) top = clamp(top + dy, bounds.y, bottom - minHeight);
  if (edge.includes('s'))
    bottom = clamp(bottom + dy, top + minHeight, bounds.y + bounds.height);
  return {x: left, y: top, width: right - left, height: bottom - top};
}
