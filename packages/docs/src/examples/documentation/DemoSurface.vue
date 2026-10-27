<script setup lang="ts">
import { createDemoTerminalBackend } from "../terminalDemo";
import { computed, defineComponent, h, onBeforeUnmount, ref, shallowRef, useId } from 'vue';
import type {Component} from 'vue';
import * as Core from '@frame/core';
import * as Module0 from '@frame/core/modules/editor';
import * as Module1 from '@frame/core/modules/terminal';
import * as Module2 from '@frame/core/modules/viewer';
import * as Module3 from '@frame/core/modules/chat';
import * as Module4 from '@frame/core/modules/notifications';
const Extras = { ...Module0, ...Module1, ...Module2, ...Module3, ...Module4 };
import { hydrateDemoValue, serializeDemoValue } from './formsDemo';
import {fixtureFor} from './demoState';
import type {ComponentContract} from './types';
const props=defineProps<{contract:ComponentContract;values:Record<string,unknown>;slotValues?:Record<string,string>}>();
const emit=defineEmits<{event:[name:string,args:unknown[]];update:[name:string,value:unknown]}>();
const fieldValue=ref('Project name'), fieldId=useId();
const submitted=ref('');
const instance=shallowRef<Record<string,unknown>>();const anchor=ref<HTMLButtonElement>();const open=ref(false);
const local=Core.createFrame();const history=Extras.createNotificationHistory(local);
const editor=Extras.createCodeEditor();
const chat=Extras.createAIChat({respond:async(request, writer)=>{writer.message('Local demonstration: '+request.prompt);writer.complete();}});
let terminal:ReturnType<typeof Extras.createTerminal>|undefined;
let active=true;
const Blank=defineComponent({setup:()=>()=>h('p','Application-owned preview content')});
local.registerSidePanel({id:'docs-demo-view',label:'Example collection',children:[{id:'docs-demo-child',label:'Example section',component:Blank}]});local.layout.secondarySidebarVisible=false;local.closeBottomPanel();
local.registerSettingsSection({id:'docs-demo-settings',title:'Example settings',settings:[{id:'docs-demo-name',label:'Workspace name',type:'text',default:'Preview workspace'},{id:'docs-demo-enabled',label:'Enabled',type:'checkbox',default:true}]});
const fixtures:Record<string,()=>unknown>={frame:()=>local,history:()=>history,editor:()=>editor,chat:()=>chat,terminal:()=>terminal??=Extras.createTerminal({ backend: createDemoTerminalBackend() }),anchor:()=>anchor.value,component:()=>Blank,action:()=>({label:'Acknowledge',run:()=>emit('event','acknowledge',[])}),matcher:()=>()=>false,datePage:()=>(
  value:{add:(duration:{months:number})=>unknown}
)=>value.add({months:1}),validator:()=>()=>undefined,callback:()=>()=>emit('event','callback',[])};
const target=computed(()=> ((props.contract.source.includes('/modules/')?Extras:Core) as unknown as Record<string,Component>)[props.contract.name]);
const service=computed(()=>props.contract.name.startsWith('frame.'));
const shell=computed(()=>service.value||['FrameShell','WorkspacePanes','FrameSettings','ViewSections','FrameNotifications','ViewBar'].includes(props.contract.name));
const popup=computed(()=>['FrameMenu','FrameModal','FrameQuickPick','FrameQuickPanel','NotificationPanel'].includes(props.contract.name));
const liveProps=computed(()=>{
 const values:Record<string,unknown>={};for(const [name,value] of Object.entries(props.values)){
  const property=props.contract.props.find(p=>p.name===name);
  if(property&&(property.control==='fixture'||property.type.includes('Component')&&value==='@component'))values[name]=fixtures[fixtureFor(property)]?.();else values[name]=hydrateDemoValue(props.contract.name,name,value);
 }
 if(props.contract.name==='FrameMenu')values.anchor=anchor.value;
 for(const event of props.contract.emits.filter(event=>props.contract.name!=='FrameTagGroup'||event.name!=='remove'))values['on'+event.name[0]!.toUpperCase()+event.name.slice(1)]=(
   ...args:unknown[]
 )=>{
  if(!active)return;for(const arg of args)if(typeof SubmitEvent!=='undefined'&&arg instanceof SubmitEvent)arg.preventDefault();emit('event',event.name,args);
  if(event.name.startsWith('update:'))emit('update',event.name.slice(7),serializeDemoValue(args[0]));
  if(event.name==='close'||props.contract.name==='FrameQuickPick'&&event.name==='accept')open.value=false;
  if(props.contract.name==='ResizeHandle'&&event.name==='resize')emit('update','value',args[0]);
  if(props.contract.name==='FrameForm'&&event.name==='formSubmit')submitted.value=JSON.stringify(args[0]);
 };
 values.ref=(value:unknown)=>{instance.value=value as Record<string,unknown>;};return values;
});
const Content=defineComponent({setup:()=>()=>{
 if(service.value)return h(Core.FrameShell,{frame:local,titleText:'API demonstration',showSearch:false},{default:()=>h(Core.FrameButton,{variant:'primary',onClick:runService},()=>`Run ${props.contract.name}`)});
 if(!target.value)return h('p','Use the registered composition actions to explore this surface.');
 if(popup.value&&!open.value)return h('p','Open the preview to try this overlay.');
 const slots=Object.fromEntries(Object.entries(props.slotValues??{}).filter((
   [,value]
 )=>value).map(([name,text])=>[name,(scope:Record<string,unknown>={})=>props.contract.name==='FrameTooltip'?h(Core.FrameButton,{'aria-describedby':scope.describedby},()=>text):h('span',text)]));

 if(props.contract.name==='FrameQuickPanel'&&props.slotValues?.['header-actions'])slots['header-actions']=()=>h(Core.FrameButton,{onClick:()=>{open.value=false;emit('event','header-action',[]);}},()=>props.slotValues!['header-actions']);
 if(props.contract.name==='FrameQuickPick'&&props.slotValues?.item)slots.item=(
   scope:Record<string,unknown>={}
 )=>{const item=scope.item as Core.QuickPickItem;return h('div',[h('span',props.slotValues!.item),h('strong',item.label),item.detail?h('small',item.detail):null]);};
 if(props.contract.name==='ResizeHandle')return h('div',{style:{position:'relative',height:'120px',width:'240px',border:'1px solid var(--frame-line)'}},[h(target.value,liveProps.value)]);
 if(props.contract.name==='FrameScrollArea')slots.default=()=>h('pre',{style:{margin:0,font:'inherit',whiteSpace:'pre'}},props.slotValues?.default??'');
 if(props.contract.name==='FrameFieldGroup')slots.default=()=>h(Core.FrameTextField,{modelValue:fieldValue.value,'aria-label':'Grouped value',disabled:!!props.values.disabled,'onUpdate:modelValue':(
   value:string|number
 )=>{fieldValue.value=String(value);emit('event','input',[value]);}});
 if(props.contract.name==='FrameField')slots.default=()=>h(Core.FrameTextField,{modelValue:fieldValue.value,placeholder:props.slotValues?.default,'onUpdate:modelValue':(
   value:string|number
 )=>{fieldValue.value=String(value);emit('event','input',[value]);}});
 if(props.contract.name==='FrameForm')slots.default=()=>h('div',[h(Core.FrameField,{name:'projectName',label:'Project name',required:true},{default:()=>h(Core.FrameTextField,{modelValue:fieldValue.value,'onUpdate:modelValue':(
   value:string|number
 )=>{fieldValue.value=String(value);}})}),h(Core.FrameButton,{type:'submit',variant:'primary'},()=>props.slotValues?.default||'Submit form'),h('p',{role:'status'},submitted.value)]);
 if(props.contract.name==='FrameLabel')return h('div',[h(target.value,{...liveProps.value,for:props.values.for??fieldId},slots),h(Core.FrameTextField,{id:props.values.for??fieldId,modelValue:fieldValue.value,'onUpdate:modelValue':(
   value:string|number
 )=>{fieldValue.value=String(value);}})]);
 if(shell.value){
  if(props.contract.name==='FrameShell')return h(Core.FrameShell as Component,liveProps.value,slots);
  if(props.contract.name==='FrameNotifications'){
   local.features.notifications=false;
   return h(Core.FrameShell,{frame:local,titleText:'Isolated notifications',showSearch:false},{overlays:()=>h(Core.FrameNotifications as Component,liveProps.value)});
  }
  return h(Core.FrameShell,{frame:local,titleText:'Isolated demo',showSearch:false},{default:()=>h(target.value,liveProps.value,slots)});
 }
 return h(target.value,liveProps.value,slots);
}});
let serviceCleanup:(()=>void)|undefined;
async function runService(){
 try{
  serviceCleanup?.();serviceCleanup=undefined;
  const {ref:_ref,region,...options}=liveProps.value;
  const name=props.contract.name;
  if(name==='frame.notify')local.notify(options as unknown as Core.NotificationOptions);
  else if(name==='frame.openModal'){const handle=local.openModal(options as unknown as Core.ModalDefinition);serviceCleanup=handle.close;}
  else if(name==='frame.registerSettingsSection'){serviceCleanup=local.registerSettingsSection(options as unknown as Core.SettingsSection);local.openSettings();}
  else if(name==='frame.registerBanner'){serviceCleanup=local.registerBanner(options as unknown as Core.WorkspaceBannerDefinition);local.openBanner();}
  else if(name==='frame.setWorkspacePane')local.setWorkspacePane(local.workspace.activePane.value,options as unknown as Core.WorkspacePaneContent);
  else if(name==='frame.registerView'){serviceCleanup=local.registerView(options as unknown as Core.ViewDefinition,(region??'secondary') as Core.ViewRegion);local.openView(String(options.id));}
  else if(name==='frame.registerNavigationItem'){serviceCleanup=local.registerNavigationItem(options as unknown as Core.NavigationItem);local.navigationBar.setVisible(true);}
  else if(name==='frame.showQuickPick'){const choice=await local.showQuickPick([{id:'one',label:'First'},{id:'two',label:'Second'}],options as Core.QuickPickOptions);if(active)emit('event','accept',[choice]);}
  if(active)emit('event',name,[options]);
 }catch(error){emit('event','error',[String(error)]);}
}
async function invoke(name:string){
 try {const method=instance.value?.[name];if(typeof method==='function'){const result=await method();if(active)emit('event',name,[result]);}}
 catch(error){emit('event',name+' error',[String(error)]);}
}
function show(){open.value=true;history.state.open=true;}
function notify(){local.notify({title:'Example notification',details:'An isolated notification produced by the demo.',duration:5000,action:{label:'Acknowledge',run:()=>emit('event','acknowledge',[])}});}
onBeforeUnmount(()=>{active=false;serviceCleanup?.();chat.dispose();history.dispose();void terminal?.dispose().catch(()=>{});local.dispose();});
</script>
<template><div class="documentation-surface" :class="{ 'documentation-shell-demo':shell }"><div class="showcase-row"><Core.FrameButton v-if="contract.name==='FrameToast'" variant="secondary" @click="emit('update','open',true)">Show notification</Core.FrameButton><button v-if="popup" ref="anchor" type="button" class="frame-button secondary" @click="show">Open {{ contract.name }}</button><template v-if="shell"><Core.FrameButton @click="local.splitWorkspace('right')">Split workspace</Core.FrameButton><Core.FrameButton @click="local.resetWorkspace()">Reset workspace</Core.FrameButton><Core.FrameButton @click="notify">Notify</Core.FrameButton><Core.FrameButton @click="local.openSettings()">Open settings</Core.FrameButton></template><Core.FrameButton v-for="method in contract.methods.filter(method=>method.kind!=='property'&&!method.parameters)" :key="method.name" @click="invoke(method.name)">{{ method.name }}()</Core.FrameButton></div><Content/></div></template>
