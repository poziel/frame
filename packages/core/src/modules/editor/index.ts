import './styles/index.css';

export {default as CodeEditor} from './components/CodeEditor.vue';
export {createCodeEditor, EditorController} from './controllers/codeEditor';
export type {
  CodeEditorProps,
  CodeEditorOptions,
  CodeEditorController,
} from './types/codeEditorTypes';
export {installSettingsEditor} from './integrations/settings/settingsEditor';
export {editorModule} from './integrations/module';
export type {EditorCapability} from './integrations/module';
