import {expect,test} from 'bun:test';
import {createFrame} from '../packages/core/src/framework/frame';
import {showWorkspaceContent} from '../packages/docs/src/examples/workspaceContent';

test('Docs navigation works in plain, populated-tab, and empty-tab panes',()=>{
  const frame=createFrame();const component={render:()=>null};
  showWorkspaceContent(frame,{label:'Plain',component});
  expect(frame.workspace.panes.value[0]?.component).toBe(component);
  const pane=frame.splitWorkspace();frame.workspace.setPaneMode(pane,'tabs');
  showWorkspaceContent(frame,{label:'First',component});
  expect(frame.workspace.tabs.value).toHaveLength(1);
  showWorkspaceContent(frame,{label:'Second',component});
  expect(frame.workspace.tabs.value).toHaveLength(1);
  expect(frame.workspace.tabs.value[0]?.title).toBe('Second');
  frame.dispose();
});
