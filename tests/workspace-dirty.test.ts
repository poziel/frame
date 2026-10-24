import {test,expect} from 'bun:test';
import {createFrame} from '../packages/core/src/frame/createFrame';
const make=(trackChanges=false)=>{const frame=createFrame({workspace:{tabs:{allowClose:true,lastTab:'allow-empty',trackChanges}}});const w=frame.workspace;w.setPaneMode(w.initialPaneId,'tabs');w.registerTab(w.initialPaneId,{id:'a',title:'A',dirty:true});return frame;};
test('tab dirty states are opt-in and clean tabs close without confirmation',async()=>{
 const plain=make();expect((await plain.workspace.closeTabs(['a'])).ok).toBe(true);expect(plain.workspace.closeConfirmation.value).toBeUndefined();plain.dispose();
 const tracked=make(true);tracked.workspace.updateTab('a',{dirty:false});expect((await tracked.workspace.closeTabs(['a'])).ok).toBe(true);expect(tracked.workspace.closeConfirmation.value).toBeUndefined();tracked.dispose();
});
test('Frame guards dirty closes, cancellation retains tabs, and saving resets the guard',async()=>{
 const frame=make(true),w=frame.workspace;
 const cancelled=w.closeTabs(['a']);expect(w.closeConfirmation.value?.tabs[0]?.id).toBe('a');w.closeConfirmation.value!.respond(false);
 expect(await cancelled).toEqual({ok:false,reason:'cancelled'});expect(w.tabs.value).toHaveLength(1);
 const approved=w.closeTabs(['a']);w.closeConfirmation.value!.respond(true);expect((await approved).ok).toBe(true);expect(w.tabs.value).toHaveLength(0);frame.dispose();
});
test('dirty state changes invalidate pending confirmation and disposal cancels it',async()=>{
 const frame=make(true),w=frame.workspace;const pending=w.closeTabs(['a']);w.updateTab('a',{dirty:false});expect((await pending).ok).toBe(false);expect(w.closeConfirmation.value).toBeUndefined();expect(w.tabs.value).toHaveLength(1);w.updateTab('a',{dirty:true});const exit=w.confirmUnsavedChanges(['a']);frame.dispose();expect(await exit).toBe(false);
});
test('dirty confirmations are isolated and host close hooks run only after approval',async()=>{
 const first=make(true),second=make(true);let calls=0;first.workspace.configure({tabs:{beforeClose:()=>{calls++;return true;}}});
 const pending=first.workspace.closeTabs(['a']);expect(second.workspace.closeConfirmation.value).toBeUndefined();expect(calls).toBe(0);first.workspace.closeConfirmation.value!.respond(true);expect((await pending).ok).toBe(true);expect(calls).toBe(1);first.dispose();second.dispose();
});
