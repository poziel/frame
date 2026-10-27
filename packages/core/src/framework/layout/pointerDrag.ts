import {DragClickSuppression} from './dragClickSuppression';

/** Viewport position delivered to the owner of a pointer gesture. */
export interface DragPoint {

  /** Horizontal viewport coordinate in pixels. */
  x: number;

  /** Vertical viewport coordinate in pixels. */
  y: number;
}

/** Callbacks and workbench ownership for one pointer gesture. */
export interface PointerDragHandlers {

  /** Workbench sharing at most one active pointer session. */
  scope?: HTMLElement;

  /** Updates the preview after activation or viewport movement. */
  move(point: DragPoint): void;

  /** Commits a drop when the initiating pointer is released. */
  drop(point: DragPoint): void;

  /** Clears the owner's preview on completion or cancellation. */
  end(): void;
}

/**
 * Owns one pointer gesture and its window listeners.
 * Movement starts after five pixels; unrelated pointers are ignored. Escape,
 * blur, cancellation, and replacement end the session without a committed drop.
 */
export class PointerDrag {

  /** One session per workbench without retaining detached workbenches. */
  private static readonly owners = new WeakMap<HTMLElement, () => void>();

  /** Initiating pointer identity and movement origin. */
  private readonly event: PointerEvent;

  /** Owner callbacks and optional workbench boundary. */
  private readonly handlers: PointerDragHandlers;

  /** Window delivering gesture, keyboard, and viewport events. */
  private readonly bus: Window | undefined;

  /** Whether movement has crossed the activation threshold. */
  private active = false;

  /** Prevents repeated drop or cancellation cleanup. */
  private ended = false;

  /** Latest coordinates reused when the viewport changes. */
  private point: DragPoint;

  /** Attaches a cancellable gesture for the primary button only. */
  constructor(event: PointerEvent, handlers: PointerDragHandlers) {
    this.event = event;
    this.handlers = handlers;
    this.point = {x: event.clientX, y: event.clientY};
    this.bus = event.button === 0 ? window : undefined;
    this.cancel = this.cancel.bind(this);
    this.update = this.update.bind(this);
    this.finish = this.finish.bind(this);
    this.pointerCancel = this.pointerCancel.bind(this);
    this.key = this.key.bind(this);
    this.refresh = this.refresh.bind(this);
    if (event.button !== 0) {
      this.ended = true;
      return;
    }
    if (handlers.scope) {
      PointerDrag.owners.get(handlers.scope)?.();
      PointerDrag.owners.set(handlers.scope, this.cancel);
    }
    this.bus!.addEventListener('pointermove', this.update, {passive: false});
    this.bus!.addEventListener('pointerup', this.finish);
    this.bus!.addEventListener('pointercancel', this.pointerCancel);
    this.bus!.addEventListener('keydown', this.key);
    this.bus!.addEventListener('blur', this.cancel);
    this.bus!.addEventListener('scroll', this.refresh, true);
    this.bus!.addEventListener('resize', this.refresh);
  }

  /** Bound cleanup that cancels the gesture without committing a drop. */
  cancel(): void {
    this.stop(false);
  }

  /** Updates the initiating pointer after crossing the activation threshold. */
  private update(next: PointerEvent): void {
    if (next.pointerId !== this.event.pointerId) return;
    this.point = {x: next.clientX, y: next.clientY};
    if (
      !this.active &&
      Math.hypot(
        this.point.x - this.event.clientX,
        this.point.y - this.event.clientY
      ) < 5
    )
      return;
    if (!this.active) {
      this.active = true;
      this.handlers.scope?.classList?.add('frame-item-dragging');
    }
    next.preventDefault();
    this.handlers.move(this.point);
  }

  /** Refreshes hit testing after scrolling or resizing. */
  private refresh(): void {
    if (this.active) this.handlers.move(this.point);
  }

  /** Commits the final target and always releases session resources. */
  private finish(next: PointerEvent): void {
    if (next.pointerId !== this.event.pointerId) return;
    try {
      if (this.active) {
        this.point = {x: next.clientX, y: next.clientY};
        this.handlers.move(this.point);
        this.handlers.drop(this.point);
      }
    } finally {
      this.stop(true);
    }
  }

  /** Consumes Escape before cancelling the active gesture. */
  private key(next: KeyboardEvent): void {
    if (next.key !== 'Escape') return;
    next.preventDefault();
    next.stopPropagation();
    this.cancel();
  }

  /** Handles cancellation only for this session's pointer. */
  private pointerCancel(next: PointerEvent): void {
    if (next.pointerId === this.event.pointerId) this.stop(true);
  }

  /** Releases listeners, click handling, and owner preview exactly once. */
  private stop(released: boolean): void {
    if (this.ended) return;
    this.ended = true;
    if (this.active)
      new DragClickSuppression(this.bus!, this.event.pointerId, released);
    const scope = this.handlers.scope;
    if (scope && PointerDrag.owners.get(scope) === this.cancel) {
      scope.classList?.remove('frame-item-dragging');
      PointerDrag.owners.delete(scope);
    }
    this.bus!.removeEventListener('pointermove', this.update);
    this.bus!.removeEventListener('pointerup', this.finish);
    this.bus!.removeEventListener('pointercancel', this.pointerCancel);
    this.bus!.removeEventListener('keydown', this.key);
    this.bus!.removeEventListener('blur', this.cancel);
    this.bus!.removeEventListener('scroll', this.refresh, true);
    this.bus!.removeEventListener('resize', this.refresh);
    this.handlers.end();
  }
}
