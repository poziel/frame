import { createApp, h, nextTick } from 'vue';
import { createFrame, FrameShell, FrameTextInput, FramePopover, FrameButton, parseTheme, parseThemeFile, type FrameThemeFormat } from '@frame/core';

const frame = createFrame();
const second = createFrame();
createApp({ render: () => h('main', [
  h(FrameShell, { frame, titleText: 'First', showSearch: false, style: { height: '300px' } }, { default: () => h('section', { id: 'first' }, [h(FrameTextInput, { placeholder: 'First input' }), h(FramePopover, null, { trigger: () => h(FrameButton, { label: 'Open popup' }), default: () => h(FrameTextInput, { placeholder: 'Popup input' }) })]) }),
  h(FrameShell, { frame: second, titleText: 'Second', showSearch: false, style: { height: '300px' } }, { default: () => h('section', { id: 'second' }, [h(FrameTextInput, { placeholder: 'Second input' })]) }),
]) }).mount('#app');
const definitions: Record<FrameThemeFormat, string> = {
  json: '{"frame":{"text":{"input":{"padding":"24px"}}}}',
  jsonc: '{/* theme */ "frame.text.input.padding": "24px",}',
  json5: "{'frame.text.input.padding': '24px'}",
  yaml: 'frame:\n  text:\n    input:\n      padding: 24px',
  toml: '[frame.text.input]\npadding = "24px"',
  ini: '[frame.text.input]\npadding = 24px',
};
Object.assign(window, { themeFormatFixture: {
  async apply(format: FrameThemeFormat) { frame.theme.set(parseTheme(definitions[format], { format })); await nextTick(); },
  async file() { frame.theme.set(await parseThemeFile(new File([definitions.yaml], 'theme.yaml'))); await nextTick(); },
  async replace() { frame.theme.set(parseTheme('{}')); await nextTick(); },
  async reset() { frame.theme.reset(); await nextTick(); },
} });
