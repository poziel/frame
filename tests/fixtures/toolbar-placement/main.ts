import { createApp, defineComponent, h, ref } from 'vue';
import { createFrame, FrameShell } from '@frame/core';

const frame = createFrame({ toolbar: { primary: true } });
const second = createFrame({ toolbar: { primary: true } });
const panel = defineComponent({ render: () => h('p', 'Sidebar content') });
frame.registerSidePanel({ id: 'sample', label: 'Sample', component: panel });
second.registerSidePanel({ id: 'sample', label: 'Sample', component: panel });
frame.openSidePanel('sample'); second.openSidePanel('sample');
const runs = ref(0), mounted = ref(true);
frame.registerToolbarAction({ id: 'refresh', label: 'Refresh fixture', visible: true, run() { runs.value++; } });
frame.status.register({ id: 'resolution', label: 'Resolution', kind: 'text', text: '32 × 32', order: 10 });
createApp({ render: () => h('div', [
  h('div', { id: 'first' }, mounted.value ? [h(FrameShell, { frame, titleText: 'First', style: { height: '340px' } })] : []),
  h('div', { id: 'second' }, [h(FrameShell, { frame: second, titleText: 'Second', style: { height: '340px' } })]),
  h('output', { id: 'runs' }, String(runs.value)),
]) }).mount('#app');
Object.assign(window, { placementFixture: { frame, second, remount() { mounted.value = !mounted.value; } } });
