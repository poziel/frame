import {test,expect} from 'bun:test';
import {createFrame} from '../packages/core/src/framework/frame';
test('view-bar size and display locks preserve configured defaults and hide editing commands',async()=>{
 const locked=createFrame({primaryViewBar:{position:'top',size:'compact',display:'icons',allowSizeChange:false,allowDisplayChange:false}}), free=createFrame();
 expect(locked.primaryViewBar.position.value).toBe('top');expect(locked.primaryViewBar.size.value).toBe('compact');expect(locked.primaryViewBar.display.value).toBe('icons');
 expect(locked.primaryViewBar.setSize('default')).toBe(false);expect(locked.primaryViewBar.setDisplay('both')).toBe(false);
 expect(locked.commands.isVisible('frame.primaryViewBar.size.default')).toBe(false);expect(locked.commands.isEnabled('frame.primaryViewBar.display.text')).toBe(false);
 await locked.commands.execute('frame.primaryViewBar.size.default');expect(locked.primaryViewBar.size.value).toBe('compact');
 locked.primaryViewBar.resetPresentation();expect(locked.primaryViewBar.size.value).toBe('compact');expect(locked.primaryViewBar.display.value).toBe('icons');
 expect(free.primaryViewBar.setSize('compact')).toBe(true);expect(free.primaryViewBar.setDisplay('both')).toBe(true);
 locked.dispose();free.dispose();
});
test('secondary view-bar presentation locks are independent',()=>{
 const frame=createFrame({secondaryViewBar:{size:'compact',display:'icons',allowSizeChange:false,allowDisplayChange:false}});
 expect(frame.secondaryViewBar.size.value).toBe('compact');expect(frame.secondaryViewBar.display.value).toBe('icons');
 expect(frame.secondaryViewBar.setSize('default')).toBe(false);expect(frame.secondaryViewBar.setDisplay('text')).toBe(false);
 expect(frame.primaryViewBar.setSize('compact')).toBe(true);frame.dispose();
});
