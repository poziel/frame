import type {Frame} from '../../../../index';
import {SettingsEditorRegistration} from './settingsEditorRegistration';

/** @deprecated Register the editor capability with frame.use(editorModule) instead. */
export function installSettingsEditor(frame: Frame): () => void {
  return new SettingsEditorRegistration(frame).dispose;
}
