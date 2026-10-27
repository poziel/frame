import {createApp,defineComponent,h,ref} from 'vue';
import {createFrame,FrameShell,FrameIcon} from '@frame/core';
import '../../../packages/core/src/style.css';
const frame=createFrame({secondaryViewBar:{display:'both'}});frame.layout.secondaryWidth=560;
const icon=defineComponent({setup:()=>()=>h(FrameIcon,{name:'comment-discussion',size:16})});
const runs=ref(0);
const content=defineComponent({setup(){const value=ref('Draft message');return()=>h('input',{id:'draft',value:value.value,'aria-label':'Draft message',onInput:(
  event:Event
)=>value.value=(event.target as HTMLInputElement).value});}});
for(const [id,label]of [['chat','Chat'],['codex','Codex'],['claude','Claude Code']])frame.registerSecondaryTab({id,label,icon,component:content,badge:id==='chat'?3:undefined,actions:id==='chat'?[{id:'new',label:'New Chat',icon,run(){runs.value++;}},{id:'settings',label:'Chat Settings',icon,run(){runs.value+=10;}},{id:'disabled',label:'Unavailable action',icon,disabled:true,run(){runs.value+=100;}}]:[]});
frame.openSecondaryPanel('chat');
createApp({setup:()=>()=>h('div',[
 h('button',{id:'narrow',onClick:()=>frame.layout.secondaryWidth=160},'Narrow'),h('button',{id:'medium',onClick:()=>frame.layout.secondaryWidth=340},'Medium'),h('button',{id:'wide',onClick:()=>frame.layout.secondaryWidth=560},'Wide'),h('button',{id:'open-chat',onClick:()=>frame.openSecondaryPanel('chat')},'Open Chat'),
 h('output',{id:'runs'},runs.value),h('output',{id:'display-state'},frame.secondaryViewBar.display.value),h('output',{id:'size-state'},frame.secondaryViewBar.size.value),h('output',{id:'side-state'},frame.layout.primarySide),h('output',{id:'region-state'},frame.viewRegion('chat')??''),
 h(FrameShell,{frame,titleText:'Secondary views',style:'height:650px;min-height:0'}),
])}).mount('#app');
