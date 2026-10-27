import { createApp, h, ref } from 'vue';
import { createFrame, FrameShell } from '@frame/core';
import { createNotificationHistory, NotificationPanel } from '@frame/core/modules/notifications';
import '../../../packages/core/src/style.css';

const frame = createFrame();
const history = createNotificationHistory(frame, { statusBar: true });
const other = createFrame({ settings: false });
const runs = ref(0), mounted = ref(true);
frame.status.register({ id: 'branch', kind: 'text', label: 'Branch', text: 'main', side: 'left', badge: 2 });
frame.status.register({ id: 'save', kind: 'button', label: 'Save', text: 'Save', side: 'right', run: () => { runs.value++; frame.status.set('Saving document'); } });
other.status.register({ id: 'other', kind: 'text', label: 'Other instance', side: 'right' });
createApp({ setup: () => () => h('div', [
  h('button', { onClick: () => { frame.status.show('Could not save', { duration: 100, severity: 'error' }); } }, 'Temporary error'),
  h('button', { onClick: () => { frame.status.setBarVisible(true); } }, 'Show status bar'),
  h('button', { onClick: () => { frame.status.setBadgeVisible('branch', false); } }, 'API hide badge'),
  h('button', { onClick: () => { frame.status.move('save', 'left'); } }, 'API move save'),
  h('button', { onClick: () => { frame.status.update('branch', { text: 'Very long branch name '.repeat(30) }); } }, 'Long branch'),
  h('button', { onClick: () => { frame.notify({ title: 'Saved', duration: 0 }); } }, 'Notify'),
  h('button', { onClick: () => { mounted.value = !mounted.value; } }, 'Toggle shell'),
  h('output', { id: 'runs' }, String(runs.value)),
  mounted.value ? h(FrameShell, { frame, style: 'height:450px;min-height:0', titleText: 'Status fixture' }, { overlays: () => h(NotificationPanel, { frame, history }) }) : null,
  h('div', { id: 'other-shell' }, h(FrameShell, { frame: other, style: 'height:250px;min-height:0', titleText: 'Other frame' })),
]) }).mount('#app');
