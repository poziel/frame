import { expect, test } from 'bun:test';
import { reactive } from 'vue';
import {createFrame} from '../packages/core/src/framework/frame';

test('host history drives existing navigation commands and respects feature availability', async () => {
  const state=reactive({back:true,forward:false});
  const calls:string[]=[];
  const frame=createFrame({navigation:{
    canGoBack:()=>state.back,canGoForward:()=>state.forward,
    back:async()=>{calls.push('undo');state.forward=true;},
    forward:()=>{calls.push('redo');},
  }});
  frame.registerSidePanel({id:'view',label:'View',component:{template:'<div/>'}});
  frame.openView('view');
  expect(frame.navigation.canGoBack).toBe(true);
  expect(frame.navigation.canGoForward).toBe(false);
  await frame.commands.execute('frame.navigation.forward');
  expect(calls).toEqual([]);
  await frame.commands.execute('frame.navigation.back');
  expect(calls).toEqual(['undo']);
  expect(frame.navigation.canGoForward).toBe(true);
  await frame.commands.execute('frame.navigation.forward');
  expect(calls).toEqual(['undo','redo']);
  frame.features.setAvailable('navigation',false);
  await frame.commands.execute('frame.navigation.back');
  expect(frame.navigation.canGoBack).toBe(false);
  expect(calls).toEqual(['undo','redo']);
  const other=createFrame({navigation:true});
  expect(other.navigation.canGoBack).toBe(false);
  frame.features.setAvailable('navigation',true);
  frame.dispose();other.dispose();
  expect(frame.navigation.canGoBack).toBe(false);
  await frame.navigation.back();
  expect(calls).toEqual(['undo','redo']);
});
