import type {Frame} from '../../../../index';
import SettingsJsonEditor from './SettingsJsonEditor.vue';

/**
 * Owns the paired settings and keyboard-shortcut JSON editor registrations.
 *
 * Partial installation rolls back the settings contribution. Disposal removes
 * only these registrations; the host Frame and mounted surfaces stay owned by
 * their existing lifecycle controllers.
 */
export class SettingsEditorRegistration {

  /** Releases the settings contribution installed by this registration. */
  private readonly removeSettings: () => void;

  /** Releases the keyboard-shortcut contribution after successful installation. */
  private readonly removeKeybindings: () => void;

  /** Prevents repeated disposal from releasing either contribution twice. */
  private disposed = false;

  /** Installs both contributions, rolling back if the second cannot register. */
  constructor(frame: Frame) {
    this.removeSettings = frame.settings.registerEditor({
      component: SettingsJsonEditor,
      props: {kind: 'settings'},
    });
    try {
      this.removeKeybindings = frame.keybindings.registerEditor({
        component: SettingsJsonEditor,
        props: {kind: 'keybindings'},
      });
    } catch (error) {
      this.removeSettings();
      throw error;
    }
    this.dispose = this.dispose.bind(this);
  }

  /** Releases both contributions once; safe to pass as a module disposer. */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.removeSettings();
    this.removeKeybindings();
  }
}
