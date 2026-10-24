import {test,expect} from 'bun:test';
import {createFrame} from '../packages/core/src/frame/createFrame';
import {workspaceTabMenu} from '../packages/core/src/frame/workspaceTabMenu';
test('disabling panes hides pane commands and tab split/move actions while retaining document tabs',()=>{
 const frame=createFrame({workspace:{allowPaneCreation:false,welcome:{commands:['app.open']},tabs:{allowClose:true,lastTab:'allow-empty'}}});
 const pane=frame.workspace.initialPaneId;frame.workspace.setPaneMode(pane,'tabs');
 frame.workspace.registerTab(pane,{id:'a',title:'A'});
 const menu=workspaceTabMenu(frame.workspace,pane,'a');
 expect(menu.some(item=>item.id==='tab.split'||item.id==='tab.move')).toBe(false);
 expect(menu.some(item=>item.id==='tab.close')).toBe(true);
 expect(frame.commands.isVisible('frame.workspace.split.right')).toBe(false);
 expect(frame.commands.isVisible('frame.workspace.close')).toBe(false);
 expect(frame.workspace.options.welcome?.commands).toEqual(['app.open']);frame.dispose();
});
