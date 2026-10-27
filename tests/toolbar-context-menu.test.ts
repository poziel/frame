import { expect, test } from 'bun:test';
import { Toolbar } from '../packages/core/src/framework/views/toolbar';

test('toolbar context menu permission is instance scoped and retained through reset', () => {
 const disabled = new Toolbar({ contextMenu: false, primary: true }, () => []);
 const defaults = new Toolbar({}, () => []);
 expect(disabled.contextMenuEnabled).toBe(false);
 expect(defaults.contextMenuEnabled).toBe(true);
 disabled.toggle('primary');
 disabled.reset();
 expect(disabled.contextMenuEnabled).toBe(false);
 expect(disabled.isVisible('primary')).toBe(true);
 disabled.dispose(); defaults.dispose();
});
