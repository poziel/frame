import {defineComponent, h} from 'vue';
import type {Frame} from '../../../framework/frame';
import FrameIcon from '../../../components/data-display/FrameIcon.vue';
import type {
  NotificationHistoryOptions,
  NotificationHistoryState,
  NotificationIndicatorPosition,
} from '../types/notificationHistoryTypes';

/** History operations invoked by optional toolbar and status contributions. */
interface NotificationHistoryActions {

  /** Changes feature availability without clearing retained notifications. */
  setEnabled(enabled: boolean): void;

  /** Opens or closes history subject to its current availability. */
  toggle(): void;
}

/**
 * Owns one history's shell registrations and placement synchronization.
 *
 * This adapter reads the controller's existing reactive state rather than owning
 * a second history store. Toolbar pinning, feature availability, and placement
 * remain separate. Disposal removes only this adapter's registered controls.
 */
export class NotificationHistoryBindings {

  /** Unique toolbar action ID allocated within the owning Frame. */
  readonly toolbarActionId: string;

  /** Optional status item ID, allocated independently of toolbar collisions. */
  readonly statusItemId?: string;

  /** Frame coordinating the registered toolbar and status contributions. */
  private readonly frame: Frame;

  /** Shared history state used by live getters and placement callbacks. */
  private readonly state: NotificationHistoryState;

  /** Original host options controlling optional status integration. */
  private readonly options: NotificationHistoryOptions;

  /** Bound controller operations used by the registered controls. */
  private readonly actions: NotificationHistoryActions;

  /** Releases the exact toolbar registration owned by this adapter. */
  private readonly removeAction: () => void;

  /** Releases the optional status registration owned by this adapter. */
  private readonly removeStatus: () => void;

  /** Makes retained placement callbacks harmless after registration cleanup. */
  private disposed = false;

  /** Registers shell controls against an already initialized history state. */
  constructor(
    frame: Frame,
    state: NotificationHistoryState,
    options: NotificationHistoryOptions,
    actions: NotificationHistoryActions
  ) {
    this.frame = frame;
    this.state = state;
    this.options = options;
    this.actions = actions;
    this.setPosition = this.setPosition.bind(this);
    this.dispose = this.dispose.bind(this);
    let id = 'notification-history';
    for (
      let suffix = 2;
      frame.toolbarActions.some((item) => item.id === id);
      suffix++
    )
      id = 'notification-history-' + suffix;
    this.toolbarActionId = id;
    this.removeAction = this.registerAction();
    const registeredAction = frame.toolbarActions.find(
      (action) => action.id === id
    )!;
    if (options.statusBar) {
      registeredAction.placement = Object.freeze(
        state.indicatorPosition === 'top-right'
          ? {area: 'titleBar'}
          : {
              area: 'statusBar',
              side:
                state.indicatorPosition === 'bottom-left' ? 'left' : 'right',
            }
      );
      // This history supplies its own status badge and menu presentation.
      registeredAction.showInStatusBar = () => false;
      registeredAction.onPlacementChange = (placement) =>
        this.setPosition(
          placement.area === 'titleBar'
            ? 'top-right'
            : placement.side === 'right'
              ? 'bottom-right'
              : 'bottom-left'
        );
      let statusId = id;
      for (
        let suffix = 2;
        frame.status.items.value.some((item) => item.id === statusId);
        suffix++
      )
        statusId = id + '-' + suffix;
      this.statusItemId = statusId;
      this.removeStatus = this.registerStatus(statusId);
      registeredAction.onPlacementChange(
        frame.toolbar.getPlacement(`action:${id}`)
      );
    } else {
      this.removeStatus = () => {};
    }
  }

  /**
   * Changes the shared location and synchronizes optional shell placements.
   * @throws If an active adapter receives an unsupported location.
   */
  setPosition(position: NotificationIndicatorPosition): void {
    if (this.disposed) return;
    if (!['bottom-right', 'bottom-left', 'top-right'].includes(position))
      throw Error('Unknown notification indicator position');
    this.state.indicatorPosition = position;
    if (this.options.statusBar) {
      const current = this.frame.toolbar.getPlacement(
        `action:${this.toolbarActionId}`
      );
      this.frame.toolbar.setPlacement(
        `action:${this.toolbarActionId}`,
        position === 'top-right'
          ? {area: 'titleBar'}
          : {
              area: 'statusBar',
              side: position === 'bottom-left' ? 'left' : 'right',
              order: current.area === 'statusBar' ? current.order : undefined,
            }
      );
    }
    if (this.statusItemId && position !== 'top-right') {
      this.frame.status.move(
        this.statusItemId,
        position === 'bottom-left' ? 'left' : 'right'
      );
    }
  }

  /** Removes this history's toolbar/status controls, leaving history state alone. */
  dispose(): void {
    if (this.disposed) return;
    this.removeAction();
    this.removeStatus();
    this.disposed = true;
  }

  /** Registers the live icon, feature availability, pinning, and toggle action. */
  private registerAction(): () => void {
    const {frame, state, options, actions} = this;
    return frame.registerToolbarAction({
      id: this.toolbarActionId,
      label: 'Notifications',
      icon: defineComponent({
        setup: () => () =>
          h(FrameIcon, {
            name: state.items.length ? 'bell-dot' : 'bell',
            size: 16,
          }),
      }),
      visible: options.indicatorPinned ?? true,
      showInToolbar: () => state.indicatorPosition === 'top-right',
      feature: {
        label: 'Notification Center',
        get enabled() {
          return state.indicatorEnabled;
        },
        setEnabled: actions.setEnabled,
      },
      run: () => actions.toggle(),
    });
  }

  /** Registers the status-specific badge, placement getters, and activation. */
  private registerStatus(id: string): () => void {
    const {frame, state, toolbarActionId, actions} = this;
    return frame.status.register({
      id,
      kind: 'button',
      label: 'Notification history',
      icon: 'bell',
      get order() {
        const placement = frame.toolbar.getPlacement(
          `action:${toolbarActionId}`
        );
        return placement.area === 'statusBar' ? (placement.order ?? 900) : 900;
      },
      get side() {
        return state.indicatorPosition === 'bottom-left'
          ? ('left' as const)
          : ('right' as const);
      },
      get badge() {
        return state.items.length || undefined;
      },
      get tooltip() {
        return `Notification history (${state.items.length})`;
      },
      available: () => state.indicatorEnabled,
      showInStatusBar: () => state.indicatorPosition !== 'top-right',
      onMove: (side) => {
        const position = side === 'left' ? 'bottom-left' : 'bottom-right';
        if (state.indicatorPosition !== position) this.setPosition(position);
      },
      run: () => actions.toggle(),
    });
  }
}
