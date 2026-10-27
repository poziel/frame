import type {FrameModule} from '../../../framework/configuration/moduleRegistry';
import {
  createCodeEditor,
  type CodeEditorController,
} from '../controllers/codeEditor';
import {installSettingsEditor} from './settings/settingsEditor';

/** Lazy controller creation installed on one Frame through editorModule. */
export interface EditorCapability {

  /** Creates a controller without mounting a surface or loading Monaco. */
  create(): CodeEditorController;
}

/** Registers the editor capability and makes it available to Frame settings. */
export const editorModule = {
  id: 'frame.editor',
  key: 'editor',
  install(frame) {
    const removeSettingsEditor = installSettingsEditor(frame);
    return {
      capability: {create: createCodeEditor},
      dispose: removeSettingsEditor,
    };
  },
} satisfies FrameModule<'editor', EditorCapability>;
