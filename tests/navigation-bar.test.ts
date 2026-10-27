import { expect, test } from 'bun:test';
import {createFrame} from '../packages/core/src/framework/frame';

test('navigation justification is explicit, isolated, resettable and defaults left on either side', () => {
 const a=createFrame({navigationBar:{position:'right'}}),b=createFrame({navigationBar:{justification:'center'}});
 expect(a.navigationBar.justification.value).toBe('left');
 expect(b.navigationBar.justification.value).toBe('center');
 expect(a.navigationBar.setJustification('right')).toBe(true);
 a.navigationBar.setPosition('left');expect(a.navigationBar.justification.value).toBe('right');
 expect(a.navigationBar.setJustification('invalid' as never)).toBe(false);
 a.resetLayout();expect(a.navigationBar.justification.value).toBe('left');
 a.dispose();expect(a.navigationBar.setJustification('center')).toBe(false);b.dispose();
});
test('nav registration is separate and optional, with four docking positions', async () => {
 const a=createFrame(), b=createFrame({navigationBar:{position:'right',display:'both',size:'compact'}});
 expect(a.navigationBar.visible.value).toBe(false);expect(b.navigationBar.position.value).toBe('right');
 let calls=0;const remove=b.registerNavigationItem({id:'home',type:'action',label:'Home',run:()=>{calls++;}});
 expect(calls).toBe(0);expect(await b.navigationBar.activate('home')).toBe(true);expect(calls).toBe(1);
 for(const pos of ['top','left','bottom','right'] as const)expect(b.navigationBar.setPosition(pos)).toBe(true);
 b.navigationBar.setVisible(false);b.resetLayout();expect(b.navigationBar.visible.value).toBe(true);expect(b.navigationBar.position.value).toBe('right');
 b.setZenMode(true);expect(b.navigationBar.visible.value).toBe(false);b.navigationBar.setPosition('left');b.setZenMode(false);expect(b.navigationBar.visible.value).toBe(true);expect(b.navigationBar.position.value).toBe('right');
 remove();remove();b.dispose();expect(await b.navigationBar.activate('home')).toBe(false);a.dispose();
});
