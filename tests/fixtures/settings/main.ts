import {createApp, h, markRaw} from 'vue';
import CustomField from './CustomField.vue';
import {Frame, FrameShell} from '@frame/core';
import {editorModule} from '@frame/core/modules/editor';
import '../../../packages/core/src/styles/index.scss';

let json = '{}';
const copied: string[] = [];
const frame = new Frame({
  settings: {
    storage: {
      async read() {
        return json;
      },
      async write(value) {
        json = value;
      },
    },
    async writeClipboard(text) {
      copied.push(text);
    },
  },
  workspace: {
    tabs: {allowClose: true, lastTab: 'allow-empty', showSingleTab: true},
  },
});
frame.registerSettingsSection({
  id: 'editor',
  title: 'Text Editor',
  description: 'Configure editing and formatting.',
  settings: [
    {
      id: 'editor.fontSize',
      label: 'Editor: Font Size',
      description: 'Controls the font size in pixels.',
      type: 'number',
      default: 14,
      min: 8,
      max: 40,
    },
    {
      id: 'editor.formatOnSave',
      label: 'Editor: Format On Save',
      description: 'Format a file when it is saved.',
      type: 'checkbox',
      default: false,
    },
    {
      id: 'editor.fontFamily',
      label: 'Editor: Font Family',
      description: 'Controls the font family.',
      type: 'text',
      default: 'Consolas, monospace',
    },
    {
      id: 'editor.custom',
      label: 'Custom field',
      description:
        'Test a composed control without replacing its settings row.',
      type: 'text',
      default: 'initial',
      component: markRaw(CustomField),
    },
  ],
});
frame.registerSettingsSection({
  id: 'application',
  title: 'Application',
  settings: [
    {
      id: 'app.autosave',
      label: 'Files: Auto Save',
      type: 'select',
      default: 'off',
      options: [
        {value: 'off', label: 'Off'},
        {value: 'afterDelay', label: 'After Delay'},
      ],
    },
  ],
});
Object.assign(window, {
  fixture: {
    frame,
    copied,
    saved: () => json,
    installEditor: () => {
      frame.use(editorModule);
    },
  },
});
createApp({
  render: () => h(FrameShell, {frame, style: 'height:100vh;min-height:0'}),
}).mount('#app');
