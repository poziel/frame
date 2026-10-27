import {createApp,defineComponent,h,ref} from 'vue';
import {createFrame,FrameShell,FrameButton,FrameQuickPick,FrameQuickPanel} from '@frame/core';
import '../../../packages/core/src/style.css';
const frames=[createFrame(),createFrame()];
const picker=[ref(false),ref(false)],panel=[ref(false),ref(false)],accepted=[ref('none'),ref('none')];
const inputInstances=[ref<InstanceType<typeof FrameQuickPick>>(),ref<InstanceType<typeof FrameQuickPick>>()];
const override=[ref<'top'|'center'>(),ref<'top'|'center'>()];
const items=[{id:'disabled',label:'Unavailable',disabled:true},{id:'alpha',label:'Alpha',detail:'Distinct searchable detail'},{id:'beta',label:'Beta'},...Array.from({length:60},(
  _,
  i
)=>({id:'item-'+i,label:'Item '+i}))];
for(const [i,frame] of frames.entries()){
 frame.layout.primarySidebarVisible=false;frame.layout.secondarySidebarVisible=false;frame.layout.panelVisible=false;frame.layout.quickInputPosition=i===0?'center':'top';
 const title='Host '+(i===0?'A':'B');
 const Content=defineComponent({setup:()=>()=>h('div',[
  h(FrameButton,{onClick:()=>picker[i]!.value=true},()=>title+' open picker'),h(FrameButton,{onClick:()=>panel[i]!.value=true},()=>title+' open panel'),h('output',{id:'accepted-'+i},accepted[i]!.value),
  picker[i]!.value?h(FrameQuickPick,{ref:(value:unknown)=>inputInstances[i]!.value=value as InstanceType<typeof FrameQuickPick>,title:title+' picker',items,position:override[i]!.value,onAccept:(
    id:string
  )=>{accepted[i]!.value=id;picker[i]!.value=false;},onClose:()=>picker[i]!.value=false}):null,
  panel[i]!.value?h(FrameQuickPanel,{title:title+' panel',position:override[i]!.value,onClose:()=>panel[i]!.value=false},{'header-actions':()=>h(FrameButton,{'aria-label':title+' header action'},()=> 'Header action'),default:()=>[h('input',{'aria-label':title+' custom input'}),h('button',{},title+' custom action'),h('div',{style:'height:700px'},'Long panel content')]}):null,
 ])});frame.setWorkspacePane(frame.workspace.initialPaneId,{label:title,component:Content});
}
const standalonePicker=ref(false),standalonePanel=ref(false),standaloneAccepted=ref('none');
(globalThis as typeof globalThis & {__quickSplit:unknown}).__quickSplit={frames,picker,panel,override,inputInstances};
createApp({setup:()=>()=>h('main',[
 h('section',{style:'display:flex;gap:8px;padding:8px'},[h(FrameButton,{onClick:()=>standalonePicker.value=true},()=> 'Standalone open picker'),h(FrameButton,{onClick:()=>standalonePanel.value=true},()=> 'Standalone open panel'),h('output',{id:'standalone-accepted'},standaloneAccepted.value)]),
 h('div',{class:'fixture-shells',style:'display:flex;gap:16px;padding:16px'},frames.map((
   frame,
   i
 )=>h('section',{id:'host-'+i,style:'width:540px;height:560px'},[h(FrameShell,{frame,showSearch:false})]))),
 standalonePicker.value?h(FrameQuickPick,{title:'Standalone picker',items,onAccept:(
   id:string
 )=>{standaloneAccepted.value=id;standalonePicker.value=false;},onClose:()=>standalonePicker.value=false}):null,
 standalonePanel.value?h(FrameQuickPanel,{title:'Standalone panel',onClose:()=>standalonePanel.value=false},{default:()=>h('input',{'aria-label':'Standalone entry'})}):null,
])}).mount('#app');
const style=document.createElement('style');style.textContent='.fixture-shells .workbench{width:100%;height:100%}';document.head.append(style);
