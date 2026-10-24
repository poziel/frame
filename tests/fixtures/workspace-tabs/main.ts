import { createApp, h, ref, onMounted, onUnmounted } from 'vue';
import { createFrame, FrameShell } from '@frame/core';
import '../../../packages/core/src/style.css';
const frame = createFrame({workspace:{tabs:{allowCreate:true,allowClose:true,allowMove:true,lastTab:'allow-empty'}}});
const second = createFrame({workspace:{allowPaneCreation:false,tabs:{allowCreate:true,allowClose:true,lastTab:'allow-empty'}}});
const namedSlot = ref(false);
let mounts = 0, unmounts = 0;
const Content = {setup(){const count=ref(0);onMounted(()=>mounts++);onUnmounted(()=>unmounts++);return()=>h('button',{'aria-label':'Counter',onClick:()=>count.value++},`Count ${count.value}`);}};
frame.workspace.setPaneMode('pane-1','tabs');
frame.workspace.registerTab('pane-1',{id:'alpha',title:'Alpha',component:Content});
frame.workspace.registerTab('pane-1',{id:'beta',title:'Beta'});
frame.workspace.activateTab('alpha');
second.workspace.setPaneMode('pane-1','tabs');second.workspace.registerTab('pane-1',{id:'other',title:'Other'});
Object.assign(window,{__workspaceFrame:frame,__otherFrame:second,__workspaceMounts:()=>({mounts,unmounts}),__workspaceNamedSlot:namedSlot});
document.body.style.margin='0';
createApp({render:()=>h('div',{},[
  h('section',{id:'first',style:'height:65vh'},[h(FrameShell,{frame},{...(namedSlot.value?{'workspace-pane':()=>h('input',{'aria-label':'Host pane content'})}:{}),'workspace-tab-actions':()=>h('button',{'aria-label':'New tab',onClick:()=>frame.workspace.requestTab()},'+')})]),
  h('section',{id:'second',style:'height:35vh'},[h(FrameShell,{frame:second})])
])}).mount('#app');
