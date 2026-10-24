import { expect, test } from 'bun:test';
import { createWorkspace } from '../packages/core/src/frame/workspace';
import { createFrame } from '../packages/core/src/frame/createFrame';

test('pane permissions and limits apply without changing the source', () => {
  for (const maxPanes of [0, 21, 1.5, NaN]) expect(() => createWorkspace({ maxPanes })).toThrow();
  const w = createWorkspace({ maxPanes: 2 });
  const second = w.split('right');
  expect(w.panes.value.find(p => p.id === second)?.component).toBeUndefined();
  expect(() => w.split('right')).toThrow();
  w.configure({ allowPaneCreation: false });
  expect(w.canSplit()).toBe(false);
  expect(w.panes.value).toHaveLength(2);
});

test('tabs are opt-in, user permissions independent from host registration', async () => {
  const w = createWorkspace();
  expect(w.setPaneMode('pane-1', 'tabs').ok).toBe(true);
  w.registerTab('pane-1', { id: 'a', title: 'A' });
  expect((await w.requestTab()).ok).toBe(false);
  expect((await w.closeTabs(['a'])).ok).toBe(false);
  w.configure({ tabs: { allowCreate: true, allowClose: true, lastTab: 'allow-empty' } });
  expect((await w.requestTab()).ok).toBe(true);
  expect(w.tabs.value).toHaveLength(2);
  expect((await w.closeTabs(w.tabs.value.map(t => t.id))).ok).toBe(true);
  expect(w.tabs.value).toHaveLength(0);
});

test('pin groups, neighbor fallback and last-tab policy', async () => {
  const w = createWorkspace({ tabs: { allowClose: true } });
  w.setPaneMode('pane-1', 'tabs');
  for (const id of ['a','b','c']) w.registerTab('pane-1', {id, title:id});
  w.activateTab('b');
  await w.closeTabs(['b']);
  expect(w.activeTabs.value['pane-1']).toBe('c');
  w.setTabPinned('c', true);
  expect(w.tabs.value.map(t => t.id)).toEqual(['c','a']);
  expect((await w.closeTabs(['c'])).ok).toBe(false);
  await w.closeTabs(['a']);
  w.setTabPinned('c', false);
  expect((await w.closeTabs(['c'])).ok).toBe(false);
});

test('moving is separate from splitting, checks content and both permissions', () => {
  const w = createWorkspace({ tabs: { allowMove: true } });
  w.setPaneMode('pane-1','tabs');
  w.registerTab('pane-1',{id:'a',title:'A'});
  const plain = w.split('right');
  expect(w.tabs.value[0]?.paneId).toBe('pane-1');
  w.configure({allowPaneCreation:false});
  expect(w.moveTabToNewPane('a','right').ok).toBe(false);
  expect(w.moveTab('a',plain).ok).toBe(true);
  expect(w.paneMode(plain)).toBe('tabs');
  const release = w.registerPaneContent('pane-1');
  expect(w.setPaneMode('pane-1','plain').ok).toBe(true);
  expect(w.moveTab('a','pane-1').ok).toBe(false);
  release();
  expect(w.moveTab('a','pane-1').ok).toBe(true);
});

test('bulk close and pane closure are atomic, guarded and stale-safe', async () => {
  let finish!: (allowed:boolean)=>void;
  const w = createWorkspace({tabs:{allowClose:true,lastTab:'allow-empty',beforeClose:()=>new Promise(resolve=>{finish=resolve;})}});
  w.setPaneMode('pane-1','tabs');
  w.registerTab('pane-1',{id:'a',title:'A'});
  w.registerTab('pane-1',{id:'b',title:'B'});
  const pending = w.closeTabs(['a','b']);
  w.setTabPinned('b',true);
  finish(true);
  expect((await pending).ok).toBe(false);
  expect(w.tabs.value).toHaveLength(2);
  w.configure({tabs:{beforeClose:()=>false}});
  const other = w.split('right');
  expect((await w.requestClosePane('pane-1')).ok).toBe(false);
  expect(w.panes.value).toHaveLength(2);
  expect(w.close('pane-1')).toBe(false);
  expect(w.close(other)).toBe(true);
});

test('async creation cannot commit after reset or permission changes', async () => {
  let finish!: (tab: {id:string;title:string})=>void;
  const w = createWorkspace({tabs:{allowCreate:true,create:()=>new Promise(resolve=>{finish=resolve;})}});
  w.setPaneMode('pane-1','tabs');
  const pending = w.requestTab();
  w.reset();
  finish({id:'late',title:'Late'});
  expect((await pending).ok).toBe(false);
  expect(w.tabs.value).toHaveLength(0);
  w.dispose(); w.dispose();
  expect((await w.requestTab()).ok).toBe(false);
});

test('temporarily disabling creation invalidates an already running factory', async () => {
  let finish!: (tab: {id:string;title:string})=>void;
  const w = createWorkspace({tabs:{allowCreate:true,create:()=>new Promise(resolve=>{finish=resolve;})}});
  w.setPaneMode('pane-1','tabs');
  const result = w.requestTab();
  w.configure({tabs:{allowCreate:false}});
  w.configure({tabs:{allowCreate:true}});
  finish({id:'late',title:'Late'});
  expect((await result).ok).toBe(false);
  expect(w.tabs.value).toHaveLength(0);
});

