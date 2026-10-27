import {PointerDrag} from '../layout/pointerDrag';
import {barGapAt, barGapMarker} from '../layout/barInsertion';
import {reactive} from 'vue';
import type {ViewDefinition, ViewRegion} from './shellViewContainer';

/** Drop Marker contract used by its owning shell controller. */
export interface DropMarker {

  /** Horizontal position of the insertion preview in pixels. */
  left: number;

  /** Vertical position of the insertion preview in pixels. */
  top: number;

  /** Width of the insertion preview in pixels. */
  width: number;

  /** Height of the insertion preview in pixels. */
  height: number;

  /** Discriminant selecting text-only or actionable status behavior. */
  kind: 'insert' | 'inside';
}

/** View Drop contract used by its owning shell controller. */
export interface ViewDrop {

  /** Destination shell region for the pending move. */
  region: ViewRegion;

  /** Optional destination parent view. */
  parent?: string;

  /** Optional sibling ID before which the contribution is inserted. */
  before?: string;

  /** Insertion preview describing the proposed destination. */
  marker: DropMarker;
}

export function insertionBefore(
  ids: readonly string[],
  hovered: string,
  after: boolean
) {
  const index = ids.indexOf(hovered);
  return index < 0 ? undefined : after ? ids[index + 1] : hovered;
}

/** Host services used by one shell view-drag coordinator. */
export interface ViewDragContext {

  /** Looks up the current registered view without taking ownership of it. */
  view(id: string): ViewDefinition | undefined;

  /** Lists destination siblings in presentation order. */
  siblings(region: ViewRegion, parent?: string): string[];

  /** Checks whether this view may move to the proposed region and parent. */
  canMove(id: string, region: ViewRegion, parent?: string): boolean;

  /** Commits a validated move through the owning registration service. */
  move(
    id: string,
    region: ViewRegion,
    before?: string,
    parent?: string
  ): boolean;

  /** Selects a registered view during hover navigation. */
  activate(id: string): void;

  /** Reveals a destination region after a permitted hover delay. */
  reveal(region: ViewRegion): void;

  /** Reports whether a destination region is currently hidden. */
  closed(region: ViewRegion): boolean;

  /** Reads the primary sidebar side used for edge hit testing. */
  primarySide(): 'left' | 'right';

  /** Reads whether navigation or movement is currently available. */
  enabled(region: ViewRegion): boolean;
}

/**
 * Coordinates one active pointer session for moving registered shell views.
 * The session owns hover previews, reveal timers, and cancellation. Actual
 * view moves are delegated to the supplied registration and layout services.
 */
export class ViewDrag {

  /** Services used to validate, preview, and commit moves of registered views. */
  private readonly context: ViewDragContext;

  /** Reactive presentation state shared with the owning shell. */
  readonly state: {
    active: boolean;
    id: string;
    x: number;
    y: number;
    drop: {
      region: ViewRegion;
      parent?: string | undefined;
      before?: string | undefined;
      marker: {
        left: number;
        top: number;
        width: number;
        height: number;
        kind: 'insert' | 'inside';
      };
    } | null;
  };

  /** Cancellation callback for the active pointer session. */
  private stop: (() => void) | undefined;

  /** Connects the controller to its existing per-Frame services and configuration. */
  constructor(context: ViewDragContext) {
    this.context = context;
    this.begin = this.begin.bind(this);
    this.cancel = this.cancel.bind(this);
    this.state = reactive({
      active: false,
      id: '',
      x: 0,
      y: 0,
      drop: null as ViewDrop | null,
    });
    this.stop = undefined;
  }

