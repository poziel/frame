import {shallowRef} from 'vue';
import type {FrameMenuItem} from '../../components/navigation/generalMenu';
import type {FeatureRegistry} from '../features/featureRegistry';
import type {Layout} from '../layout/layout';
import type {Status} from './status';

/** Owns the Manage menu and its status-bar contribution for one shell. */
export class ManageMenu {

  /** Host-editable menu contents shared by every Manage presentation. */
  readonly items = shallowRef<readonly FrameMenuItem[]>([
    {
      id: 'settings',
      label: 'Settings',
      command: 'frame.settings',
      shortcut: 'Ctrl+,',
    },
    {
      id: 'keybindings',
      label: 'Keyboard Shortcuts',
      command: 'frame.keybindings',
    },
  ]);

  /** Exact registration cleanup, populated when the status service is connected. */
  private unregister?: () => void;

  /** Installs the status entry after Frame has constructed the status service. */
  connect(status: Status, layout: Layout, features: FeatureRegistry): void {
    this.unregister?.();
    this.unregister = status.register({
      id: 'frame.manage',
      kind: 'button',
      label: 'Manage',
      icon: 'settings-gear',
      side: 'right',
      order: 1000,
      available: () => features.settings,
      showInStatusBar: () => layout.manageButtonPosition === 'bottom',
      menu: () => this.items.value,
    });
  }

  /** Restores Manage to its default placement when its status entry is removed. */
  onStatusRemove(id: string, layout: Layout): void {
    if (id === 'frame.manage') layout.manageButtonPosition = 'bottom';
  }

  /** Removes the status contribution owned by this menu. */
  dispose(): void {
    this.unregister?.();
    this.unregister = undefined;
  }
}
