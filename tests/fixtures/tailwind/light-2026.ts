import '@frame/tailwind';
import { createApp, h } from 'vue';
import { createFrame, FrameShell, FrameButton, FrameIcon, FrameTextInput, FrameSelect, FramePopover, SelectOption, parseTheme } from '@frame/core';
import { vscodeLight2026, vscodeHighContrastBlack, vscodeHighContrastWhite } from '@frame/themes';
import definition from '@frame/themes/vscode-light-2026.json';
import blackDefinition from '@frame/themes/vscode-high-contrast-black.json';
import whiteDefinition from '@frame/themes/vscode-high-contrast-white.json';
import '../../../packages/docs/src/docs.css';

const frame = createFrame({ theme: vscodeLight2026 });
const presets = [vscodeLight2026, vscodeHighContrastBlack, vscodeHighContrastWhite];
const sectionStyle = { padding: '12px', display: 'grid', gap: '12px', color: 'var(--frame-text)' };
const files = ['.gitignore', 'package.json', 'src/', '  App.vue', '  main.ts', '  app.css', 'README.md'];
const Explorer = { render: () => h('div', { style: sectionStyle }, [
  h('strong', {}, 'FRAME APPLICATION'),
  h('nav', { class: 'component-catalog', id: 'preset-catalog' }, [h('section', {}, [h('button', { 'aria-current': 'page' }, 'Selected view'), h('button', {}, 'Other view')])]),
  ...files.map(file => h('div', { style: { display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--frame-text)' } }, [h(FrameIcon, { name: file.endsWith('/') ? 'folder' : 'file', size: 16 }), file])),
]) };
const Inspector = { render: () => h('div', { style: sectionStyle }, [h('strong', {}, frame.theme.current.value?.name ?? 'Frame default'), h('p', {}, 'A source-mapped palette for Frame.'), ...[
  ['Chrome', '--frame-bg'], ['Workspace', '--frame-canvas'], ['Text', '--frame-text'], ['Accent', '--frame-accent'], ['Border', '--frame-border-color'],
].map(([label, token]) => h('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } }, [h('span', { style: { width: '16px', height: '16px', border: '1px solid var(--frame-line)', borderRadius: '3px', background: `var(${token})` } }), label])), h('p', { style: { color: 'var(--frame-muted)', lineHeight: '1.6' } }, 'Frame keeps its layout, typography and spacing. Theme imports change values without rebuilding Tailwind.')]) };
const Editor = { render: () => h('article', { id: 'preset-workspace', style: { minHeight: '100%', background: 'var(--frame-canvas)', color: 'var(--frame-text)' } }, [
  h('header', { style: { padding: '8px 16px', borderBottom: '1px solid var(--frame-line)', display: 'flex', alignItems: 'center', gap: '12px' } }, [h(FrameIcon, { name: 'json', size: 16 }), h('span', {}, 'theme.json'), h('span', { style: { marginLeft: 'auto' } }, [h(FrameSelect, { label: 'Theme preset', modelValue: frame.theme.current.value?.id ?? 'default', options: [new SelectOption({ value: 'default', label: 'Frame default' }), ...presets.map(preset => new SelectOption({ value: preset.id, label: preset.name }))], 'onUpdate:modelValue': (value: string) => { const theme = presets.find(theme => theme.id === value); if (theme) frame.theme.set(theme); else frame.theme.reset(); } })])]),
  h('div', { style: { padding: '24px', display: 'grid', gap: '20px' } }, [
    h('pre', { class: 'font-mono text-sm', style: { margin: '0', lineHeight: '1.8', color: 'var(--frame-text)' } }, JSON.stringify({ name: frame.theme.current.value?.name ?? 'Frame default', appearance: frame.theme.current.value?.appearance, chrome: frame.theme.current.value?.tokens['--frame-bg'], workspace: frame.theme.current.value?.tokens['--frame-canvas'], foreground: frame.theme.current.value?.tokens['--frame-text'], accent: frame.theme.current.value?.tokens['--frame-accent'] }, null, 2)),
    h('section', { id: 'preset-tailwind', class: 'bg-surface text-foreground p-4 rounded-md', style: { border: '1px solid var(--frame-line)' } }, [h('strong', {}, 'Application content · Tailwind'), h('p', {}, 'bg-surface · text-foreground · p-4 · rounded-md')]),
    h('div', { style: { display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' } }, [
      h(FrameButton, { id: 'preset-primary', variant: 'primary' }, () => 'Open workspace'),
      h(FrameButton, { id: 'preset-secondary', variant: 'secondary' }, () => 'Add note'),
      h(FrameTextInput, { id: 'preset-input', modelValue: '', placeholder: 'Search files…' }),
      h(FramePopover, { triggerLabel: 'Preview popup' }, () => h('div', { id: 'preset-portal', class: 'text-foreground', style: { minWidth: '180px' } }, 'The popup uses the same light theme.')),
    ]),
    h('p', { style: { color: 'var(--frame-muted)' } }, 'Palette from the MIT-licensed Microsoft VS Code source. Frame is an independent framework.'),
  ]),
]) };
frame.registerSidePanel({ id: 'preset.explorer', label: 'Explorer', icon: () => h(FrameIcon, { name: 'files', size: 20 }), component: Explorer });
frame.openSidePanel('preset.explorer');
frame.registerSecondaryTab({ id: 'preset.inspector', label: 'Theme', component: Inspector });
frame.openSecondaryPanel('preset.inspector');
frame.setWorkspacePane(frame.workspace.initialPaneId, { label: 'theme.json', component: Editor });
frame.status.register({ id: 'preset.status', kind: 'text', label: 'Theme source', text: 'Frame · Theme preview', side: 'left' });
frame.status.register({ id: 'preset.language', kind: 'text', label: 'Language', text: 'UTF-8    JSON    Spaces: 2', side: 'right' });
frame.registerCommand({ id: 'preset.choose-theme', label: 'Theme: Use VS Code Light 2026', run: () => frame.theme.set(vscodeLight2026) });
const app = createApp({ render: () => h(FrameShell, { frame, titleText: `Frame · ${frame.theme.current.value?.name ?? 'Default'}` }) });
app.mount('#light-preview');
Object.assign(window, { lightThemeFixture: { frame, importJSON(id = vscodeLight2026.id) { const json = id === vscodeHighContrastBlack.id ? blackDefinition : id === vscodeHighContrastWhite.id ? whiteDefinition : definition; frame.theme.set(parseTheme(JSON.stringify(json))); }, dispose() { app.unmount(); frame.dispose(); } } });
