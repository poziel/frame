import {createApp,defineComponent,h,ref} from 'vue';
import {createFrame,FrameShell} from '@frame/core';
const Counter=defineComponent({setup(){const count=ref(0);return ()=>h('div',[h('button',{onClick:()=>count.value++},'Increment state'),h('output',{class:'counter'},String(count.value))]);}});
const frames=[createFrame(),createFrame()];
for(const frame of frames){
 frame.layout.menuBarVisible=true;frame.layout.secondarySidebarVisible=false;frame.layout.panelVisible=false;
 frame.registerSidePanel({id:'same',label:'Explorer',component:Counter,badge:0});
 frame.registerSidePanel({id:'search',label:'Search',component:Counter});
 frame.registerSidePanel({id:'hidden',label:'Hidden contribution',component:Counter,showInRail:false});
 frame.openSidePanel('same');
}
(window as any).viewBarFrames=frames;
createApp({render:()=>h('div',{style:'display:flex;gap:8px'},frames.map((
  frame,
  index
)=>h('section',{id:`frame-${index}`,style:'width:700px;height:500px;position:relative'},[h(FrameShell,{frame,titleText:`Instance ${index}`,showSearch:false})])))}).mount('#app');
