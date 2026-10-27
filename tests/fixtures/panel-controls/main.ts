import {createApp,defineComponent,h,ref} from 'vue';
import {createFrame,FrameShell,FrameIcon} from '@frame/core';
import '../../../packages/core/src/style.css';
const frame=createFrame();
const content=defineComponent({setup(){const value=ref('Original draft');return()=>h('input',{'aria-label':'Panel draft',value:value.value,onInput:(
  event:Event
)=>value.value=(event.target as HTMLInputElement).value});}});
const blank={render:()=>h('p','Sidebar content')};
const icon=defineComponent({setup:()=>()=>h(FrameIcon,{name:'terminal',size:16})});
frame.registerView({id:'primary',label:'Primary',component:blank},'primary');
frame.registerView({id:'secondary',label:'Secondary',component:blank},'secondary');
frame.registerView({id:'terminal',label:'Terminal',badge:3,icon,component:content},'bottom');
frame.registerView({id:'output',label:'Output',icon,component:blank},'bottom');
frame.openSidePanel('primary');frame.openSecondaryPanel('secondary');frame.openBottomPanel('terminal');
Object.assign(window,{panelFixture:frame});
createApp({setup:()=>()=>h(FrameShell,{frame,titleText:'Panel controls fixture',style:'height:760px;min-height:0'})}).mount('#app');