test('pane-specific last-tab and presentation policies do not leak', async () => {
  const w = createWorkspace({tabs:{allowClose:true}});
  w.setPaneMode('pane-1','tabs');
  const second=w.split('right');w.setPaneMode(second,'tabs');
  w.configurePaneTabs(second,{lastTab:'allow-empty',showTitles:false});
  w.registerTab('pane-1',{id:'a',title:'A'});w.registerTab(second,{id:'b',title:'B'});
  expect(w.tabOptions(second).showTitles).toBe(false);
  expect((await w.closeTabs(['a'])).ok).toBe(false);
  expect((await w.closeTabs(['b'])).ok).toBe(true);
  expect(w.tabOptions('pane-1').showTitles).toBe(true);
  expect(w.panes.value.some(p=>p.id===second)).toBe(false);
});

test('disposal settles requests even when a host callback ignores its abort signal', async () => {
  const w=createWorkspace({tabs:{allowCreate:true,create:()=>new Promise(()=>{})}});
  w.setPaneMode('pane-1','tabs');
  const pending=w.requestTab();w.dispose();
  const result=await Promise.race([pending,new Promise(resolve=>setTimeout(()=>resolve('timeout'),50))]);
  expect(result).not.toBe('timeout');
});

test('navigation restores surviving selections without resurrecting closed or moved tabs', async()=>{
  const f=createFrame({navigation:true,workspace:{tabs:{allowClose:true,allowMove:true,lastTab:'allow-empty'}}});
  const w=f.workspace;w.setPaneMode('pane-1','tabs');
  for(const id of ['a','b','c'])w.registerTab('pane-1',{id,title:id});
  w.activateTab('a');w.activateTab('b');
  expect(f.navigation.back()).toBe(true);expect(w.activeTabs.value['pane-1']).toBe('a');
  await w.closeTabs(['b']);
  expect(()=>f.navigation.forward()).not.toThrow();
  expect(w.tabs.value.some(t=>t.id==='b')).toBe(false);
  const pane=w.split('right');w.moveTab('a',pane);f.navigation.back();
  expect(w.tabs.value.find(t=>t.id==='a')?.paneId).toBe(pane);
  f.dispose();
});

test('pane closure commits its tabs and tree together before other pane removal',async()=>{
  const w=createWorkspace({tabs:{allowClose:true,lastTab:'allow-empty'}});
  w.setPaneMode('pane-1','tabs');w.registerTab('pane-1',{id:'a',title:'A'});
  const other=w.split('right');
  const closing=w.requestClosePane('pane-1');
  const removedOther=w.close(other);
  const result=await closing;
  expect(result.ok).toBe(true);
  expect(removedOther).toBe(false);
  expect(w.panes.value.map(p=>p.id)).toEqual([other]);
});

test('host cleanup survives synchronous updates from a registration listener',()=>{
  const w=createWorkspace();w.setPaneMode('pane-1','tabs');
  w.onDidChange(event=>{if(event.type==='register')w.updateTab(event.tabIds[0]!,{title:'Renamed'});});
  const cleanup=w.registerTab('pane-1',{id:'a',title:'A'});
  expect(w.tabs.value[0]?.title).toBe('Renamed');
  cleanup();cleanup();expect(w.tabs.value).toHaveLength(0);
});

test('pin events tolerate listeners unregistering the contribution',()=>{
  const w=createWorkspace();w.setPaneMode('pane-1','tabs');
  const cleanup=w.registerTab('pane-1',{id:'a',title:'A'});
  w.onDidChange(event=>{if(event.type==='update')cleanup();});
  expect(()=>w.setTabPinned('a',true)).not.toThrow();
});

test('permission changes cancel drag payloads even if movement is reenabled',()=>{
  const w=createWorkspace({tabs:{allowMove:true}});w.setPaneMode('pane-1','tabs');w.registerTab('pane-1',{id:'a',title:'A'});
  const payload=w.tabDragData('a')!;
  expect(w.readTabDrag(payload)).toBe('a');
  w.configure({tabs:{allowMove:false}});w.configure({tabs:{allowMove:true}});
  expect(w.readTabDrag(payload)).toBeUndefined();
});

test('closing the final tab collapses its pane or returns the final pane to plain mode',async()=>{
  const w=createWorkspace({tabs:{allowClose:true,lastTab:'allow-empty'}});
  w.setPaneMode('pane-1','tabs');w.registerTab('pane-1',{id:'a',title:'A'});
  const second=w.split();w.setPaneMode(second,'tabs');w.registerTab(second,{id:'b',title:'B'});
  await w.closeTabs(['b']);
  expect(w.panes.value.map(p=>p.id)).toEqual(['pane-1']);
  await w.closeTabs(['a']);
  expect(w.paneMode('pane-1')).toBe('plain');
  expect(w.panes.value).toHaveLength(1);
});

test('tab creation resumes from the final blank page and stays plain when cancelled',async()=>{
  const w=createWorkspace({tabs:{allowCreate:true,allowClose:true,lastTab:'allow-empty'}});
  expect(w.canCreateTab()).toBe(true);
  expect((await w.requestTab(undefined,'double-click')).ok).toBe(true);
  await w.closeTabs(w.tabs.value.map(t=>t.id));
  expect(w.paneMode('pane-1')).toBe('plain');
  w.configure({tabs:{create:()=>undefined}});
  expect((await w.requestTab()).ok).toBe(false);
  expect(w.paneMode('pane-1')).toBe('plain');
  w.configure({tabs:{allowCreate:false}});
  expect(w.canCreateTab()).toBe(false);
});
