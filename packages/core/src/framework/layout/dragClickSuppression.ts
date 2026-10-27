/**
 * Owns temporary listeners suppressing the compatibility click after a drag.
 * Expires after pointer release, a new gesture, blur, or the suppressed click.
 */
export class DragClickSuppression {

  /** Window on which the gesture's compatibility click is delivered. */
  private readonly bus: Window;

  /** Pointer retained when cancellation precedes physical release. */
  private readonly pointerId: number;

  /** Deferred cleanup lets the release-generated click arrive first. */
  private timer: ReturnType<typeof setTimeout> | undefined;

  /** Guards repeated timeout and event cleanup. */
  private disposed = false;

  /** Arms suppression until the current gesture is fully released. */
  constructor(bus: Window, pointerId: number, released: boolean) {
    this.bus = bus;
    this.pointerId = pointerId;
    this.dispose = this.dispose.bind(this);
    this.suppress = this.suppress.bind(this);
    this.release = this.release.bind(this);
    bus.addEventListener('click', this.suppress, {capture: true});
    bus.addEventListener('pointerup', this.release);
    bus.addEventListener('pointerdown', this.dispose);
    bus.addEventListener('pointercancel', this.dispose);
    bus.addEventListener('blur', this.dispose);
    if (released) this.timer = setTimeout(this.dispose, 0);
  }

  /** Releases temporary listeners without affecting later independent clicks. */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    clearTimeout(this.timer);
    this.bus.removeEventListener('click', this.suppress, true);
    this.bus.removeEventListener('pointerup', this.release);
    this.bus.removeEventListener('pointerdown', this.dispose);
    this.bus.removeEventListener('pointercancel', this.dispose);
    this.bus.removeEventListener('blur', this.dispose);
  }

  /** Consumes the first compatibility click and ends suppression. */
  private suppress(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.dispose();
  }

  /** Schedules expiry after the initiating pointer is physically released. */
  private release(event: PointerEvent): void {
    if (event.pointerId === this.pointerId)
      this.timer = setTimeout(this.dispose, 0);
  }
}
