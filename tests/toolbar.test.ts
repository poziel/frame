import {expect,test} from 'bun:test';
import {createFrame} from '../packages/core/src/framework/frame';

test('toolbar configuration and changes are isolated on the Frame instance',()=>{
 const first=createFrame({toolbar:{primary:true,commandCenter:false}}),second=createFrame();
 expect(first.toolbar.isVisible('primary')).toBe(true);
 expect(first.toolbar.isVisible('commandCenter')).toBe(false);
 expect(second.toolbar.isVisible('primary')).toBe(false);
 first.toolbar.toggle('secondary');
 expect(first.toolbar.isVisible('secondary')).toBe(true);
 expect(second.toolbar.isVisible('secondary')).toBe(false);
 first.resetLayout();
 expect(first.toolbar.isVisible('primary')).toBe(true);
 expect(first.toolbar.isVisible('secondary')).toBe(false);
 first.dispose();second.dispose();
});

test('custom toolbar actions use their existing registration and cannot collide with built-in control keys',()=>{
 const frame=createFrame();let calls=0;
 const remove=frame.registerToolbarAction({id:'primary',label:'Custom primary',run(){calls++;}});
 expect(frame.toolbar.setActionVisible('primary',true)).toBe(true);
 expect(frame.toolbarActions[0]!.visible).toBe(true);
 expect(frame.toolbar.isVisible('primary')).toBe(false);
 frame.toolbarActions[0]!.run();expect(calls).toBe(1);
 remove();expect(frame.toolbar.setActionVisible('primary',true)).toBe(false);
 const unregister=frame.registerToolbarAction({id:'later',label:'Later',run(){}});
 frame.dispose();expect(frame.toolbar.setVisible('primary',true)).toBe(false);
 expect(frame.toolbar.setActionVisible('later',true)).toBe(false);
 expect(frame.toolbarActions.length).toBe(0);unregister();
});

test('hosts can keep only the primary toggle and still open customization by command', async()=>{
 const frame=createFrame({toolbar:{customize:false,primary:true},features:{panel:false,secondarySidebar:false}});
 const other=createFrame();
 expect(frame.toolbar.isVisible('customize')).toBe(false);
 expect(frame.toolbar.isVisible('primary')).toBe(true);
 expect(frame.toolbar.isVisible('bottom')).toBe(false);
 expect(frame.toolbar.isVisible('secondary')).toBe(false);
 expect(frame.commands.isEnabled('frame.layout.customize')).toBe(true);
 expect(other.toolbar.isVisible('customize')).toBe(true);
 frame.toolbar.setVisible('layoutControls',false);
 frame.resetLayout();
 expect(frame.toolbar.isVisible('customize')).toBe(false);
 expect(frame.toolbar.isVisible('primary')).toBe(true);
 expect(frame.toolbar.isVisible('layoutControls')).toBe(true);
 frame.dispose();other.dispose();
});
