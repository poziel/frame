import type {Frame} from '../frame';
import {PreferencePresentation} from './preferencePresentation';

/**
 * Owns the shell's settings and keyboard-shortcut presentation adapters.
 * Each document has independent watchers and tab ownership; their content and
 * draft state remain owned by the existing per-Frame preference controllers.
 */
export class PreferencesPresentation {

  /** Individual document adapters released with the mounted shell. */
  private readonly presentations: readonly PreferencePresentation[];

  /** Creates presentation bindings for both supported preference documents. */
  constructor(frame: Frame) {
    this.dispose = this.dispose.bind(this);
    this.presentations = [
      new PreferencePresentation(frame, 'settings'),
      new PreferencePresentation(frame, 'keybindings'),
    ];
  }

  /** Releases both adapters without disposing host preference data. */
  dispose(): void {
    for (const presentation of this.presentations) presentation.dispose();
  }
}
