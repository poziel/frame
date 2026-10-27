import { expect, test } from 'bun:test';
import {createFrame} from '../packages/core/src/framework/frame';
test('all view bars expose display and size without changing container state', () => {
 const f=createFrame({primaryViewBar:{display:'both'},panelViewBar:{size:'compact'}});
 f.registerView({id:'terminal',label:'Terminal',component:{render(){return null;}}},'bottom');f.openView('terminal');
 for(const bar of [f.primaryViewBar,f.secondaryViewBar,f.panelViewBar])for(const mode of ['icons','text','both'] as const){expect(bar.setDisplay(mode)).toBe(true);expect(bar.display.value).toBe(mode);}
 expect(f.primaryViewBar.effectiveDisplay.value).toBe('both');expect(f.panelViewBar.size.value).toBe('compact');
 f.panelViewBar.setBarVisible(false);expect(f.layout.panelVisible).toBe(true);expect(f.views.value).toHaveLength(1);
 expect('registerActivityAction' in f).toBe(false);f.dispose();
});
