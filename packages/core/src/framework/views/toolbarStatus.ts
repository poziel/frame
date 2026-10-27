import {effectScope, watch} from 'vue';
import type {Frame} from '../frame';
import type {ToolbarAction} from './toolbar';
import type {ToolbarButton, ToolbarItemId} from './toolbar';
import {regionIcon} from '../layout/layoutIcons';

export const toolbarStatusPrefix = 'frame.toolbar.';
const builtins: {
  id: ToolbarButton;
  label: string;
  command: string;
  region?: 'primary' | 'secondary' | 'panel';
  shortcut?: string;
  controls?: string;
}[] = [
  {
    id: 'customize',
    label: 'Customize layout',
    command: 'frame.layout.customize',
  },
  {
    id: 'primary',
    label: 'Toggle primary sidebar',
    command: 'frame.sidebar.toggle',
    region: 'primary',
    shortcut: 'Ctrl+B',
    controls: 'side-panel',
  },
  {
    id: 'bottom',
    label: 'Toggle panel',
    command: 'frame.panel.toggle',
    region: 'panel',
    shortcut: 'Ctrl+J',
    controls: 'bottom-panel',
  },
  {
    id: 'secondary',
    label: 'Toggle secondary sidebar',
    command: 'frame.secondary.toggle',
    region: 'secondary',
    shortcut: 'Ctrl+Alt+B',
  },
];

/**
 * Binds toolbar controls and actions to status-bar presentations.
 * Both presentations execute the same registered commands. This adapter owns
 * only status registrations and the placement observers attached to them.
 */
export class ToolbarStatus {

  /** Placement observers belong to the adapter rather than its caller's scope. */
  private readonly scope = effectScope(true);

  /** Root instance owning commands, contributions, and presentation services. */
  private readonly frame: Frame;

  /** Cleanup operations for registrations and observers owned by this controller. */
  private readonly removers: Set<() => void>;

  /** Connects the controller to its existing per-Frame services and configuration. */
  constructor(frame: Frame) {
    const owner = this;
    this.frame = frame;
    this.placement = this.placement.bind(this);
    this.track = this.track.bind(this);
    this.registerAction = this.registerAction.bind(this);
    this.dispose = this.dispose.bind(this);
    this.removers = new Set<() => void>();
    for (const button of builtins) {
      const expanded = () =>
        button.region === 'primary'
          ? owner.frame.layout.primarySidebarVisible
          : button.region === 'secondary'
            ? owner.frame.layout.secondarySidebarVisible
            : button.region === 'panel'
              ? owner.frame.layout.panelVisible
              : undefined;
      const remove = owner.frame.status.register({
        id: toolbarStatusPrefix + button.id,
        kind: 'button',
        label: button.label,
        get icon() {
          return button.region
            ? regionIcon(
                button.region,
                !!expanded(),
                owner.frame.layout.primarySide
              )
            : 'layout';
        },
        get expanded() {
          return expanded();
        },
        controls: button.controls,
        shortcut: button.shortcut,
        get tooltip() {
          return button.region
            ? `${expanded() ? 'Hide' : 'Show'} ${button.region === 'panel' ? 'panel' : button.region + ' sidebar'}`
            : button.label;
        },
        get side() {
          return owner.placement(button.id)?.side ?? 'left';
        },
        get order() {
          return owner.placement(button.id)?.order ?? 0;
        },
        get visible() {
          return owner.frame.toolbar.isVisible(button.id);
        },
        get disabled() {
          return !owner.frame.commands.isEnabled(button.command);
        },
        available: () => owner.frame.commands.isVisible(button.command),
        showInStatusBar: () =>
          !!owner.placement(button.id) &&
          owner.frame.toolbar.isVisible(button.id),
        onMove: (side) => {
          owner.frame.toolbar.setPlacement(button.id, {
            area: 'statusBar',
            side,
            order: owner.placement(button.id)?.order,
          });
        },
        run: () => {
          void owner.frame.commands.execute(button.command);
        },
      });
      owner.track(button.id, remove);
    }
  }

  /** Creates a status presentation for an existing toolbar action. */
  registerAction(action: ToolbarAction) {
    if (!this.scope.active)
      throw new Error('Toolbar status binding is disposed');
    const owner = this;
    const id = `action:${action.id}` as const;
    const remove = owner.frame.status.register({
      id: toolbarStatusPrefix + id,
      kind: 'button',
      get label() {
        return action.label;
      },
      get icon() {
        return action.icon;
      },
      get side() {
        return owner.placement(id)?.side ?? 'left';
      },
      get order() {
        return owner.placement(id)?.order ?? 0;
      },
      get visible() {
        return action.visible !== false;
      },
      get disabled() {
        return !!action.disabled || !owner.frame.commands.isEnabled(action.id);
      },
      available: () =>
        action.feature?.enabled !== false &&
        owner.frame.commands.isVisible(action.id),
      showInStatusBar: () =>
        !!owner.placement(id) &&
        action.visible !== false &&
        action.showInStatusBar?.() !== false,
      onMove: (side) => {
        owner.frame.toolbar.setPlacement(id, {
          area: 'statusBar',
          side,
          order: owner.placement(id)?.order,
        });
      },
      run: () => {
        void owner.frame.commands.execute(action.id);
      },
    });
    return owner.track(id, remove);
  }

  /** Releases resources owned by this controller and prevents subsequent state changes. */
  dispose() {
    for (const remove of [...this.removers]) remove();
    this.scope.stop();
  }

  /** Reads a toolbar item placement only when it targets the status bar. */
  private placement(id: ToolbarItemId) {
    const value = this.frame.toolbar.getPlacement(id);
    return value.area === 'statusBar' ? value : undefined;
  }

  /** Attaches a placement observer and returns idempotent registration cleanup. */
  private track(id: ToolbarItemId, remove: () => void) {
    const stop = this.scope.run(() =>
      watch(
        () => this.frame.toolbar.getPlacement(id),
        () => this.frame.status.resetItemPosition(toolbarStatusPrefix + id),
        {flush: 'sync'}
      )
    )!;
    const cleanup = () => {
      if (this.removers.delete(cleanup)) {
        stop();
        remove();
      }
    };
    this.removers.add(cleanup);
    return cleanup;
  }
}
