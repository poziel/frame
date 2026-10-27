import {reactive} from 'vue';

import {barGapAt, barGapMarker} from './barInsertion';

import {PointerDrag} from './pointerDrag';

/** Host-specific content operations used by a bar drag controller. */
export interface BarDragOptions {

  /** Optional explicit list; otherwise the nearest bar-drop-list is used. */
  list?: () => HTMLElement | undefined;

  /** Checks whether the item still exists and may participate in dragging. */
  exists(id: string): boolean;

  /** Commits the item before the selected content ID, or at the end. */
  move(id: string, before?: string): unknown;

  /** Runs once when movement crosses the pointer activation threshold. */
  start?(): void;

  /** Restores focus to the item after a successful drop. */
  focus?(id: string): void;
}

/**
 * Owns one bar drag interaction and its reactive insertion preview.
 * PointerDrag owns document listeners; this controller resolves bar targets.
 */
export class BarDrag {

  /** Bar-specific lookup, movement, focus, and drag-start integration. */
  private readonly options: BarDragOptions;

  /** Reactive preview position, source identity, and insertion target. */
  readonly state = reactive({
    active: false,
    id: '',
    x: 0,
    y: 0,
    marker: null as ReturnType<typeof barGapMarker> | null,
    before: undefined as string | undefined,
  });

  /** Cancellation callback for the currently owned pointer gesture. */
  private stop: (() => void) | undefined = undefined;

  /** Creates an independently owned BarDrag controller. */
  constructor(options: BarDragOptions) {
    this.options = options;
    this.begin = this.begin.bind(this);
    this.cancel = this.cancel.bind(this);
  }

  /** Starts a primary-button gesture for an existing bar item. */
  begin(event: PointerEvent, id: string) {
    if (event.button !== 0 || !this.options.exists(id)) return;
    const source = event.currentTarget as HTMLElement,
      list =
        this.options.list?.() ?? source.closest<HTMLElement>('.bar-drop-list');
    if (!list) return;
    this.stop?.();
    const axis = list.dataset.barAxis === 'x' ? 'x' : 'y';
    this.stop = new PointerDrag(event, {
      scope: source.closest<HTMLElement>('.workbench') ?? undefined,
      move: (point) => {
        if (!this.state.active) this.options.start?.();
        this.state.active = true;
        this.state.id = id;
        this.state.x = point.x;
        this.state.y = point.y;
        const box = list.getBoundingClientRect();
        const inside =
          point.x >= box.left &&
          point.x <= box.right &&
          point.y >= box.top &&
          point.y <= box.bottom;
        const gap =
          inside && barGapAt(list, axis, axis === 'x' ? point.x : point.y);
        this.state.before = gap ? gap.before : undefined;
        this.state.marker = gap ? barGapMarker(gap, axis) : null;
      },
      drop: () => {
        if (this.state.marker && this.options.exists(id)) {
          this.options.move(id, this.state.before);
          this.options.focus?.(id);
        }
      },
      end: () => {
        this.state.active = false;
        this.state.id = '';
        this.state.marker = null;
        this.state.before = undefined;
        this.stop = undefined;
      },
    }).cancel;
  }

  /** Cancels the active gesture and clears its preview through session cleanup. */
  cancel() {
    return this.stop?.();
  }
}
