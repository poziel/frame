import {createApp,defineComponent,h,ref} from 'vue';
import {createFrame,FrameShell,FrameIcon} from '@frame/core';
const icon=defineComponent({setup:()=>()=>h(FrameIcon,{name:'files',size:16})});
const Content=defineComponent({props:{label:String},setup(props){const count=ref(0),note=ref('Draft');return()=>h('div',[h('button',{onClick:()=>count.value++},'Increment '+props.label),h('output',{class:'count'},String(count.value)),h('input',{'aria-label':props.label+' draft',value:note.value,onInput:(
  e:Event
)=>note.value=(e.target as HTMLInputElement).value})]);}});
const frames=[createFrame({navigation:true}),createFrame()];
const actions=Array.from({length:8},(_, i)=>({id:'action-'+i,label:'View action '+i,icon,run:()=>{}}));
for(const frame of frames){
 frame.layout.primaryWidth=260;frame.layout.secondaryWidth=260;
 for(let i=1;i<=10;i++){
  frame.registerSidePanel({id:'p'+i,label:'Primary view '+i,icon,component:Content,props:{label:'Primary '+i},actions:i===1?actions:[]});
  frame.registerSecondaryTab({id:'s'+i,label:'Secondary view '+i,icon,component:Content,props:{label:'Secondary '+i},actions:i===1?actions:[]});
 }
 frame.openSidePanel('p1');frame.openSecondaryPanel('s1');
}
(window as any).sidebarFrames=frames;
createApp({render:()=>h('div',frames.map((frame, index)=>h('section',{id:'sidebar-instance-'+index,style:'height:650px;width:1240px;position:relative;margin-bottom:20px'},[h(FrameShell,{frame,titleText:'Sidebar instance '+index,showSearch:false,style:'height:650px;min-height:0'})])))}).mount('#app');
