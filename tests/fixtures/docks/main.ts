import { createApp, defineComponent, h, ref } from 'vue';
import { createFrame, FrameShell } from '@frame/core';
const frame=createFrame({navigationBar:true});
const simple=defineComponent({render:()=>h('div','Anchor content')});
frame.registerSidePanel({id:'primary',label:'Primary',component:simple});frame.openSidePanel('primary');
frame.registerSecondaryTab({id:'secondary',label:'Secondary',component:simple});frame.openSecondaryPanel('secondary');
frame.registerBottomTab({id:'panel',label:'Panel',component:simple});frame.openBottomPanel('panel');
const sample=defineComponent({setup(){const count=ref(0),draft=ref('');return()=>h('div',{style:{display:'flex',gap:'6px',alignItems:'center'}},[h('button',{onClick:()=>count.value++},`Count ${count.value}`),h('input',{'aria-label':'Dock draft',value:draft.value,onInput:(
  e:Event
)=>draft.value=(e.target as HTMLInputElement).value})]);}});
function add(
  id:string,
  anchor='workspace',
  edge='bottom',
  placement='outside',
  extra={}
){return frame.docks.register({id,label:id,component:sample,anchor,edge,placement,...extra} as Parameters<typeof frame.docks.register>[0]);}
createApp({render:()=>h(FrameShell,{frame,titleText:'Dock fixture'},()=>h('div',{style:{height:'100%',background:'var(--frame-canvas)'}},'Workspace'))}).mount('#app');
Object.assign(window,{dockFixture:{frame,add}});
