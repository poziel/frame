import { createApp, h, ref, onMounted } from 'vue';
import { createFrame, FrameShell } from '@frame/core';
import '../../../packages/core/src/style.css';
const frame=createFrame({navigation:true,navigationBar:{display:'both',allowAddSeparator:true},primaryViewBar:{allowAddSeparator:true},secondaryViewBar:{position:'default',allowAddSeparator:true},panelViewBar:{allowAddSeparator:true}});
const selected=ref('Alpha'),calls=ref(0);let mounts=0;
for(const label of ['Alpha','Beta','Disabled'])frame.registerNavigationItem({id:label,type:'action',label,icon:label==='Alpha'?{render:()=>h('svg',{'data-test-icon':'alpha',viewBox:'0 0 16 16'},[h('path',{d:'M2 2h12v12H2z'})])}:undefined,badge:4,disabled:label==='Disabled',active:()=>selected.value===label,run:()=>{selected.value=label;calls.value++;}});
frame.registerNavigationItem({id:'separator',type:'separator',label:'Divider'});
frame.registerNavigationItem({id:'link',type:'link',label:'Go home',href:'#home',onNavigate:()=>{calls.value++;}});
frame.registerNavigationItem({id:'native',type:'link',label:'Native link',href:'#native'});
frame.registerNavigationItem({id:'menu',type:'dropdown',label:'Options',items:[{id:'nested',type:'dropdown',label:'Nested',items:[{id:'nested-action',type:'action',label:'Run nested',run:()=>{calls.value++;}}]},{id:'nested-link',type:'link',label:'Menu link',href:'#menu-link',onNavigate:()=>{calls.value++;}}]});
const content={setup(){onMounted(()=>{mounts++;});return()=>h('input',{'aria-label':'Retained input',defaultValue:'draft'});}};
frame.registerView({id:'view',label:'Sidebar content',component:content},'primary');frame.openView('view');
frame.registerView({id:'secondary',label:'Secondary content',component:content},'secondary');frame.openView('secondary');
frame.registerView({id:'panel',label:'Panel content',component:content},'bottom');frame.openView('panel');
frame.setWorkspacePane(frame.workspace.activePane.value,{label:'Workspace draft',component:content});
(globalThis as any).__navFrame=frame;(globalThis as any).__navMounts=()=>mounts;
createApp({setup:()=>()=>h('div',[
 h('output',`Calls ${calls.value}`),
 ...(['top','bottom','left','right']as const).map(position=>h('button',{onClick:()=>frame.navigationBar.setPosition(position)},`Dock ${position}`)),
 h('button',{onClick:()=>frame.navigationBar.setVisible(!frame.navigationBar.visible.value)},'Toggle navigation'),
 h('button',{onClick:()=>frame.navigationBar.setSize('compact')},'Compact API'),
 h('button',{onClick:()=>frame.navigationBar.setDisplay('text')},'Text API'),
 h('button',{onClick:()=>{for(let i=0;i<60;i++)frame.registerNavigationItem({id:`extra-${i}`,type:'action',label:`Extra ${i}`,run(){}});}},'Add overflow'),
 h(FrameShell,{frame,style:'height:650px;min-height:0'}),
])}).mount('#app');
