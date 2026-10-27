import { test, expect } from 'bun:test';
import {createFrame} from '../packages/core/src/framework/frame';
import { defineTheme } from '../packages/core/src/themes/theme';
import { matchesShortcut } from '../packages/core/src/framework/shortcuts/shortcuts';

test('application and Frame contributions switch live without changing request identity', async () => {
 const frame = createFrame(), other = createFrame(); let calls = 0;
 frame.registerCommand({id:'app.search', label:'Find document', shortcut:'Ctrl+K', run(){calls++;}});
 const remove = frame.registerCommand({id:'extension.settings', label:'Extension settings', scope:'frame', shortcut:'Ctrl+Shift+Y', run(){calls++;}});
 frame.registerCommand({id:'hidden', label:'Hidden', quickInput:false, run(){}});
 frame.openQuickInput(); const id = frame.quickInput.value!.id;
 expect(frame.quickInputItems.value.map(x=>x.id)).toEqual(['app.search']);
 frame.setQuickInputMode('frame'); expect(frame.quickInput.value!.id).toBe(id);
 expect(frame.quickInputItems.value.filter(x=>!x.id.startsWith('frame.')).map(x=>x.id)).toEqual(['extension.settings']);
 frame.acceptQuickInput('app.search'); expect(calls).toBe(0);
 frame.acceptQuickInput('extension.settings'); expect(calls).toBe(1); expect(frame.quickInput.value).toBeNull();
 frame.openCommands(); remove(); expect(frame.quickInputItems.value.some(x=>x.id==='extension.settings')).toBe(false);
 expect(other.commands.get('extension.settings')).toBeUndefined(); expect(other.commands.get('app.search')).toBeUndefined(); frame.dispose(); other.dispose();
});

test('explicit quick picks retain caller data and do not interpret operators', async () => {
 const frame = createFrame(); const item = {id:'literal',label:'> literal'};
 const pending = frame.showQuickPick([item]); frame.setQuickInputMode('frame');
 expect(frame.quickInput.value!.mode).toBe('pick'); frame.acceptQuickInput(item.id); expect(await pending).toBe(item);
});

test('theme contributions and workspace activation commands follow their resource lifecycle', async () => {
 const frame=createFrame(); const theme=defineTheme({version:1,id:'test-theme',name:'Test theme',appearance:'dark',tokens:{}});
 const remove=frame.theme.register(theme); frame.openCommands();
 expect(frame.quickInputItems.value.some(x=>x.id==='frame.theme.select.test-theme')).toBe(false);
 frame.acceptQuickInput('frame.theme.change');
 frame.acceptQuickInput('frame.theme.select.test-theme'); await Promise.resolve(); await Promise.resolve(); expect(frame.theme.current.value!.id).toBe(theme.id);
 remove(); expect(frame.commands.value.some(x=>x.id==='frame.theme.select.test-theme')).toBe(false);
 frame.workspace.setPaneMode(frame.workspace.initialPaneId,'tabs');
 const unregister=frame.workspace.registerTab(frame.workspace.initialPaneId,{id:'document',title:'Document'});
 await frame.executeCommand('frame.workspace.activate.document'); expect(frame.workspace.activeTabs.value[frame.workspace.initialPaneId]).toBe('document');
 unregister(); expect(frame.commands.value.some(x=>x.id==='frame.workspace.activate.document')).toBe(false);
 frame.dispose(); expect(frame.theme.available.value).toEqual([]);
});

test('shortcut matching requires exact modifiers and supports command on macOS', () => {
 const event=(extra:object)=>({key:'y',ctrlKey:true,metaKey:false,altKey:false,shiftKey:true,...extra} as KeyboardEvent);
 expect(matchesShortcut(event({}),'Ctrl+Shift+Y')).toBe(true);
 expect(matchesShortcut(event({ctrlKey:false,metaKey:true}),'Ctrl+Shift+Y')).toBe(true);
 expect(matchesShortcut(event({altKey:true}),'Ctrl+Shift+Y')).toBe(false);
 expect(matchesShortcut(event({shiftKey:false}),'Ctrl+Shift+Y')).toBe(false);
});

test('duplicate view names share View terminology, carry icons, and open the correct region', async () => {
 const frame=createFrame(); const component={render:()=>null}, icon={render:()=>null};
 const removePrimary=frame.registerView({id:'explorer',label:'Explorer',children:[{id:'nested-outline',label:'Outline',component,icon}]},'primary');
 frame.registerView({id:'secondary-outline',label:'Outline',component,icon},'secondary');
 frame.openCommands();
 const primary=frame.quickInputItems.value.find(x=>x.id===frame.getViewCommand('nested-outline'))!;
 const secondary=frame.quickInputItems.value.find(x=>x.id===frame.getViewCommand('secondary-outline'))!;
 expect(primary.label).toBe('View: Outline (Primary sidebar)');
 expect(secondary.label).toBe('View: Outline (Secondary sidebar)'); expect(secondary.icon).toBe(icon);
 frame.acceptQuickInput(secondary.id);expect(frame.state.activeSecondaryTab).toBe('secondary-outline');expect(frame.layout.secondarySidebarVisible).toBe(true);
 await frame.executeCommand(primary.id);expect(frame.state.activeSidePanel).toBe('explorer');expect(frame.menuState.collapsed.explorer).toBe(false);
 frame.moveView('secondary-outline','bottom');frame.openCommands();
 expect(frame.quickInputItems.value.find(x=>x.id===secondary.id)!.label).toBe('View: Outline (Panel)');
 removePrimary();expect(frame.quickInputItems.value.find(x=>x.id===secondary.id)!.label).toBe('View: Outline');frame.dispose();
});
