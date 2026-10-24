import '@frame/tailwind';
import { createApp, h, ref } from 'vue';
import { createFrame, defineTheme, parseTheme, FrameShell, FramePopover, FrameButton } from '@frame/core';

const makeTheme = (id: string, color: string, spacing: string) => defineTheme({ version: 1, id, name: id, appearance: 'dark', tokens: { '--frame-surface': color, '--frame-overlay-surface': color, '--frame-spacing-unit': spacing } });
const first = createFrame({ theme: makeTheme('first', '#112233', '5px') });
const second = createFrame({ theme: makeTheme('second', '#445566', '7px') });
const visible = ref(true);
const sampleClass = 'bg-surface text-foreground p-4 rounded-md font-sans text-sm';
const content = (id: string) => () => h('section', { id: `${id}-sample`, class: sampleClass }, [
  h(FrameButton, { id: `${id}-control` }, () => 'Frame control'),
  h(FramePopover, { triggerLabel: `Open ${id}`, contentProps: { id: `${id}-popup` } }, () => h('div', { id: `${id}-portal-sample`, class: sampleClass }, 'Scoped portal')),
]);
const app = createApp({ render: () => h('div', {}, [
  visible.value && h(FrameShell, { frame: first, titleText: 'First', showSearch: false, style: { height: '260px' } }, { default: content('first') }),
  h(FrameShell, { frame: second, titleText: 'Second', showSearch: false, style: { height: '260px' } }, { default: content('second') }),
]) });
app.mount('#instances');
const standalone = createFrame({ theme: makeTheme('standalone', '#778899', '8px') });
const detach = standalone.theme.attach(document.querySelector<HTMLElement>('#standalone')!);
createApp({ render: () => h(FrameButton, { id: 'standalone-button' }, () => 'Standalone control') }).mount('#standalone-control');
Object.assign(window, { themeFixture: {
  first, second, standalone,
  setFirst(json: string) { first.theme.set(parseTheme(json)); },
  hide() { visible.value = false; }, show() { visible.value = true; }, detach,
  dispose() { first.dispose(); second.dispose(); standalone.dispose(); app.unmount(); },
} });
