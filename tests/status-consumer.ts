import { createFrame, type StatusItemDefinition, type StatusSide, type StatusMessageOptions, type StatusController } from '@frame/core';
import { createNotificationHistory } from '@frame/features';
const frame = createFrame({ status: { message: 'Ready', hidden: ['version'], hiddenBadges: [], visible: true } });
const status: StatusController = frame.status;
const side: StatusSide = 'left';
const item: StatusItemDefinition = { id: 'version', kind: 'text', label: 'Version', text: '1.0', side };
const remove = status.register(item);
status.register({ id: 'save', kind: 'button', label: 'Save', icon: 'save', run: () => status.set('Saving document') });
status.register({ id: 'menu', kind: 'button', label: 'Actions', menu: () => [{ id: 'settings', label: 'Settings', command: 'frame.settings' }] });
status.update('version', { text: '1.1', badge: 2 });
status.move('version', 'right'); status.setVisible('version', true); status.setBadgeVisible('version', false);
const options: StatusMessageOptions = { duration: 4000, severity: 'error' };
const dismiss = status.show('Could not save', options); dismiss(); status.clear();
const history = createNotificationHistory(frame, { statusBar: true });
if (history.statusItemId) status.move(history.statusItemId, 'left');
// @ts-expect-error The center is reserved for status text.
status.move('version', 'center');
// @ts-expect-error Text contributions cannot run actions.
status.register({ id: 'invalid', kind: 'text', label: 'Invalid', run() {} });
remove(); history.dispose(); frame.dispose();