  /** Starts a permitted pointer session and delegates committed moves to shell services. */
  begin(event: PointerEvent, id: string, region: ViewRegion) {
    const owner = this;
    const view = owner.context.view(id);
    const shell = (event.currentTarget as HTMLElement).closest<HTMLElement>(
      '.workbench'
    );
    if (
      !shell ||
      !view ||
      event.button !== 0 ||
      !owner.context.enabled(region) ||
      view.draggable === false
    )
      return;
    owner.stop?.();
    let hoverKey = '';
    let timer: ReturnType<typeof setTimeout> | undefined;
    let point = {x: event.clientX, y: event.clientY};
    function cancelHover() {
      clearTimeout(timer);
      timer = undefined;
      hoverKey = '';
    }
    function schedule(key: string, action: () => void, delay: number) {
      if (key === hoverKey) return;
      cancelHover();
      hoverKey = key;
      timer = setTimeout(() => {
        action();
        requestAnimationFrame(() => {
          if (owner.state.active) update();
        });
      }, delay);
    }
    function update() {
      const hit = document.elementFromPoint(
        point.x,
        point.y
      ) as HTMLElement | null;
      owner.state.drop = null;
      if (!hit || !shell!.contains(hit)) {
        cancelHover();
        return;
      }
      const body = shell!.querySelector<HTMLElement>('.workbench-body');
      if (!body) return;
      const bounds = body.getBoundingClientRect();
      let edge: ViewRegion | undefined;
      if (
        point.y > bounds.bottom - 28 &&
        point.x > bounds.left + 48 &&
        point.x < bounds.right - 48 &&
        owner.context.closed('bottom')
      )
        edge = 'bottom';
      else if (point.x < bounds.left + 28)
        edge = owner.context.primarySide() === 'left' ? 'primary' : 'secondary';
      else if (point.x > bounds.right - 28)
        edge =
          owner.context.primarySide() === 'right' ? 'primary' : 'secondary';
      if (
        edge &&
        owner.context.closed(edge) &&
        owner.context.enabled(edge) &&
        owner.context.canMove(id, edge)
      ) {
        const target = edge;
        schedule(`edge:${target}`, () => owner.context.reveal(target), 350);
        const physicalLeft =
          (target === 'primary') === (owner.context.primarySide() === 'left');
        owner.state.drop = {
          region: target,
          marker:
            target === 'bottom'
              ? {
                  kind: 'inside',
                  left: bounds.left,
                  top: bounds.bottom - 28,
                  width: bounds.width,
                  height: 28,
                }
              : {
                  kind: 'inside',
                  left: physicalLeft ? bounds.left : bounds.right - 28,
                  top: bounds.top,
                  width: 28,
                  height: bounds.height,
                },
        };
        return;
      }
      const regionElement = hit.closest<HTMLElement>('[data-view-region]');
      if (!regionElement) {
        cancelHover();
        return;
      }
      const destination = regionElement.dataset.viewRegion as ViewRegion;
      if (!owner.context.enabled(destination)) {
        cancelHover();
        return;
      }
      const item = hit.closest<HTMLElement>('[data-view-id]');
      const hovered = item?.dataset.viewId;
      if (hovered && hovered !== id)
        schedule(
          `view:${hovered}`,
          () => {
            if (owner.context.view(hovered)) owner.context.activate(hovered);
          },
          600
        );
      else cancelHover();
      const collection = hit.closest<HTMLElement>('[data-view-parent]');
      const parent = collection?.dataset.viewParent;
      if (!owner.context.canMove(id, destination, parent)) return;
      const list = hit.closest<HTMLElement>('[data-view-axis]');
      const barList =
        hit.closest<HTMLElement>('.bar-drop-list') ??
        (list?.matches?.('.view-bar')
          ? list.querySelector<HTMLElement>('.bar-drop-list')
          : null);
      const gap =
        barList &&
        barGapAt(
          barList,
          barList.dataset.barAxis === 'x' ? 'x' : 'y',
          barList.dataset.barAxis === 'x' ? point.x : point.y
        );
      if (gap) {
        owner.state.drop = {
          region: destination,
          before: gap.before,
          marker: barGapMarker(
            gap,
            barList!.dataset.barAxis === 'x' ? 'x' : 'y'
          ),
        };
      } else if (list && item && list.contains(item)) {
        const axis = list.dataset.viewAxis;
        const box = item.getBoundingClientRect();
        const after =
          axis === 'x'
            ? point.x > box.left + box.width / 2
            : point.y > box.top + box.height / 2;
        const before = insertionBefore(
          owner.context.siblings(destination, parent),
          hovered!,
          after
        );
        const row =
          item
            .closest<HTMLElement>('.panel-section')
            ?.getBoundingClientRect() ?? box;
        const marker =
          axis === 'x'
            ? {
                kind: 'insert' as const,
                left: (after ? box.right : box.left) - 1,
                top: box.top,
                width: 2,
                height: box.height,
              }
            : {
                kind: 'insert' as const,
                left: row.left,
                top: (after ? row.bottom : row.top) - 1,
                width: row.width,
                height: 2,
              };
        owner.state.drop = {region: destination, parent, before, marker};
      } else if (list && !collection) {
        const axis = list.dataset.viewAxis;
        const items = Array.from(
          list.querySelectorAll<HTMLElement>('[data-view-id]')
        ).filter((element) => element.closest('[data-view-axis]') === list);
        const following = items.find((element) => {
          const box = element.getBoundingClientRect();
          return axis === 'x'
            ? point.x < box.left + box.width / 2
            : point.y < box.top + box.height / 2;
        });
        const reference = following ?? items[items.length - 1];
        if (reference) {
          const box = reference.getBoundingClientRect();
          owner.state.drop = {
            region: destination,
            before: following?.dataset.viewId,
            marker:
              axis === 'x'
                ? {
                    kind: 'insert',
                    left: (following ? box.left : box.right) - 1,
                    top: box.top,
                    width: 2,
                    height: box.height,
                  }
                : {
                    kind: 'insert',
                    left: box.left,
                    top: (following ? box.top : box.bottom) - 1,
                    width: box.width,
                    height: 2,
                  },
          };
        } else {
          const box = list.getBoundingClientRect();
          owner.state.drop = {
            region: destination,
            marker: {
              kind: 'inside',
              left: box.left,
              top: box.top,
              width: Math.max(20, box.width),
              height: Math.max(20, box.height),
            },
          };
        }
      } else if (collection) {
        const sections = Array.from(collection.children).filter((element) =>
          element.classList.contains('panel-section')
        ) as HTMLElement[];
        const row = sections.find(
          (element) =>
            point.y <
            element.getBoundingClientRect().top +
              element.getBoundingClientRect().height / 2
        );
        const before =
          row?.querySelector<HTMLElement>('[data-view-id]')?.dataset.viewId;
        const bounds = collection.getBoundingClientRect();
        const last = sections[sections.length - 1]?.getBoundingClientRect();
        owner.state.drop = {
          region: destination,
          parent,
          before,
          marker: sections.length
            ? {
                kind: 'insert',
                left: bounds.left,
                top: (row?.getBoundingClientRect().top ?? last!.bottom) - 1,
                width: bounds.width,
                height: 2,
              }
            : {
                kind: 'inside',
                left: bounds.left,
                top: bounds.top,
                width: bounds.width,
                height: bounds.height,
              },
        };
      } else {
        const bounds = regionElement.getBoundingClientRect();
        owner.state.drop = {
          region: destination,
          marker: {
            kind: 'inside',
            left: bounds.left + 2,
            top: bounds.top + 2,
            width: Math.max(0, bounds.width - 4),
            height: Math.max(0, bounds.height - 4),
          },
        };
      }
    }
    owner.stop = new PointerDrag(event, {
      scope: shell,
      move(next) {
        owner.state.active = true;
        owner.state.id = id;
        owner.state.x = next.x;
        owner.state.y = next.y;
        point = next;
        update();
      },
      drop() {
        const drop = owner.state.drop;
        if (drop) {
          owner.context.reveal(drop.region);
          owner.context.move(id, drop.region, drop.before, drop.parent);
        }
      },
      end() {
        cancelHover();
        owner.state.active = false;
        owner.state.id = '';
        owner.state.drop = null;
        owner.stop = undefined;
      },
    }).cancel;
  }

  /** Cancels the active pointer session and its temporary preview resources. */
  cancel() {
    return this.stop?.();
  }
}
