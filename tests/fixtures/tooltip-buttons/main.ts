import { createApp, defineComponent, h, ref } from "vue";
import { FrameButton, FrameIconButton, FrameTooltip } from "@frame/core";
const RectIcon=defineComponent({render:()=>h('svg',{viewBox:'0 0 16 10',width:16,height:10},[h('path',{d:'M0 0H16V10H0Z'})])});
const App = defineComponent({setup(){
 const button=ref<{element?:HTMLButtonElement;focus():void}>(), icon=ref<{element?:HTMLButtonElement;focus():void}>();
 const clicks=ref(0), submitted=ref(false), disabled=ref(false);
 return ()=>h('main',{style:'display:grid;gap:16px;padding:40px;max-width:400px'},[
  h('form',{onSubmit:(event:Event)=>{event.preventDefault();submitted.value=true;}},[
   h(FrameButton,{ref:button,label:'Submit',type:'submit',variant:'primary',name:'intent',value:'save',onClick:()=>clicks.value++}),
   h(FrameButton,{label:'Default button',onClick:()=>clicks.value++}),
   h(FrameButton,{label:'Disabled button',disabled:true,onClick:()=>clicks.value++}),
  ]),
  h('output',{id:'clicks'},String(clicks.value)),h('output',{id:'submitted'},String(submitted.value)),
  h('p',{id:'external-description'},'Host description'),
  h(FrameIconButton,{ref:icon,label:'Open',icon:'folder',shortcut:'Ctrl+O','aria-describedby':'external-description','data-testid':'icon',onClick:()=>clicks.value++}),
  h(FrameIconButton,{label:'Rectangle',icon:RectIcon,tooltip:false}),
  h(FrameIconButton,{label:'Labeled rectangle',icon:RectIcon,showLabel:true,tooltip:false}),
  h(FrameIconButton,{label:'No hint',icon:'folder',tooltip:false}),
  h(FrameTooltip,{text:'Standalone hint',shortcut:'Alt+S',disabled:disabled.value,placement:'right',id:'standalone-wrapper'}, {default:(
    {describedby}:{describedby?:string}
  )=>h('button',{'aria-describedby':describedby},'Standalone')}),
  h('button',{onClick:()=>disabled.value=!disabled.value},'Toggle hint'),
  h('button',{onClick:()=>button.value?.focus()},'Focus public button'),
  h('button',{onClick:()=>icon.value?.focus()},'Focus public icon'),
  h('button',{onClick:()=>{(window as any).elementContracts={button:button.value?.element instanceof HTMLButtonElement,icon:icon.value?.element instanceof HTMLButtonElement};}},'Check elements'),
 ]);
}});
createApp(App).mount('#app');
