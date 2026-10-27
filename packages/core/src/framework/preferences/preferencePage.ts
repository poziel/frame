import {markRaw, shallowRef} from 'vue';
import type {SettingsEditorDefinition} from '../settings/settingsTypes';
import {
  PreferenceDocument,
  type PreferenceDocumentHost,
} from './preferenceDocument';

/**
 * Shared preference content model for settings and keyboard shortcuts.
 * Owns mode, search, editor registration, and one isolated JSON document.
 * Moving between modal and tab presentations reuses this same model.
 */
export class PreferencePage {

  /** Active presentation content; switching hosts does not reset it. */
  readonly mode = shallowRef<'form' | 'json'>('form');

  /** Search text retained when moving between a modal and a tab. */
  readonly search = shallowRef('');

  /** Optional editor supplied by the editor module. */
  readonly editor = shallowRef<SettingsEditorDefinition>();

  /** Isolated JSON draft shared by both presentation hosts. */
  readonly json: PreferenceDocument;

  /** Prevents registration or edits after disposal. */
  private disposed = false;

  /** Connects a content-specific serializer to the common page model. */
  constructor(host: PreferenceDocumentHost, label: string) {
    this.showJSON = this.showJSON.bind(this);
    this.showForm = this.showForm.bind(this);
    this.registerEditor = this.registerEditor.bind(this);
    this.dispose = this.dispose.bind(this);
    this.json = new PreferenceDocument(host, label);
  }

  /** Enters JSON mode without applying an unsaved draft. */
  showJSON() {
    if (this.disposed) return;
    if (this.mode.value !== 'json') this.json.reset();
    this.mode.value = 'json';
  }

  /** Returns to the form and discards only unsaved JSON edits. */
  showForm() {
    if (this.disposed) return;
    this.json.reset();
    this.mode.value = 'form';
  }

  /** Registers one host-owned JSON editor and returns its cleanup. */
  registerEditor(definition: SettingsEditorDefinition) {
    if (this.disposed || this.editor.value)
      throw new Error('Preference editor is disposed or already installed');
    const entry = {...definition, component: markRaw(definition.component)};
    this.editor.value = entry;
    return () => {
      if (this.editor.value === entry) this.editor.value = undefined;
    };
  }

  /** Releases watchers and editor ownership for this page. */
  dispose() {
    this.disposed = true;
    this.json.dispose();
    this.editor.value = undefined;
  }
}
