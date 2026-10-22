<script setup lang="ts">
import { computed, defineComponent, h, onBeforeUnmount, ref, shallowRef } from 'vue';
import type {Component} from 'vue';
import * as Core from '@frame/core';
import * as Extras from '@frame/extras';
import {fixtureFor} from './demoState';
import type {ComponentContract} from './types';
const props=defineProps<{contract:ComponentContract;values:Record<string,unknown>;slotValues?:Record<string,string>}>();
const emit=defineEmits<{event:[name:string,args:unknown[]];update:[name:string,value:unknown]}>();
const instance=shallowRef<Record<string,unknown>>();const anchor=ref<HTMLButtonElement>();const open=ref(false);
const local=Core.createFrame();const history=Extras.createNotificationHistory(local);
const editor=Extras.createCodeEditor();
const chat=Extras.createAIChat({respond:async(request,writer)=>{writer.message('Local demonstration: '+request.prompt);writer.complete();}});
let terminal:ReturnType<typeof Extras.createTerminal>|undefined;
let active=true;
const Blank=defineComponent({setup:()=>()=>h('p','Application-owned preview content')});
local.registerSidePanel({id:'docs-demo-view',label:'Example collection',children:[{id:'docs-demo-child',label:'Example section',component:Blank}]});local.layout.secondarySidebarVisible=false;local.closeBottomPanel();
local.registerSettingsSection({id:'docs-demo-settings',title:'Example settings',settings:[{id:'docs-demo-name',label:'Workspace name',type:'text',default:'Preview workspace'},{id:'docs-demo-enabled',label:'Enabled',type:'checkbox',default:true}]});
const fixtures:Record<string,()=>unknown>={frame:()=>local,history:()=>history,editor:()=>editor,chat:()=>chat,terminal:()=>terminal??=Extras.createTerminal(),anchor:()=>anchor.value,component:()=>Blank,action:()=>({label:'Acknowledge',run:()=>emit('event','acknowledge',[])}),callback:()=>()=>emit('event','callback',[])};
const target=computed(()=> ((props.contract.source.includes('/extras/')?Extras:Core) as unknown as Record<string,Component>)[props.contract.name==='CommandPalette'?'QuickInput':props.contract.name]);
const service=computed(()=>props.contract.name.startsWith('frame.'));
const shell=computed(()=>service.value||['FrameShell','WorkspacePanes','FrameSettings','ViewSections','FrameNotifications','ActivityRail'].includes(props.contract.name));
const popup=computed(()=>['FrameMenu','FrameModal','CommandPalette','NotificationPanel'].includes(props.contract.name));
const liveProps=computed(()=>{
 const values:Record<string,unknown>={};for(const [name,value] of Object.entries(props.values)){
  const property=props.contract.props.find(p=>p.name===name);
  if(property&&(property.control==='fixture'||property.type.includes('Component')&&value==='@component'))values[name]=fixtures[fixtureFor(property)]?.();else values[name]=value;
 }
 if(props.contract.name==='FrameMenu')values.anchor=anchor.value;
 for(const event of props.contract.emits)values['on'+event.name[0]!.toUpperCase()+event.name.slice(1)]=(...args:unknown[])=>{
  if(!active)return;emit('event',event.name,args);
  if(event.name.startsWith('update:'))emit('update',event.name.slice(7),args[0]);
  if(event.name==='close')open.value=false;
 };
 values.ref=(value:unknown)=>{instance.value=value as Record<string,unknown>;};return values;
});
const Content=defineComponent({setup:()=>()=>{
 if(service.value)return h(Core.FrameShell,{frame:local,titleText:'API demonstration',showSearch:false},{default:()=>h(Core.FrameButton,{variant:'primary',onClick:runService},()=>`Run ${props.contract.name}`)});
 if(!target.value)return h('p','Use the registered composition actions to explore this surface.');
 if(popup.value&&!open.value)return h('p','Open the preview to try this overlay.');
 const slots=Object.fromEntries(Object.entries(props.slotValues??{}).filter(([,value])=>value).map(([name,text])=>[name,(scope:Record<string,unknown>={})=>props.contract.name==='FrameTooltip'?h(Core.FrameButton,{'aria-describedby':scope.describedby},()=>text):h('span',text)]));

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
  else if(name==='frame.registerActivityAction')serviceCleanup=local.registerActivityAction(options as unknown as Core.ActivityAction);
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
<template><div class="documentation-surface" :class="{ 'documentation-shell-demo':shell }"><div class="showcase-row"><button v-if="popup" ref="anchor" type="button" class="frame-button secondary" @click="show">Open {{ contract.name }}</button><template v-if="shell"><Core.FrameButton @click="local.splitWorkspace('right')">Split workspace</Core.FrameButton><Core.FrameButton @click="local.resetWorkspace()">Reset workspace</Core.FrameButton><Core.FrameButton @click="notify">Notify</Core.FrameButton><Core.FrameButton @click="local.openSettings()">Open settings</Core.FrameButton></template><Core.FrameButton v-for="method in contract.methods.filter(method=>method.kind!=='property'&&!method.parameters)" :key="method.name" @click="invoke(method.name)">{{ method.name }}()</Core.FrameButton></div><Content/></div></template>
