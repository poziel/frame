import { expect, test } from 'bun:test';
import { createToolbar } from '../packages/core/src/frame/toolbar';

test('toolbar context menu permission is instance scoped and retained through reset', () => {
 const disabled = createToolbar({ contextMenu: false, primary: true }, () => []);
 const defaults = createToolbar({}, () => []);
 expect(disabled.contextMenuEnabled).toBe(false);
 expect(defaults.contextMenuEnabled).toBe(true);
 disabled.toggle('primary');
 disabled.reset();
 expect(disabled.contextMenuEnabled).toBe(false);
 expect(disabled.isVisible('primary')).toBe(true);
 disabled.dispose(); defaults.dispose();
});
